using Kasuwa.Server.DTOs;

namespace Kasuwa.Server.Services
{
    public interface IReviewService
    {
        Task<ReviewDto> CreateReviewAsync(string customerId, CreateReviewDto createReviewDto);
        Task<ReviewDto?> GetReviewByIdAsync(int id, string? userId = null);
        Task<ReviewDto?> UpdateReviewAsync(int id, string userId, UpdateReviewDto updateReviewDto);
        Task<bool> DeleteReviewAsync(int id, string userId);
        Task<ReviewSummaryDto> GetProductReviewSummaryAsync(int productId, string? userId = null);
        Task<ReviewSearchResultDto> SearchReviewsAsync(ReviewSearchDto searchDto, string? userId = null);
        Task<List<ReviewListDto>> GetProductReviewsAsync(int productId, int pageNumber = 1, int pageSize = 20, string? userId = null);
        Task<List<ReviewDto>> GetCustomerReviewsAsync(string customerId);
        Task<List<ReviewDto>> GetVendorProductReviewsAsync(string vendorId);
        Task<ReviewDto> ApproveReviewAsync(int id, string adminId, ApproveReviewDto approveReviewDto);
        Task<bool> MarkReviewAsHelpfulAsync(int reviewId, string userId, bool isHelpful);
        Task<bool> IsReviewHelpfulByUserAsync(int reviewId, string userId);
        Task<ReviewStatsDto> GetReviewStatsAsync();
        Task<CustomerReviewSummaryDto> GetCustomerReviewSummaryAsync(string customerId);
        Task<VendorReviewSummaryDto> GetVendorReviewSummaryAsync(string vendorId);
        Task<List<ReviewDto>> GetPendingReviewsAsync(int limit = 50);
        Task<bool> BulkReviewActionAsync(BulkReviewActionDto bulkActionDto, string adminId);
        Task<bool> RespondToReviewAsync(int reviewId, string vendorId, string response);
        Task<List<ReviewDto>> GetRecentReviewsAsync(int limit = 10);
    }
}