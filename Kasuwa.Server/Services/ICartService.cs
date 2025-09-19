using Kasuwa.Server.DTOs;

namespace Kasuwa.Server.Services
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(string userId);
        Task<CartDto> AddToCartAsync(string userId, AddToCartDto addToCartDto);
        Task<CartItemDto?> UpdateCartItemAsync(string userId, int itemId, UpdateCartItemDto updateCartItemDto);
        Task<bool> RemoveFromCartAsync(string userId, int itemId);
        Task<bool> RemoveMultipleItemsAsync(string userId, List<int> itemIds);
        Task<bool> ClearCartAsync(string userId);
        Task<CartSummaryDto> GetCartSummaryAsync(string userId);
        Task<CartValidationResultDto> ValidateCartAsync(string userId);
        Task<int> GetCartItemCountAsync(string userId);
        Task<bool> MergeCartsAsync(string fromUserId, string toUserId);
    }
}