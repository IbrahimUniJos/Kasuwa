using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kasuwa.Server.Models
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public string VendorId { get; set; } = string.Empty;

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        [MaxLength(200)]
        public string ProductName { get; set; } = string.Empty; // Snapshot at time of order

        [MaxLength(50)]
        public string? ProductSKU { get; set; }

        [MaxLength(200)]
        public string? ProductVariant { get; set; } // e.g., "Size: Large, Color: Red"

        [MaxLength(500)]
        public string? ProductImageUrl { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Order Order { get; set; } = null!;
        public virtual Product Product { get; set; } = null!;
        public virtual ApplicationUser Vendor { get; set; } = null!;
    }
}