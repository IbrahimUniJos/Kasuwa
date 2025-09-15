using System.ComponentModel.DataAnnotations;

namespace Kasuwa.Server.Models
{
    public class ProductCategory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public int? ParentCategoryId { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(200)]
        public string? ImageUrl { get; set; }

        public int SortOrder { get; set; } = 0;

        [MaxLength(100)]
        public string? Slug { get; set; }

        [MaxLength(500)]
        public string? MetaTitle { get; set; }

        [MaxLength(1000)]
        public string? MetaDescription { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ProductCategory? ParentCategory { get; set; }
        public virtual ICollection<ProductCategory> SubCategories { get; set; } = new List<ProductCategory>();
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}