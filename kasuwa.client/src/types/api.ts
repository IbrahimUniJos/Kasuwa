// API DTOs matching the backend C# DTOs

// Authentication DTOs matching AuthController.cs
export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  // Vendor-specific fields (optional)
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessPhone?: string;
  // Customer-specific fields (optional)
  dateOfBirth?: string; // ISO date string
  preferredLanguage?: string;
}

export interface AuthResponseDto {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  tokenExpiration?: string; // ISO date string
  user?: UserDto;
}

export interface RefreshTokenRequestDto {
  accessToken: string;
  refreshToken: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  isActive: boolean;
  isVendorApproved: boolean;
  businessName?: string;
  profileImageUrl?: string;
  dateCreated: string; // ISO date string
  lastLogin?: string; // ISO date string
  roles: string[];
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

// User Type enum matching backend
export const UserType = {
  Customer: 1,
  Vendor: 2,
  Administrator: 3
} as const;

export type UserType = typeof UserType[keyof typeof UserType];

// Product DTOs
export interface ProductDto {
  id: number;
  vendorId: string;
  vendorName: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  isActive: boolean;
  createdDate: string; // ISO date string
  updatedDate: string; // ISO date string
  categoryId: number;
  categoryName: string;
  comparePrice?: number;
  weight: number;
  weightUnit?: string;
  requiresShipping: boolean;
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images: ProductImageDto[];
  variants: ProductVariantDto[];
  averageRating: number;
  reviewCount: number;
}

export interface ProductListDto {
  id: number;
  name: string;
  price: number;
  comparePrice?: number;
  sku: string;
  isActive: boolean;
  stockQuantity: number;
  continueSellingWhenOutOfStock: boolean;
  categoryName: string;
  primaryImageUrl?: string;
  averageRating: number;
  reviewCount: number;
  inStock: boolean;
  createdDate: string; // ISO date string
}

export interface ProductImageDto {
  id: number;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isMain: boolean;
}

export interface ProductVariantDto {
  id: number;
  name: string;
  value: string;
  priceAdjustment: number;
  stockQuantity: number;
  sku?: string;
  isActive: boolean;
}

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  sortOrder: number; // Add sortOrder property
  parentCategoryId?: number;
  subCategories: CategoryDto[];
  productCount?: number; // Add productCount property
}

// Create and Update DTOs for categories
export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentCategoryId?: number;
  isActive: boolean;
  sortOrder: number;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
  parentCategoryId?: number;
  isActive: boolean;
  sortOrder: number;
}

export interface VendorDto {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  description?: string;
  logoUrl?: string;
  isVerified: boolean;
  rating: number;
  totalProducts: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  categoryId: number;
  comparePrice?: number;
  weight: number;
  weightUnit?: string;
  requiresShipping: boolean;
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images: Array<{
    imageUrl: string;
    altText?: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  variants: Array<{
    name: string;
    value: string;
    priceAdjustment: number;
    stockQuantity: number;
    sku?: string;
  }>;
}

export interface UpdateProductDto {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  comparePrice?: number;
  weight: number;
  weightUnit?: string;
  requiresShipping: boolean;
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
}

// Cart DTOs
export interface CartDto {
  id: number;
  userId: string;
  totalItems: number;
  totalAmount: number;
  createdAt: string; // ISO date string
  items: CartItemDto[];
}

export interface CartItemDto {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productVariant?: string;
  product: ProductDto;
}

export interface AddToCartDto {
  productId: number;
  quantity: number;
  productVariant?: string;
}

export interface UpdateCartItemDto {
  cartItemId: number;
  quantity: number;
}

// Wishlist DTOs
export interface WishlistDto {
  id: number;
  userId: string;
  createdAt: string; // ISO date string
  items: WishlistItemDto[];
}

export interface WishlistItemDto {
  id: number;
  productId: number;
  createdAt: string; // ISO date string
  product: ProductDto;
}

export interface AddToWishlistDto {
  productId: number;
}

// Order DTOs
export interface OrderDto {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string; // ISO date string
  items: OrderItemDto[];
  shippingAddress: AddressDto;
  billingAddress?: AddressDto;
}

export interface OrderItemDto {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productSku: string;
  productVariant?: string;
  productImageUrl?: string;
  vendorId: string;
}

export interface CreateOrderDto {
  shippingAddressId: number;
  billingAddressId?: number;
  paymentMethod: string;
  notes?: string;
}

export interface AddressDto {
  id: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export interface CreateAddressDto {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

// Review DTOs
export interface ReviewDto {
  id: number;
  productId: number;
  userId: string;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string; // ISO date string
  user: UserDto;
}

export interface CreateReviewDto {
  productId: number;
  rating: number;
  title: string;
  content: string;
}

export interface ReviewHelpfulDto {
  reviewId: number;
  isHelpful: boolean;
}

// Admin DTOs
export interface AdminStatsDto {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersToday: number;
  ordersToday: number;
  revenueToday: number;
}

export interface UserSuspensionDto {
  userId: string;
  reason: string;
  suspendedUntil?: string; // ISO date string
  isActive: boolean;
}

// Payment DTOs
export interface PaymentDto {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  status: string;
  method: string;
  provider: string;
  transactionId?: string;
  createdAt: string; // ISO date string
}

export interface ProcessPaymentDto {
  orderId: number;
  amount: number;
  paymentMethod: string;
  paymentToken?: string;
  metadata?: Record<string, any>;
}

// Query parameters for API endpoints
export interface ProductQueryParams {
  searchTerm?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  vendorId?: string;
  minRating?: number;
  sortBy?: string; // name, price, rating, date
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
}

export interface OrderQueryParams {
  page?: number;
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Paginated API response wrapper
export interface PaginatedApiResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Standard API response wrapper
export interface ApiResponseDto<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}