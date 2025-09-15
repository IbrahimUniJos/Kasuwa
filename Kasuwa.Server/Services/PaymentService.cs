using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.Data;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;
using System.Text.Json;

namespace Kasuwa.Server.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PaymentService> _logger;
        private readonly IConfiguration _configuration;

        public PaymentService(ApplicationDbContext context, ILogger<PaymentService> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<PaymentDto> ProcessPaymentAsync(ProcessPaymentDto processPaymentDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Get the order
                var order = await _context.Orders
                    .Include(o => o.Payment)
                    .FirstOrDefaultAsync(o => o.Id == processPaymentDto.OrderId);

                if (order == null)
                    throw new ArgumentException("Order not found");

                if (order.Payment != null)
                    throw new InvalidOperationException("Order already has a payment");

                // Generate transaction ID
                var transactionId = GenerateTransactionId();

                // Create payment record
                var payment = new Payment
                {
                    OrderId = processPaymentDto.OrderId,
                    PaymentMethod = processPaymentDto.PaymentInfo.PaymentMethod,
                    PaymentProvider = processPaymentDto.PaymentInfo.PaymentProvider,
                    TransactionId = transactionId,
                    Amount = order.TotalAmount,
                    Currency = processPaymentDto.PaymentInfo.Currency,
                    Status = PaymentStatus.Processing,
                    PaymentDate = DateTime.UtcNow,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                // Process payment based on provider
                var paymentResult = processPaymentDto.PaymentInfo.PaymentProvider.ToLower() switch
                {
                    "stripe" => await ProcessStripePaymentInternalAsync(payment, processPaymentDto.PaymentInfo),
                    "paypal" => await ProcessPayPalPaymentInternalAsync(payment, processPaymentDto.PaymentInfo),
                    _ => await ProcessMockPaymentAsync(payment, processPaymentDto.PaymentInfo)
                };

                if (paymentResult.Status == PaymentStatus.Completed)
                {
                    // Update order status
                    order.Status = OrderStatus.Confirmed;
                    order.UpdatedDate = DateTime.UtcNow;

                    // Add order tracking
                    var tracking = new OrderTracking
                    {
                        OrderId = order.Id,
                        Status = OrderStatus.Confirmed,
                        StatusDate = DateTime.UtcNow,
                        Notes = "Payment completed successfully",
                        UpdatedBy = "System"
                    };
                    _context.OrderTrackings.Add(tracking);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Payment {PaymentId} processed for order {OrderId} with status {Status}",
                    payment.Id, processPaymentDto.OrderId, paymentResult.Status);

                return MapToPaymentDto(paymentResult);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error processing payment for order {OrderId}", processPaymentDto.OrderId);
                throw;
            }
        }

        public async Task<PaymentDto?> GetPaymentByIdAsync(int paymentId)
        {
            try
            {
                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.Id == paymentId);

                return payment != null ? MapToPaymentDto(payment) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment {PaymentId}", paymentId);
                throw;
            }
        }

        public async Task<PaymentDto?> GetPaymentByOrderIdAsync(int orderId)
        {
            try
            {
                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.OrderId == orderId);

                return payment != null ? MapToPaymentDto(payment) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment for order {OrderId}", orderId);
                throw;
            }
        }

        public async Task<PaymentDto> RefundPaymentAsync(RefundPaymentDto refundPaymentDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.Id == refundPaymentDto.PaymentId);

                if (payment == null)
                    throw new ArgumentException("Payment not found");

                if (payment.Status != PaymentStatus.Completed)
                    throw new InvalidOperationException("Can only refund completed payments");

                var totalRefunded = payment.RefundAmount ?? 0;
                var newRefundAmount = totalRefunded + refundPaymentDto.RefundAmount;

                if (newRefundAmount > payment.Amount)
                    throw new ArgumentException("Refund amount exceeds payment amount");

                // Process refund based on provider
                var refundResult = payment.PaymentProvider.ToLower() switch
                {
                    "stripe" => await ProcessStripeRefundAsync(payment, refundPaymentDto),
                    "paypal" => await ProcessPayPalRefundAsync(payment, refundPaymentDto),
                    _ => await ProcessMockRefundAsync(payment, refundPaymentDto)
                };

                // Update payment record
                payment.RefundAmount = newRefundAmount;
                payment.RefundDate = DateTime.UtcNow;
                payment.RefundReason = refundPaymentDto.RefundReason;
                payment.RefundTransactionId = refundResult.RefundTransactionId;
                payment.Status = newRefundAmount >= payment.Amount ? PaymentStatus.Refunded : PaymentStatus.PartiallyRefunded;
                payment.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Refund of {RefundAmount} processed for payment {PaymentId}",
                    refundPaymentDto.RefundAmount, refundPaymentDto.PaymentId);

                return MapToPaymentDto(payment);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error processing refund for payment {PaymentId}", refundPaymentDto.PaymentId);
                throw;
            }
        }

        public async Task<List<PaymentDto>> GetPaymentHistoryAsync(string? customerId = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var query = _context.Payments
                    .Include(p => p.Order)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(customerId))
                {
                    query = query.Where(p => p.Order.CustomerId == customerId);
                }

                if (fromDate.HasValue)
                {
                    query = query.Where(p => p.PaymentDate >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(p => p.PaymentDate <= toDate.Value);
                }

                var payments = await query
                    .OrderByDescending(p => p.PaymentDate)
                    .ToListAsync();

                return payments.Select(MapToPaymentDto).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment history");
                throw;
            }
        }

        public async Task<bool> ValidatePaymentAsync(int paymentId)
        {
            try
            {
                var payment = await _context.Payments.FindAsync(paymentId);
                if (payment == null)
                    return false;

                // Validate with payment provider
                var isValid = payment.PaymentProvider.ToLower() switch
                {
                    "stripe" => await ValidateStripePaymentAsync(payment),
                    "paypal" => await ValidatePayPalPaymentAsync(payment),
                    _ => true // Mock payments are always valid
                };

                if (!isValid)
                {
                    payment.Status = PaymentStatus.Failed;
                    payment.FailureReason = "Payment validation failed";
                    payment.UpdatedDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return isValid;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating payment {PaymentId}", paymentId);
                throw;
            }
        }

        public async Task<PaymentDto?> UpdatePaymentStatusAsync(int paymentId, PaymentStatus status, string? failureReason = null)
        {
            try
            {
                var payment = await _context.Payments.FindAsync(paymentId);
                if (payment == null)
                    return null;

                payment.Status = status;
                payment.FailureReason = failureReason;
                payment.UpdatedDate = DateTime.UtcNow;

                if (status == PaymentStatus.Completed)
                {
                    payment.ProcessedDate = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment {PaymentId} status updated to {Status}", paymentId, status);

                return MapToPaymentDto(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating payment status for payment {PaymentId}", paymentId);
                throw;
            }
        }

        // Stripe Integration Methods
        public async Task<string> CreateStripePaymentIntentAsync(decimal amount, string currency = "USD", Dictionary<string, string>? metadata = null)
        {
            try
            {
                // In a real implementation, you would use the Stripe SDK here
                // For now, we'll simulate the process
                await Task.Delay(100); // Simulate API call

                var paymentIntentId = $"pi_{Guid.NewGuid():N}";
                
                _logger.LogInformation("Created Stripe payment intent {PaymentIntentId} for amount {Amount} {Currency}",
                    paymentIntentId, amount, currency);

                return paymentIntentId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Stripe payment intent");
                throw;
            }
        }

        public async Task<PaymentDto> ProcessStripePaymentAsync(string paymentIntentId, int orderId)
        {
            try
            {
                // In a real implementation, you would confirm the payment intent with Stripe
                await Task.Delay(100); // Simulate API call

                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.OrderId == orderId);

                if (payment == null)
                    throw new ArgumentException("Payment not found for order");

                payment.ExternalTransactionId = paymentIntentId;
                payment.Status = PaymentStatus.Completed;
                payment.ProcessedDate = DateTime.UtcNow;
                payment.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Stripe payment {PaymentIntentId} processed successfully for order {OrderId}",
                    paymentIntentId, orderId);

                return MapToPaymentDto(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Stripe payment {PaymentIntentId}", paymentIntentId);
                throw;
            }
        }

        // PayPal Integration Methods
        public async Task<string> CreatePayPalOrderAsync(decimal amount, string currency = "USD", Dictionary<string, string>? metadata = null)
        {
            try
            {
                // In a real implementation, you would use the PayPal SDK here
                await Task.Delay(100); // Simulate API call

                var paypalOrderId = $"PAY-{Guid.NewGuid():N}";

                _logger.LogInformation("Created PayPal order {PayPalOrderId} for amount {Amount} {Currency}",
                    paypalOrderId, amount, currency);

                return paypalOrderId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating PayPal order");
                throw;
            }
        }

        public async Task<PaymentDto> ProcessPayPalPaymentAsync(string paypalOrderId, int orderId)
        {
            try
            {
                // In a real implementation, you would capture the PayPal order
                await Task.Delay(100); // Simulate API call

                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.OrderId == orderId);

                if (payment == null)
                    throw new ArgumentException("Payment not found for order");

                payment.ExternalTransactionId = paypalOrderId;
                payment.Status = PaymentStatus.Completed;
                payment.ProcessedDate = DateTime.UtcNow;
                payment.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("PayPal payment {PayPalOrderId} processed successfully for order {OrderId}",
                    paypalOrderId, orderId);

                return MapToPaymentDto(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayPal payment {PayPalOrderId}", paypalOrderId);
                throw;
            }
        }

        // Webhook Handlers
        public async Task HandleStripeWebhookAsync(string payload, string signature)
        {
            try
            {
                // In a real implementation, you would verify the webhook signature
                // and process the webhook event
                var webhookEvent = JsonSerializer.Deserialize<Dictionary<string, object>>(payload);
                
                _logger.LogInformation("Received Stripe webhook: {EventType}", 
                    webhookEvent?.GetValueOrDefault("type", "unknown"));

                // Process webhook based on event type
                // This is where you would handle events like payment_intent.succeeded, etc.
                
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling Stripe webhook");
                throw;
            }
        }

        public async Task HandlePayPalWebhookAsync(string payload, string signature)
        {
            try
            {
                // In a real implementation, you would verify the webhook signature
                // and process the webhook event
                var webhookEvent = JsonSerializer.Deserialize<Dictionary<string, object>>(payload);
                
                _logger.LogInformation("Received PayPal webhook: {EventType}", 
                    webhookEvent?.GetValueOrDefault("event_type", "unknown"));

                // Process webhook based on event type
                
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling PayPal webhook");
                throw;
            }
        }

        // Private helper methods
        private async Task<Payment> ProcessStripePaymentInternalAsync(Payment payment, PaymentInfoDto paymentInfo)
        {
            try
            {
                // Simulate Stripe payment processing
                await Task.Delay(1000);

                if (!string.IsNullOrEmpty(paymentInfo.CardToken))
                {
                    payment.ExternalTransactionId = $"pi_{Guid.NewGuid():N}";
                    payment.Status = PaymentStatus.Completed;
                    payment.ProcessedDate = DateTime.UtcNow;
                    payment.PaymentResponse = JsonSerializer.Serialize(new { success = true, provider = "stripe" });
                }
                else
                {
                    payment.Status = PaymentStatus.Failed;
                    payment.FailureReason = "Invalid card token";
                }

                payment.UpdatedDate = DateTime.UtcNow;
                return payment;
            }
            catch (Exception ex)
            {
                payment.Status = PaymentStatus.Failed;
                payment.FailureReason = ex.Message;
                payment.UpdatedDate = DateTime.UtcNow;
                return payment;
            }
        }

        private async Task<Payment> ProcessPayPalPaymentInternalAsync(Payment payment, PaymentInfoDto paymentInfo)
        {
            try
            {
                // Simulate PayPal payment processing
                await Task.Delay(1000);

                if (!string.IsNullOrEmpty(paymentInfo.PayPalPaymentId))
                {
                    payment.ExternalTransactionId = paymentInfo.PayPalPaymentId;
                    payment.Status = PaymentStatus.Completed;
                    payment.ProcessedDate = DateTime.UtcNow;
                    payment.PaymentResponse = JsonSerializer.Serialize(new { success = true, provider = "paypal" });
                }
                else
                {
                    payment.Status = PaymentStatus.Failed;
                    payment.FailureReason = "Invalid PayPal payment ID";
                }

                payment.UpdatedDate = DateTime.UtcNow;
                return payment;
            }
            catch (Exception ex)
            {
                payment.Status = PaymentStatus.Failed;
                payment.FailureReason = ex.Message;
                payment.UpdatedDate = DateTime.UtcNow;
                return payment;
            }
        }

        private async Task<Payment> ProcessMockPaymentAsync(Payment payment, PaymentInfoDto paymentInfo)
        {
            // Mock payment for testing
            await Task.Delay(500);

            payment.ExternalTransactionId = $"mock_{Guid.NewGuid():N}";
            payment.Status = PaymentStatus.Completed;
            payment.ProcessedDate = DateTime.UtcNow;
            payment.PaymentResponse = JsonSerializer.Serialize(new { success = true, provider = "mock" });
            payment.UpdatedDate = DateTime.UtcNow;

            return payment;
        }

        private async Task<RefundResult> ProcessStripeRefundAsync(Payment payment, RefundPaymentDto refundDto)
        {
            // Simulate Stripe refund
            await Task.Delay(500);
            return new RefundResult { RefundTransactionId = $"re_{Guid.NewGuid():N}" };
        }

        private async Task<RefundResult> ProcessPayPalRefundAsync(Payment payment, RefundPaymentDto refundDto)
        {
            // Simulate PayPal refund
            await Task.Delay(500);
            return new RefundResult { RefundTransactionId = $"RF_{Guid.NewGuid():N}" };
        }

        private async Task<RefundResult> ProcessMockRefundAsync(Payment payment, RefundPaymentDto refundDto)
        {
            // Mock refund
            await Task.Delay(200);
            return new RefundResult { RefundTransactionId = $"mock_refund_{Guid.NewGuid():N}" };
        }

        private async Task<bool> ValidateStripePaymentAsync(Payment payment)
        {
            // Simulate Stripe validation
            await Task.Delay(100);
            return !string.IsNullOrEmpty(payment.ExternalTransactionId);
        }

        private async Task<bool> ValidatePayPalPaymentAsync(Payment payment)
        {
            // Simulate PayPal validation
            await Task.Delay(100);
            return !string.IsNullOrEmpty(payment.ExternalTransactionId);
        }

        private string GenerateTransactionId()
        {
            return $"TXN_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N[..8]}";
        }

        private PaymentDto MapToPaymentDto(Payment payment)
        {
            return new PaymentDto
            {
                Id = payment.Id,
                OrderId = payment.OrderId,
                PaymentMethod = payment.PaymentMethod,
                PaymentProvider = payment.PaymentProvider,
                TransactionId = payment.TransactionId,
                ExternalTransactionId = payment.ExternalTransactionId,
                Amount = payment.Amount,
                Currency = payment.Currency,
                Status = payment.Status,
                PaymentDate = payment.PaymentDate,
                ProcessedDate = payment.ProcessedDate,
                FailureReason = payment.FailureReason,
                RefundAmount = payment.RefundAmount,
                RefundDate = payment.RefundDate,
                RefundReason = payment.RefundReason,
                RefundTransactionId = payment.RefundTransactionId
            };
        }

        private class RefundResult
        {
            public string RefundTransactionId { get; set; } = string.Empty;
        }
    }
}