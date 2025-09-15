using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;
using Kasuwa.Server.Services;

namespace Kasuwa.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IOrderService _orderService;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(IPaymentService paymentService, IOrderService orderService, ILogger<PaymentsController> logger)
        {
            _paymentService = paymentService;
            _orderService = orderService;
            _logger = logger;
        }

        /// <summary>
        /// Process payment for an order
        /// </summary>
        [HttpPost("process")]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<PaymentDto>> ProcessPayment([FromBody] ProcessPaymentDto processPaymentDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // Verify the order belongs to the user
                var order = await _orderService.GetOrderByIdAsync(processPaymentDto.OrderId, userId);
                if (order == null)
                {
                    return NotFound("Order not found or access denied");
                }

                var payment = await _paymentService.ProcessPaymentAsync(processPaymentDto);

                _logger.LogInformation("Payment processed for order {OrderId} by user {UserId}", processPaymentDto.OrderId, userId);

                return Ok(payment);
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
                _logger.LogError(ex, "Error processing payment for order {OrderId}", processPaymentDto.OrderId);
                return StatusCode(500, "An error occurred while processing the payment");
            }
        }

        /// <summary>
        /// Get payment details by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentDto>> GetPayment(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var payment = await _paymentService.GetPaymentByIdAsync(id);
                if (payment == null)
                {
                    return NotFound("Payment not found");
                }

                // Verify access - only allow customer or admin
                if (!User.IsInRole("Administrator"))
                {
                    var order = await _orderService.GetOrderByIdAsync(payment.OrderId, userId);
                    if (order == null)
                    {
                        return Forbid("Access denied");
                    }
                }

                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment {PaymentId}", id);
                return StatusCode(500, "An error occurred while retrieving the payment");
            }
        }

        /// <summary>
        /// Get payment by order ID
        /// </summary>
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<PaymentDto>> GetPaymentByOrderId(int orderId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // Verify access to the order
                var order = await _orderService.GetOrderByIdAsync(orderId, User.IsInRole("Administrator") ? null : userId);
                if (order == null)
                {
                    return NotFound("Order not found or access denied");
                }

                var payment = await _paymentService.GetPaymentByOrderIdAsync(orderId);
                if (payment == null)
                {
                    return NotFound("Payment not found for this order");
                }

                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment for order {OrderId}", orderId);
                return StatusCode(500, "An error occurred while retrieving the payment");
            }
        }

        /// <summary>
        /// Process refund (Admin only)
        /// </summary>
        [HttpPost("refund")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult<PaymentDto>> ProcessRefund([FromBody] RefundPaymentDto refundPaymentDto)
        {
            try
            {
                var payment = await _paymentService.RefundPaymentAsync(refundPaymentDto);

                _logger.LogInformation("Refund processed for payment {PaymentId} by admin", refundPaymentDto.PaymentId);

                return Ok(payment);
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
                _logger.LogError(ex, "Error processing refund for payment {PaymentId}", refundPaymentDto.PaymentId);
                return StatusCode(500, "An error occurred while processing the refund");
            }
        }

        /// <summary>
        /// Get payment history for the current user
        /// </summary>
        [HttpGet("history")]
        public async Task<ActionResult<List<PaymentDto>>> GetPaymentHistory([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var customerId = User.IsInRole("Administrator") ? null : userId;
                var payments = await _paymentService.GetPaymentHistoryAsync(customerId, fromDate, toDate);

                return Ok(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment history");
                return StatusCode(500, "An error occurred while retrieving payment history");
            }
        }

        /// <summary>
        /// Create a Stripe payment intent
        /// </summary>
        [HttpPost("stripe/create-intent")]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<CreatePaymentIntentResponseDto>> CreateStripePaymentIntent([FromBody] CreatePaymentIntentDto createPaymentIntentDto)
        {
            try
            {
                var paymentIntentId = await _paymentService.CreateStripePaymentIntentAsync(
                    createPaymentIntentDto.Amount,
                    createPaymentIntentDto.Currency,
                    createPaymentIntentDto.Metadata);

                // Retrieve the client secret from Stripe
                // In a real implementation, you would use the Stripe SDK to get this
                var clientSecret = "pi_client_secret_" + paymentIntentId; // Placeholder

                return Ok(new CreatePaymentIntentResponseDto
                {
                    PaymentIntentId = paymentIntentId,
                    ClientSecret = clientSecret
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Stripe payment intent");
                return StatusCode(500, "An error occurred while creating the payment intent");
            }
        }

        /// <summary>
        /// Process a Stripe payment
        /// </summary>
        [HttpPost("stripe/process")]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<PaymentDto>> ProcessStripePayment([FromBody] ProcessStripePaymentDto processStripePaymentDto)
        {
            try
            {
                var payment = await _paymentService.ProcessStripePaymentAsync(
                    processStripePaymentDto.PaymentIntentId,
                    processStripePaymentDto.OrderId);

                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Stripe payment");
                return StatusCode(500, "An error occurred while processing the payment");
            }
        }

        /// <summary>
        /// Create a PayPal order
        /// </summary>
        [HttpPost("paypal/create-order")]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<CreatePayPalOrderResponseDto>> CreatePayPalOrder([FromBody] CreatePaymentIntentDto createPaymentIntentDto)
        {
            try
            {
                var orderId = await _paymentService.CreatePayPalOrderAsync(
                    createPaymentIntentDto.Amount,
                    createPaymentIntentDto.Currency,
                    createPaymentIntentDto.Metadata);

                // In a real implementation, you would get the approval URL from PayPal
                var approvalUrl = $"https://www.paypal.com/checkout?token={orderId}"; // Placeholder

                return Ok(new CreatePayPalOrderResponseDto
                {
                    OrderId = orderId,
                    ApprovalUrl = approvalUrl
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating PayPal order");
                return StatusCode(500, "An error occurred while creating the PayPal order");
            }
        }

        /// <summary>
        /// Process a PayPal payment
        /// </summary>
        [HttpPost("paypal/process")]
        [Authorize(Policy = "RequireCustomerRole")]
        public async Task<ActionResult<PaymentDto>> ProcessPayPalPayment([FromBody] ProcessPayPalPaymentDto processPayPalPaymentDto)
        {
            try
            {
                var payment = await _paymentService.ProcessPayPalPaymentAsync(
                    processPayPalPaymentDto.PayPalOrderId,
                    processPayPalPaymentDto.OrderId);

                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayPal payment");
                return StatusCode(500, "An error occurred while processing the payment");
            }
        }

        /// <summary>
        /// Handle Stripe webhook
        /// </summary>
        [HttpPost("webhook/stripe")]
        [AllowAnonymous]
        public async Task<IActionResult> HandleStripeWebhook()
        {
            try
            {
                using var reader = new StreamReader(Request.Body);
                var payload = await reader.ReadToEndAsync();
                var signature = Request.Headers["Stripe-Signature"].ToString();

                await _paymentService.HandleStripeWebhookAsync(payload, signature);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling Stripe webhook");
                return StatusCode(500, "An error occurred while processing the webhook");
            }
        }

        /// <summary>
        /// Handle PayPal webhook
        /// </summary>
        [HttpPost("webhook/paypal")]
        [AllowAnonymous]
        public async Task<IActionResult> HandlePayPalWebhook()
        {
            try
            {
                using var reader = new StreamReader(Request.Body);
                var payload = await reader.ReadToEndAsync();
                var signature = Request.Headers["PayPal-Transmission-Sig"].ToString();

                await _paymentService.HandlePayPalWebhookAsync(payload, signature);

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling PayPal webhook");
                return StatusCode(500, "An error occurred while processing the webhook");
            }
        }

        /// <summary>
        /// Update payment status (Admin only)
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult<PaymentDto>> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusDto updatePaymentStatusDto)
        {
            try
            {
                var payment = await _paymentService.UpdatePaymentStatusAsync(id, updatePaymentStatusDto.Status, updatePaymentStatusDto.FailureReason);
                if (payment == null)
                {
                    return NotFound("Payment not found");
                }

                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating payment status for payment {PaymentId}", id);
                return StatusCode(500, "An error occurred while updating the payment status");
            }
        }

        /// <summary>
        /// Validate payment (Internal use)
        /// </summary>
        [HttpPost("{id}/validate")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<ActionResult<bool>> ValidatePayment(int id)
        {
            try
            {
                var isValid = await _paymentService.ValidatePaymentAsync(id);
                return Ok(isValid);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating payment {PaymentId}", id);
                return StatusCode(500, "An error occurred while validating the payment");
            }
        }

        // Additional DTOs for payment operations
        public class UpdatePaymentStatusDto
        {
            [Required]
            public PaymentStatus Status { get; set; }

            [MaxLength(500)]
            public string? FailureReason { get; set; }
        }

        public class CreatePaymentIntentDto
        {
            [Required]
            [Range(0.01, double.MaxValue)]
            public decimal Amount { get; set; }

            [MaxLength(3)]
            public string Currency { get; set; } = "USD";

            public Dictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
        }

        public class CreatePaymentIntentResponseDto
        {
            public string PaymentIntentId { get; set; } = string.Empty;
            public string ClientSecret { get; set; } = string.Empty;
        }

        public class CreatePayPalOrderResponseDto
        {
            public string OrderId { get; set; } = string.Empty;
            public string ApprovalUrl { get; set; } = string.Empty;
        }

        public class ProcessStripePaymentDto
        {
            [Required]
            public string PaymentIntentId { get; set; } = string.Empty;

            [Required]
            public int OrderId { get; set; }
        }

        public class ProcessPayPalPaymentDto
        {
            [Required]
            public string PayPalOrderId { get; set; } = string.Empty;

            [Required]
            public int OrderId { get; set; }
        }
    }
}