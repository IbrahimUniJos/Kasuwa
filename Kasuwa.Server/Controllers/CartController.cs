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
    [Authorize] // Remove the specific policy requirement to allow all authenticated users
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly ILogger<CartController> _logger;

        public CartController(ICartService cartService, ILogger<CartController> logger)
        {
            _cartService = cartService;
            _logger = logger;
        }

        /// <summary>
        /// Get current user's cart
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<CartDto>> GetCart()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var cart = await _cartService.GetCartAsync(userId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart");
                return StatusCode(500, "An error occurred while retrieving the cart");
            }
        }

        /// <summary>
        /// Add item to cart
        /// </summary>
        [HttpPost("items")]
        public async Task<ActionResult<CartDto>> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                await _cartService.AddToCartAsync(userId, addToCartDto);

                // Return the full updated cart
                var cart = await _cartService.GetCartAsync(userId);

                _logger.LogInformation("Added product {ProductId} to cart for user {UserId}", addToCartDto.ProductId, userId);

                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart");
                return StatusCode(500, "An error occurred while adding the item to cart");
            }
        }

        /// <summary>
        /// Update cart item
        /// </summary>
        [HttpPut("items/{itemId}")]
        public async Task<ActionResult<CartDto>> UpdateCartItem(int itemId, [FromBody] UpdateCartItemDto updateCartItemDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var cartItem = await _cartService.UpdateCartItemAsync(userId, itemId, updateCartItemDto);
                if (cartItem == null)
                {
                    return NotFound("Cart item not found");
                }

                // Return the full updated cart
                var cart = await _cartService.GetCartAsync(userId);

                _logger.LogInformation("Updated cart item {ItemId} for user {UserId}", itemId, userId);

                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item {ItemId}", itemId);
                return StatusCode(500, "An error occurred while updating the cart item");
            }
        }

        /// <summary>
        /// Remove item from cart
        /// </summary>
        [HttpDelete("items/{itemId}")]
        public async Task<ActionResult<CartDto>> RemoveFromCart(int itemId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _cartService.RemoveFromCartAsync(userId, itemId);
                if (!success)
                {
                    return NotFound("Cart item not found");
                }

                // Return the updated cart
                var cart = await _cartService.GetCartAsync(userId);

                _logger.LogInformation("Removed cart item {ItemId} for user {UserId}", itemId, userId);

                return Ok(cart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing cart item {ItemId}", itemId);
                return StatusCode(500, "An error occurred while removing the item from cart");
            }
        }

        /// <summary>
        /// Remove multiple items from cart
        /// </summary>
        [HttpDelete("items")]
        public async Task<ActionResult> RemoveMultipleItems([FromBody] BulkCartActionDto bulkActionDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _cartService.RemoveMultipleItemsAsync(userId, bulkActionDto.ItemIds);
                if (!success)
                {
                    return NotFound("No items found to remove");
                }

                _logger.LogInformation("Removed {Count} cart items for user {UserId}", bulkActionDto.ItemIds.Count, userId);

                return Ok(new { message = $"Removed {bulkActionDto.ItemIds.Count} items from cart" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing multiple cart items");
                return StatusCode(500, "An error occurred while removing items from cart");
            }
        }

        /// <summary>
        /// Clear entire cart
        /// </summary>
        [HttpDelete]
        public async Task<ActionResult> ClearCart()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                await _cartService.ClearCartAsync(userId);

                _logger.LogInformation("Cleared cart for user {UserId}", userId);

                return Ok(new { message = "Cart cleared successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart");
                return StatusCode(500, "An error occurred while clearing the cart");
            }
        }

        /// <summary>
        /// Get cart summary with totals
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<CartSummaryDto>> GetCartSummary()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var summary = await _cartService.GetCartSummaryAsync(userId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart summary");
                return StatusCode(500, "An error occurred while retrieving cart summary");
            }
        }

        /// <summary>
        /// Validate cart items (check stock, availability, etc.)
        /// </summary>
        [HttpGet("validate")]
        public async Task<ActionResult<CartValidationResultDto>> ValidateCart()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var validation = await _cartService.ValidateCartAsync(userId);
                return Ok(validation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating cart");
                return StatusCode(500, "An error occurred while validating the cart");
            }
        }

        /// <summary>
        /// Get cart item count
        /// </summary>
        [HttpGet("count")]
        public async Task<ActionResult<int>> GetCartItemCount()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var count = await _cartService.GetCartItemCountAsync(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cart item count");
                return StatusCode(500, "An error occurred while retrieving cart item count");
            }
        }

        /// <summary>
        /// Merge guest cart with user cart (typically used after login)
        /// </summary>
        [HttpPost("merge")]
        public async Task<ActionResult> MergeCart([FromBody] MergeCartDto mergeCartDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _cartService.MergeCartsAsync(mergeCartDto.GuestUserId, userId);
                if (!success)
                {
                    return BadRequest("Failed to merge carts");
                }

                _logger.LogInformation("Merged guest cart {GuestUserId} with user cart {UserId}", mergeCartDto.GuestUserId, userId);

                return Ok(new { message = "Carts merged successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error merging carts");
                return StatusCode(500, "An error occurred while merging carts");
            }
        }
    }

    // Additional DTO for merging carts
    public class MergeCartDto
    {
        [Required]
        public string GuestUserId { get; set; } = string.Empty;
    }
}