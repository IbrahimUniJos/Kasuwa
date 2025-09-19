using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.Data;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Services
{
    public class WishlistService : IWishlistService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICartService _cartService;
        private readonly ILogger<WishlistService> _logger;

        public WishlistService(ApplicationDbContext context, ICartService cartService, ILogger<WishlistService> logger)
        {
            _context = context;
            _cartService = cartService;
            _logger = logger;
        }

        public async Task<WishlistDto> GetWishlistAsync(string userId)
        {
            try
            {
                var wishlistItems = await _context.WishlistItems
                    .Include(wi => wi.Product)
                        .ThenInclude(p => p.Images)
                    .Include(wi => wi.Product)
                        .ThenInclude(p => p.Category)
                    .Include(wi => wi.Product)
                        .ThenInclude(p => p.Vendor)
                    .Include(wi => wi.Product)
                        .ThenInclude(p => p.Reviews)
                    .Where(wi => wi.UserId == userId)
                    .OrderByDescending(wi => wi.CreatedDate)
                    .ToListAsync();

                var wishlist = new WishlistDto
                {
                    Id = 0, // Since we're using direct wishlist items without a wishlist entity
                    UserId = userId,
                    CreatedDate = wishlistItems.Any() ? wishlistItems.Min(wi => wi.CreatedDate) : DateTime.UtcNow,
                    UpdatedDate = wishlistItems.Any() ? wishlistItems.Max(wi => wi.CreatedDate) : DateTime.UtcNow,
                    WishlistItems = wishlistItems.Select(wi => new WishlistItemDto
                    {
                        Id = wi.Id,
                        ProductId = wi.ProductId,
                        ProductName = wi.Product.Name,
                        ProductSKU = wi.Product.SKU,
                        ProductPrice = wi.Product.Price,
                        ComparePrice = wi.Product.ComparePrice,
                        ProductImageUrl = wi.Product.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                                       ?? wi.Product.Images.FirstOrDefault()?.ImageUrl,
                        IsInStock = wi.Product.StockQuantity > 0 || wi.Product.ContinueSellingWhenOutOfStock,
                        IsActive = wi.Product.IsActive,
                        CategoryName = wi.Product.Category.Name,
                        VendorName = $"{wi.Product.Vendor.FirstName} {wi.Product.Vendor.LastName}".Trim(),
                        AverageRating = wi.Product.Reviews.Any() ? wi.Product.Reviews.Average(r => r.Rating) : 0,
                        ReviewCount = wi.Product.Reviews.Count(),
                        CreatedDate = wi.CreatedDate
                    }).ToList()
                };

                return wishlist;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wishlist for user {UserId}", userId);
                throw;
            }
        }

        public async Task<WishlistItemDto> AddToWishlistAsync(string userId, AddToWishlistDto addToWishlistDto)
        {
            try
            {
                // Check if product exists and is active
                var product = await _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Category)
                    .Include(p => p.Vendor)
                    .Include(p => p.Reviews)
                    .FirstOrDefaultAsync(p => p.Id == addToWishlistDto.ProductId && p.IsActive);

                if (product == null)
                    throw new ArgumentException("Product not found or inactive");

                // Check if item already exists in wishlist
                var existingItem = await _context.WishlistItems
                    .FirstOrDefaultAsync(wi => wi.UserId == userId && wi.ProductId == addToWishlistDto.ProductId);

                if (existingItem != null)
                    throw new ArgumentException("Product is already in your wishlist");

                // Create new wishlist item
                var wishlistItem = new WishlistItem
                {
                    UserId = userId,
                    ProductId = addToWishlistDto.ProductId,
                    CreatedDate = DateTime.UtcNow
                };

                _context.WishlistItems.Add(wishlistItem);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Added product {ProductId} to wishlist for user {UserId}", addToWishlistDto.ProductId, userId);

                return new WishlistItemDto
                {
                    Id = wishlistItem.Id,
                    ProductId = wishlistItem.ProductId,
                    ProductName = product.Name,
                    ProductSKU = product.SKU,
                    ProductPrice = product.Price,
                    ComparePrice = product.ComparePrice,
                    ProductImageUrl = product.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                                   ?? product.Images.FirstOrDefault()?.ImageUrl,
                    IsInStock = product.StockQuantity > 0 || product.ContinueSellingWhenOutOfStock,
                    IsActive = product.IsActive,
                    CategoryName = product.Category.Name,
                    VendorName = $"{product.Vendor.FirstName} {product.Vendor.LastName}".Trim(),
                    AverageRating = product.Reviews.Any() ? product.Reviews.Average(r => r.Rating) : 0,
                    ReviewCount = product.Reviews.Count(),
                    CreatedDate = wishlistItem.CreatedDate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding product {ProductId} to wishlist for user {UserId}", addToWishlistDto.ProductId, userId);
                throw;
            }
        }

        public async Task<bool> RemoveFromWishlistAsync(string userId, int itemId)
        {
            try
            {
                var wishlistItem = await _context.WishlistItems
                    .FirstOrDefaultAsync(wi => wi.Id == itemId && wi.UserId == userId);

                if (wishlistItem == null)
                    return false;

                _context.WishlistItems.Remove(wishlistItem);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Removed wishlist item {ItemId} for user {UserId}", itemId, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing wishlist item {ItemId} for user {UserId}", itemId, userId);
                throw;
            }
        }

        public async Task<bool> RemoveMultipleItemsAsync(string userId, List<int> itemIds)
        {
            try
            {
                var wishlistItems = await _context.WishlistItems
                    .Where(wi => itemIds.Contains(wi.Id) && wi.UserId == userId)
                    .ToListAsync();

                if (!wishlistItems.Any())
                    return false;

                _context.WishlistItems.RemoveRange(wishlistItems);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Removed {Count} wishlist items for user {UserId}", wishlistItems.Count, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing multiple wishlist items for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> ClearWishlistAsync(string userId)
        {
            try
            {
                var wishlistItems = await _context.WishlistItems
                    .Where(wi => wi.UserId == userId)
                    .ToListAsync();

                if (!wishlistItems.Any())
                    return true;

                _context.WishlistItems.RemoveRange(wishlistItems);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Cleared wishlist for user {UserId}", userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing wishlist for user {UserId}", userId);
                throw;
            }
        }

        public async Task<CartDto> MoveToCartAsync(string userId, MoveToCartDto moveToCartDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Get wishlist item
                var wishlistItem = await _context.WishlistItems
                    .Include(wi => wi.Product)
                    .FirstOrDefaultAsync(wi => wi.Id == moveToCartDto.WishlistItemId && wi.UserId == userId);

                if (wishlistItem == null)
                    throw new ArgumentException("Wishlist item not found");

                // Add to cart
                var addToCartDto = new AddToCartDto
                {
                    ProductId = wishlistItem.ProductId,
                    Quantity = moveToCartDto.Quantity,
                    ProductVariantId = moveToCartDto.ProductVariantId
                };

                var cart = await _cartService.AddToCartAsync(userId, addToCartDto);

                // Remove from wishlist
                _context.WishlistItems.Remove(wishlistItem);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation("Moved product {ProductId} from wishlist to cart for user {UserId}", 
                    wishlistItem.ProductId, userId);

                return cart;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error moving wishlist item {ItemId} to cart for user {UserId}", 
                    moveToCartDto.WishlistItemId, userId);
                throw;
            }
        }

        public async Task<CartDto> MoveAllToCartAsync(string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var wishlistItems = await _context.WishlistItems
                    .Include(wi => wi.Product)
                    .Where(wi => wi.UserId == userId)
                    .ToListAsync();

                if (!wishlistItems.Any())
                {
                    // Return empty cart if no wishlist items
                    return await _cartService.GetCartAsync(userId);
                }

                CartDto? finalCart = null;

                foreach (var wishlistItem in wishlistItems)
                {
                    try
                    {
                        var addToCartDto = new AddToCartDto
                        {
                            ProductId = wishlistItem.ProductId,
                            Quantity = 1 // Default quantity
                        };

                        finalCart = await _cartService.AddToCartAsync(userId, addToCartDto);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to move product {ProductId} from wishlist to cart for user {UserId}", 
                            wishlistItem.ProductId, userId);
                        // Continue with other items
                    }
                }

                // Remove all items from wishlist
                _context.WishlistItems.RemoveRange(wishlistItems);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation("Moved {Count} items from wishlist to cart for user {UserId}", 
                    wishlistItems.Count, userId);

                // Return the final cart state or get current cart if finalCart is null
                return finalCart ?? await _cartService.GetCartAsync(userId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error moving all wishlist items to cart for user {UserId}", userId);
                throw;
            }
        }

        public async Task<int> GetWishlistItemCountAsync(string userId)
        {
            try
            {
                return await _context.WishlistItems
                    .CountAsync(wi => wi.UserId == userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wishlist item count for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> IsProductInWishlistAsync(string userId, int productId)
        {
            try
            {
                return await _context.WishlistItems
                    .AnyAsync(wi => wi.UserId == userId && wi.ProductId == productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if product {ProductId} is in wishlist for user {UserId}", productId, userId);
                throw;
            }
        }

        public async Task<List<WishlistItemDto>> GetRecentlyViewedSimilarAsync(string userId, int limit = 10)
        {
            try
            {
                // Get user's wishlist categories
                var userCategories = await _context.WishlistItems
                    .Include(wi => wi.Product)
                    .Where(wi => wi.UserId == userId)
                    .Select(wi => wi.Product.CategoryId)
                    .Distinct()
                    .ToListAsync();

                if (!userCategories.Any())
                    return new List<WishlistItemDto>();

                // Find similar products from the same categories
                var similarProducts = await _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Category)
                    .Include(p => p.Vendor)
                    .Include(p => p.Reviews)
                    .Where(p => p.IsActive && 
                              userCategories.Contains(p.CategoryId) && 
                              !_context.WishlistItems.Any(wi => wi.UserId == userId && wi.ProductId == p.Id))
                    .OrderByDescending(p => p.CreatedDate)
                    .Take(limit)
                    .ToListAsync();

                return similarProducts.Select(p => new WishlistItemDto
                {
                    Id = 0, // Not in wishlist yet
                    ProductId = p.Id,
                    ProductName = p.Name,
                    ProductSKU = p.SKU,
                    ProductPrice = p.Price,
                    ComparePrice = p.ComparePrice,
                    ProductImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                                   ?? p.Images.FirstOrDefault()?.ImageUrl,
                    IsInStock = p.StockQuantity > 0 || p.ContinueSellingWhenOutOfStock,
                    IsActive = p.IsActive,
                    CategoryName = p.Category.Name,
                    VendorName = $"{p.Vendor.FirstName} {p.Vendor.LastName}".Trim(),
                    AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
                    ReviewCount = p.Reviews.Count(),
                    CreatedDate = p.CreatedDate
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting similar products for user {UserId}", userId);
                throw;
            }
        }
    }
}