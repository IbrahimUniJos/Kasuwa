using Kasuwa.Server.DTOs;

namespace Kasuwa.Server.Services
{
    public interface IWishlistService
    {
        Task<WishlistDto> GetWishlistAsync(string userId);
        Task<WishlistItemDto> AddToWishlistAsync(string userId, AddToWishlistDto addToWishlistDto);
        Task<bool> RemoveFromWishlistAsync(string userId, int itemId);
        Task<bool> RemoveMultipleItemsAsync(string userId, List<int> itemIds);
        Task<bool> ClearWishlistAsync(string userId);
        Task<CartDto> MoveToCartAsync(string userId, MoveToCartDto moveToCartDto);
        Task<CartDto> MoveAllToCartAsync(string userId);
        Task<int> GetWishlistItemCountAsync(string userId);
        Task<bool> IsProductInWishlistAsync(string userId, int productId);
        Task<List<WishlistItemDto>> GetRecentlyViewedSimilarAsync(string userId, int limit = 10);
    }
}