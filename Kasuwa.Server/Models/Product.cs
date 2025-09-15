using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kasuwa.Server.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string VendorId { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        [Required]
        [MaxLength(50)]
        public string SKU { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

        [Required]
        public int CategoryId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ComparePrice { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal Weight { get; set; }

        [MaxLength(50)]
        public string? WeightUnit { get; set; }

        public bool RequiresShipping { get; set; } = true;

        public bool TrackQuantity { get; set; } = true;

        public bool ContinueSellingWhenOutOfStock { get; set; } = false;

        [MaxLength(500)]
        public string? MetaTitle { get; set; }

        [MaxLength(1000)]
        public string? MetaDescription { get; set; }

        // Navigation properties
        public virtual ApplicationUser Vendor { get; set; } = null!;
        public virtual ProductCategory Category { get; set; } = null!;
        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}