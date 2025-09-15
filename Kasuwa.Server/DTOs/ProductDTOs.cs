using System.ComponentModel.DataAnnotations;

namespace Kasuwa.Server.DTOs
{
    // Product DTOs
    public class CreateProductDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative")]
        public int StockQuantity { get; set; }

        [Required]
        [MaxLength(50)]
        public string SKU { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Compare price cannot be negative")]
        public decimal? ComparePrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Weight cannot be negative")]
        public decimal Weight { get; set; }

        [MaxLength(50)]
        public string? WeightUnit { get; set; } = "kg";

        public bool RequiresShipping { get; set; } = true;

        public bool TrackQuantity { get; set; } = true;

        public bool ContinueSellingWhenOutOfStock { get; set; } = false;

        [MaxLength(500)]
        public string? MetaTitle { get; set; }

        [MaxLength(1000)]
        public string? MetaDescription { get; set; }

        public List<CreateProductImageDto> Images { get; set; } = new List<CreateProductImageDto>();
        public List<CreateProductVariantDto> Variants { get; set; } = new List<CreateProductVariantDto>();
    }

    public class UpdateProductDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative")]
        public int StockQuantity { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Compare price cannot be negative")]
        public decimal? ComparePrice { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Weight cannot be negative")]
        public decimal Weight { get; set; }

        [MaxLength(50)]
        public string? WeightUnit { get; set; }

        public bool RequiresShipping { get; set; }

        public bool TrackQuantity { get; set; }

        public bool ContinueSellingWhenOutOfStock { get; set; }

        [MaxLength(500)]
        public string? MetaTitle { get; set; }

        [MaxLength(1000)]
        public string? MetaDescription { get; set; }

        public bool IsActive { get; set; }
    }

    public class ProductDto
    {
        public int Id { get; set; }
        public string VendorId { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string SKU { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal? ComparePrice { get; set; }
        public decimal Weight { get; set; }
        public string? WeightUnit { get; set; }
        public bool RequiresShipping { get; set; }
        public bool TrackQuantity { get; set; }
        public bool ContinueSellingWhenOutOfStock { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public List<ProductImageDto> Images { get; set; } = new List<ProductImageDto>();
        public List<ProductVariantDto> Variants { get; set; } = new List<ProductVariantDto>();
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public bool InStock => StockQuantity > 0 || ContinueSellingWhenOutOfStock;
    }

    public class ProductListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal? ComparePrice { get; set; }
        public string SKU { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int StockQuantity { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? PrimaryImageUrl { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public bool InStock => StockQuantity > 0;
        public DateTime CreatedDate { get; set; }
    }

    // Product Image DTOs
    public class CreateProductImageDto
    {
        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? AltText { get; set; }

        public int SortOrder { get; set; } = 0;

        public bool IsPrimary { get; set; } = false;
    }

    public class ProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? AltText { get; set; }
        public int SortOrder { get; set; }
        public bool IsPrimary { get; set; }
    }

    // Product Variant DTOs
    public class CreateProductVariantDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Value { get; set; } = string.Empty;

        public decimal PriceAdjustment { get; set; } = 0;

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; } = 0;

        [MaxLength(50)]
        public string? SKU { get; set; }
    }

    public class ProductVariantDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public decimal PriceAdjustment { get; set; }
        public int StockQuantity { get; set; }
        public string? SKU { get; set; }
        public bool IsActive { get; set; }
    }

    // Product Category DTOs
    public class CreateProductCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public int? ParentCategoryId { get; set; }

        [MaxLength(200)]
        public string? ImageUrl { get; set; }

        public int SortOrder { get; set; } = 0;

        [MaxLength(100)]
        public string? Slug { get; set; }

        [MaxLength(500)]
        public string? MetaTitle { get; set; }

        [MaxLength(1000)]
        public string? MetaDescription { get; set; }
    }

    public class UpdateProductCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public int? ParentCategoryId { get; set; }

        [MaxLength(200)]
        public string? ImageUrl { get; set; }

        public int SortOrder { get; set; }

        [MaxLength(100)]
        public string? Slug { get; set; }

        [MaxLength(500)]
        public string? MetaTitle { get; set; }

        [MaxLength(1000)]
        public string? MetaDescription { get; set; }

        public bool IsActive { get; set; }
    }

    public class ProductCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? ParentCategoryId { get; set; }
        public string? ParentCategoryName { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
        public int SortOrder { get; set; }
        public string? Slug { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<ProductCategoryDto> SubCategories { get; set; } = new List<ProductCategoryDto>();
        public int ProductCount { get; set; }
    }

    // Product Search and Filter DTOs
    public class ProductSearchDto
    {
        public string? SearchTerm { get; set; }
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool? InStockOnly { get; set; }
        public string? VendorId { get; set; }
        public int? MinRating { get; set; }
        public string SortBy { get; set; } = "name"; // name, price, rating, date
        public string SortDirection { get; set; } = "asc"; // asc, desc
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class ProductSearchResultDto
    {
        public List<ProductListDto> Products { get; set; } = new List<ProductListDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }
}