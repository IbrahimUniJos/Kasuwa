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
    }
    
    public class VendorAnalyticsDto
    {
        public List<ProductPerformanceDto> ProductPerformance { get; set; } = new List<ProductPerformanceDto>();
        public List<MonthlySalesDto> MonthlySales { get; set; } = new List<MonthlySalesDto>();
        public List<CategorySalesDto> CategoryBreakdown { get; set; } = new List<CategorySalesDto>();
        public List<object> TopSellingProducts { get; set; } = new List<object>(); // Will contain ProductListDto objects
        public List<string> RecentActivity { get; set; } = new List<string>();
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
        public string Month { get; set; } = string.Empty;
        public int Sales { get; set; }
        public decimal Revenue { get; set; }
    }
    
    public class CategorySalesDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public decimal TotalRevenue { get; set; }
    }
    
    // Vendor Order Management DTOs
    public class VendorOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public OrderStatus Status { get; set; }
        public decimal TotalAmount { get; set; }
        public int ItemCount { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public List<VendorOrderItemDto> OrderItems { get; set; } = new List<VendorOrderItemDto>();
        public List<OrderTrackingDto> OrderTrackings { get; set; } = new List<OrderTrackingDto>();
    }
    
    public class VendorOrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductSKU { get; set; }
        public string? ProductVariant { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
    
    public class VendorOrderSearchDto
    {
        public OrderStatus? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public string SortBy { get; set; } = "orderDate"; // orderDate, totalAmount, status
        public string SortDirection { get; set; } = "desc"; // asc, desc
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
    
    public class VendorOrderSearchResultDto
    {
        public List<VendorOrderDto> Orders { get; set; } = new List<VendorOrderDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }
    
    // Vendor Inventory Management DTOs
    public class VendorInventoryDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductSKU { get; set; }
        public int CurrentStock { get; set; }
        public int LowStockThreshold { get; set; }
        public bool IsLowStock { get; set; }
        public int ReservedStock { get; set; }
        public DateTime LastUpdated { get; set; }
    }
    
    public class UpdateInventoryDto
    {
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }
        
        [Range(0, int.MaxValue)]
        public int LowStockThreshold { get; set; } = 5;
    }
    
    // Vendor Communication DTOs
    public class VendorMessageDto
    {
        public int Id { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime SentDate { get; set; }
        public DateTime? ReadDate { get; set; }
    }
    
    public class SendVendorMessageDto
    {
        [Required]
        public string ToUserId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }
    
    // Vendor Performance Metrics DTOs
    public class VendorPerformanceDto
    {
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageOrderValue { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public double CancellationRate { get; set; }
        public double OnTimeDeliveryRate { get; set; }
        public DateTime Last30DaysFrom { get; set; }
        public DateTime Last30DaysTo { get; set; }
    }
    
    public class VendorPayoutDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime PayoutDate { get; set; }
        public DateTime? ProcessedDate { get; set; }
        public string? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
    }
    
    // Enhanced validation DTOs
    public class EnhancedRegisterRequestDto
    {
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        public string Email { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 100 characters")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$", 
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number")]
        public string Password { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Confirm password is required")]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "First name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "First name must be between 2 and 50 characters")]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "First name can only contain letters and spaces")]
        public string FirstName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Last name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Last name must be between 2 and 50 characters")]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Last name can only contain letters and spaces")]
        public string LastName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "User type is required")]
        [EnumDataType(typeof(UserType), ErrorMessage = "Invalid user type")]
        public UserType UserType { get; set; }
        
        // Vendor-specific validation
        [StringLength(100, ErrorMessage = "Business name cannot exceed 100 characters")]
        public string? BusinessName { get; set; }
        
        [StringLength(500, ErrorMessage = "Business description cannot exceed 500 characters")]
        public string? BusinessDescription { get; set; }
        
        [StringLength(200, ErrorMessage = "Business address cannot exceed 200 characters")]
        public string? BusinessAddress { get; set; }
        
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string? BusinessPhone { get; set; }
        
        // Customer-specific fields
        public DateTime? DateOfBirth { get; set; }
        
        [StringLength(10, ErrorMessage = "Preferred language cannot exceed 10 characters")]
        public string? PreferredLanguage { get; set; }
    }
}