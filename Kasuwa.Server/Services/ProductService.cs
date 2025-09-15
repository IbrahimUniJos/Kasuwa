using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.Data;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductService> _logger;

        public ProductService(ApplicationDbContext context, ILogger<ProductService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ProductSearchResultDto> SearchProductsAsync(ProductSearchDto searchDto)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Vendor)
                    .Include(p => p.Images)
                    .Include(p => p.Reviews)
                    .Where(p => p.IsActive);

                // Apply search filters
                if (!string.IsNullOrWhiteSpace(searchDto.SearchTerm))
                {
                    query = query.Where(p => p.Name.Contains(searchDto.SearchTerm) || 
                                           p.Description.Contains(searchDto.SearchTerm) ||
                                           p.SKU.Contains(searchDto.SearchTerm));
                }

                if (searchDto.CategoryId.HasValue)
                {
                    query = query.Where(p => p.CategoryId == searchDto.CategoryId.Value);
                }

                if (searchDto.MinPrice.HasValue)
                {
                    query = query.Where(p => p.Price >= searchDto.MinPrice.Value);
                }

                if (searchDto.MaxPrice.HasValue)
                {
                    query = query.Where(p => p.Price <= searchDto.MaxPrice.Value);
                }

                if (searchDto.InStockOnly == true)
                {
                    query = query.Where(p => p.StockQuantity > 0 || p.ContinueSellingWhenOutOfStock);
                }

                if (!string.IsNullOrWhiteSpace(searchDto.VendorId))
                {
                    query = query.Where(p => p.VendorId == searchDto.VendorId);
                }

                // Apply sorting
                query = searchDto.SortBy.ToLower() switch
                {
                    "price" => searchDto.SortDirection == "desc" 
                        ? query.OrderByDescending(p => p.Price) 
                        : query.OrderBy(p => p.Price),
                    "date" => searchDto.SortDirection == "desc" 
                        ? query.OrderByDescending(p => p.CreatedDate) 
                        : query.OrderBy(p => p.CreatedDate),
                    "rating" => searchDto.SortDirection == "desc" 
                        ? query.OrderByDescending(p => p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0) 
                        : query.OrderBy(p => p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0),
                    _ => searchDto.SortDirection == "desc" 
                        ? query.OrderByDescending(p => p.Name) 
                        : query.OrderBy(p => p.Name)
                };

                var totalCount = await query.CountAsync();

                var products = await query
                    .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                    .Take(searchDto.PageSize)
                    .Select(p => new ProductListDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        ComparePrice = p.ComparePrice,
                        SKU = p.SKU,
                        IsActive = p.IsActive,
                        StockQuantity = p.StockQuantity,
                        CategoryName = p.Category.Name,
                        PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary) != null 
                            ? p.Images.First(i => i.IsPrimary).ImageUrl 
                            : p.Images.FirstOrDefault() != null ? p.Images.First().ImageUrl : null,
                        AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
                        ReviewCount = p.Reviews.Count(),
                        CreatedDate = p.CreatedDate
                    })
                    .ToListAsync();

                return new ProductSearchResultDto
                {
                    Products = products,
                    TotalCount = totalCount,
                    PageNumber = searchDto.PageNumber,
                    PageSize = searchDto.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching products");
                throw;
            }
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Vendor)
                    .Include(p => p.Images.OrderBy(i => i.SortOrder))
                    .Include(p => p.Variants.Where(v => v.IsActive))
                    .Include(p => p.Reviews.Where(r => r.IsApproved))
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (product == null)
                    return null;

                return new ProductDto
                {
                    Id = product.Id,
                    VendorId = product.VendorId,
                    VendorName = $"{product.Vendor.FirstName} {product.Vendor.LastName}".Trim(),
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    StockQuantity = product.StockQuantity,
                    SKU = product.SKU,
                    IsActive = product.IsActive,
                    CreatedDate = product.CreatedDate,
                    UpdatedDate = product.UpdatedDate,
                    CategoryId = product.CategoryId,
                    CategoryName = product.Category.Name,
                    ComparePrice = product.ComparePrice,
                    Weight = product.Weight,
                    WeightUnit = product.WeightUnit,
                    RequiresShipping = product.RequiresShipping,
                    TrackQuantity = product.TrackQuantity,
                    ContinueSellingWhenOutOfStock = product.ContinueSellingWhenOutOfStock,
                    MetaTitle = product.MetaTitle,
                    MetaDescription = product.MetaDescription,
                    Images = product.Images.Select(i => new ProductImageDto
                    {
                        Id = i.Id,
                        ImageUrl = i.ImageUrl,
                        AltText = i.AltText,
                        SortOrder = i.SortOrder,
                        IsPrimary = i.IsPrimary
                    }).ToList(),
                    Variants = product.Variants.Select(v => new ProductVariantDto
                    {
                        Id = v.Id,
                        Name = v.Name,
                        Value = v.Value,
                        PriceAdjustment = v.PriceAdjustment,
                        StockQuantity = v.StockQuantity,
                        SKU = v.SKU,
                        IsActive = v.IsActive
                    }).ToList(),
                    AverageRating = product.Reviews.Any() ? product.Reviews.Average(r => r.Rating) : 0,
                    ReviewCount = product.Reviews.Count()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product {ProductId}", id);
                throw;
            }
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto, string vendorId)
        {
            try
            {
                var product = new Product
                {
                    VendorId = vendorId,
                    Name = createProductDto.Name,
                    Description = createProductDto.Description,
                    Price = createProductDto.Price,
                    StockQuantity = createProductDto.StockQuantity,
                    SKU = createProductDto.SKU,
                    CategoryId = createProductDto.CategoryId,
                    ComparePrice = createProductDto.ComparePrice,
                    Weight = createProductDto.Weight,
                    WeightUnit = createProductDto.WeightUnit,
                    RequiresShipping = createProductDto.RequiresShipping,
                    TrackQuantity = createProductDto.TrackQuantity,
                    ContinueSellingWhenOutOfStock = createProductDto.ContinueSellingWhenOutOfStock,
                    MetaTitle = createProductDto.MetaTitle,
                    MetaDescription = createProductDto.MetaDescription,
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                // Add images
                if (createProductDto.Images.Any())
                {
                    var images = createProductDto.Images.Select(img => new ProductImage
                    {
                        ProductId = product.Id,
                        ImageUrl = img.ImageUrl,
                        AltText = img.AltText,
                        SortOrder = img.SortOrder,
                        IsPrimary = img.IsPrimary,
                        CreatedDate = DateTime.UtcNow
                    }).ToList();

                    _context.ProductImages.AddRange(images);
                }

                // Add variants
                if (createProductDto.Variants.Any())
                {
                    var variants = createProductDto.Variants.Select(v => new ProductVariant
                    {
                        ProductId = product.Id,
                        Name = v.Name,
                        Value = v.Value,
                        PriceAdjustment = v.PriceAdjustment,
                        StockQuantity = v.StockQuantity,
                        SKU = v.SKU,
                        IsActive = true,
                        CreatedDate = DateTime.UtcNow
                    }).ToList();

                    _context.ProductVariants.AddRange(variants);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product {ProductId} created by vendor {VendorId}", product.Id, vendorId);

                return await GetProductByIdAsync(product.Id) ?? throw new InvalidOperationException("Failed to retrieve created product");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product for vendor {VendorId}", vendorId);
                throw;
            }
        }

        public async Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto updateProductDto, string vendorId)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.Id == id && p.VendorId == vendorId);

                if (product == null)
                    return null;

                product.Name = updateProductDto.Name;
                product.Description = updateProductDto.Description;
                product.Price = updateProductDto.Price;
                product.StockQuantity = updateProductDto.StockQuantity;
                product.CategoryId = updateProductDto.CategoryId;
                product.ComparePrice = updateProductDto.ComparePrice;
                product.Weight = updateProductDto.Weight;
                product.WeightUnit = updateProductDto.WeightUnit;
                product.RequiresShipping = updateProductDto.RequiresShipping;
                product.TrackQuantity = updateProductDto.TrackQuantity;
                product.ContinueSellingWhenOutOfStock = updateProductDto.ContinueSellingWhenOutOfStock;
                product.MetaTitle = updateProductDto.MetaTitle;
                product.MetaDescription = updateProductDto.MetaDescription;
                product.IsActive = updateProductDto.IsActive;
                product.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product {ProductId} updated by vendor {VendorId}", id, vendorId);

                return await GetProductByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product {ProductId} for vendor {VendorId}", id, vendorId);
                throw;
            }
        }

        public async Task<bool> DeleteProductAsync(int id, string vendorId)
        {
            try
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.Id == id && p.VendorId == vendorId);

                if (product == null)
                    return false;

                // Soft delete - set IsActive to false
                product.IsActive = false;
                product.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product {ProductId} deleted by vendor {VendorId}", id, vendorId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product {ProductId} for vendor {VendorId}", id, vendorId);
                throw;
            }
        }

        public async Task<List<ProductListDto>> GetVendorProductsAsync(string vendorId)
        {
            try
            {
                return await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Images)
                    .Include(p => p.Reviews)
                    .Where(p => p.VendorId == vendorId)
                    .OrderByDescending(p => p.CreatedDate)
                    .Select(p => new ProductListDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        ComparePrice = p.ComparePrice,
                        SKU = p.SKU,
                        IsActive = p.IsActive,
                        StockQuantity = p.StockQuantity,
                        CategoryName = p.Category.Name,
                        PrimaryImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary) != null 
                            ? p.Images.First(i => i.IsPrimary).ImageUrl 
                            : p.Images.FirstOrDefault() != null ? p.Images.First().ImageUrl : null,
                        AverageRating = p.Reviews.Any() ? p.Reviews.Average(r => r.Rating) : 0,
                        ReviewCount = p.Reviews.Count(),
                        CreatedDate = p.CreatedDate
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products for vendor {VendorId}", vendorId);
                throw;
            }
        }

        public async Task<bool> UpdateProductStockAsync(int productId, int stockQuantity)
        {
            try
            {
                var product = await _context.Products.FindAsync(productId);
                if (product == null)
                    return false;

                product.StockQuantity = stockQuantity;
                product.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Stock updated for product {ProductId} to {StockQuantity}", productId, stockQuantity);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating stock for product {ProductId}", productId);
                throw;
            }
        }

        public async Task<List<ProductCategoryDto>> GetCategoriesAsync()
        {
            try
            {
                return await _context.ProductCategories
                    .Include(c => c.SubCategories)
                    .Where(c => c.IsActive && c.ParentCategoryId == null)
                    .OrderBy(c => c.SortOrder)
                    .ThenBy(c => c.Name)
                    .Select(c => new ProductCategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Description = c.Description,
                        ParentCategoryId = c.ParentCategoryId,
                        IsActive = c.IsActive,
                        ImageUrl = c.ImageUrl,
                        SortOrder = c.SortOrder,
                        Slug = c.Slug,
                        MetaTitle = c.MetaTitle,
                        MetaDescription = c.MetaDescription,
                        CreatedDate = c.CreatedDate,
                        SubCategories = c.SubCategories.Where(sc => sc.IsActive).Select(sc => new ProductCategoryDto
                        {
                            Id = sc.Id,
                            Name = sc.Name,
                            Description = sc.Description,
                            ParentCategoryId = sc.ParentCategoryId,
                            ParentCategoryName = c.Name,
                            IsActive = sc.IsActive,
                            ImageUrl = sc.ImageUrl,
                            SortOrder = sc.SortOrder,
                            Slug = sc.Slug,
                            MetaTitle = sc.MetaTitle,
                            MetaDescription = sc.MetaDescription,
                            CreatedDate = sc.CreatedDate,
                            ProductCount = sc.Products.Count(p => p.IsActive)
                        }).ToList(),
                        ProductCount = c.Products.Count(p => p.IsActive)
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                throw;
            }
        }

        public async Task<ProductCategoryDto?> GetCategoryByIdAsync(int id)
        {
            try
            {
                var category = await _context.ProductCategories
                    .Include(c => c.ParentCategory)
                    .Include(c => c.SubCategories)
                    .Include(c => c.Products)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (category == null)
                    return null;

                return new ProductCategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    ParentCategoryId = category.ParentCategoryId,
                    ParentCategoryName = category.ParentCategory?.Name,
                    IsActive = category.IsActive,
                    ImageUrl = category.ImageUrl,
                    SortOrder = category.SortOrder,
                    Slug = category.Slug,
                    MetaTitle = category.MetaTitle,
                    MetaDescription = category.MetaDescription,
                    CreatedDate = category.CreatedDate,
                    SubCategories = category.SubCategories.Select(sc => new ProductCategoryDto
                    {
                        Id = sc.Id,
                        Name = sc.Name,
                        Description = sc.Description,
                        ParentCategoryId = sc.ParentCategoryId,
                        ParentCategoryName = category.Name,
                        IsActive = sc.IsActive,
                        ImageUrl = sc.ImageUrl,
                        SortOrder = sc.SortOrder,
                        Slug = sc.Slug,
                        MetaTitle = sc.MetaTitle,
                        MetaDescription = sc.MetaDescription,
                        CreatedDate = sc.CreatedDate
                    }).ToList(),
                    ProductCount = category.Products.Count(p => p.IsActive)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category {CategoryId}", id);
                throw;
            }
        }

        public async Task<ProductCategoryDto> CreateCategoryAsync(CreateProductCategoryDto createCategoryDto)
        {
            try
            {
                var category = new ProductCategory
                {
                    Name = createCategoryDto.Name,
                    Description = createCategoryDto.Description,
                    ParentCategoryId = createCategoryDto.ParentCategoryId,
                    ImageUrl = createCategoryDto.ImageUrl,
                    SortOrder = createCategoryDto.SortOrder,
                    Slug = createCategoryDto.Slug ?? createCategoryDto.Name.ToLower().Replace(" ", "-"),
                    MetaTitle = createCategoryDto.MetaTitle,
                    MetaDescription = createCategoryDto.MetaDescription,
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };

                _context.ProductCategories.Add(category);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Category {CategoryId} created", category.Id);

                return await GetCategoryByIdAsync(category.Id) ?? throw new InvalidOperationException("Failed to retrieve created category");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                throw;
            }
        }

        public async Task<ProductCategoryDto?> UpdateCategoryAsync(int id, UpdateProductCategoryDto updateCategoryDto)
        {
            try
            {
                var category = await _context.ProductCategories.FindAsync(id);
                if (category == null)
                    return null;

                category.Name = updateCategoryDto.Name;
                category.Description = updateCategoryDto.Description;
                category.ParentCategoryId = updateCategoryDto.ParentCategoryId;
                category.ImageUrl = updateCategoryDto.ImageUrl;
                category.SortOrder = updateCategoryDto.SortOrder;
                category.Slug = updateCategoryDto.Slug ?? updateCategoryDto.Name.ToLower().Replace(" ", "-");
                category.MetaTitle = updateCategoryDto.MetaTitle;
                category.MetaDescription = updateCategoryDto.MetaDescription;
                category.IsActive = updateCategoryDto.IsActive;
                category.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Category {CategoryId} updated", id);

                return await GetCategoryByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category {CategoryId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            try
            {
                var category = await _context.ProductCategories
                    .Include(c => c.Products)
                    .Include(c => c.SubCategories)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (category == null)
                    return false;

                // Check if category has products or subcategories
                if (category.Products.Any() || category.SubCategories.Any())
                {
                    // Soft delete - set IsActive to false
                    category.IsActive = false;
                    category.UpdatedDate = DateTime.UtcNow;
                }
                else
                {
                    // Hard delete if no dependencies
                    _context.ProductCategories.Remove(category);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Category {CategoryId} deleted", id);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category {CategoryId}", id);
                throw;
            }
        }

        public async Task<List<ProductImageDto>> UploadProductImagesAsync(int productId, List<IFormFile> images, string vendorId)
        {
            try
            {
                // Verify product belongs to vendor
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.Id == productId && p.VendorId == vendorId);

                if (product == null)
                    throw new UnauthorizedAccessException("Product not found or access denied");

                var imageEntities = new List<ProductImage>();
                var maxSortOrder = await _context.ProductImages
                    .Where(pi => pi.ProductId == productId)
                    .MaxAsync(pi => (int?)pi.SortOrder) ?? 0;

                foreach (var image in images)
                {
                    // In a real implementation, you would upload to cloud storage here
                    // For now, we'll simulate with a placeholder URL
                    var imageUrl = $"/uploads/products/{Guid.NewGuid()}-{image.FileName}";

                    var imageEntity = new ProductImage
                    {
                        ProductId = productId,
                        ImageUrl = imageUrl,
                        AltText = product.Name,
                        SortOrder = ++maxSortOrder,
                        IsPrimary = false,
                        CreatedDate = DateTime.UtcNow
                    };

                    imageEntities.Add(imageEntity);
                }

                _context.ProductImages.AddRange(imageEntities);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Uploaded {ImageCount} images for product {ProductId}", images.Count, productId);

                return imageEntities.Select(ie => new ProductImageDto
                {
                    Id = ie.Id,
                    ImageUrl = ie.ImageUrl,
                    AltText = ie.AltText,
                    SortOrder = ie.SortOrder,
                    IsPrimary = ie.IsPrimary
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading images for product {ProductId}", productId);
                throw;
            }
        }

        public async Task<bool> DeleteProductImageAsync(int imageId, string vendorId)
        {
            try
            {
                var image = await _context.ProductImages
                    .Include(pi => pi.Product)
                    .FirstOrDefaultAsync(pi => pi.Id == imageId && pi.Product.VendorId == vendorId);

                if (image == null)
                    return false;

                _context.ProductImages.Remove(image);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Image {ImageId} deleted for product {ProductId}", imageId, image.ProductId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image {ImageId}", imageId);
                throw;
            }
        }

        public async Task<bool> SetPrimaryImageAsync(int imageId, string vendorId)
        {
            try
            {
                var image = await _context.ProductImages
                    .Include(pi => pi.Product)
                    .FirstOrDefaultAsync(pi => pi.Id == imageId && pi.Product.VendorId == vendorId);

                if (image == null)
                    return false;

                // Remove primary flag from other images of the same product
                var otherImages = await _context.ProductImages
                    .Where(pi => pi.ProductId == image.ProductId && pi.Id != imageId)
                    .ToListAsync();

                foreach (var otherImage in otherImages)
                {
                    otherImage.IsPrimary = false;
                }

                // Set this image as primary
                image.IsPrimary = true;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Image {ImageId} set as primary for product {ProductId}", imageId, image.ProductId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting primary image {ImageId}", imageId);
                throw;
            }
        }
    }
}