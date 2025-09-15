using Microsoft.EntityFrameworkCore;
using Kasuwa.Server.Data;
using Kasuwa.Server.DTOs;
using Kasuwa.Server.Models;

namespace Kasuwa.Server.Services
{
    public class ReviewService : IReviewService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ReviewService> _logger;

        public ReviewService(ApplicationDbContext context, ILogger<ReviewService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ReviewDto> CreateReviewAsync(string customerId, CreateReviewDto createReviewDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Check if customer has purchased the product
                var hasPurchased = await _context.OrderItems
                    .Include(oi => oi.Order)
                    .AnyAsync(oi => oi.Order.CustomerId == customerId && 
                                  oi.ProductId == createReviewDto.ProductId && 
                                  oi.Order.Status == OrderStatus.Delivered);

                // Check if customer has already reviewed this product
                var existingReview = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.CustomerId == customerId && r.ProductId == createReviewDto.ProductId);

                if (existingReview != null)
                    throw new ArgumentException("You have already reviewed this product");

                // Get product and customer info
                var product = await _context.Products
                    .Include(p => p.Vendor)
                    .FirstOrDefaultAsync(p => p.Id == createReviewDto.ProductId && p.IsActive);

                if (product == null)
                    throw new ArgumentException("Product not found or inactive");

                var customer = await _context.Users.FindAsync(customerId);
                if (customer == null)
                    throw new ArgumentException("Customer not found");

                // Create review
                var review = new Review
                {
                    ProductId = createReviewDto.ProductId,
                    CustomerId = customerId,
                    Rating = createReviewDto.Rating,
                    Title = createReviewDto.Title,
                    Comment = createReviewDto.Comment,
                    IsApproved = false, // Requires admin approval
                    IsVerifiedPurchase = hasPurchased,
                    HelpfulCount = 0,
                    ReviewerName = createReviewDto.IsAnonymous ? "Anonymous" : $"{customer.FirstName} {customer.LastName}".Trim(),
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation("Review {ReviewId} created for product {ProductId} by customer {CustomerId}", 
                    review.Id, createReviewDto.ProductId, customerId);

                return await GetReviewByIdAsync(review.Id, customerId) 
                    ?? throw new InvalidOperationException("Failed to retrieve created review");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating review for product {ProductId} by customer {CustomerId}", 
                    createReviewDto.ProductId, customerId);
                throw;
            }
        }

        public async Task<ReviewDto?> GetReviewByIdAsync(int id, string? userId = null)
        {
            try
            {
                var review = await _context.Reviews
                    .Include(r => r.Product)
                    .Include(r => r.Customer)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (review == null)
                    return null;

                var isHelpfulByUser = false;
                if (!string.IsNullOrEmpty(userId))
                {
                    isHelpfulByUser = await _context.ReviewHelpfuls
                        .AnyAsync(rh => rh.ReviewId == id && rh.UserId == userId);
                }

                return new ReviewDto
                {
                    Id = review.Id,
                    ProductId = review.ProductId,
                    ProductName = review.Product.Name,
                    CustomerId = review.CustomerId,
                    CustomerName = $"{review.Customer.FirstName} {review.Customer.LastName}".Trim(),
                    Rating = review.Rating,
                    Title = review.Title,
                    Comment = review.Comment,
                    IsApproved = review.IsApproved,
                    IsVerifiedPurchase = review.IsVerifiedPurchase,
                    HelpfulCount = review.HelpfulCount,
                    CreatedDate = review.CreatedDate,
                    UpdatedDate = review.UpdatedDate,
                    ReviewerName = review.ReviewerName,
                    ApprovedDate = review.ApprovedDate,
                    ApprovedBy = review.ApprovedBy,
                    AdminNotes = review.AdminNotes,
                    IsHelpfulByCurrentUser = isHelpfulByUser,
                    IsOwnReview = userId == review.CustomerId,
                    CanEdit = userId == review.CustomerId && review.IsApproved == false,
                    CanDelete = userId == review.CustomerId || 
                               (userId != null && await _context.Users.AnyAsync(u => u.Id == userId && u.UserType == UserType.Administrator))
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review {ReviewId}", id);
                throw;
            }
        }

        public async Task<ReviewDto?> UpdateReviewAsync(int id, string userId, UpdateReviewDto updateReviewDto)
        {
            try
            {
                var review = await _context.Reviews
                    .Include(r => r.Product)
                    .Include(r => r.Customer)
                    .FirstOrDefaultAsync(r => r.Id == id && r.CustomerId == userId);

                if (review == null)
                    return null;

                // Only allow updates if review is not approved
                if (review.IsApproved)
                    throw new InvalidOperationException("Cannot update an approved review");

                review.Rating = updateReviewDto.Rating;
                review.Title = updateReviewDto.Title;
                review.Comment = updateReviewDto.Comment;
                review.ReviewerName = updateReviewDto.IsAnonymous ? "Anonymous" : $"{review.Customer.FirstName} {review.Customer.LastName}".Trim();
                review.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Review {ReviewId} updated by customer {CustomerId}", id, userId);

                return await GetReviewByIdAsync(id, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review {ReviewId} by customer {CustomerId}", id, userId);
                throw;
            }
        }

        public async Task<bool> DeleteReviewAsync(int id, string userId)
        {
            try
            {
                var review = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.Id == id && (r.CustomerId == userId || 
                        _context.Users.Any(u => u.Id == userId && u.UserType == UserType.Administrator)));

                if (review == null)
                    return false;

                _context.Reviews.Remove(review);
                
                // Also remove helpful votes
                var helpfulVotes = await _context.ReviewHelpfuls
                    .Where(rh => rh.ReviewId == id)
                    .ToListAsync();
                
                _context.ReviewHelpfuls.RemoveRange(helpfulVotes);
                
                await _context.SaveChangesAsync();

                _logger.LogInformation("Review {ReviewId} deleted by user {UserId}", id, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review {ReviewId} by user {UserId}", id, userId);
                throw;
            }
        }

        public async Task<ReviewSummaryDto> GetProductReviewSummaryAsync(int productId, string? userId = null)
        {
            try
            {
                var product = await _context.Products
                    .Include(p => p.Reviews.Where(r => r.IsApproved))
                    .FirstOrDefaultAsync(p => p.Id == productId);

                if (product == null)
                    throw new ArgumentException("Product not found");

                var reviews = product.Reviews;
                var totalReviews = reviews.Count;
                var averageRating = totalReviews > 0 ? reviews.Average(r => r.Rating) : 0;

                // Rating distribution
                var ratingDistribution = new Dictionary<int, int>();
                for (int i = 1; i <= 5; i++)
                {
                    ratingDistribution[i] = reviews.Count(r => r.Rating == i);
                }

                // Verified purchases
                var verifiedPurchaseCount = reviews.Count(r => r.IsVerifiedPurchase);
                var verifiedPurchasePercentage = totalReviews > 0 ? (double)verifiedPurchaseCount / totalReviews * 100 : 0;

                // Recent reviews
                var recentReviews = reviews
                    .OrderByDescending(r => r.CreatedDate)
                    .Take(5)
                    .ToList();

                // Top helpful reviews
                var topHelpfulReviews = reviews
                    .OrderByDescending(r => r.HelpfulCount)
                    .Take(5)
                    .ToList();

                var reviewDtos = new List<ReviewDto>();
                foreach (var review in recentReviews.Concat(topHelpfulReviews).Distinct())
                {
                    var isHelpfulByUser = false;
                    if (!string.IsNullOrEmpty(userId))
                    {
                        isHelpfulByUser = await _context.ReviewHelpfuls
                            .AnyAsync(rh => rh.ReviewId == review.Id && rh.UserId == userId);
                    }

                    reviewDtos.Add(new ReviewDto
                    {
                        Id = review.Id,
                        ProductId = review.ProductId,
                        ProductName = product.Name,
                        CustomerId = review.CustomerId,
                        CustomerName = "Customer", // Would need to join with Users table for actual name
                        Rating = review.Rating,
                        Title = review.Title,
                        Comment = review.Comment,
                        IsApproved = review.IsApproved,
                        IsVerifiedPurchase = review.IsVerifiedPurchase,
                        HelpfulCount = review.HelpfulCount,
                        CreatedDate = review.CreatedDate,
                        UpdatedDate = review.UpdatedDate,
                        ReviewerName = review.ReviewerName,
                        ApprovedDate = review.ApprovedDate,
                        ApprovedBy = review.ApprovedBy,
                        AdminNotes = review.AdminNotes,
                        IsHelpfulByCurrentUser = isHelpfulByUser
                    });
                }

                return new ReviewSummaryDto
                {
                    ProductId = productId,
                    TotalReviews = totalReviews,
                    AverageRating = Math.Round(averageRating, 1),
                    RatingDistribution = ratingDistribution,
                    VerifiedPurchaseCount = verifiedPurchaseCount,
                    VerifiedPurchasePercentage = Math.Round(verifiedPurchasePercentage, 1),
                    RecentReviews = reviewDtos.Take(5).ToList(),
                    TopHelpfulReviews = reviewDtos.Skip(5).Take(5).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review summary for product {ProductId}", productId);
                throw;
            }
        }

        public async Task<ReviewSearchResultDto> SearchReviewsAsync(ReviewSearchDto searchDto, string? userId = null)
        {
            try
            {
                var query = _context.Reviews
                    .Include(r => r.Product)
                    .Include(r => r.Customer)
                    .AsQueryable();

                // Apply filters
                if (searchDto.ProductId.HasValue)
                {
                    query = query.Where(r => r.ProductId == searchDto.ProductId.Value);
                }

                if (!string.IsNullOrEmpty(searchDto.CustomerId))
                {
                    query = query.Where(r => r.CustomerId == searchDto.CustomerId);
                }

                if (searchDto.Rating.HasValue)
                {
                    query = query.Where(r => r.Rating == searchDto.Rating.Value);
                }

                if (searchDto.IsApproved.HasValue)
                {
                    query = query.Where(r => r.IsApproved == searchDto.IsApproved.Value);
                }

                if (searchDto.IsVerifiedPurchase.HasValue)
                {
                    query = query.Where(r => r.IsVerifiedPurchase == searchDto.IsVerifiedPurchase.Value);
                }

                if (!string.IsNullOrWhiteSpace(searchDto.SearchTerm))
                {
                    query = query.Where(r => r.Title.Contains(searchDto.SearchTerm) || 
                                           r.Comment.Contains(searchDto.SearchTerm));
                }

                if (searchDto.FromDate.HasValue)
                {
                    query = query.Where(r => r.CreatedDate >= searchDto.FromDate.Value);
                }

                if (searchDto.ToDate.HasValue)
                {
                    query = query.Where(r => r.CreatedDate <= searchDto.ToDate.Value);
                }

                // Apply sorting
                query = searchDto.SortBy.ToLower() switch
                {
                    "rating" => searchDto.SortDirection == "desc"
                        ? query.OrderByDescending(r => r.Rating)
                        : query.OrderBy(r => r.Rating),
                    "helpful" => searchDto.SortDirection == "desc"
                        ? query.OrderByDescending(r => r.HelpfulCount)
                        : query.OrderBy(r => r.HelpfulCount),
                    _ => searchDto.SortDirection == "desc"
                        ? query.OrderByDescending(r => r.CreatedDate)
                        : query.OrderBy(r => r.CreatedDate)
                };

                var totalCount = await query.CountAsync();

                var reviews = await query
                    .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
                    .Take(searchDto.PageSize)
                    .Select(r => new ReviewListDto
                    {
                        Id = r.Id,
                        ProductId = r.ProductId,
                        ProductName = r.Product.Name,
                        ProductImageUrl = r.Product.Images.FirstOrDefault(i => i.IsPrimary).ImageUrl,
                        Rating = r.Rating,
                        Title = r.Title,
                        Comment = r.Comment,
                        ReviewerName = r.ReviewerName,
                        IsVerifiedPurchase = r.IsVerifiedPurchase,
                        HelpfulCount = r.HelpfulCount,
                        CreatedDate = r.CreatedDate
                    })
                    .ToListAsync();

                // Add helpful status for current user
                if (!string.IsNullOrEmpty(userId))
                {
                    var reviewIds = reviews.Select(r => r.Id).ToList();
                    var helpfulReviews = await _context.ReviewHelpfuls
                        .Where(rh => reviewIds.Contains(rh.ReviewId) && rh.UserId == userId)
                        .Select(rh => rh.ReviewId)
                        .ToListAsync();

                    foreach (var review in reviews)
                    {
                        review.IsHelpfulByCurrentUser = helpfulReviews.Contains(review.Id);
                    }
                }

                // Calculate stats
                var allReviews = await _context.Reviews
                    .Where(r => !searchDto.ProductId.HasValue || r.ProductId == searchDto.ProductId.Value)
                    .ToListAsync();

                var stats = new ReviewSearchStatsDto
                {
                    AverageRating = allReviews.Any() ? Math.Round(allReviews.Average(r => r.Rating), 1) : 0,
                    RatingDistribution = new Dictionary<int, int>(),
                    VerifiedPurchaseCount = allReviews.Count(r => r.IsVerifiedPurchase),
                    VerifiedPurchasePercentage = allReviews.Any() ? 
                        Math.Round((double)allReviews.Count(r => r.IsVerifiedPurchase) / allReviews.Count * 100, 1) : 0
                };

                for (int i = 1; i <= 5; i++)
                {
                    stats.RatingDistribution[i] = allReviews.Count(r => r.Rating == i);
                }

                return new ReviewSearchResultDto
                {
                    Reviews = reviews,
                    TotalCount = totalCount,
                    PageNumber = searchDto.PageNumber,
                    PageSize = searchDto.PageSize,
                    Stats = stats
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching reviews");
                throw;
            }
        }

        public async Task<List<ReviewListDto>> GetProductReviewsAsync(int productId, int pageNumber = 1, int pageSize = 20, string? userId = null)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.Product)
                    .Where(r => r.ProductId == productId && r.IsApproved)
                    .OrderByDescending(r => r.CreatedDate)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new ReviewListDto
                    {
                        Id = r.Id,
                        ProductId = r.ProductId,
                        ProductName = r.Product.Name,
                        ProductImageUrl = r.Product.Images.FirstOrDefault(i => i.IsPrimary).ImageUrl,
                        Rating = r.Rating,
                        Title = r.Title,
                        Comment = r.Comment,
                        ReviewerName = r.ReviewerName,
                        IsVerifiedPurchase = r.IsVerifiedPurchase,
                        HelpfulCount = r.HelpfulCount,
                        CreatedDate = r.CreatedDate
                    })
                    .ToListAsync();

                // Add helpful status for current user
                if (!string.IsNullOrEmpty(userId))
                {
                    var reviewIds = reviews.Select(r => r.Id).ToList();
                    var helpfulReviews = await _context.ReviewHelpfuls
                        .Where(rh => reviewIds.Contains(rh.ReviewId) && rh.UserId == userId)
                        .Select(rh => rh.ReviewId)
                        .ToListAsync();

                    foreach (var review in reviews)
                    {
                        review.IsHelpfulByCurrentUser = helpfulReviews.Contains(review.Id);
                    }
                }

                return reviews;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for product {ProductId}", productId);
                throw;
            }
        }

        public async Task<List<ReviewDto>> GetCustomerReviewsAsync(string customerId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.Product)
                    .Where(r => r.CustomerId == customerId)
                    .OrderByDescending(r => r.CreatedDate)
                    .ToListAsync();

                return reviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    ProductName = r.Product.Name,
                    CustomerId = r.CustomerId,
                    CustomerName = "Customer", // Would need to join with Users table for actual name
                    Rating = r.Rating,
                    Title = r.Title,
                    Comment = r.Comment,
                    IsApproved = r.IsApproved,
                    IsVerifiedPurchase = r.IsVerifiedPurchase,
                    HelpfulCount = r.HelpfulCount,
                    CreatedDate = r.CreatedDate,
                    UpdatedDate = r.UpdatedDate,
                    ReviewerName = r.ReviewerName,
                    ApprovedDate = r.ApprovedDate,
                    ApprovedBy = r.ApprovedBy,
                    AdminNotes = r.AdminNotes
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for customer {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<List<ReviewDto>> GetVendorProductReviewsAsync(string vendorId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.Product)
                    .Include(r => r.Customer)
                    .Where(r => r.Product.VendorId == vendorId)
                    .OrderByDescending(r => r.CreatedDate)
                    .ToListAsync();

                return reviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    ProductName = r.Product.Name,
                    CustomerId = r.CustomerId,
                    CustomerName = $"{r.Customer.FirstName} {r.Customer.LastName}".Trim(),
                    Rating = r.Rating,
                    Title = r.Title,
                    Comment = r.Comment,
                    IsApproved = r.IsApproved,
                    IsVerifiedPurchase = r.IsVerifiedPurchase,
                    HelpfulCount = r.HelpfulCount,
                    CreatedDate = r.CreatedDate,
                    UpdatedDate = r.UpdatedDate,
                    ReviewerName = r.ReviewerName,
                    ApprovedDate = r.ApprovedDate,
                    ApprovedBy = r.ApprovedBy,
                    AdminNotes = r.AdminNotes
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for vendor {VendorId}", vendorId);
                throw;
            }
        }

        public async Task<ReviewDto> ApproveReviewAsync(int id, string adminId, ApproveReviewDto approveReviewDto)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(id);
                if (review == null)
                    throw new ArgumentException("Review not found");

                review.IsApproved = approveReviewDto.IsApproved;
                review.ApprovedDate = approveReviewDto.IsApproved ? DateTime.UtcNow : null;
                review.ApprovedBy = approveReviewDto.IsApproved ? adminId : null;
                review.AdminNotes = approveReviewDto.AdminNotes;
                review.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Review {ReviewId} {Status} by admin {AdminId}", 
                    id, approveReviewDto.IsApproved ? "approved" : "rejected", adminId);

                return await GetReviewByIdAsync(id) 
                    ?? throw new InvalidOperationException("Failed to retrieve updated review");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving review {ReviewId} by admin {AdminId}", id, adminId);
                throw;
            }
        }

        public async Task<bool> MarkReviewAsHelpfulAsync(int reviewId, string userId, bool isHelpful)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var review = await _context.Reviews.FindAsync(reviewId);
                if (review == null)
                    return false;

                var existingVote = await _context.ReviewHelpfuls
                    .FirstOrDefaultAsync(rh => rh.ReviewId == reviewId && rh.UserId == userId);

                if (existingVote != null)
                {
                    // Update existing vote
                    if (existingVote.IsHelpful != isHelpful)
                    {
                        existingVote.IsHelpful = isHelpful;
                        review.HelpfulCount += isHelpful ? 1 : -1;
                    }
                }
                else
                {
                    // Create new vote
                    var reviewHelpful = new ReviewHelpful
                    {
                        ReviewId = reviewId,
                        UserId = userId,
                        IsHelpful = isHelpful,
                        CreatedDate = DateTime.UtcNow
                    };

                    _context.ReviewHelpfuls.Add(reviewHelpful);
                    review.HelpfulCount += isHelpful ? 1 : 0;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Review {ReviewId} marked as {HelpfulStatus} by user {UserId}", 
                    reviewId, isHelpful ? "helpful" : "not helpful", userId);

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error marking review {ReviewId} as helpful by user {UserId}", reviewId, userId);
                throw;
            }
        }

        public async Task<bool> IsReviewHelpfulByUserAsync(int reviewId, string userId)
        {
            try
            {
                return await _context.ReviewHelpfuls
                    .AnyAsync(rh => rh.ReviewId == reviewId && rh.UserId == userId && rh.IsHelpful);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if review {ReviewId} is helpful by user {UserId}", reviewId, userId);
                throw;
            }
        }

        public async Task<ReviewStatsDto> GetReviewStatsAsync()
        {
            try
            {
                var allReviews = await _context.Reviews.ToListAsync();

                var stats = new ReviewStatsDto
                {
                    TotalReviews = allReviews.Count,
                    PendingReviews = allReviews.Count(r => !r.IsApproved),
                    ApprovedReviews = allReviews.Count(r => r.IsApproved),
                    RejectedReviews = 0, // We don't have a rejected status in our model
                    OverallAverageRating = allReviews.Any() ? Math.Round(allReviews.Average(r => r.Rating), 1) : 0,
                    GlobalRatingDistribution = new Dictionary<int, int>()
                };

                for (int i = 1; i <= 5; i++)
                {
                    stats.GlobalRatingDistribution[i] = allReviews.Count(r => r.Rating == i);
                }

                // Top reviewed products
                var topReviewedProducts = await _context.Products
                    .Include(p => p.Reviews)
                    .Include(p => p.Vendor)
                    .Where(p => p.Reviews.Any())
                    .Select(p => new TopReviewedProductDto
                    {
                        ProductId = p.Id,
                        ProductName = p.Name,
                        ProductImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary).ImageUrl,
                        ReviewCount = p.Reviews.Count,
                        AverageRating = p.Reviews.Any() ? Math.Round(p.Reviews.Average(r => r.Rating), 1) : 0,
                        VendorName = $"{p.Vendor.FirstName} {p.Vendor.LastName}".Trim()
                    })
                    .OrderByDescending(p => p.ReviewCount)
                    .Take(10)
                    .ToListAsync();

                stats.TopReviewedProducts = topReviewedProducts;

                // Recent reviews
                var recentReviews = await _context.Reviews
                    .Include(r => r.Product)
                    .Include(r => r.Customer)
                    .OrderByDescending(r => r.CreatedDate)
                    .Take(10)
                    .ToListAsync();

                stats.RecentReviews = recentReviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    ProductName = r.Product.Name,
                    CustomerId = r.CustomerId,
                    CustomerName = $"{r.Customer.FirstName} {r.Customer.LastName}".Trim(),
                    Rating = r.Rating,
                    Title = r.Title,
                    Comment = r.Comment,
                    IsApproved = r.IsApproved,
                    IsVerifiedPurchase = r.IsVerifiedPurchase,
                    HelpfulCount = r.HelpfulCount,
                    CreatedDate = r.CreatedDate,
                    UpdatedDate = r.UpdatedDate,
                    ReviewerName = r.ReviewerName,
                    ApprovedDate = r.ApprovedDate,
                    ApprovedBy = r.ApprovedBy,
                    AdminNotes = r.AdminNotes
                }).ToList();

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review stats");
                throw;
            }
        }

        public async Task<CustomerReviewSummaryDto> GetCustomerReviewSummaryAsync(string customerId)
        {
            try
            {
                var customer = await _context.Users.FindAsync(customerId);
                if (customer == null)
                    throw new ArgumentException("Customer not found");

                var reviews = await _context.Reviews
                    .Where(r => r.CustomerId == customerId)
                    .ToListAsync();

                var helpfulVotesReceived = await _context.ReviewHelpfuls
                    .CountAsync(rh => reviews.Select(r => r.Id).Contains(rh.ReviewId) && rh.IsHelpful);

                return new CustomerReviewSummaryDto
                {
                    CustomerId = customerId,
                    CustomerName = $"{customer.FirstName} {customer.LastName}".Trim(),
                    TotalReviews = reviews.Count,
                    AverageRatingGiven = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 1) : 0,
                    VerifiedPurchaseReviews = reviews.Count(r => r.IsVerifiedPurchase),
                    HelpfulVotesReceived = helpfulVotesReceived,
                    LastReviewDate = reviews.Any() ? reviews.Max(r => r.CreatedDate) : null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review summary for customer {CustomerId}", customerId);
                throw;
            }
        }

        public async Task<VendorReviewSummaryDto> GetVendorReviewSummaryAsync(string vendorId)
        {
            try
            {
                var vendor = await _context.Users.FindAsync(vendorId);
                if (vendor == null)
                    throw new ArgumentException("Vendor not found");

                var vendorProducts = await _context.Products
                    .Where(p => p.VendorId == vendorId)
                    .ToListAsync();

                var productIds = vendorProducts.Select(p => p.Id).ToList();
                var reviews = await _context.Reviews
                    .Where(r => productIds.Contains(r.ProductId))
                    .ToListAsync();

                var ratingDistribution = new Dictionary<int, int>();
                for (int i = 1; i <= 5; i++)
                {
                    ratingDistribution[i] = reviews.Count(r => r.Rating == i);
                }

                var topRatedProducts = await _context.Products
                    .Include(p => p.Reviews)
                    .Where(p => p.VendorId == vendorId && p.Reviews.Any())
                    .Select(p => new TopReviewedProductDto
                    {
                        ProductId = p.Id,
                        ProductName = p.Name,
                        ProductImageUrl = p.Images.FirstOrDefault(i => i.IsPrimary).ImageUrl,
                        ReviewCount = p.Reviews.Count,
                        AverageRating = p.Reviews.Any() ? Math.Round(p.Reviews.Average(r => r.Rating), 1) : 0,
                        VendorName = $"{vendor.FirstName} {vendor.LastName}".Trim()
                    })
                    .OrderByDescending(p => p.AverageRating)
                    .Take(10)
                    .ToListAsync();

                var recentReviews = await _context.Reviews
                    .Include(r => r.Product)
                    .Include(r => r.Customer)
                    .Where(r => productIds.Contains(r.ProductId))
                    .OrderByDescending(r => r.CreatedDate)
                    .Take(10)
                    .ToListAsync();

                var reviewDtos = recentReviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    ProductName = r.Product.Name,
                    CustomerId = r.CustomerId,
                    CustomerName = $"{r.Customer.FirstName} {r.Customer.LastName}".Trim(),
                    Rating = r.Rating,
                    Title = r.Title,
                    Comment = r.Comment,
                    IsApproved = r.IsApproved,
                    IsVerifiedPurchase = r.IsVerifiedPurchase,
                    HelpfulCount = r.HelpfulCount,
                    CreatedDate = r.CreatedDate,
                    UpdatedDate = r.UpdatedDate,
                    ReviewerName = r.ReviewerName,
                    ApprovedDate = r.ApprovedDate,
                    ApprovedBy = r.ApprovedBy,
                    AdminNotes = r.AdminNotes
                }).ToList();

                return new VendorReviewSummaryDto
                {
                    VendorId = vendorId,
                    VendorName = $"{vendor.FirstName} {vendor.LastName}".Trim(),
                    TotalProductsWithReviews = vendorProducts.Count(p => p.Reviews.Any()),
                    TotalReviews = reviews.Count,
                    AverageRating = reviews.Any() ? Math.Round(reviews.Average(r => r.Rating), 1) : 0,
                    RatingDistribution = ratingDistribution,
                    TopRatedProducts = topRatedProducts,
                    RecentReviews = reviewDtos,
                    ResponsesGiven = 0, // We don't have a response feature in our model
                    ResponseRate = 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review summary for vendor {VendorId}", vendorId);
                throw;
            }
        }

        public async Task<List<ReviewDto>> GetPendingReviewsAsync(int limit = 50)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.Product)
                    .Include(r => r.Customer)
                    .Where(r => !r.IsApproved)
                    .OrderBy(r => r.CreatedDate)
                    .Take(limit)
                    .ToListAsync();

                return reviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    ProductName = r.Product.Name,
                    CustomerId = r.CustomerId,
                    CustomerName = $"{r.Customer.FirstName} {r.Customer.LastName}".Trim(),
                    Rating = r.Rating,
                    Title = r.Title,
                    Comment = r.Comment,
                    IsApproved = r.IsApproved,
                    IsVerifiedPurchase = r.IsVerifiedPurchase,
                    HelpfulCount = r.HelpfulCount,
                    CreatedDate = r.CreatedDate,
                    UpdatedDate = r.UpdatedDate,
                    ReviewerName = r.ReviewerName,
                    ApprovedDate = r.ApprovedDate,
                    ApprovedBy = r.ApprovedBy,
                    AdminNotes = r.AdminNotes
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending reviews");
                throw;
            }
        }

        public async Task<bool> BulkReviewActionAsync(BulkReviewActionDto bulkActionDto, string adminId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var reviews = await _context.Reviews
                    .Where(r => bulkActionDto.ReviewIds.Contains(r.Id))
                    .ToListAsync();

                foreach (var review in reviews)
                {
                    switch (bulkActionDto.Action.ToLower())
                    {
                        case "approve":
                            review.IsApproved = true;
                            review.ApprovedDate = DateTime.UtcNow;
                            review.ApprovedBy = adminId;
                            review.AdminNotes = bulkActionDto.AdminNotes;
                            break;
                        case "reject":
                            review.IsApproved = false;
                            review.ApprovedDate = null;
                            review.ApprovedBy = null;
                            review.AdminNotes = bulkActionDto.AdminNotes;
                            break;
                        case "delete":
                            _context.Reviews.Remove(review);
                            // Also remove helpful votes
                            var helpfulVotes = await _context.ReviewHelpfuls
                                .Where(rh => rh.ReviewId == review.Id)
                                .ToListAsync();
                            _context.ReviewHelpfuls.RemoveRange(helpfulVotes);
                            break;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Bulk action '{Action}' applied to {Count} reviews by admin {AdminId}", 
                    bulkActionDto.Action, reviews.Count, adminId);

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error applying bulk action '{Action}' by admin {AdminId}", 
                    bulkActionDto.Action, adminId);
                throw;
            }
        }

        public async Task<bool> RespondToReviewAsync(int reviewId, string vendorId, string response)
        {
            try
            {
                var review = await _context.Reviews
                    .Include(r => r.Product)
                    .FirstOrDefaultAsync(r => r.Id == reviewId && r.Product.VendorId == vendorId);

                if (review == null)
                    return false;

                // In a real implementation, you might want to store the response
                // For now, we'll just log it
                _logger.LogInformation("Vendor {VendorId} responded to review {ReviewId}: {Response}", 
                    vendorId, reviewId, response);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error responding to review {ReviewId} by vendor {VendorId}", reviewId, vendorId);
                throw;
            }
        }

        public async Task<List<ReviewDto>> GetRecentReviewsAsync(int limit = 10)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.Product)
                    .Include(r => r.Customer)
                    .Where(r => r.IsApproved)
                    .OrderByDescending(r => r.CreatedDate)
                    .Take(limit)
                    .ToListAsync();

                return reviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    ProductName = r.Product.Name,
                    CustomerId = r.CustomerId,
                    CustomerName = $"{r.Customer.FirstName} {r.Customer.LastName}".Trim(),
                    Rating = r.Rating,
                    Title = r.Title,
                    Comment = r.Comment,
                    IsApproved = r.IsApproved,
                    IsVerifiedPurchase = r.IsVerifiedPurchase,
                    HelpfulCount = r.HelpfulCount,
                    CreatedDate = r.CreatedDate,
                    UpdatedDate = r.UpdatedDate,
                    ReviewerName = r.ReviewerName,
                    ApprovedDate = r.ApprovedDate,
                    ApprovedBy = r.ApprovedBy,
                    AdminNotes = r.AdminNotes
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent reviews");
                throw;
            }
        }
    }
}