using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;
using Kasuwa.Server.Services;

namespace Kasuwa.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "RequireVendorRole")]
    public class VendorController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IProductService _productService;
        private readonly IOrderService _orderService;
        private readonly ILogger<VendorController> _logger;

        public VendorController(
            UserManager<ApplicationUser> userManager,
            IProductService productService,
            IOrderService orderService,
            ILogger<VendorController> logger)
        {
            _userManager = userManager;
            _productService = productService;
            _orderService = orderService;
            _logger = logger;
        }

        /// <summary>
        /// Update vendor business profile
        /// </summary>
        [HttpPut("business-profile")]
        public async Task<ActionResult<AuthResponseDto>> UpdateBusinessProfile([FromBody] UpdateVendorBusinessProfileDto request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                user.BusinessName = request.BusinessName;
                user.BusinessDescription = request.BusinessDescription;
                user.BusinessAddress = request.BusinessAddress;
                user.BusinessPhone = request.BusinessPhone;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest(new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    });
                }

                _logger.LogInformation("Vendor {VendorId} updated business profile", userId);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Business profile updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating business profile for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "An error occurred while updating business profile"
                });
            }
        }

        /// <summary>
        /// Get vendor dashboard statistics
        /// </summary>
        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<VendorDashboardStatsDto>> GetDashboardStats()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                // For now, return mock data since we don't have products/orders tables yet
                // In a real implementation, you would query these from the database
                
                // Get actual data from database
                var vendorProducts = await _productService.GetVendorProductsAsync(userId);
                var activeProducts = vendorProducts.Where(p => p.IsActive).ToList();
                var totalRevenue = 0.00m; // TODO: Calculate from orders
                var monthlyRevenue = 0.00m; // TODO: Calculate from current month orders
                
                var stats = new VendorDashboardStatsDto
                {
                    TotalProducts = vendorProducts.Count,
                    ActiveProducts = activeProducts.Count,
                    TotalOrders = 0, // TODO: Implement when orders are available
                    PendingOrders = 0, // TODO: Implement when orders are available
                    TotalRevenue = totalRevenue,
                    MonthlyRevenue = monthlyRevenue,
                    TotalCustomers = 0, // TODO: Implement when orders are available
                    AverageRating = activeProducts.Any() ? activeProducts.Average(p => p.AverageRating) : 0.0
                };

                _logger.LogInformation("Retrieved dashboard stats for vendor {VendorId}", userId);

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard stats for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting dashboard statistics");
            }
        }
        
        /// <summary>
        /// Get vendor's products
        /// </summary>
        [HttpGet("products")]
        public async Task<ActionResult<List<ProductListDto>>> GetVendorProducts()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                var products = await _productService.GetVendorProductsAsync(userId);
                
                _logger.LogInformation("Retrieved {ProductCount} products for vendor {VendorId}", products.Count, userId);

                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting vendor products");
            }
        }
        
        /// <summary>
        /// Get vendor analytics and insights
        /// </summary>
        [HttpGet("analytics")]
        public async Task<ActionResult<VendorAnalyticsDto>> GetVendorAnalytics()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                var products = await _productService.GetVendorProductsAsync(userId);
                
                // Calculate analytics from products
                var analytics = new VendorAnalyticsDto
                {
                    ProductPerformance = products.Take(10).Select(p => new ProductPerformanceDto
                    {
                        ProductId = p.Id,
                        ProductName = p.Name,
                        Views = 0, // TODO: Implement when analytics tracking is added
                        Sales = 0, // TODO: Calculate from orders
                        Revenue = 0, // TODO: Calculate from orders
                        ConversionRate = 0 // TODO: Calculate from views and sales
                    }).ToList(),
                    
                    MonthlySales = new List<MonthlySalesDto>(), // TODO: Implement when orders are available
                    
                    CategoryBreakdown = products.GroupBy(p => p.CategoryName).Select(g => new CategorySalesDto
                    {
                        CategoryName = g.Key,
                        ProductCount = g.Count(),
                        TotalRevenue = 0 // TODO: Calculate from orders
                    }).ToList(),
                    
                    TopSellingProducts = products.OrderByDescending(p => p.ReviewCount).Take(5).Cast<object>().ToList(),
                    
                    RecentActivity = new List<string>
                    {
                        "Product analytics will be available when order tracking is implemented"
                    }
                };
                
                _logger.LogInformation("Retrieved analytics for vendor {VendorId}", userId);

                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting analytics for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting vendor analytics");
            }
        }
        
        /// <summary>
        /// Get vendor's orders
        /// </summary>
        [HttpGet("orders")]
        public async Task<ActionResult<VendorOrderSearchResultDto>> GetVendorOrders([FromQuery] VendorOrderSearchDto searchDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                // Create order search DTO
                var orderSearchDto = new OrderSearchDto
                {
                    VendorId = userId,
                    Status = searchDto.Status,
                    FromDate = searchDto.FromDate,
                    ToDate = searchDto.ToDate,
                    MinAmount = searchDto.MinAmount,
                    MaxAmount = searchDto.MaxAmount,
                    SortBy = searchDto.SortBy,
                    SortDirection = searchDto.SortDirection,
                    PageNumber = searchDto.PageNumber,
                    PageSize = searchDto.PageSize
                };

                var orders = await _orderService.SearchOrdersAsync(orderSearchDto);
                
                _logger.LogInformation("Retrieved {OrderCount} orders for vendor {VendorId}", orders.Orders.Count, userId);

                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting vendor orders");
            }
        }
        
        /// <summary>
        /// Get vendor order by ID
        /// </summary>
        [HttpGet("orders/{id}")]
        public async Task<ActionResult<VendorOrderDto>> GetVendorOrder(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                var order = await _orderService.GetOrderByIdAsync(id, userId);
                if (order == null)
                {
                    return NotFound("Order not found");
                }

                // Convert to vendor order DTO
                var vendorOrder = new VendorOrderDto
                {
                    Id = order.Id,
                    OrderNumber = order.OrderNumber,
                    OrderDate = order.OrderDate,
                    Status = order.Status,
                    TotalAmount = order.TotalAmount,
                    ItemCount = order.OrderItems.Sum(oi => oi.Quantity),
                    TrackingNumber = order.TrackingNumber,
                    EstimatedDeliveryDate = order.EstimatedDeliveryDate,
                    OrderItems = order.OrderItems.Select(oi => new VendorOrderItemDto
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.ProductName,
                        ProductSKU = oi.ProductSKU,
                        ProductVariant = oi.ProductVariant,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice
                    }).ToList(),
                    OrderTrackings = order.OrderTrackings.Select(ot => new OrderTrackingDto
                    {
                        Id = ot.Id,
                        Status = ot.Status,
                        StatusDate = ot.StatusDate,
                        Notes = ot.Notes,
                        Location = ot.Location,
                        UpdatedBy = ot.UpdatedBy
                    }).ToList()
                };

                _logger.LogInformation("Retrieved order {OrderId} for vendor {VendorId}", id, userId);

                return Ok(vendorOrder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order {OrderId} for vendor {VendorId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting the order");
            }
        }
        
        /// <summary>
        /// Update order status
        /// </summary>
        [HttpPut("orders/{id}/status")]
        public async Task<ActionResult<AuthResponseDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto updateOrderStatusDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                var result = await _orderService.UpdateOrderStatusAsync(id, updateOrderStatusDto, userId);
                if (result == null)
                {
                    return BadRequest("Failed to update order status");
                }

                _logger.LogInformation("Updated order {OrderId} status to {Status} by vendor {VendorId}", id, updateOrderStatusDto.Status, userId);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Order status updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order {OrderId} status by vendor {VendorId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while updating order status");
            }
        }
        
        /// <summary>
        /// Update order tracking information
        /// </summary>
        [HttpPost("orders/{id}/tracking")]
        public async Task<ActionResult<AuthResponseDto>> UpdateOrderTracking(int id, [FromBody] UpdateOrderTrackingDto updateOrderTrackingDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                var result = await _orderService.UpdateOrderTrackingAsync(id, updateOrderTrackingDto.TrackingNumber, updateOrderTrackingDto.Location, userId);
                if (!result)
                {
                    return BadRequest("Failed to update order tracking");
                }

                _logger.LogInformation("Updated tracking for order {OrderId} by vendor {VendorId}", id, userId);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Order tracking updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tracking for order {OrderId} by vendor {VendorId}", id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while updating order tracking");
            }
        }
        
        /// <summary>
        /// Get vendor inventory
        /// </summary>
        [HttpGet("inventory")]
        public async Task<ActionResult<List<VendorInventoryDto>>> GetVendorInventory()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                var products = await _productService.GetVendorProductsAsync(userId);
                
                var inventory = products.Select(p => new VendorInventoryDto
                {
                    ProductId = p.Id,
                    ProductName = p.Name,
                    ProductSKU = p.SKU,
                    CurrentStock = p.StockQuantity,
                    LowStockThreshold = 5, // Default value since ProductListDto doesn't have this property
                    IsLowStock = p.StockQuantity <= 5, // Default threshold
                    ReservedStock = 0, // TODO: Calculate from pending orders
                    LastUpdated = p.CreatedDate
                }).ToList();

                _logger.LogInformation("Retrieved inventory for vendor {VendorId}", userId);

                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inventory for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting vendor inventory");
            }
        }
        
        /// <summary>
        /// Update product inventory
        /// </summary>
        [HttpPut("inventory")]
        public async Task<ActionResult<AuthResponseDto>> UpdateInventory([FromBody] UpdateInventoryDto updateInventoryDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                var result = await _productService.UpdateProductStockAsync(updateInventoryDto.ProductId, updateInventoryDto.StockQuantity);
                if (!result)
                {
                    return BadRequest("Failed to update product inventory");
                }

                _logger.LogInformation("Updated inventory for product {ProductId} by vendor {VendorId}", updateInventoryDto.ProductId, userId);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Product inventory updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inventory for product {ProductId} by vendor {VendorId}", updateInventoryDto.ProductId, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while updating product inventory");
            }
        }
        
        /// <summary>
        /// Get vendor performance metrics
        /// </summary>
        [HttpGet("performance")]
        public async Task<ActionResult<VendorPerformanceDto>> GetVendorPerformance()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                // For now, return mock data
                // In a real implementation, you would query actual order and review data
                var performance = new VendorPerformanceDto
                {
                    TotalOrders = 0,
                    CompletedOrders = 0,
                    CancelledOrders = 0,
                    TotalRevenue = 0,
                    AverageOrderValue = 0,
                    AverageRating = 0,
                    TotalReviews = 0,
                    CancellationRate = 0,
                    OnTimeDeliveryRate = 0,
                    Last30DaysFrom = DateTime.UtcNow.AddDays(-30),
                    Last30DaysTo = DateTime.UtcNow
                };

                _logger.LogInformation("Retrieved performance metrics for vendor {VendorId}", userId);

                return Ok(performance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance metrics for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting vendor performance metrics");
            }
        }
        
        /// <summary>
        /// Get vendor payouts
        /// </summary>
        [HttpGet("payouts")]
        public async Task<ActionResult<List<VendorPayoutDto>>> GetVendorPayouts()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                // For now, return mock data
                // In a real implementation, you would query actual payout data
                var payouts = new List<VendorPayoutDto>
                {
                    new VendorPayoutDto
                    {
                        Id = 1,
                        Amount = 0,
                        Status = "Pending",
                        PayoutDate = DateTime.UtcNow,
                        ProcessedDate = null,
                        PaymentMethod = "Bank Transfer",
                        TransactionId = null
                    }
                };

                _logger.LogInformation("Retrieved payouts for vendor {VendorId}", userId);

                return Ok(payouts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payouts for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting vendor payouts");
            }
        }
        
        /// <summary>
        /// Get vendor messages
        /// </summary>
        [HttpGet("messages")]
        public async Task<ActionResult<List<VendorMessageDto>>> GetVendorMessages()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                // For now, return mock data
                // In a real implementation, you would query actual message data
                var messages = new List<VendorMessageDto>
                {
                    new VendorMessageDto
                    {
                        Id = 1,
                        Subject = "Welcome to Kasuwa Marketplace",
                        Content = "Thank you for joining our platform. We're excited to have you as a vendor!",
                        From = "admin@kasuwa.com",
                        To = user.Email!,
                        IsRead = false,
                        SentDate = DateTime.UtcNow,
                        ReadDate = null
                    }
                };

                _logger.LogInformation("Retrieved messages for vendor {VendorId}", userId);

                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting messages for vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while getting vendor messages");
            }
        }
        
        /// <summary>
        /// Send message to customer or admin
        /// </summary>
        [HttpPost("messages")]
        public async Task<ActionResult<AuthResponseDto>> SendMessage([FromBody] SendVendorMessageDto sendMessageDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || user.UserType != UserType.Vendor)
                {
                    return NotFound("Vendor not found");
                }

                // For now, just log the message
                // In a real implementation, you would store the message in a database
                _logger.LogInformation("Vendor {VendorId} sent message to {ToUserId}: {Subject}", userId, sendMessageDto.ToUserId, sendMessageDto.Subject);

                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Message sent successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message by vendor {VendorId}", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, "An error occurred while sending the message");
            }
        }
    }
}