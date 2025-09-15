using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;
using Kasuwa.Server.Services;

namespace Kasuwa.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(IReviewService reviewService, ILogger<ReviewsController> logger)
        {
            _reviewService = reviewService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new review
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] CreateReviewDto createReviewDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var review = await _reviewService.CreateReviewAsync(userId, createReviewDto);

                _logger.LogInformation("Review {ReviewId} created by user {UserId} for product {ProductId}", 
                    review.Id, userId, createReviewDto.ProductId);

                return Ok(review);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review for product {ProductId} by user {UserId}", 
                    createReviewDto.ProductId, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while creating the review");
            }
        }

        /// <summary>
        /// Get reviews for a product
        /// </summary>
        [HttpGet("product/{productId}")]
        [AllowAnonymous]
        public async Task<ActionResult<ReviewSearchResultDto>> GetProductReviews(int productId, [FromQuery] ReviewSearchDto searchDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                var result = await _reviewService.SearchReviewsAsync(new ReviewSearchDto
                {
                    ProductId = productId,
                    SearchTerm = searchDto.SearchTerm,
                    Rating = searchDto.Rating,
                    FromDate = searchDto.FromDate,
                    ToDate = searchDto.ToDate,
                    SortBy = searchDto.SortBy,
                    SortDirection = searchDto.SortDirection,
                    PageNumber = searchDto.PageNumber,
                    PageSize = searchDto.PageSize
                }, userId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for product {ProductId}", productId);
                return StatusCode(500, "An error occurred while retrieving product reviews");
            }
        }

        /// <summary>
        /// Update a review
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<ReviewDto>> UpdateReview(int id, [FromBody] UpdateReviewDto updateReviewDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var review = await _reviewService.UpdateReviewAsync(id, userId, updateReviewDto);
                if (review == null)
                {
                    return NotFound("Review not found or access denied");
                }

                _logger.LogInformation("Review {ReviewId} updated by user {UserId}", id, userId);

                return Ok(review);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review {ReviewId} by user {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while updating the review");
            }
        }

        /// <summary>
        /// Delete a review
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<bool>> DeleteReview(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _reviewService.DeleteReviewAsync(id, userId);
                if (!result)
                {
                    return NotFound("Review not found or access denied");
                }

                _logger.LogInformation("Review {ReviewId} deleted by user {UserId}", id, userId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review {ReviewId} by user {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while deleting the review");
            }
        }

        /// <summary>
        /// Mark a review as helpful or not helpful
        /// </summary>
        [HttpPost("{id}/helpful")]
        [Authorize]
        public async Task<ActionResult<bool>> MarkReviewAsHelpful(int id, [FromBody] MarkHelpfulDto markHelpfulDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _reviewService.MarkReviewAsHelpfulAsync(id, userId, markHelpfulDto.IsHelpful);
                if (!result)
                {
                    return NotFound("Review not found");
                }

                _logger.LogInformation("Review {ReviewId} marked as {HelpfulStatus} by user {UserId}", 
                    id, markHelpfulDto.IsHelpful ? "helpful" : "not helpful", userId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking review {ReviewId} as helpful by user {UserId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while marking the review as helpful");
            }
        }

        /// <summary>
        /// Check if a review is helpful for the current user
        /// </summary>
        [HttpGet("{id}/is-helpful")]
        [Authorize]
        public async Task<ActionResult<bool>> IsReviewHelpful(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var isHelpful = await _reviewService.IsReviewHelpfulByUserAsync(id, userId);

                return Ok(isHelpful);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if review {ReviewId} is helpful for user {UserId}", id, userId);
                return StatusCode(500, "An error occurred while checking review helpful status");
            }
        }

        /// <summary>
        /// Get review statistics (Admin only)
        /// </summary>
        [HttpGet("stats")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult<ReviewStatsDto>> GetReviewStats()
        {
            try
            {
                var stats = await _reviewService.GetReviewStatsAsync();

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review stats");
                return StatusCode(500, "An error occurred while retrieving review statistics");
            }
        }

        /// <summary>
        /// Get customer review summary
        /// </summary>
        [HttpGet("customer/{customerId}/summary")]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<CustomerReviewSummaryDto>> GetCustomerReviewSummary(string customerId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // Only allow customers to get their own summary
                if (userId != customerId && !User.IsInRole("Administrator"))
                {
                    return Forbid("Access denied");
                }

                var summary = await _reviewService.GetCustomerReviewSummaryAsync(customerId);

                return Ok(summary);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review summary for customer {CustomerId}", customerId);
                return StatusCode(500, "An error occurred while retrieving customer review summary");
            }
        }

        /// <summary>
        /// Get vendor review summary
        /// </summary>
        [HttpGet("vendor/{vendorId}/summary")]
        [Authorize(Policy = "RequireVendorOrAdmin")]
        public async Task<ActionResult<VendorReviewSummaryDto>> GetVendorReviewSummary(string vendorId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // Only allow vendor to get their own summary or admin
                if (userId != vendorId && !User.IsInRole("Administrator"))
                {
                    return Forbid("Access denied");
                }

                var summary = await _reviewService.GetVendorReviewSummaryAsync(vendorId);

                return Ok(summary);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review summary for vendor {VendorId}", vendorId);
                return StatusCode(500, "An error occurred while retrieving vendor review summary");
            }
        }

        /// <summary>
        /// Get pending reviews for approval (Admin only)
        /// </summary>
        [HttpGet("pending")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult<List<ReviewDto>>> GetPendingReviews([FromQuery] int limit = 50)
        {
            try
            {
                var reviews = await _reviewService.GetPendingReviewsAsync(limit);

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending reviews");
                return StatusCode(500, "An error occurred while retrieving pending reviews");
            }
        }

        /// <summary>
        /// Apply bulk action to reviews (Admin only)
        /// </summary>
        [HttpPost("bulk-action")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult<bool>> BulkReviewAction([FromBody] BulkReviewActionDto bulkActionDto)
        {
            try
            {
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminId))
                {
                    return Unauthorized();
                }

                var success = await _reviewService.BulkReviewActionAsync(bulkActionDto, adminId);

                _logger.LogInformation("Bulk action '{Action}' applied to {Count} reviews by admin {AdminId}", 
                    bulkActionDto.Action, bulkActionDto.ReviewIds.Count, adminId);

                return Ok(success);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying bulk action");
                return StatusCode(500, "An error occurred while applying bulk action");
            }
        }

        /// <summary>
        /// Respond to a review (Vendor only)
        /// </summary>
        [HttpPost("{id}/respond")]
        [Authorize(Policy = "RequireVendorRole")]
        public async Task<ActionResult<bool>> RespondToReview(int id, [FromBody] RespondToReviewDto respondDto)
        {
            var vendorId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            try
            {
                if (string.IsNullOrEmpty(vendorId))
                {
                    return Unauthorized();
                }

                var success = await _reviewService.RespondToReviewAsync(id, vendorId, respondDto.Response);

                if (!success)
                {
                    return NotFound("Review not found or access denied");
                }

                _logger.LogInformation("Vendor {VendorId} responded to review {ReviewId}", vendorId, id);

                return Ok(success);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error responding to review {ReviewId} by vendor {VendorId}", id, vendorId);
                return StatusCode(500, "An error occurred while responding to the review");
            }
        }

        /// <summary>
        /// Get recent reviews
        /// </summary>
        [HttpGet("recent")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ReviewDto>>> GetRecentReviews([FromQuery] int limit = 10)
        {
            try
            {
                var reviews = await _reviewService.GetRecentReviewsAsync(limit);

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent reviews");
                return StatusCode(500, "An error occurred while retrieving recent reviews");
            }
        }
    }
}