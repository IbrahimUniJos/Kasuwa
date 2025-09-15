using System.ComponentModel.DataAnnotations;

namespace Kasuwa.Server.DTOs
{
    // Review DTOs
    public class CreateReviewDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [MaxLength(100)]
        public string? Title { get; set; }

        [MaxLength(2000)]
        public string? Comment { get; set; }

        [MaxLength(100)]
        public string? ReviewerName { get; set; }

        public bool IsAnonymous { get; set; } = false;
    }

    public class UpdateReviewDto
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [MaxLength(100)]
        public string? Title { get; set; }

        [MaxLength(2000)]
        public string? Comment { get; set; }

        [MaxLength(100)]
        public string? ReviewerName { get; set; }

        public bool IsAnonymous { get; set; } = false;
    }

    public class ReviewDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string? Comment { get; set; }
        public bool IsApproved { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public int HelpfulCount { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string? ReviewerName { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? ApprovedBy { get; set; }
        public string? AdminNotes { get; set; }
        public bool IsHelpfulByCurrentUser { get; set; } = false;
        public bool IsOwnReview { get; set; } = false;
        public bool CanEdit { get; set; } = false;
        public bool CanDelete { get; set; } = false;
    }

    public class ReviewListDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string? Comment { get; set; }
        public string ReviewerName { get; set; } = string.Empty;
        public bool IsVerifiedPurchase { get; set; }
        public int HelpfulCount { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsHelpfulByCurrentUser { get; set; } = false;
    }

    public class ReviewSummaryDto
    {
        public int ProductId { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new Dictionary<int, int>();
        public int VerifiedPurchaseCount { get; set; }
        public double VerifiedPurchasePercentage { get; set; }
        public List<ReviewDto> RecentReviews { get; set; } = new List<ReviewDto>();
        public List<ReviewDto> TopHelpfulReviews { get; set; } = new List<ReviewDto>();
    }

    public class ReviewSearchDto
    {
        public int? ProductId { get; set; }
        public string? CustomerId { get; set; }
        public int? Rating { get; set; }
        public bool? IsApproved { get; set; }
        public bool? IsVerifiedPurchase { get; set; }
        public string? SearchTerm { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string SortBy { get; set; } = "createdDate"; // createdDate, rating, helpful
        public string SortDirection { get; set; } = "desc"; // asc, desc
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class ReviewSearchResultDto
    {
        public List<ReviewListDto> Reviews { get; set; } = new List<ReviewListDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
        public ReviewSearchStatsDto Stats { get; set; } = new ReviewSearchStatsDto();
    }

    public class ReviewSearchStatsDto
    {
        public double AverageRating { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new Dictionary<int, int>();
        public int VerifiedPurchaseCount { get; set; }
        public double VerifiedPurchasePercentage { get; set; }
    }

    public class ApproveReviewDto
    {
        [Required]
        public bool IsApproved { get; set; }

        [MaxLength(500)]
        public string? AdminNotes { get; set; }
    }

    public class MarkReviewHelpfulDto
    {
        [Required]
        public int ReviewId { get; set; }

        public bool IsHelpful { get; set; } = true;
    }

    public class ReviewStatsDto
    {
        public int TotalReviews { get; set; }
        public int PendingReviews { get; set; }
        public int ApprovedReviews { get; set; }
        public int RejectedReviews { get; set; }
        public double OverallAverageRating { get; set; }
        public Dictionary<int, int> GlobalRatingDistribution { get; set; } = new Dictionary<int, int>();
        public List<TopReviewedProductDto> TopReviewedProducts { get; set; } = new List<TopReviewedProductDto>();
        public List<ReviewDto> RecentReviews { get; set; } = new List<ReviewDto>();
    }

    public class TopReviewedProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public int ReviewCount { get; set; }
        public double AverageRating { get; set; }
        public string VendorName { get; set; } = string.Empty;
    }

    public class BulkReviewActionDto
    {
        [Required]
        public List<int> ReviewIds { get; set; } = new List<int>();

        [Required]
        public string Action { get; set; } = string.Empty; // "approve", "reject", "delete"

        [MaxLength(500)]
        public string? AdminNotes { get; set; }
    }

    public class CustomerReviewSummaryDto
    {
        public string CustomerId { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public int TotalReviews { get; set; }
        public double AverageRatingGiven { get; set; }
        public int VerifiedPurchaseReviews { get; set; }
        public int HelpfulVotesReceived { get; set; }
        public DateTime? LastReviewDate { get; set; }
        public List<ReviewListDto> RecentReviews { get; set; } = new List<ReviewListDto>();
    }

    public class VendorReviewSummaryDto
    {
        public string VendorId { get; set; } = string.Empty;
        public string VendorName { get; set; } = string.Empty;
        public int TotalProductsWithReviews { get; set; }
        public int TotalReviews { get; set; }
        public double AverageRating { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new Dictionary<int, int>();
        public List<TopReviewedProductDto> TopRatedProducts { get; set; } = new List<TopReviewedProductDto>();
        public List<ReviewDto> RecentReviews { get; set; } = new List<ReviewDto>();
        public int ResponsesGiven { get; set; }
        public double ResponseRate { get; set; }
    }

    public class MarkHelpfulDto
    {
        public bool IsHelpful { get; set; } = true;
    }

    public class RespondToReviewDto
    {
        [Required]
        [MaxLength(1000)]
        public string Response { get; set; } = string.Empty;
    }
}