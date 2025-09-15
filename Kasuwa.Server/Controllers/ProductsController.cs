using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Services;

namespace Kasuwa.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductService productService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        /// <summary>
        /// Search and filter products
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ProductSearchResultDto>> GetProducts([FromQuery] ProductSearchDto searchDto)
        {
            try
            {
                var result = await _productService.SearchProductsAsync(searchDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching products");
                return StatusCode(500, "An error occurred while searching products");
            }
        }

        /// <summary>
        /// Get product by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound("Product not found");
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting product {ProductId}", id);
                return StatusCode(500, "An error occurred while retrieving the product");
            }
        }

        /// <summary>
        /// Create a new product (Vendor/Admin only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "RequireVendorOrAdmin")]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createProductDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var product = await _productService.CreateProductAsync(createProductDto, userId);
                
                _logger.LogInformation("Product {ProductId} created by user {UserId}", product.Id, userId);
                
                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, "An error occurred while creating the product");
            }
        }

        /// <summary>
        /// Update an existing product (Vendor/Admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "RequireVendorOrAdmin")]
        public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] UpdateProductDto updateProductDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var product = await _productService.UpdateProductAsync(id, updateProductDto, userId);
                if (product == null)
                {
                    return NotFound("Product not found or access denied");
                }

                _logger.LogInformation("Product {ProductId} updated by user {UserId}", id, userId);

                return Ok(product);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product {ProductId}", id);
                return StatusCode(500, "An error occurred while updating the product");
            }
        }

        /// <summary>
        /// Delete a product (Vendor/Admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "RequireVendorOrAdmin")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _productService.DeleteProductAsync(id, userId);
                if (!success)
                {
                    return NotFound("Product not found or access denied");
                }

                _logger.LogInformation("Product {ProductId} deleted by user {UserId}", id, userId);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product {ProductId}", id);
                return StatusCode(500, "An error occurred while deleting the product");
            }
        }

        /// <summary>
        /// Upload images for a product (Vendor/Admin only)
        /// </summary>
        [HttpPost("{id}/images")]
        [Authorize(Policy = "RequireVendorOrAdmin")]
        public async Task<ActionResult<List<ProductImageDto>>> UploadProductImages(int id, [FromForm] List<IFormFile> images)
        {
            try
            {
                if (images == null || !images.Any())
                {
                    return BadRequest("No images provided");
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var uploadedImages = await _productService.UploadProductImagesAsync(id, images, userId);
                
                _logger.LogInformation("Uploaded {ImageCount} images for product {ProductId}", images.Count, id);

                return Ok(uploadedImages);
            }
            catch (UnauthorizedAccessException)
            {
                return NotFound("Product not found or access denied");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading images for product {ProductId}", id);
                return StatusCode(500, "An error occurred while uploading images");
            }
        }

        /// <summary>
        /// Delete a product image (Vendor/Admin only)
        /// </summary>
        [HttpDelete("images/{imageId}")]
        [Authorize(Policy = "RequireVendorOrAdmin")]
        public async Task<ActionResult> DeleteProductImage(int imageId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _productService.DeleteProductImageAsync(imageId, userId);
                if (!success)
                {
                    return NotFound("Image not found or access denied");
                }

                _logger.LogInformation("Image {ImageId} deleted by user {UserId}", imageId, userId);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image {ImageId}", imageId);
                return StatusCode(500, "An error occurred while deleting the image");
            }
        }

        /// <summary>
        /// Set primary image for a product (Vendor/Admin only)
        /// </summary>
        [HttpPut("images/{imageId}/set-primary")]
        [Authorize(Policy = "RequireVendorOrAdmin")]
        public async Task<ActionResult> SetPrimaryImage(int imageId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _productService.SetPrimaryImageAsync(imageId, userId);
                if (!success)
                {
                    return NotFound("Image not found or access denied");
                }

                _logger.LogInformation("Image {ImageId} set as primary by user {UserId}", imageId, userId);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting primary image {ImageId}", imageId);
                return StatusCode(500, "An error occurred while setting primary image");
            }
        }

        /// <summary>
        /// Get product categories
        /// </summary>
        [HttpGet("categories")]
        public async Task<ActionResult<List<ProductCategoryDto>>> GetCategories()
        {
            try
            {
                var categories = await _productService.GetCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                return StatusCode(500, "An error occurred while retrieving categories");
            }
        }

        /// <summary>
        /// Get category by ID
        /// </summary>
        [HttpGet("categories/{id}")]
        public async Task<ActionResult<ProductCategoryDto>> GetCategory(int id)
        {
            try
            {
                var category = await _productService.GetCategoryByIdAsync(id);
                if (category == null)
                {
                    return NotFound("Category not found");
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category {CategoryId}", id);
                return StatusCode(500, "An error occurred while retrieving the category");
            }
        }

        /// <summary>
        /// Create a new category (Admin only)
        /// </summary>
        [HttpPost("categories")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult<ProductCategoryDto>> CreateCategory([FromBody] CreateProductCategoryDto createCategoryDto)
        {
            try
            {
                var category = await _productService.CreateCategoryAsync(createCategoryDto);
                
                _logger.LogInformation("Category {CategoryId} created", category.Id);
                
                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return StatusCode(500, "An error occurred while creating the category");
            }
        }

        /// <summary>
        /// Update an existing category (Admin only)
        /// </summary>
        [HttpPut("categories/{id}")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult<ProductCategoryDto>> UpdateCategory(int id, [FromBody] UpdateProductCategoryDto updateCategoryDto)
        {
            try
            {
                var category = await _productService.UpdateCategoryAsync(id, updateCategoryDto);
                if (category == null)
                {
                    return NotFound("Category not found");
                }

                _logger.LogInformation("Category {CategoryId} updated", id);

                return Ok(category);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category {CategoryId}", id);
                return StatusCode(500, "An error occurred while updating the category");
            }
        }

        /// <summary>
        /// Delete a category (Admin only)
        /// </summary>
        [HttpDelete("categories/{id}")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            try
            {
                var success = await _productService.DeleteCategoryAsync(id);
                if (!success)
                {
                    return NotFound("Category not found");
                }

                _logger.LogInformation("Category {CategoryId} deleted", id);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category {CategoryId}", id);
                return StatusCode(500, "An error occurred while deleting the category");
            }
        }

        /// <summary>
        /// Search products (Alternative endpoint with POST for complex queries)
        /// </summary>
        [HttpPost("search")]
        public async Task<ActionResult<ProductSearchResultDto>> SearchProducts([FromBody] ProductSearchDto searchDto)
        {
            try
            {
                var result = await _productService.SearchProductsAsync(searchDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching products");
                return StatusCode(500, "An error occurred while searching products");
            }
        }
    }
}