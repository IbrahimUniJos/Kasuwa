// Review service for Kasuwa platform
import { apiClient } from './api';
import type { 
  ReviewDto,
  CreateReviewDto,
  ReviewHelpfulDto,
  PaginatedApiResponse
} from '../types/api';

export class ReviewService {
  /**
   * Get reviews for a product
   */
  async getProductReviews(productId: number, page: number = 1, pageSize: number = 10): Promise<PaginatedApiResponse<ReviewDto>> {
    const response = await apiClient.get<PaginatedApiResponse<ReviewDto>>(`/reviews/product/${productId}`, {
      page,
      pageSize
    });
    return response;
  }

  /**
   * Get a specific review by ID
   */
  async getReview(id: number): Promise<ReviewDto> {
    const response = await apiClient.get<ReviewDto>(`/reviews/${id}`);
    return response;
  }

  /**
   * Create a new review
   */
  async createReview(reviewData: CreateReviewDto): Promise<ReviewDto> {
    const response = await apiClient.post<ReviewDto>('/reviews', reviewData);
    return response;
  }

  /**
   * Update an existing review
   */
  async updateReview(id: number, reviewData: Partial<CreateReviewDto>): Promise<ReviewDto> {
    const response = await apiClient.put<ReviewDto>(`/reviews/${id}`, reviewData);
    return response;
  }

  /**
   * Delete a review
   */
  async deleteReview(id: number): Promise<void> {
    await apiClient.delete<void>(`/reviews/${id}`);
  }

  /**
   * Mark review as helpful/not helpful
   */
  async markReviewHelpful(helpfulData: ReviewHelpfulDto): Promise<void> {
    await apiClient.post<void>('/reviews/helpful', helpfulData);
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(page: number = 1, pageSize: number = 10): Promise<PaginatedApiResponse<ReviewDto>> {
    const response = await apiClient.get<PaginatedApiResponse<ReviewDto>>('/reviews/my-reviews', {
      page,
      pageSize
    });
    return response;
  }

  /**
   * Check if user can review a product (has purchased it)
   */
  async canReviewProduct(productId: number): Promise<boolean> {
    try {
      const response = await apiClient.get<{ canReview: boolean }>(`/reviews/can-review/${productId}`);
      return response.canReview;
    } catch (error) {
      return false;
    }
  }
}

// Create and export default instance
export const reviewService = new ReviewService();