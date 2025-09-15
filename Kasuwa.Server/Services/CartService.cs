using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.Data;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Services
{
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CartService> _logger;

        public CartService(ApplicationDbContext context, ILogger<CartService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CartDto> GetCartAsync(string userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                        .ThenInclude(p => p.Images)
                    .Include(ci => ci.Product)
                        .ThenInclude(p => p.Category)
                    .Include(ci => ci.ProductVariant)
                    .Where(ci => ci.UserId == userId)
                    .OrderByDescending(ci => ci.UpdatedDate)
                    .ToListAsync();

                var cart = new CartDto
                {
                    Id = 0, // Since we're using direct cart items without a cart entity
                    UserId = userId,
                    CreatedDate = cartItems.Any() ? cartItems.Min(ci => ci.CreatedDate) : DateTime.UtcNow,
                    UpdatedDate = cartItems.Any() ? cartItems.Max(ci => ci.UpdatedDate) : DateTime.UtcNow,
                    CartItems = cartItems.Select(ci => new CartItemDto
                    {
                        Id = ci.Id,
                        ProductId = ci.ProductId,
                        ProductName = ci.Product.Name,
                        ProductSKU = ci.Product.SKU,
                        ProductPrice = ci.Product.Price,
                        ProductImageUrl = ci.Product.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                                       ?? ci.Product.Images.FirstOrDefault()?.ImageUrl,
                        Quantity = ci.Quantity,
                        ProductVariantId = ci.ProductVariantId,
                        ProductVariantName = ci.ProductVariant?.Name,
                        ProductVariantValue = ci.ProductVariant?.Value,
                        VariantPriceAdjustment = ci.ProductVariant?.PriceAdjustment ?? 0,
                        IsInStock = ci.Product.StockQuantity > 0 || ci.Product.ContinueSellingWhenOutOfStock,
                        AvailableStock = ci.ProductVariant?.StockQuantity ?? ci.Product.StockQuantity,
                        CreatedDate = ci.CreatedDate,
                        UpdatedDate = ci.UpdatedDate
                    }).ToList()
                };

                return cart;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart for user {UserId}", userId);
                throw;
            }
        }

        public async Task<CartItemDto> AddToCartAsync(string userId, AddToCartDto addToCartDto)
        {
            try
            {
                // Check if product exists and is active
                var product = await _context.Products
                    .Include(p => p.Images)
                    .Include(p => p.Variants)
                    .FirstOrDefaultAsync(p => p.Id == addToCartDto.ProductId && p.IsActive);

                if (product == null)
                    throw new ArgumentException("Product not found or inactive");

                // Validate variant if specified
                ProductVariant? variant = null;
                if (addToCartDto.ProductVariantId.HasValue)
                {
                    variant = product.Variants.FirstOrDefault(v => v.Id == addToCartDto.ProductVariantId.Value && v.IsActive);
                    if (variant == null)
                        throw new ArgumentException("Product variant not found or inactive");
                }

                // Check stock availability
                var availableStock = variant?.StockQuantity ?? product.StockQuantity;
                if (product.TrackQuantity && availableStock < addToCartDto.Quantity)
                    throw new ArgumentException($"Insufficient stock. Available: {availableStock}, Requested: {addToCartDto.Quantity}");

                // Check if item already exists in cart
                var existingItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserId == userId && 
                                              ci.ProductId == addToCartDto.ProductId && 
                                              ci.ProductVariantId == addToCartDto.ProductVariantId);

                if (existingItem != null)
                {
                    // Update quantity
                    var newQuantity = existingItem.Quantity + addToCartDto.Quantity;
                    
                    // Check total stock availability
                    if (product.TrackQuantity && availableStock < newQuantity)
                        throw new ArgumentException($"Insufficient stock. Available: {availableStock}, Total requested: {newQuantity}");

                    existingItem.Quantity = newQuantity;
                    existingItem.UpdatedDate = DateTime.UtcNow;
                }
                else
                {
                    // Create new cart item
                    var cartItem = new CartItem
                    {
                        UserId = userId,
                        ProductId = addToCartDto.ProductId,
                        ProductVariantId = addToCartDto.ProductVariantId,
                        Quantity = addToCartDto.Quantity,
                        CreatedDate = DateTime.UtcNow,
                        UpdatedDate = DateTime.UtcNow
                    };

                    _context.CartItems.Add(cartItem);
                    existingItem = cartItem;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Added product {ProductId} to cart for user {UserId} with quantity {Quantity}", 
                    addToCartDto.ProductId, userId, addToCartDto.Quantity);

                // Return updated cart item
                return new CartItemDto
                {
                    Id = existingItem.Id,
                    ProductId = existingItem.ProductId,
                    ProductName = product.Name,
                    ProductSKU = product.SKU,
                    ProductPrice = product.Price,
                    ProductImageUrl = product.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                                   ?? product.Images.FirstOrDefault()?.ImageUrl,
                    Quantity = existingItem.Quantity,
                    ProductVariantId = existingItem.ProductVariantId,
                    ProductVariantName = variant?.Name,
                    ProductVariantValue = variant?.Value,
                    VariantPriceAdjustment = variant?.PriceAdjustment ?? 0,
                    IsInStock = availableStock > 0 || product.ContinueSellingWhenOutOfStock,
                    AvailableStock = availableStock,
                    CreatedDate = existingItem.CreatedDate,
                    UpdatedDate = existingItem.UpdatedDate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding product {ProductId} to cart for user {UserId}", addToCartDto.ProductId, userId);
                throw;
            }
        }

        public async Task<CartItemDto?> UpdateCartItemAsync(string userId, int itemId, UpdateCartItemDto updateCartItemDto)
        {
            try
            {
                var cartItem = await _context.CartItems
                    .Include(ci => ci.Product)
                        .ThenInclude(p => p.Images)
                    .Include(ci => ci.ProductVariant)
                    .FirstOrDefaultAsync(ci => ci.Id == itemId && ci.UserId == userId);

                if (cartItem == null)
                    return null;

                // Check stock availability
                var availableStock = cartItem.ProductVariant?.StockQuantity ?? cartItem.Product.StockQuantity;
                if (cartItem.Product.TrackQuantity && availableStock < updateCartItemDto.Quantity)
                    throw new ArgumentException($"Insufficient stock. Available: {availableStock}, Requested: {updateCartItemDto.Quantity}");

                cartItem.Quantity = updateCartItemDto.Quantity;
                cartItem.UpdatedDate = DateTime.UtcNow;

                // Update variant if changed
                if (updateCartItemDto.ProductVariantId != cartItem.ProductVariantId)
                {
                    if (updateCartItemDto.ProductVariantId.HasValue)
                    {
                        var variant = await _context.ProductVariants
                            .FirstOrDefaultAsync(v => v.Id == updateCartItemDto.ProductVariantId.Value && 
                                                    v.ProductId == cartItem.ProductId && v.IsActive);
                        if (variant == null)
                            throw new ArgumentException("Product variant not found or inactive");

                        // Check stock for new variant
                        if (cartItem.Product.TrackQuantity && variant.StockQuantity < updateCartItemDto.Quantity)
                            throw new ArgumentException($"Insufficient stock for variant. Available: {variant.StockQuantity}, Requested: {updateCartItemDto.Quantity}");
                    }

                    cartItem.ProductVariantId = updateCartItemDto.ProductVariantId;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated cart item {ItemId} for user {UserId} with quantity {Quantity}", 
                    itemId, userId, updateCartItemDto.Quantity);

                return new CartItemDto
                {
                    Id = cartItem.Id,
                    ProductId = cartItem.ProductId,
                    ProductName = cartItem.Product.Name,
                    ProductSKU = cartItem.Product.SKU,
                    ProductPrice = cartItem.Product.Price,
                    ProductImageUrl = cartItem.Product.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                                   ?? cartItem.Product.Images.FirstOrDefault()?.ImageUrl,
                    Quantity = cartItem.Quantity,
                    ProductVariantId = cartItem.ProductVariantId,
                    ProductVariantName = cartItem.ProductVariant?.Name,
                    ProductVariantValue = cartItem.ProductVariant?.Value,
                    VariantPriceAdjustment = cartItem.ProductVariant?.PriceAdjustment ?? 0,
                    IsInStock = availableStock > 0 || cartItem.Product.ContinueSellingWhenOutOfStock,
                    AvailableStock = availableStock,
                    CreatedDate = cartItem.CreatedDate,
                    UpdatedDate = cartItem.UpdatedDate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item {ItemId} for user {UserId}", itemId, userId);
                throw;
            }
        }

        public async Task<bool> RemoveFromCartAsync(string userId, int itemId)
        {
            try
            {
                var cartItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.Id == itemId && ci.UserId == userId);

                if (cartItem == null)
                    return false;

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Removed cart item {ItemId} for user {UserId}", itemId, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cart item {ItemId} for user {UserId}", itemId, userId);
                throw;
            }
        }

        public async Task<bool> RemoveMultipleItemsAsync(string userId, List<int> itemIds)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Where(ci => itemIds.Contains(ci.Id) && ci.UserId == userId)
                    .ToListAsync();

                if (!cartItems.Any())
                    return false;

                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Removed {Count} cart items for user {UserId}", cartItems.Count, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing multiple cart items for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> ClearCartAsync(string userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Where(ci => ci.UserId == userId)
                    .ToListAsync();

                if (!cartItems.Any())
                    return true;

                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Cleared cart for user {UserId}", userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart for user {UserId}", userId);
                throw;
            }
        }

        public async Task<CartSummaryDto> GetCartSummaryAsync(string userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                    .Include(ci => ci.ProductVariant)
                    .Where(ci => ci.UserId == userId)
                    .ToListAsync();

                var subTotal = cartItems.Sum(ci => 
                    (ci.Product.Price + (ci.ProductVariant?.PriceAdjustment ?? 0)) * ci.Quantity);

                var hasOutOfStockItems = cartItems.Any(ci => 
                    ci.Product.TrackQuantity && 
                    (ci.ProductVariant?.StockQuantity ?? ci.Product.StockQuantity) < ci.Quantity);

                var estimatedShipping = CalculateEstimatedShipping(cartItems);
                var estimatedTax = subTotal * 0.10m; // 10% tax rate
                var estimatedTotal = subTotal + estimatedShipping + estimatedTax;

                var messages = new List<string>();
                if (hasOutOfStockItems)
                {
                    messages.Add("Some items in your cart are out of stock or have limited availability.");
                }

                if (cartItems.Count == 0)
                {
                    messages.Add("Your cart is empty.");
                }

                return new CartSummaryDto
                {
                    TotalItems = cartItems.Sum(ci => ci.Quantity),
                    SubTotal = subTotal,
                    EstimatedShipping = estimatedShipping,
                    EstimatedTax = estimatedTax,
                    EstimatedTotal = estimatedTotal,
                    HasOutOfStockItems = hasOutOfStockItems,
                    Messages = messages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart summary for user {UserId}", userId);
                throw;
            }
        }

        public async Task<CartValidationResultDto> ValidateCartAsync(string userId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                    .Include(ci => ci.ProductVariant)
                    .Where(ci => ci.UserId == userId)
                    .ToListAsync();

                var validationResults = new List<CartItemValidationDto>();
                var generalMessages = new List<string>();

                foreach (var item in cartItems)
                {
                    var isProductActive = item.Product.IsActive;
                    var isVariantActive = item.ProductVariant?.IsActive ?? true;
                    var availableStock = item.ProductVariant?.StockQuantity ?? item.Product.StockQuantity;
                    var hasStock = !item.Product.TrackQuantity || availableStock >= item.Quantity || item.Product.ContinueSellingWhenOutOfStock;

                    var isValid = isProductActive && isVariantActive && hasStock;
                    var validationMessage = string.Empty;

                    if (!isProductActive)
                        validationMessage = "Product is no longer available";
                    else if (!isVariantActive)
                        validationMessage = "Product variant is no longer available";
                    else if (!hasStock)
                        validationMessage = $"Only {availableStock} items available";

                    validationResults.Add(new CartItemValidationDto
                    {
                        ItemId = item.Id,
                        IsValid = isValid,
                        ValidationMessage = validationMessage,
                        AvailableStock = availableStock,
                        RequestedQuantity = item.Quantity,
                        IsProductActive = isProductActive,
                        IsVariantActive = isVariantActive
                    });
                }

                if (cartItems.Count == 0)
                {
                    generalMessages.Add("Your cart is empty");
                }

                var invalidItemsCount = validationResults.Count(v => !v.IsValid);
                if (invalidItemsCount > 0)
                {
                    generalMessages.Add($"{invalidItemsCount} item(s) in your cart need attention");
                }

                return new CartValidationResultDto
                {
                    ValidationResults = validationResults,
                    GeneralMessages = generalMessages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating cart for user {UserId}", userId);
                throw;
            }
        }

        public async Task<int> GetCartItemCountAsync(string userId)
        {
            try
            {
                return await _context.CartItems
                    .Where(ci => ci.UserId == userId)
                    .SumAsync(ci => ci.Quantity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart item count for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> MergeCartsAsync(string fromUserId, string toUserId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var fromCartItems = await _context.CartItems
                    .Where(ci => ci.UserId == fromUserId)
                    .ToListAsync();

                if (!fromCartItems.Any())
                    return true;

                foreach (var fromItem in fromCartItems)
                {
                    var existingItem = await _context.CartItems
                        .FirstOrDefaultAsync(ci => ci.UserId == toUserId && 
                                                  ci.ProductId == fromItem.ProductId && 
                                                  ci.ProductVariantId == fromItem.ProductVariantId);

                    if (existingItem != null)
                    {
                        // Merge quantities
                        existingItem.Quantity += fromItem.Quantity;
                        existingItem.UpdatedDate = DateTime.UtcNow;
                    }
                    else
                    {
                        // Move item to target user
                        fromItem.UserId = toUserId;
                        fromItem.UpdatedDate = DateTime.UtcNow;
                    }
                }

                // Remove duplicate items from the source cart
                var itemsToRemove = fromCartItems.Where(fi => 
                    _context.CartItems.Any(ci => ci.UserId == toUserId && 
                                                ci.ProductId == fi.ProductId && 
                                                ci.ProductVariantId == fi.ProductVariantId && 
                                                ci.Id != fi.Id)).ToList();

                if (itemsToRemove.Any())
                {
                    _context.CartItems.RemoveRange(itemsToRemove);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Merged cart from user {FromUserId} to user {ToUserId}", fromUserId, toUserId);

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error merging carts from user {FromUserId} to user {ToUserId}", fromUserId, toUserId);
                throw;
            }
        }

        private decimal CalculateEstimatedShipping(List<CartItem> cartItems)
        {
            // Simple shipping calculation
            var totalWeight = cartItems.Sum(item => item.Quantity * 0.5m); // Assume 0.5kg per item
            var baseShipping = 5.00m;
            var perKgRate = 1.00m;

            return baseShipping + (totalWeight * perKgRate);
        }
    }
}