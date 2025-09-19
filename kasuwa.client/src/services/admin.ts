import { apiClient } from './api';
import type {
  UserDto,
  PaginatedApiResponse,
  UserQueryParams,
  ApiResponseDto
} from '../types/api';

// Extended admin-specific DTOs
interface AdminDashboardStatsDto {
  totalUsers: number;
  totalCustomers: number;
  totalVendors: number;
  approvedVendors: number;
  pendingVendorApplications: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
  totalPlatformRevenue: number;
  monthlyPlatformRevenue: number;
  totalOrders: number;
  totalProducts: number;
}

interface ApproveVendorRequestDto {
  isApproved: boolean;
}

interface SuspensionDto {
  reason: string;
  suspensionType: 'Warning' | 'Temporary' | 'Permanent';
  duration?: string;
  notifyUser: boolean;
  freezeOrders: boolean;
  adminNotes?: string;
}

interface PlatformSettingsDto {
  general: {
    platformName: string;
    defaultCommissionRate: number;
    minimumOrderAmount: number;
    taxRate: number;
  };
  moderation: {
    autoApproveProducts: boolean;
    requireVendorVerification: boolean;
    reviewModerationEnabled: boolean;
  };
  payments: {
    supportedPaymentMethods: string[];
    paymentProcessingFee: number;
    vendorPayoutSchedule: string;
  };
}

interface SalesReportDto {
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    totalCommission: number;
  };
}

interface UserActivityReportDto {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  usersByRole: Record<string, number>;
  userActivity: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
}

interface AuditLogDto {
  id: number;
  adminUserId?: string;
  action: string;
  entityType: string;
  entityId?: number;
  oldValues?: string;
  newValues?: string;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
  level: 'Info' | 'Warning' | 'Error' | 'Critical';
  additionalData?: string;
}

export const adminService = {
  // Dashboard Stats
  async getDashboardStats(): Promise<AdminDashboardStatsDto> {
    const response = await apiClient.get<AdminDashboardStatsDto>('/admin/dashboard-stats');
    return response;
  },

  // User Management
  async getUsers(params: UserQueryParams = {}): Promise<PaginatedApiResponse<UserDto>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.searchTerm) searchParams.append('search', params.searchTerm);
    if (params.role) searchParams.append('userType', params.role);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await apiClient.get<PaginatedApiResponse<UserDto>>(`/admin/users?${searchParams}`);
    return response;
  },

  async getUser(id: string): Promise<UserDto> {
    const response = await apiClient.get<UserDto>(`/admin/users/${id}`);
    return response;
  },

  async approveVendor(userId: string, request: ApproveVendorRequestDto): Promise<ApiResponseDto<any>> {
    const response = await apiClient.post<ApiResponseDto<any>>(`/admin/users/${userId}/approve-vendor`, request);
    return response;
  },

  async toggleUserStatus(userId: string): Promise<ApiResponseDto<any>> {
    const response = await apiClient.post<ApiResponseDto<any>>(`/admin/users/${userId}/toggle-status`);
    return response;
  },

  async suspendUser(userId: string, request: SuspensionDto): Promise<ApiResponseDto<any>> {
    const response = await apiClient.post<ApiResponseDto<any>>(`/admin/users/${userId}/suspend`, request);
    return response;
  },

  // Vendor Management
  async getPendingVendors(page: number = 1, pageSize: number = 10): Promise<PaginatedApiResponse<UserDto>> {
    const response = await apiClient.get<PaginatedApiResponse<UserDto>>(`/admin/vendors/pending?page=${page}&pageSize=${pageSize}`);
    return response;
  },

  // Platform Settings
  async getPlatformSettings(): Promise<PlatformSettingsDto> {
    const response = await apiClient.get<PlatformSettingsDto>('/admin/settings');
    return response;
  },

  async updatePlatformSettings(settings: PlatformSettingsDto): Promise<ApiResponseDto<any>> {
    const response = await apiClient.put<ApiResponseDto<any>>('/admin/settings', settings);
    return response;
  },

  // Reports
  async getSalesReport(params: {
    startDate: string;
    endDate: string;
  }): Promise<SalesReportDto> {
    const searchParams = new URLSearchParams();
    searchParams.append('startDate', params.startDate);
    searchParams.append('endDate', params.endDate);
    
    const response = await apiClient.get<SalesReportDto>(`/admin/reports/sales?${searchParams}`);
    return response;
  },

  async getUserActivityReport(): Promise<UserActivityReportDto> {
    const response = await apiClient.get<UserActivityReportDto>('/admin/reports/user-activity');
    return response;
  },

  // Audit Logs
  async getAuditLogs(page: number = 1, pageSize: number = 10): Promise<PaginatedApiResponse<AuditLogDto>> {
    const response = await apiClient.get<PaginatedApiResponse<AuditLogDto>>(`/admin/audit-logs?page=${page}&pageSize=${pageSize}`);
    return response;
  }
};

export type {
  AdminDashboardStatsDto,
  ApproveVendorRequestDto,
  SuspensionDto,
  PlatformSettingsDto,
  SalesReportDto,
  UserActivityReportDto,
  AuditLogDto
};
