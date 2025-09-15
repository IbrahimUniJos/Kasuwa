using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Services
{
    public interface IPaymentService
    {
        Task<PaymentDto> ProcessPaymentAsync(ProcessPaymentDto processPaymentDto);
        Task<PaymentDto?> GetPaymentByIdAsync(int paymentId);
        Task<PaymentDto?> GetPaymentByOrderIdAsync(int orderId);
        Task<PaymentDto> RefundPaymentAsync(RefundPaymentDto refundPaymentDto);
        Task<List<PaymentDto>> GetPaymentHistoryAsync(string? customerId = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<bool> ValidatePaymentAsync(int paymentId);
        Task<PaymentDto?> UpdatePaymentStatusAsync(int paymentId, PaymentStatus status, string? failureReason = null);
        
        // Payment provider specific methods
        Task<string> CreateStripePaymentIntentAsync(decimal amount, string currency = "USD", Dictionary<string, string>? metadata = null);
        Task<PaymentDto> ProcessStripePaymentAsync(string paymentIntentId, int orderId);
        Task<string> CreatePayPalOrderAsync(decimal amount, string currency = "USD", Dictionary<string, string>? metadata = null);
        Task<PaymentDto> ProcessPayPalPaymentAsync(string paypalOrderId, int orderId);
        
        // Webhook handlers
        Task HandleStripeWebhookAsync(string payload, string signature);
        Task HandlePayPalWebhookAsync(string payload, string signature);
    }
}