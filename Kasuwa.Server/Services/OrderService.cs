using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.Data;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrderService> _logger;

        public OrderService(ApplicationDbContext context, ILogger<OrderService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto createOrderDto, string customerId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Validate order items and calculate totals
                var orderItems = new List<OrderItem>();
                decimal subTotal = 0;
                
                foreach (var itemDto in createOrderDto.OrderItems)
                {
                    var product = await _context.Products
                        .Include(p => p.Vendor)
                        .Include(p => p.Images)
                        .Include(p => p.Variants)
                        .FirstOrDefaultAsync(p => p.Id == itemDto.ProductId && p.IsActive);
                    
                    if (product == null)
                        throw new ArgumentException($"Product with ID {itemDto.ProductId} not found or inactive");
                    
                    // Check stock availability
                    if (product.TrackQuantity && product.StockQuantity < itemDto.Quantity)
                        throw new ArgumentException($"Insufficient stock for product {product.Name}. Available: {product.StockQuantity}, Requested: {itemDto.Quantity}");
                    
                    var unitPrice = product.Price;
                    var productVariant = string.Empty;
                    
                    // Handle product variants
                    if (itemDto.ProductVariantId.HasValue)
                    {
                        var variant = product.Variants.FirstOrDefault(v => v.Id == itemDto.ProductVariantId.Value && v.IsActive);
                        if (variant == null)
                            throw new ArgumentException($"Product variant with ID {itemDto.ProductVariantId} not found or inactive");
                        
                        unitPrice += variant.PriceAdjustment;
                        productVariant = $"{variant.Name}: {variant.Value}";
                        
                        // Check variant stock
                        if (variant.StockQuantity < itemDto.Quantity)
                            throw new ArgumentException($"Insufficient stock for product variant {productVariant}. Available: {variant.StockQuantity}, Requested: {itemDto.Quantity}");
                    }
                    
                    var totalPrice = unitPrice * itemDto.Quantity;
                    subTotal += totalPrice;
                    
                    var orderItem = new OrderItem
                    {
                        ProductId = itemDto.ProductId,
                        VendorId = product.VendorId,
                        Quantity = itemDto.Quantity,
                        UnitPrice = unitPrice,
                        TotalPrice = totalPrice,
                        ProductName = product.Name,
                        ProductSKU = product.SKU,
                        ProductVariant = productVariant,
                        ProductImageUrl = product.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                                       ?? product.Images.FirstOrDefault()?.ImageUrl
                    };
                    
                    orderItems.Add(orderItem);
                }
                
                // Calculate additional costs
                var shippingCost = CalculateShippingCost(orderItems, createOrderDto.ShippingMethod);
                var taxAmount = CalculateTax(subTotal, shippingCost);
                var totalAmount = subTotal + shippingCost + taxAmount;
                
                // Generate order number
                var orderNumber = await GenerateOrderNumberAsync();
                
                // Create order
                var order = new Order
                {
                    CustomerId = customerId,
                    OrderNumber = orderNumber,
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,
                    SubTotal = subTotal,
                    ShippingCost = shippingCost,
                    TaxAmount = taxAmount,
                    TotalAmount = totalAmount,
                    ShippingAddress = createOrderDto.ShippingAddress,
                    BillingAddress = createOrderDto.BillingAddress,
                    ShippingMethod = createOrderDto.ShippingMethod,
                    Notes = createOrderDto.Notes,
                    UpdatedDate = DateTime.UtcNow
                };
                
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                
                // Add order items
                foreach (var item in orderItems)
                {
                    item.OrderId = order.Id;
                }
                _context.OrderItems.AddRange(orderItems);
                
                // Add initial tracking record
                var initialTracking = new OrderTracking
                {
                    OrderId = order.Id,
                    Status = OrderStatus.Pending,
                    StatusDate = DateTime.UtcNow,
                    Notes = "Order created",
                    UpdatedBy = customerId
                };
                _context.OrderTrackings.Add(initialTracking);
                
                // Update product stock
                foreach (var itemDto in createOrderDto.OrderItems)
                {
                    var product = await _context.Products.FindAsync(itemDto.ProductId);
                    if (product != null && product.TrackQuantity)
                    {
                        product.StockQuantity -= itemDto.Quantity;
                        
                        if (itemDto.ProductVariantId.HasValue)
                        {
                            var variant = await _context.ProductVariants.FindAsync(itemDto.ProductVariantId.Value);
                            if (variant != null)
                            {
                                variant.StockQuantity -= itemDto.Quantity;
                            }
                        }
                    }
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                _logger.LogInformation("Order {OrderNumber} created for customer {CustomerId} with total amount {TotalAmount}", 
                    orderNumber, customerId, totalAmount);
                
                return await GetOrderByIdAsync(order.Id, customerId) 
                    ?? throw new InvalidOperationException("Failed to retrieve created order");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating order for customer {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<OrderDto?> GetOrderByIdAsync(int id, string? userId = null)
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.Vendor)
                    .Include(o => o.OrderTrackings.OrderBy(ot => ot.StatusDate))
                    .Include(o => o.Payment)
                    .AsQueryable();
                
                if (!string.IsNullOrEmpty(userId))
                {
                    // Filter by user - either customer or vendor
                    query = query.Where(o => o.CustomerId == userId || 
                                           o.OrderItems.Any(oi => oi.VendorId == userId));
                }
                
                var order = await query.FirstOrDefaultAsync(o => o.Id == id);
                
                if (order == null)
                    return null;
                
                return new OrderDto
                {
                    Id = order.Id,
                    CustomerId = order.CustomerId,
                    CustomerName = $"{order.Customer.FirstName} {order.Customer.LastName}".Trim(),
                    OrderNumber = order.OrderNumber,
                    OrderDate = order.OrderDate,
                    Status = order.Status,
                    SubTotal = order.SubTotal,
                    ShippingCost = order.ShippingCost,
                    TaxAmount = order.TaxAmount,
                    DiscountAmount = order.DiscountAmount,
                    TotalAmount = order.TotalAmount,
                    ShippingAddress = order.ShippingAddress,
                    BillingAddress = order.BillingAddress,
                    TrackingNumber = order.TrackingNumber,
                    ShippingMethod = order.ShippingMethod,
                    EstimatedDeliveryDate = order.EstimatedDeliveryDate,
                    ActualDeliveryDate = order.ActualDeliveryDate,
                    Notes = order.Notes,
                    CancellationReason = order.CancellationReason,
                    CancelledDate = order.CancelledDate,
                    UpdatedDate = order.UpdatedDate,
                    OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        VendorId = oi.VendorId,
                        VendorName = $"{oi.Vendor.FirstName} {oi.Vendor.LastName}".Trim(),
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice,
                        ProductName = oi.ProductName,
                        ProductSKU = oi.ProductSKU,
                        ProductVariant = oi.ProductVariant,
                        ProductImageUrl = oi.ProductImageUrl
                    }).ToList(),
                    OrderTrackings = order.OrderTrackings.Select(ot => new OrderTrackingDto
                    {
                        Id = ot.Id,
                        Status = ot.Status,
                        StatusDate = ot.StatusDate,
                        Notes = ot.Notes,
                        TrackingNumber = ot.TrackingNumber,
                        Location = ot.Location,
                        UpdatedBy = ot.UpdatedBy
                    }).ToList(),
                    Payment = order.Payment != null ? new PaymentDto
                    {
                        Id = order.Payment.Id,
                        OrderId = order.Payment.OrderId,
                        PaymentMethod = order.Payment.PaymentMethod,
                        PaymentProvider = order.Payment.PaymentProvider,
                        TransactionId = order.Payment.TransactionId,
                        ExternalTransactionId = order.Payment.ExternalTransactionId,
                        Amount = order.Payment.Amount,
                        Currency = order.Payment.Currency,
                        Status = order.Payment.Status,
                        PaymentDate = order.Payment.PaymentDate,
                        ProcessedDate = order.Payment.ProcessedDate,
                        FailureReason = order.Payment.FailureReason,
                        RefundAmount = order.Payment.RefundAmount,
                        RefundDate = order.Payment.RefundDate,
                        RefundReason = order.Payment.RefundReason,
                        RefundTransactionId = order.Payment.RefundTransactionId
                    } : null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order {OrderId}", id);
                throw;
            }
        }

        public async Task<OrderSearchResultDto> SearchOrdersAsync(OrderSearchDto searchDto, string? userId = null, bool isAdmin = false)
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.OrderItems)
                    .AsQueryable();
                
                // Apply user filtering
                if (!isAdmin && !string.IsNullOrEmpty(userId))
                {
                    query = query.Where(o => o.CustomerId == userId || 
                                           o.OrderItems.Any(oi => oi.VendorId == userId));
                }
                
                // Apply search filters
                if (!string.IsNullOrWhiteSpace(searchDto.OrderNumber))
                {
                    query = query.Where(o => o.OrderNumber.Contains(searchDto.OrderNumber));
                }
                
                if (searchDto.Status.HasValue)
                {
                    query = query.Where(o => o.Status == searchDto.Status.Value);
                }
                
                if (searchDto.FromDate.HasValue)
                {
                    query = query.Where(o => o.OrderDate >= searchDto.FromDate.Value);
                }
                
                if (searchDto.ToDate.HasValue)
                {
                    query = query.Where(o => o.OrderDate <= searchDto.ToDate.Value);
                }
                
                if (!string.IsNullOrWhiteSpace(searchDto.CustomerId))
                {
                    query = query.Where(o => o.CustomerId == searchDto.CustomerId);
                }
                
                if (!string.IsNullOrWhiteSpace(searchDto.VendorId))
                {
                    query = query.Where(o => o.OrderItems.Any(oi => oi.VendorId == searchDto.VendorId));
                }
                
                if (searchDto.MinAmount.HasValue)
                {
                    query = query.Where(o => o.TotalAmount >= searchDto.MinAmount.Value);
                }
                
                if (searchDto.MaxAmount.HasValue)
                {
                    query = query.Where(o => o.TotalAmount <= searchDto.MaxAmount.Value);
                }
                
                // Apply sorting
                query = searchDto.SortBy.ToLower() switch
                {
                    "totalamount" => searchDto.SortDirection == "desc"
                        ? query.OrderByDescending(o => o.TotalAmount)
                        : query.OrderBy(o => o.TotalAmount),
                    "status" => searchDto.SortDirection == "desc"
                        ? query.OrderByDescending(o => o.Status)
                        : query.OrderBy(o => o.Status),
                    _ => searchDto.SortDirection == "desc"
                        ? query.OrderByDescending(o => o.OrderDate)
                        : query.OrderBy(o => o.OrderDate)
                };
                
                var totalCount = await query.CountAsync();
                
                var orders = await query
                    .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                    .Take(searchDto.PageSize)
                    .Select(o => new OrderListDto
                    {
                        Id = o.Id,
                        OrderNumber = o.OrderNumber,
                        OrderDate = o.OrderDate,
                        Status = o.Status,
                        TotalAmount = o.TotalAmount,
                        ItemCount = o.OrderItems.Sum(oi => oi.Quantity),
                        TrackingNumber = o.TrackingNumber,
                        EstimatedDeliveryDate = o.EstimatedDeliveryDate
                    })
                    .ToListAsync();
                
                return new OrderSearchResultDto
                {
                    Orders = orders,
                    TotalCount = totalCount,
                    PageNumber = searchDto.PageNumber,
                    PageSize = searchDto.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching orders");
                throw;
            }
        }

        public async Task<List<OrderListDto>> GetCustomerOrdersAsync(string customerId)
        {
            try
            {
                return await _context.Orders
                    .Include(o => o.OrderItems)
                    .Where(o => o.CustomerId == customerId)
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => new OrderListDto
                    {
                        Id = o.Id,
                        OrderNumber = o.OrderNumber,
                        OrderDate = o.OrderDate,
                        Status = o.Status,
                        TotalAmount = o.TotalAmount,
                        ItemCount = o.OrderItems.Sum(oi => oi.Quantity),
                        TrackingNumber = o.TrackingNumber,
                        EstimatedDeliveryDate = o.EstimatedDeliveryDate
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for customer {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<List<OrderListDto>> GetVendorOrdersAsync(string vendorId)
        {
            try
            {
                return await _context.Orders
                    .Include(o => o.OrderItems)
                    .Where(o => o.OrderItems.Any(oi => oi.VendorId == vendorId))
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => new OrderListDto
                    {
                        Id = o.Id,
                        OrderNumber = o.OrderNumber,
                        OrderDate = o.OrderDate,
                        Status = o.Status,
                        TotalAmount = o.TotalAmount,
                        ItemCount = o.OrderItems.Where(oi => oi.VendorId == vendorId).Sum(oi => oi.Quantity),
                        TrackingNumber = o.TrackingNumber,
                        EstimatedDeliveryDate = o.EstimatedDeliveryDate
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders for vendor {VendorId}", vendorId);
                throw;
            }
        }

        public async Task<OrderDto?> UpdateOrderStatusAsync(int id, UpdateOrderStatusDto updateStatusDto, string userId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == id);
                
                if (order == null)
                    return null;
                
                // Check permissions - only vendor of items in order or admin can update
                var hasPermission = order.OrderItems.Any(oi => oi.VendorId == userId);
                if (!hasPermission)
                {
                    // Check if user is admin (this would need to be implemented based on your role system)
                    // For now, we'll assume if userId doesn't match any vendor, it might be admin
                }
                
                var previousStatus = order.Status;
                order.Status = updateStatusDto.Status;
                order.TrackingNumber = updateStatusDto.TrackingNumber ?? order.TrackingNumber;
                order.EstimatedDeliveryDate = updateStatusDto.EstimatedDeliveryDate ?? order.EstimatedDeliveryDate;
                order.ActualDeliveryDate = updateStatusDto.ActualDeliveryDate ?? order.ActualDeliveryDate;
                order.UpdatedDate = DateTime.UtcNow;
                
                // Add tracking record
                var tracking = new OrderTracking
                {
                    OrderId = id,
                    Status = updateStatusDto.Status,
                    StatusDate = DateTime.UtcNow,
                    Notes = updateStatusDto.Notes ?? $"Status updated from {previousStatus} to {updateStatusDto.Status}",
                    TrackingNumber = updateStatusDto.TrackingNumber,
                    Location = updateStatusDto.Location,
                    UpdatedBy = userId
                };
                
                _context.OrderTrackings.Add(tracking);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Order {OrderId} status updated from {PreviousStatus} to {NewStatus} by user {UserId}", 
                    id, previousStatus, updateStatusDto.Status, userId);
                
                return await GetOrderByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status for order {OrderId}", id);
                throw;
            }
        }

        public async Task<bool> CancelOrderAsync(int id, CancelOrderDto cancelOrderDto, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.Id == id);
                
                if (order == null)
                    return false;
                
                // Check if order can be cancelled
                if (order.Status == OrderStatus.Delivered || order.Status == OrderStatus.Cancelled)
                {
                    throw new InvalidOperationException("Order cannot be cancelled in its current status");
                }
                
                // Check permissions - customer can cancel their own order
                if (order.CustomerId != userId)
                {
                    throw new UnauthorizedAccessException("You don't have permission to cancel this order");
                }
                
                order.Status = OrderStatus.Cancelled;
                order.CancellationReason = cancelOrderDto.CancellationReason;
                order.CancelledDate = DateTime.UtcNow;
                order.UpdatedDate = DateTime.UtcNow;
                
                // Add tracking record
                var tracking = new OrderTracking
                {
                    OrderId = id,
                    Status = OrderStatus.Cancelled,
                    StatusDate = DateTime.UtcNow,
                    Notes = $"Order cancelled: {cancelOrderDto.CancellationReason}",
                    UpdatedBy = userId
                };
                
                _context.OrderTrackings.Add(tracking);
                
                // Restore product stock
                foreach (var item in order.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null && product.TrackQuantity)
                    {
                        product.StockQuantity += item.Quantity;
                    }
                }
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                _logger.LogInformation("Order {OrderId} cancelled by user {UserId}: {Reason}", 
                    id, userId, cancelOrderDto.CancellationReason);
                
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error cancelling order {OrderId}", id);
                throw;
            }
        }

        public async Task<OrderStatsDto> GetOrderStatsAsync(string? vendorId = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var query = _context.Orders
                    .Include(o => o.OrderItems)
                    .AsQueryable();
                
                if (!string.IsNullOrEmpty(vendorId))
                {
                    query = query.Where(o => o.OrderItems.Any(oi => oi.VendorId == vendorId));
                }
                
                if (fromDate.HasValue)
                {
                    query = query.Where(o => o.OrderDate >= fromDate.Value);
                }
                
                if (toDate.HasValue)
                {
                    query = query.Where(o => o.OrderDate <= toDate.Value);
                }
                
                var orders = await query.ToListAsync();
                
                var stats = new OrderStatsDto
                {
                    TotalOrders = orders.Count,
                    PendingOrders = orders.Count(o => o.Status == OrderStatus.Pending),
                    ProcessingOrders = orders.Count(o => o.Status == OrderStatus.Processing),
                    ShippedOrders = orders.Count(o => o.Status == OrderStatus.Shipped),
                    DeliveredOrders = orders.Count(o => o.Status == OrderStatus.Delivered),
                    CancelledOrders = orders.Count(o => o.Status == OrderStatus.Cancelled),
                    TotalRevenue = orders.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount),
                    AverageOrderValue = orders.Any() ? orders.Average(o => o.TotalAmount) : 0
                };
                
                // Calculate daily stats for the last 30 days
                var last30Days = DateTime.UtcNow.Date.AddDays(-30);
                var dailyOrders = orders
                    .Where(o => o.OrderDate >= last30Days)
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new DailyOrderStatsDto
                    {
                        Date = g.Key,
                        OrderCount = g.Count(),
                        Revenue = g.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount)
                    })
                    .OrderBy(d => d.Date)
                    .ToList();
                
                stats.DailyStats = dailyOrders;
                
                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting order stats for vendor {VendorId}", vendorId);
                throw;
            }
        }

        public async Task<bool> UpdateOrderTrackingAsync(int orderId, string trackingNumber, string location, string updatedBy)
        {
            try
            {
                var order = await _context.Orders.FindAsync(orderId);
                if (order == null)
                    return false;
                
                order.TrackingNumber = trackingNumber;
                order.UpdatedDate = DateTime.UtcNow;
                
                var tracking = new OrderTracking
                {
                    OrderId = orderId,
                    Status = order.Status,
                    StatusDate = DateTime.UtcNow,
                    Notes = "Tracking information updated",
                    TrackingNumber = trackingNumber,
                    Location = location,
                    UpdatedBy = updatedBy
                };
                
                _context.OrderTrackings.Add(tracking);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Tracking updated for order {OrderId}: {TrackingNumber} at {Location}", 
                    orderId, trackingNumber, location);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tracking for order {OrderId}", orderId);
                throw;
            }
        }

        public async Task<List<OrderTrackingDto>> GetOrderTrackingAsync(int orderId)
        {
            try
            {
                return await _context.OrderTrackings
                    .Where(ot => ot.OrderId == orderId)
                    .OrderBy(ot => ot.StatusDate)
                    .Select(ot => new OrderTrackingDto
                    {
                        Id = ot.Id,
                        Status = ot.Status,
                        StatusDate = ot.StatusDate,
                        Notes = ot.Notes,
                        TrackingNumber = ot.TrackingNumber,
                        Location = ot.Location,
                        UpdatedBy = ot.UpdatedBy
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tracking for order {OrderId}", orderId);
                throw;
            }
        }

        private async Task<string> GenerateOrderNumberAsync()
        {
            var today = DateTime.UtcNow.ToString("yyyyMMdd");
            var lastOrder = await _context.Orders
                .Where(o => o.OrderNumber.StartsWith($"ORD-{today}"))
                .OrderByDescending(o => o.OrderNumber)
                .FirstOrDefaultAsync();
            
            var sequence = 1;
            if (lastOrder != null)
            {
                var lastSequence = lastOrder.OrderNumber.Substring(lastOrder.OrderNumber.LastIndexOf('-') + 1);
                if (int.TryParse(lastSequence, out var parsed))
                {
                    sequence = parsed + 1;
                }
            }
            
            return $"ORD-{today}-{sequence:D4}";
        }

        private decimal CalculateShippingCost(List<OrderItem> orderItems, string? shippingMethod)
        {
            // Simple shipping calculation - in a real app this would be more sophisticated
            var totalWeight = orderItems.Sum(item => item.Quantity * 0.5m); // Assume 0.5kg per item
            
            return shippingMethod?.ToLower() switch
            {
                "express" => 15.00m + (totalWeight * 2.00m),
                "overnight" => 25.00m + (totalWeight * 3.00m),
                _ => 5.00m + (totalWeight * 1.00m) // Standard shipping
            };
        }

        private decimal CalculateTax(decimal subTotal, decimal shippingCost)
        {
            // Simple tax calculation - 10% on subtotal only
            return subTotal * 0.10m;
        }
    }
}