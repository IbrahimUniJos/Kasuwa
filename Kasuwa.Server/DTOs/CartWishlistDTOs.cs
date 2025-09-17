using System.ComponentModel.DataAnnotations;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.DTOs
{
    // Cart DTOs
    public class CartDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } // Frontend expects CreatedAt
        public DateTime UpdatedAt { get; set; } // Frontend expects UpdatedAt
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>(); // Frontend expects Items
        public decimal TotalAmount => Items.Sum(item => item.TotalPrice);
        public int TotalItems => Items.Sum(item => item.Quantity);

        // Legacy properties for backward compatibility
        public DateTime CreatedDate => CreatedAt;
        public DateTime UpdatedDate => UpdatedAt;
        public List<CartItemDto> CartItems => Items;
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
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Legacy properties for backward compatibility
        public DateTime CreatedDate => CreatedAt;
        public DateTime UpdatedDate => UpdatedAt;

        // For frontend compatibility - add the full product object
        public ProductDto? Product { get; set; }

        // Frontend expects productVariant as a string
        public string? ProductVariant => !string.IsNullOrEmpty(ProductVariantValue) ? 
            $"{ProductVariantName}: {ProductVariantValue}" : null;
    }

    public class AddToCartDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        public int? ProductVariantId { get; set; }

        // Frontend compatibility
        public string? ProductVariant { get; set; }
    }

    public class UpdateCartItemDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        public int? ProductVariantId { get; set; }

        // For API compatibility - frontend sends cartItemId separately
        public int CartItemId { get; set; }
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
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<WishlistItemDto> Items { get; set; } = new List<WishlistItemDto>();
        public int TotalItems => Items.Count;

        // Legacy properties for backward compatibility - make them settable
        public DateTime CreatedDate { get => CreatedAt; set => CreatedAt = value; }
        public DateTime UpdatedDate { get => UpdatedAt; set => UpdatedAt = value; }
        public List<WishlistItemDto> WishlistItems { get => Items; set => Items = value; }
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
        public DateTime CreatedAt { get; set; }
        public bool HasDiscount => ComparePrice.HasValue && ComparePrice > ProductPrice;
        public decimal? DiscountPercentage => HasDiscount ? Math.Round(((ComparePrice!.Value - ProductPrice) / ComparePrice.Value) * 100, 1) : null;

        // Legacy property - make it settable
        public DateTime CreatedDate { get => CreatedAt; set => CreatedAt = value; }

        // For frontend compatibility - add the full product object
        public ProductDto? Product { get; set; }
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