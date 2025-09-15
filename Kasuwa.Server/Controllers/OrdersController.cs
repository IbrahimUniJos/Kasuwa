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
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        /// <summary>
        /// Get orders for the current user (customer or vendor)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<OrderSearchResultDto>> GetOrders([FromQuery] OrderSearchDto searchDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var isAdmin = User.IsInRole("Administrator");
                var result = await _orderService.SearchOrdersAsync(searchDto, userId, isAdmin);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for user");
                return StatusCode(500, "An error occurred while retrieving orders");
            }
        }

        /// <summary>
        /// Get specific order by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var isAdmin = User.IsInRole("Administrator");
                var order = await _orderService.GetOrderByIdAsync(id, isAdmin ? null : userId);

                if (order == null)
                {
                    return NotFound("Order not found or access denied");
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order {OrderId}", id);
                return StatusCode(500, "An error occurred while retrieving the order");
            }
        }

        /// <summary>
        /// Create a new order (Customer only)
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto createOrderDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var order = await _orderService.CreateOrderAsync(createOrderDto, userId);

                _logger.LogInformation("Order {OrderNumber} created by customer {CustomerId}", order.OrderNumber, userId);

                return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, "An error occurred while creating the order");
            }
        }

        /// <summary>
        /// Update order status (Vendor/Admin only)
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Policy = "RequireVendorOrAdmin")]
        public async Task<ActionResult<OrderDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto updateStatusDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var order = await _orderService.UpdateOrderStatusAsync(id, updateStatusDto, userId);
                if (order == null)
                {
                    return NotFound("Order not found or access denied");
                }

                _logger.LogInformation("Order {OrderId} status updated to {Status} by user {UserId}", id, updateStatusDto.Status, userId);

                return Ok(order);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("You don't have permission to update this order");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status for order {OrderId}", id);
                return StatusCode(500, "An error occurred while updating the order status");
            }
        }

        /// <summary>
        /// Cancel an order (Customer can cancel their own orders)
        /// </summary>
        [HttpPost("{id}/cancel")]
        public async Task<ActionResult> CancelOrder(int id, [FromBody] CancelOrderDto cancelOrderDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _orderService.CancelOrderAsync(id, cancelOrderDto, userId);
                if (!success)
                {
                    return NotFound("Order not found");
                }

                _logger.LogInformation("Order {OrderId} cancelled by user {UserId}", id, userId);

                return Ok(new { message = "Order cancelled successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid("You don't have permission to cancel this order");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling order {OrderId}", id);
                return StatusCode(500, "An error occurred while cancelling the order");
            }
        }

        /// <summary>
        /// Get order tracking information
        /// </summary>
        [HttpGet("{id}/tracking")]
        public async Task<ActionResult<List<OrderTrackingDto>>> GetOrderTracking(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // First check if user has access to this order
                var isAdmin = User.IsInRole("Administrator");
                var order = await _orderService.GetOrderByIdAsync(id, isAdmin ? null : userId);
                if (order == null)
                {
                    return NotFound("Order not found or access denied");
                }

                var tracking = await _orderService.GetOrderTrackingAsync(id);
                return Ok(tracking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tracking for order {OrderId}", id);
                return StatusCode(500, "An error occurred while retrieving order tracking");
            }
        }

        /// <summary>
        /// Update order tracking information (Vendor/Admin only)
        /// </summary>
        [HttpPut("{id}/tracking")]
        [Authorize(Policy = "RequireVendorOrAdmin")]
        public async Task<ActionResult> UpdateOrderTracking(int id, [FromBody] UpdateTrackingDto updateTrackingDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _orderService.UpdateOrderTrackingAsync(id, updateTrackingDto.TrackingNumber, updateTrackingDto.Location, userId);
                if (!success)
                {
                    return NotFound("Order not found");
                }

                _logger.LogInformation("Tracking updated for order {OrderId} by user {UserId}", id, userId);

                return Ok(new { message = "Tracking information updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tracking for order {OrderId}", id);
                return StatusCode(500, "An error occurred while updating tracking information");
            }
        }

        /// <summary>
        /// Get order statistics (Vendor/Admin only)
        /// </summary>
        [HttpGet("stats")]
        [Authorize(Policy = "RequireVendorOrAdmin")]
        public async Task<ActionResult<OrderStatsDto>> GetOrderStats([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var isAdmin = User.IsInRole("Administrator");
                var vendorId = isAdmin ? null : userId;

                var stats = await _orderService.GetOrderStatsAsync(vendorId, fromDate, toDate);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order stats");
                return StatusCode(500, "An error occurred while retrieving order statistics");
            }
        }

        /// <summary>
        /// Get customer's orders
        /// </summary>
        [HttpGet("customer")]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<List<OrderListDto>>> GetCustomerOrders()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var orders = await _orderService.GetCustomerOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer orders");
                return StatusCode(500, "An error occurred while retrieving customer orders");
            }
        }

        /// <summary>
        /// Get vendor's orders
        /// </summary>
        [HttpGet("vendor")]
        [Authorize(Policy = "RequireVendorRole")]
        public async Task<ActionResult<List<OrderListDto>>> GetVendorOrders()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var orders = await _orderService.GetVendorOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting vendor orders");
                return StatusCode(500, "An error occurred while retrieving vendor orders");
            }
        }
    }

    // Additional DTO for tracking updates
    public class UpdateTrackingDto
    {
        [Required]
        [MaxLength(100)]
        public string TrackingNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Location { get; set; }
    }
}