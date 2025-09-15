using System.ComponentModel.DataAnnotations;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.DTOs
{
    // Order DTOs
    public class CreateOrderDto
    {
        [Required]
        public List<CreateOrderItemDto> OrderItems { get; set; } = new List<CreateOrderItemDto>();

        [Required]
        [MaxLength(500)]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string BillingAddress { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? ShippingMethod { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public PaymentInfoDto PaymentInfo { get; set; } = new PaymentInfoDto();
    }

    public class CreateOrderItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        public int? ProductVariantId { get; set; }
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public OrderStatus Status { get; set; }
        public decimal SubTotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string BillingAddress { get; set; } = string.Empty;
        public string? TrackingNumber { get; set; }
        public string? ShippingMethod { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public DateTime? ActualDeliveryDate { get; set; }
        public string? Notes { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime? CancelledDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new List<OrderItemDto>();
        public List<OrderTrackingDto> OrderTrackings { get; set; } = new List<OrderTrackingDto>();
        public PaymentDto? Payment { get; set; }
    }

    public class OrderListDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public OrderStatus Status { get; set; }
        public string StatusDisplay => Status.ToString();
        public decimal TotalAmount { get; set; }
        public int ItemCount { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string VendorId { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductSKU { get; set; }
        public string? ProductVariant { get; set; }
        public string? ProductImageUrl { get; set; }
    }

    public class OrderTrackingDto
    {
        public int Id { get; set; }
        public OrderStatus Status { get; set; }
        public string StatusDisplay => Status.ToString();
        public DateTime StatusDate { get; set; }
        public string? Notes { get; set; }
        public string? TrackingNumber { get; set; }
        public string? Location { get; set; }
        public string? UpdatedBy { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        [Required]
        public OrderStatus Status { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        [MaxLength(100)]
        public string? TrackingNumber { get; set; }

        [MaxLength(100)]
        public string? Location { get; set; }

        public DateTime? EstimatedDeliveryDate { get; set; }

        public DateTime? ActualDeliveryDate { get; set; }
    }

    public class UpdateOrderTrackingDto
    {
        [Required]
        [MaxLength(100)]
        public string TrackingNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    public class CancelOrderDto
    {
        [Required]
        [MaxLength(1000)]
        public string CancellationReason { get; set; } = string.Empty;
    }

    public class OrderSearchDto
    {
        public string? OrderNumber { get; set; }
        public OrderStatus? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? CustomerId { get; set; }
        public string? VendorId { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public string SortBy { get; set; } = "orderDate"; // orderDate, totalAmount, status
        public string SortDirection { get; set; } = "desc"; // asc, desc
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class OrderSearchResultDto
    {
        public List<OrderListDto> Orders { get; set; } = new List<OrderListDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }

    // Payment DTOs
    public class PaymentInfoDto
    {
        [Required]
        [MaxLength(100)]
        public string PaymentMethod { get; set; } = string.Empty; // "Credit Card", "PayPal", etc.

        [Required]
        [MaxLength(200)]
        public string PaymentProvider { get; set; } = string.Empty; // "Stripe", "PayPal", etc.

        [MaxLength(3)]
        public string Currency { get; set; } = "USD";

        // Credit card details (in a real app, this would be tokenized)
        public string? CardToken { get; set; }
        public string? PayPalPaymentId { get; set; }
        
        // Additional payment metadata
        public Dictionary<string, string> PaymentMetadata { get; set; } = new Dictionary<string, string>();
    }

    public class PaymentDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentProvider { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string? ExternalTransactionId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public PaymentStatus Status { get; set; }
        public string StatusDisplay => Status.ToString();
        public DateTime PaymentDate { get; set; }
        public DateTime? ProcessedDate { get; set; }
        public string? FailureReason { get; set; }
        public decimal? RefundAmount { get; set; }
        public DateTime? RefundDate { get; set; }
        public string? RefundReason { get; set; }
        public string? RefundTransactionId { get; set; }
    }

    public class ProcessPaymentDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public PaymentInfoDto PaymentInfo { get; set; } = new PaymentInfoDto();
    }

    public class RefundPaymentDto
    {
        [Required]
        public int PaymentId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Refund amount must be greater than 0")]
        public decimal RefundAmount { get; set; }

        [Required]
        [MaxLength(500)]
        public string RefundReason { get; set; } = string.Empty;
    }

    // Order Statistics DTOs
    public class OrderStatsDto
    {
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int ProcessingOrders { get; set; }
        public int ShippedOrders { get; set; }
        public int DeliveredOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageOrderValue { get; set; }
        public List<DailyOrderStatsDto> DailyStats { get; set; } = new List<DailyOrderStatsDto>();
    }

    public class DailyOrderStatsDto
    {
        public DateTime Date { get; set; }
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
    }
}