using System.ComponentModel.DataAnnotations;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.DTOs
{
    // Vendor Management DTOs
    public class VendorApplicationStatusDto
    {
        public bool IsApproved { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string ApplicationStatus { get; set; } = string.Empty;
        public string? BusinessName { get; set; }
        public string? BusinessDescription { get; set; }
    }

    public class UpdateVendorBusinessProfileDto
    {
        [Required]
        [StringLength(100, ErrorMessage = "Business name cannot exceed 100 characters")]
        public string BusinessName { get; set; } = string.Empty;
        
        [StringLength(500, ErrorMessage = "Business description cannot exceed 500 characters")]
        public string? BusinessDescription { get; set; }
        
        [StringLength(200, ErrorMessage = "Business address cannot exceed 200 characters")]
        public string? BusinessAddress { get; set; }
        
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string? BusinessPhone { get; set; }
    }

    public class VendorDashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public int TotalCustomers { get; set; }
        public double AverageRating { get; set; }
        public decimal YesterdayRevenue { get; set; }
        public decimal WeeklyRevenue { get; set; }
        public int LowStockProducts { get; set; }
        public int OutOfStockProducts { get; set; }
        public int ThisMonthOrders { get; set; }
        public decimal ConversionRate { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? Icon { get; set; }
        public string? Url { get; set; }
    }
    
    public class VendorAnalyticsDto
    {
        public List<ProductPerformanceDto> ProductPerformance { get; set; } = new();
        public List<MonthlySalesDto> MonthlySales { get; set; } = new();
        public List<CategorySalesDto> CategoryBreakdown { get; set; } = new();
        public List<TopSellingProductDto> TopSellingProducts { get; set; } = new();
        public List<RecentActivityDto> RecentActivity { get; set; } = new();
    }

    public class ProductPerformanceDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Views { get; set; }
        public int Sales { get; set; }
        public decimal Revenue { get; set; }
        public double ConversionRate { get; set; }
    }

    public class MonthlySalesDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
        public int ProductsSold { get; set; }
    }

    public class CategorySalesDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public decimal TotalRevenue { get; set; }
        public int OrderCount { get; set; }
        public double AverageRating { get; set; }
    }

    public class TopSellingProductDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int SalesCount { get; set; }
        public decimal Revenue { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
    }

    // Vendor Order DTOs
    public class VendorOrderSearchDto
    {
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public string? SortBy { get; set; } = "OrderDate";
        public string? SortDirection { get; set; } = "desc";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class VendorOrderSearchResultDto
    {
        public List<VendorOrderDto> Orders { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class VendorOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string? TrackingNumber { get; set; }
        public List<VendorOrderItemDto> OrderItems { get; set; } = new();
        public string? Notes { get; set; }
        public DateTime? ShippedDate { get; set; }
        public DateTime? DeliveredDate { get; set; }
        public int ItemCount { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public List<OrderTrackingDto> OrderTrackings { get; set; } = new();
    }

    public class VendorOrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSku { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string ProductSKU { get; set; } = string.Empty;
        public string? ProductVariant { get; set; }
    }

    // Additional DTOs for VendorController
    public class VendorInventoryDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSku { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public int ReorderLevel { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
        public DateTime LastUpdated { get; set; }
        public string ProductSKU { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public int LowStockThreshold { get; set; }
        public bool IsLowStock { get; set; }
        public int ReservedStock { get; set; }
    }

    public class UpdateInventoryDto
    {
        [Required]
        public int ProductId { get; set; }
        
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }
        
        [Range(0, int.MaxValue)]
        public int ReorderLevel { get; set; }
    }

    public class VendorPerformanceDto
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
        public double AverageRating { get; set; }
        public int CustomerCount { get; set; }
        public decimal ConversionRate { get; set; }
        public List<MonthlyPerformanceDto> MonthlyData { get; set; } = new();
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public int TotalReviews { get; set; }
        public double CancellationRate { get; set; }
        public double OnTimeDeliveryRate { get; set; }
        public DateTime Last30DaysFrom { get; set; }
        public DateTime Last30DaysTo { get; set; }
    }

    public class MonthlyPerformanceDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Orders { get; set; }
    }

    public class VendorPayoutDto
    {
        public int Id { get; set; }
        public string VendorId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime PayoutDate { get; set; }
        public DateTime? ProcessedDate { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }
    }

    public class VendorMessageDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string FromUserName { get; set; } = string.Empty;
        public DateTime SentDate { get; set; }
        public bool IsRead { get; set; }
        public string? OrderNumber { get; set; }
        public string Content { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public DateTime? ReadDate { get; set; }
    }

    public class SendVendorMessageDto
    {
        [Required]
        [StringLength(200)]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        [StringLength(1000)]
        public string Message { get; set; } = string.Empty;
        
        public string? OrderNumber { get; set; }
        public string ToUserId { get; set; } = string.Empty;
    }
}