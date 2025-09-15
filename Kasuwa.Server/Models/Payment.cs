using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kasuwa.Server.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(100)]
        public string PaymentMethod { get; set; } = string.Empty; // e.g., "Credit Card", "PayPal", "Stripe"

        [Required]
        [MaxLength(200)]
        public string PaymentProvider { get; set; } = string.Empty; // e.g., "Stripe", "PayPal"

        [Required]
        [MaxLength(100)]
        public string TransactionId { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? ExternalTransactionId { get; set; } // Provider's transaction ID

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(3)]
        public string Currency { get; set; } = "USD";

        [Required]
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        public DateTime? ProcessedDate { get; set; }

        [MaxLength(500)]
        public string? FailureReason { get; set; }

        [MaxLength(1000)]
        public string? PaymentResponse { get; set; } // JSON response from payment provider

        [Column(TypeName = "decimal(18,2)")]
        public decimal? RefundAmount { get; set; }

        public DateTime? RefundDate { get; set; }

        [MaxLength(500)]
        public string? RefundReason { get; set; }

        [MaxLength(100)]
        public string? RefundTransactionId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Order Order { get; set; } = null!;
    }

    public enum PaymentStatus
    {
        Pending = 1,
        Processing = 2,
        Completed = 3,
        Failed = 4,
        Cancelled = 5,
        Refunded = 6,
        PartiallyRefunded = 7
    }
}