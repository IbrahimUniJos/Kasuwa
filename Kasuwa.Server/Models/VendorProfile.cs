using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kasuwa.Server.Models
{
    public class VendorProfile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? BusinessRegistrationNumber { get; set; }

        [MaxLength(100)]
        public string? TaxIdentificationNumber { get; set; }

        public VendorVerificationStatus VerificationStatus { get; set; } = VendorVerificationStatus.Pending;

        public DateTime? VerificationDate { get; set; }

        public string? VerificationNotes { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal Rating { get; set; } = 0.0m;

        public int ReviewCount { get; set; } = 0;

        public int TotalSales { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalRevenue { get; set; } = 0.0m;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

        // Store customization
        [MaxLength(50)]
        public string? StoreThemeColor { get; set; }

        [MaxLength(500)]
        public string? StoreBannerUrl { get; set; }

        [MaxLength(500)]
        public string? StoreLogoUrl { get; set; }

        [MaxLength(1000)]
        public string? StoreDescription { get; set; }

        // Business hours
        public string? BusinessHours { get; set; } // JSON string for flexible hours storage

        // Social media links
        [MaxLength(200)]
        public string? FacebookUrl { get; set; }

        [MaxLength(200)]
        public string? InstagramUrl { get; set; }

        [MaxLength(200)]
        public string? TwitterUrl { get; set; }

        [MaxLength(200)]
        public string? WebsiteUrl { get; set; }

        // Commission and fees
        [Column(TypeName = "decimal(5,2)")]
        public decimal CommissionRate { get; set; } = 10.0m; // Default 10% commission

        public bool IsCommissionRateCustom { get; set; } = false;

        // Shipping settings
        public bool OffersShipping { get; set; } = true;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? DefaultShippingCost { get; set; }

        public bool OffersFreeShipping { get; set; } = false;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? FreeShippingThreshold { get; set; }

        // Return policy
        public bool AcceptsReturns { get; set; } = true;

        public int? ReturnPolicyDays { get; set; } = 30;

        [MaxLength(1000)]
        public string? ReturnPolicyDescription { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; } = null!;

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
        public virtual ICollection<VendorReview> Reviews { get; set; } = new List<VendorReview>();
    }

    public class VendorReview
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string VendorId { get; set; } = string.Empty;

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        public int OrderId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public bool IsVerifiedPurchase { get; set; } = false;

        // Navigation properties
        [ForeignKey("VendorId")]
        public virtual ApplicationUser Vendor { get; set; } = null!;

        [ForeignKey("CustomerId")]
        public virtual ApplicationUser Customer { get; set; } = null!;

        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; } = null!;
    }

    public class VendorAnalytics
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string VendorId { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        public int ProductViews { get; set; } = 0;

        public int StoreVisits { get; set; } = 0;

        public int OrdersCount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Revenue { get; set; } = 0.0m;

        public int UniqueCustomers { get; set; } = 0;

        // Navigation properties
        [ForeignKey("VendorId")]
        public virtual ApplicationUser Vendor { get; set; } = null!;
    }

    public enum VendorVerificationStatus
    {
        Pending = 0,
        UnderReview = 1,
        Approved = 2,
        Rejected = 3,
        Suspended = 4
    }
}