// Vendor service for Kasuwa platform
import { apiClient } from './api';

// Vendor-related DTOs for TypeScript
export interface VendorApplicationStatusDto {
  isApproved: boolean;
  approvedDate?: string;
  applicationStatus: string;
  businessName?: string;
  businessDescription?: string;
}

export interface UpdateVendorBusinessProfileDto {
  businessName: string;
  businessDescription?: string;
  businessAddress?: string;
  businessPhone?: string;
}

export interface VendorDashboardStatsDto {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  averageRating: number;
  yesterdayRevenue: number;
  weeklyRevenue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  thisMonthOrders: number;
  conversionRate: number;
  recentActivities: RecentActivityDto[];
}

export interface RecentActivityDto {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  url?: string;
}

export interface VendorAnalyticsDto {
  productPerformance: ProductPerformanceDto[];
  monthlySales: MonthlySalesDto[];
  categoryBreakdown: CategorySalesDto[];
  topSellingProducts: TopSellingProductDto[];
  recentActivity: RecentActivityDto[];
}

export interface ProductPerformanceDto {
  productId: number;
  productName: string;
  views: number;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export interface MonthlySalesDto {
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  orderCount: number;
  productsSold: number;
}

export interface CategorySalesDto {
  categoryName: string;
  productCount: number;
  totalRevenue: number;
  orderCount: number;
  averageRating: number;
}

export interface TopSellingProductDto {
  productId: number;
  name: string;
  imageUrl: string;
  salesCount: number;
  revenue: number;
  price: number;
  stockQuantity: number;
}

export interface VendorOrderSearchDto {
  status?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface VendorOrderSearchResultDto {
  orders: VendorOrderDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface VendorOrderDto {
  id: number;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  trackingNumber?: string;
  orderItems: VendorOrderItemDto[];
  notes?: string;
  shippedDate?: string;
  deliveredDate?: string;
  itemCount: number;
  estimatedDeliveryDate?: string;
}

export interface VendorOrderItemDto {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productVariant?: string;
}

export interface VendorInventoryDto {
  productId: number;
  productName: string;
  productSku: string;
  stockQuantity: number;
  reorderLevel: number;
  price: number;
  isActive: boolean;
  lastUpdated: string;
  currentStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  reservedStock: number;
}

export interface UpdateInventoryDto {
  productId: number;
  stockQuantity: number;
  reorderLevel: number;
}

export interface VendorPerformanceDto {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  customerCount: number;
  conversionRate: number;
  monthlyData: MonthlyPerformanceDto[];
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  totalReviews: number;
  cancellationRate: number;
  onTimeDeliveryRate: number;
  last30DaysFrom: string;
  last30DaysTo: string;
}

export interface MonthlyPerformanceDto {
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  orders: number;
}

export class VendorService {
  /**
   * Get vendor application status
   */
  async getApplicationStatus(): Promise<VendorApplicationStatusDto> {
    const response = await apiClient.get<VendorApplicationStatusDto>('/vendor/application-status');
    return response;
  }

  /**
   * Update vendor business profile
   */
  async updateBusinessProfile(profileData: UpdateVendorBusinessProfileDto): Promise<void> {
    await apiClient.put<void>('/vendor/business-profile', profileData);
  }

  /**
   * Get vendor dashboard statistics
   */
  async getDashboardStats(): Promise<VendorDashboardStatsDto> {
    const response = await apiClient.get<VendorDashboardStatsDto>('/vendor/dashboard-stats');
    return response;
  }

  /**
   * Get vendor analytics data
   */
  async getAnalytics(): Promise<VendorAnalyticsDto> {
    const response = await apiClient.get<VendorAnalyticsDto>('/vendor/analytics');
    return response;
  }

  /**
   * Search vendor orders
   */
  async searchOrders(searchParams: VendorOrderSearchDto): Promise<VendorOrderSearchResultDto> {
    const response = await apiClient.get<VendorOrderSearchResultDto>('/vendor/orders', { params: searchParams });
    return response;
  }

  /**
   * Get specific order details
   */
  async getOrder(orderId: number): Promise<VendorOrderDto> {
    const response = await apiClient.get<VendorOrderDto>(`/vendor/orders/${orderId}`);
    return response;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: number, status: string, trackingNumber?: string): Promise<void> {
    await apiClient.put<void>(`/vendor/orders/${orderId}/status`, { 
      status, 
      trackingNumber 
    });
  }

  /**
   * Get vendor inventory
   */
  async getInventory(): Promise<VendorInventoryDto[]> {
    const response = await apiClient.get<VendorInventoryDto[]>('/vendor/inventory');
    return response;
  }

  /**
   * Update inventory item
   */
  async updateInventory(inventoryData: UpdateInventoryDto): Promise<void> {
    await apiClient.put<void>('/vendor/inventory', inventoryData);
  }

  /**
   * Get vendor performance metrics
   */
  async getPerformance(): Promise<VendorPerformanceDto> {
    const response = await apiClient.get<VendorPerformanceDto>('/vendor/performance');
    return response;
  }

  /**
   * Get products for vendor
   */
  async getProducts(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/vendor/products');
    return response;
  }

  /**
   * Create a new product
   */
  async createProduct(productData: any): Promise<any> {
    const response = await apiClient.post<any>('/vendor/products', productData);
    return response;
  }

  /**
   * Update existing product
   */
  async updateProduct(productId: number, productData: any): Promise<any> {
    const response = await apiClient.put<any>(`/vendor/products/${productId}`, productData);
    return response;
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: number): Promise<void> {
    await apiClient.delete<void>(`/vendor/products/${productId}`);
  }

  /**
   * Upload product image
   */
  async uploadProductImage(productId: number, file: File): Promise<{ imageUrl: string }> {
    const response = await apiClient.uploadFile<{ imageUrl: string }>(`/vendor/products/${productId}/image`, file);
    return response;
  }
}

// Create and export default instance
export const vendorService = new VendorService();