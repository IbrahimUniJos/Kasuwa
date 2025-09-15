// API DTOs matching the backend C# DTOs

// Authentication DTOs
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
  phoneNumber?: string;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  expiresAt: string; // ISO date string
  user: UserDto;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isEmailConfirmed: boolean;
  profilePictureUrl?: string;
  createdAt: string; // ISO date string
}

// Product DTOs
export interface ProductDto {
  id: number;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  categoryId: number;
  vendorId: string;
  isActive: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string; // ISO date string
  category: CategoryDto;
  vendor: VendorDto;
  images: ProductImageDto[];
  variants: ProductVariantDto[];
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
  price?: number;
  sku?: string;
  quantity?: number;
  isActive: boolean;
}

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  parentCategoryId?: number;
  subCategories: CategoryDto[];
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
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  trackQuantity: boolean;
  quantity: number;
  categoryId: number;
  weight?: number;
  dimensions?: string;
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: number;
  isActive?: boolean;
  isFeatured?: boolean;
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
  page?: number;
  pageSize?: number;
  categoryId?: number;
  vendorId?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string;
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