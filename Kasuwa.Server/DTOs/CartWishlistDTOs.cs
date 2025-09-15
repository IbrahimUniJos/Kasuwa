using System.ComponentModel.DataAnnotations;

namespace Kasuwa.Server.DTOs
{
    // Cart DTOs
    public class CartDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public List<CartItemDto> CartItems { get; set; } = new List<CartItemDto>();
        public decimal TotalAmount => CartItems.Sum(item => item.TotalPrice);
        public int TotalItems => CartItems.Sum(item => item.Quantity);
    }

    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSKU { get; set; } = string.Empty;
        public decimal ProductPrice { get; set; }
        public string? ProductImageUrl { get; set; }
        public int Quantity { get; set; }
        public int? ProductVariantId { get; set; }
        public string? ProductVariantName { get; set; }
        public string? ProductVariantValue { get; set; }
        public decimal VariantPriceAdjustment { get; set; }
        public decimal UnitPrice => ProductPrice + VariantPriceAdjustment;
        public decimal TotalPrice => UnitPrice * Quantity;
        public bool IsInStock { get; set; }
        public int AvailableStock { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
    }

    public class AddToCartDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        public int? ProductVariantId { get; set; }
    }

    public class UpdateCartItemDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        public int? ProductVariantId { get; set; }
    }

    public class CartSummaryDto
    {
        public int TotalItems { get; set; }
        public decimal SubTotal { get; set; }
        public decimal EstimatedShipping { get; set; }
        public decimal EstimatedTax { get; set; }
        public decimal EstimatedTotal { get; set; }
        public bool HasOutOfStockItems { get; set; }
        public List<string> Messages { get; set; } = new List<string>();
    }

    // Wishlist DTOs
    public class WishlistDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public List<WishlistItemDto> WishlistItems { get; set; } = new List<WishlistItemDto>();
        public int TotalItems => WishlistItems.Count;
    }

    public class WishlistItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSKU { get; set; } = string.Empty;
        public decimal ProductPrice { get; set; }
        public decimal? ComparePrice { get; set; }
        public string? ProductImageUrl { get; set; }
        public bool IsInStock { get; set; }
        public bool IsActive { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool HasDiscount => ComparePrice.HasValue && ComparePrice > ProductPrice;
        public decimal? DiscountPercentage => HasDiscount ? Math.Round(((ComparePrice!.Value - ProductPrice) / ComparePrice.Value) * 100, 1) : null;
    }

    public class AddToWishlistDto
    {
        [Required]
        public int ProductId { get; set; }
    }

    public class MoveToCartDto
    {
        [Required]
        public int WishlistItemId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; } = 1;

        public int? ProductVariantId { get; set; }
    }

    public class BulkCartActionDto
    {
        [Required]
        public List<int> ItemIds { get; set; } = new List<int>();
    }

    public class BulkWishlistActionDto
    {
        [Required]
        public List<int> ItemIds { get; set; } = new List<int>();
    }

    public class CartItemValidationDto
    {
        public int ItemId { get; set; }
        public bool IsValid { get; set; }
        public string? ValidationMessage { get; set; }
        public int AvailableStock { get; set; }
        public int RequestedQuantity { get; set; }
        public bool IsProductActive { get; set; }
        public bool IsVariantActive { get; set; }
    }

    public class CartValidationResultDto
    {
        public bool IsValid => ValidationResults.All(v => v.IsValid);
        public List<CartItemValidationDto> ValidationResults { get; set; } = new List<CartItemValidationDto>();
        public List<string> GeneralMessages { get; set; } = new List<string>();
    }
}