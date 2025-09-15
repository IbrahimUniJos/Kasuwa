using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Services;

namespace Kasuwa.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "RequireCustomerRole")]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;
        private readonly ILogger<WishlistController> _logger;

        public WishlistController(IWishlistService wishlistService, ILogger<WishlistController> logger)
        {
            _wishlistService = wishlistService;
            _logger = logger;
        }

        /// <summary>
        /// Get current user's wishlist
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<WishlistDto>> GetWishlist()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var wishlist = await _wishlistService.GetWishlistAsync(userId);
                return Ok(wishlist);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wishlist");
                return StatusCode(500, "An error occurred while retrieving the wishlist");
            }
        }

        /// <summary>
        /// Add item to wishlist
        /// </summary>
        [HttpPost("items")]
        public async Task<ActionResult<WishlistItemDto>> AddToWishlist([FromBody] AddToWishlistDto addToWishlistDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var wishlistItem = await _wishlistService.AddToWishlistAsync(userId, addToWishlistDto);

                _logger.LogInformation("Added product {ProductId} to wishlist for user {UserId}", addToWishlistDto.ProductId, userId);

                return Ok(wishlistItem);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to wishlist");
                return StatusCode(500, "An error occurred while adding the item to wishlist");
            }
        }

        /// <summary>
        /// Remove item from wishlist
        /// </summary>
        [HttpDelete("items/{itemId}")]
        public async Task<ActionResult> RemoveFromWishlist(int itemId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _wishlistService.RemoveFromWishlistAsync(userId, itemId);
                if (!success)
                {
                    return NotFound("Wishlist item not found");
                }

                _logger.LogInformation("Removed wishlist item {ItemId} for user {UserId}", itemId, userId);

                return Ok(new { message = "Item removed from wishlist" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing wishlist item {ItemId}", itemId);
                return StatusCode(500, "An error occurred while removing the item from wishlist");
            }
        }

        /// <summary>
        /// Remove multiple items from wishlist
        /// </summary>
        [HttpDelete("items")]
        public async Task<ActionResult> RemoveMultipleItems([FromBody] BulkWishlistActionDto bulkActionDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _wishlistService.RemoveMultipleItemsAsync(userId, bulkActionDto.ItemIds);
                if (!success)
                {
                    return NotFound("No items found to remove");
                }

                _logger.LogInformation("Removed {Count} wishlist items for user {UserId}", bulkActionDto.ItemIds.Count, userId);

                return Ok(new { message = $"Removed {bulkActionDto.ItemIds.Count} items from wishlist" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing multiple wishlist items");
                return StatusCode(500, "An error occurred while removing items from wishlist");
            }
        }

        /// <summary>
        /// Clear entire wishlist
        /// </summary>
        [HttpDelete]
        public async Task<ActionResult> ClearWishlist()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                await _wishlistService.ClearWishlistAsync(userId);

                _logger.LogInformation("Cleared wishlist for user {UserId}", userId);

                return Ok(new { message = "Wishlist cleared successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing wishlist");
                return StatusCode(500, "An error occurred while clearing the wishlist");
            }
        }

        /// <summary>
        /// Move item from wishlist to cart
        /// </summary>
        [HttpPost("items/{itemId}/move-to-cart")]
        public async Task<ActionResult<CartItemDto>> MoveToCart(int itemId, [FromBody] MoveToCartDto moveToCartDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // Set the item ID from the route
                moveToCartDto.WishlistItemId = itemId;

                var cartItem = await _wishlistService.MoveToCartAsync(userId, moveToCartDto);

                _logger.LogInformation("Moved wishlist item {ItemId} to cart for user {UserId}", itemId, userId);

                return Ok(cartItem);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error moving wishlist item {ItemId} to cart", itemId);
                return StatusCode(500, "An error occurred while moving the item to cart");
            }
        }

        /// <summary>
        /// Move all items from wishlist to cart
        /// </summary>
        [HttpPost("move-all-to-cart")]
        public async Task<ActionResult<List<CartItemDto>>> MoveAllToCart()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var cartItems = await _wishlistService.MoveAllToCartAsync(userId);

                _logger.LogInformation("Moved {Count} items from wishlist to cart for user {UserId}", cartItems.Count, userId);

                return Ok(cartItems);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error moving all wishlist items to cart");
                return StatusCode(500, "An error occurred while moving items to cart");
            }
        }

        /// <summary>
        /// Get wishlist item count
        /// </summary>
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetWishlistItemCount()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var count = await _wishlistService.GetWishlistItemCountAsync(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wishlist item count");
                return StatusCode(500, "An error occurred while retrieving wishlist item count");
            }
        }

        /// <summary>
        /// Check if a product is in the user's wishlist
        /// </summary>
        [HttpGet("contains/{productId}")]
        public async Task<ActionResult<bool>> IsProductInWishlist(int productId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var isInWishlist = await _wishlistService.IsProductInWishlistAsync(userId, productId);
                return Ok(isInWishlist);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if product {ProductId} is in wishlist", productId);
                return StatusCode(500, "An error occurred while checking wishlist status");
            }
        }

        /// <summary>
        /// Get recommended products based on wishlist
        /// </summary>
        [HttpGet("recommendations")]
        public async Task<ActionResult<List<WishlistItemDto>>> GetRecommendations([FromQuery] int limit = 10)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var recommendations = await _wishlistService.GetRecentlyViewedSimilarAsync(userId, limit);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting wishlist recommendations");
                return StatusCode(500, "An error occurred while retrieving recommendations");
            }
        }

        /// <summary>
        /// Toggle product in wishlist (add if not present, remove if present)
        /// </summary>
        [HttpPost("toggle/{productId}")]
        public async Task<ActionResult<WishlistToggleResultDto>> ToggleProduct(int productId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var isInWishlist = await _wishlistService.IsProductInWishlistAsync(userId, productId);

                if (isInWishlist)
                {
                    // Remove from wishlist
                    var wishlistItem = await _wishlistService.GetWishlistAsync(userId);
                    var item = wishlistItem.WishlistItems.FirstOrDefault(wi => wi.ProductId == productId);
                    
                    if (item != null)
                    {
                        await _wishlistService.RemoveFromWishlistAsync(userId, item.Id);
                        
                        _logger.LogInformation("Removed product {ProductId} from wishlist for user {UserId}", productId, userId);
                        
                        return Ok(new WishlistToggleResultDto 
                        { 
                            IsInWishlist = false, 
                            Message = "Product removed from wishlist" 
                        });
                    }
                }
                else
                {
                    // Add to wishlist
                    var addToWishlistDto = new AddToWishlistDto { ProductId = productId };
                    await _wishlistService.AddToWishlistAsync(userId, addToWishlistDto);
                    
                    _logger.LogInformation("Added product {ProductId} to wishlist for user {UserId}", productId, userId);
                    
                    return Ok(new WishlistToggleResultDto 
                    { 
                        IsInWishlist = true, 
                        Message = "Product added to wishlist" 
                    });
                }

                return BadRequest("Unable to toggle wishlist status");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling product {ProductId} in wishlist", productId);
                return StatusCode(500, "An error occurred while updating wishlist");
            }
        }
    }

    // Additional DTO for wishlist toggle result
    public class WishlistToggleResultDto
    {
        public bool IsInWishlist { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}