// Order and Review services for Kasuwa platform
import { apiClient, unwrapApiResponse, unwrapPaginatedResponse } from './api';
import type { 
  OrderDto,
  OrderQueryParams,
  CreateOrderDto,
  ReviewDto,
  CreateReviewDto,
  ReviewHelpfulDto,
  PaymentDto,
  ProcessPaymentDto,
  PaginatedApiResponse,
  ApiResponseDto 
} from '../types/api';

export class OrderService {
  /**
   * Get user's orders with pagination and filters
   */
  async getOrders(params?: OrderQueryParams): Promise<PaginatedApiResponse<OrderDto>> {
    const response = await apiClient.get<PaginatedApiResponse<OrderDto>>('/orders', params);
    return unwrapPaginatedResponse(response);
  }

  /**
   * Get a specific order by ID
   */
  async getOrder(id: number): Promise<OrderDto> {
    const response = await apiClient.get<ApiResponseDto<OrderDto>>(`/orders/${id}`);
    return unwrapApiResponse(response);
  }

  /**
   * Create a new order from current cart
   */
  async createOrder(orderData: CreateOrderDto): Promise<OrderDto> {
    const response = await apiClient.post<ApiResponseDto<OrderDto>>('/orders', orderData);
    return unwrapApiResponse(response);
  }

  /**
   * Cancel an order (if allowed)
   */
  async cancelOrder(id: number, reason?: string): Promise<OrderDto> {
    const response = await apiClient.post<ApiResponseDto<OrderDto>>(`/orders/${id}/cancel`, { reason });
    return unwrapApiResponse(response);
  }

  /**
   * Track order shipment
   */
  async trackOrder(id: number): Promise<any> {
    const response = await apiClient.get<ApiResponseDto<any>>(`/orders/${id}/tracking`);
    return unwrapApiResponse(response);
  }

  /**
   * Get order history/status timeline
   */
  async getOrderHistory(id: number): Promise<any[]> {
    const response = await apiClient.get<ApiResponseDto<any[]>>(`/orders/${id}/history`);
    return unwrapApiResponse(response);
  }

  /**
   * Update order status (vendor/admin only)
   */
  async updateOrderStatus(id: number, status: string, notes?: string): Promise<OrderDto> {
    const response = await apiClient.put<ApiResponseDto<OrderDto>>(`/orders/${id}/status`, { status, notes });
    return unwrapApiResponse(response);
  }

  /**
   * Process return/refund request
   */
  async requestReturn(id: number, reason: string, items?: number[]): Promise<OrderDto> {
    const response = await apiClient.post<ApiResponseDto<OrderDto>>(`/orders/${id}/return`, { reason, items });
    return unwrapApiResponse(response);
  }
}

export class ReviewService {
  /**
   * Get reviews for a product
   */
  async getProductReviews(productId: number, page: number = 1, pageSize: number = 10): Promise<PaginatedApiResponse<ReviewDto>> {
    const response = await apiClient.get<PaginatedApiResponse<ReviewDto>>(`/reviews/product/${productId}`, {
      page,
      pageSize
    });
    return unwrapPaginatedResponse(response);
  }

  /**
   * Get a specific review by ID
   */
  async getReview(id: number): Promise<ReviewDto> {
    const response = await apiClient.get<ApiResponseDto<ReviewDto>>(`/reviews/${id}`);
    return unwrapApiResponse(response);
  }

  /**
   * Create a new review
   */
  async createReview(reviewData: CreateReviewDto): Promise<ReviewDto> {
    const response = await apiClient.post<ApiResponseDto<ReviewDto>>('/reviews', reviewData);
    return unwrapApiResponse(response);
  }

  /**
   * Update an existing review
   */
  async updateReview(id: number, reviewData: Partial<CreateReviewDto>): Promise<ReviewDto> {
    const response = await apiClient.put<ApiResponseDto<ReviewDto>>(`/reviews/${id}`, reviewData);
    return unwrapApiResponse(response);
  }

  /**
   * Delete a review
   */
  async deleteReview(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponseDto<void>>(`/reviews/${id}`);
    unwrapApiResponse(response);
  }

  /**
   * Mark review as helpful/not helpful
   */
  async markReviewHelpful(helpfulData: ReviewHelpfulDto): Promise<void> {
    const response = await apiClient.post<ApiResponseDto<void>>('/reviews/helpful', helpfulData);
    unwrapApiResponse(response);
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(page: number = 1, pageSize: number = 10): Promise<PaginatedApiResponse<ReviewDto>> {
    const response = await apiClient.get<PaginatedApiResponse<ReviewDto>>('/reviews/my-reviews', {
      page,
      pageSize
    });
    return unwrapPaginatedResponse(response);
  }

  /**
   * Check if user can review a product (has purchased it)
   */
  async canReviewProduct(productId: number): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponseDto<{ canReview: boolean }>>(`/reviews/can-review/${productId}`);
      const data = unwrapApiResponse(response);
      return data.canReview;
    } catch (error) {
      return false;
    }
  }
}

export class PaymentService {
  /**
   * Process payment for an order
   */
  async processPayment(paymentData: ProcessPaymentDto): Promise<PaymentDto> {
    const response = await apiClient.post<ApiResponseDto<PaymentDto>>('/payments/process', paymentData);
    return unwrapApiResponse(response);
  }

  /**
   * Get payment details for an order
   */
  async getPayment(orderId: number): Promise<PaymentDto> {
    const response = await apiClient.get<ApiResponseDto<PaymentDto>>(`/payments/order/${orderId}`);
    return unwrapApiResponse(response);
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<PaymentDto> {
    const response = await apiClient.get<ApiResponseDto<PaymentDto>>(`/payments/verify/${transactionId}`);
    return unwrapApiResponse(response);
  }

  /**
   * Request refund for a payment
   */
  async requestRefund(paymentId: number, amount?: number, reason?: string): Promise<PaymentDto> {
    const response = await apiClient.post<ApiResponseDto<PaymentDto>>(`/payments/${paymentId}/refund`, {
      amount,
      reason
    });
    return unwrapApiResponse(response);
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(page: number = 1, pageSize: number = 10): Promise<PaginatedApiResponse<PaymentDto>> {
    const response = await apiClient.get<PaginatedApiResponse<PaymentDto>>('/payments/history', {
      page,
      pageSize
    });
    return unwrapPaginatedResponse(response);
  }
}

// Create and export default instances
export const orderService = new OrderService();
export const reviewService = new ReviewService();
export const paymentService = new PaymentService();