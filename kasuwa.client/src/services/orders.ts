// Order and Payment services for Kasuwa platform
import { apiClient, unwrapPaginatedResponse } from './api';
import type { 
  OrderDto,
  OrderQueryParams,
  CreateOrderDto,
  PaymentDto,
  ProcessPaymentDto,
  PaginatedApiResponse
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
    const response = await apiClient.get<OrderDto>(`/orders/${id}`);
    return response;
  }

  /**
   * Create a new order from current cart
   */
  async createOrder(orderData: CreateOrderDto): Promise<OrderDto> {
    const response = await apiClient.post<OrderDto>('/orders', orderData);
    return response;
  }

  /**
   * Cancel an order (if allowed)
   */
  async cancelOrder(id: number, reason?: string): Promise<OrderDto> {
    const response = await apiClient.post<OrderDto>(`/orders/${id}/cancel`, { reason });
    return response;
  }

  /**
   * Track order shipment
   */
  async trackOrder(id: number): Promise<any> {
    const response = await apiClient.get<any>(`/orders/${id}/tracking`);
    return response;
  }

  /**
   * Get order history/status timeline
   */
  async getOrderHistory(id: number): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/orders/${id}/history`);
    return response;
  }

  /**
   * Update order status (vendor/admin only)
   */
  async updateOrderStatus(id: number, status: string, notes?: string): Promise<OrderDto> {
    const response = await apiClient.put<OrderDto>(`/orders/${id}/status`, { status, notes });
    return response;
  }

  /**
   * Process return/refund request
   */
  async requestReturn(id: number, reason: string, items?: number[]): Promise<OrderDto> {
    const response = await apiClient.post<OrderDto>(`/orders/${id}/return`, { reason, items });
    return response;
  }
}

export class PaymentService {
  /**
   * Process payment for an order
   */
  async processPayment(paymentData: ProcessPaymentDto): Promise<PaymentDto> {
    const response = await apiClient.post<PaymentDto>('/payments/process', paymentData);
    return response;
  }

  /**
   * Get payment details for an order
   */
  async getPayment(orderId: number): Promise<PaymentDto> {
    const response = await apiClient.get<PaymentDto>(`/payments/order/${orderId}`);
    return response;
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<PaymentDto> {
    const response = await apiClient.get<PaymentDto>(`/payments/verify/${transactionId}`);
    return response;
  }

  /**
   * Request refund for a payment
   */
  async requestRefund(paymentId: number, amount?: number, reason?: string): Promise<PaymentDto> {
    const response = await apiClient.post<PaymentDto>(`/payments/${paymentId}/refund`, {
      amount,
      reason
    });
    return response;
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
export const paymentService = new PaymentService();