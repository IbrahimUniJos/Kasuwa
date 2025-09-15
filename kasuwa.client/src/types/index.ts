// Core domain types for Kasuwa e-commerce platform

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isEmailConfirmed: boolean;
  profilePictureUrl?: string;
  addresses: UserAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAddress {
  id: number;
  userId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
  isActive: boolean;
  slug: string;
  displayOrder: number;
  parentCategory?: ProductCategory;
  subCategories: ProductCategory[];
}

export interface Product {
  id: number;
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
  vendorId: string;
  isActive: boolean;
  isFeatured: boolean;
  weight?: number;
  dimensions?: string;
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  category: ProductCategory;
  vendor: User;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isMain: boolean;
}

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  value: string;
  price?: number;
  sku?: string;
  quantity?: number;
  isActive: boolean;
}

export interface Review {
  id: number;
  productId: number;
  userId: string;
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  user: User;
  product: Product;
}

export interface Cart {
  id: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productVariant?: string;
  createdAt: Date;
  product: Product;
}

export interface Wishlist {
  id: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: WishlistItem[];
}

export interface WishlistItem {
  id: number;
  wishlistId: number;
  productId: number;
  createdAt: Date;
  product: Product;
}

export interface Order {
  id: number;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: UserAddress;
  billingAddress?: UserAddress;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  tracking?: OrderTracking;
  payment?: Payment;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  vendorId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productSku: string;
  productVariant?: string;
  productImageUrl?: string;
  createdAt: Date;
}

export interface OrderTracking {
  id: number;
  orderId: number;
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  trackingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  provider: string;
  transactionId?: string;
  providerTransactionId?: string;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Returned = 'Returned',
  Refunded = 'Refunded'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded'
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: Date;
}

// Filter and search types
export interface ProductFilters {
  categoryId?: number;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  sortBy?: ProductSortBy;
  sortOrder?: SortOrder;
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export enum ProductSortBy {
  Name = 'name',
  Price = 'price',
  CreatedAt = 'createdAt',
  Rating = 'rating',
  Popularity = 'popularity'
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

// Form types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface NewsletterSubscription {
  email: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface CartState extends LoadingState {
  cart?: Cart;
  isOpen: boolean;
}

export interface AuthState extends LoadingState {
  user?: User;
  isAuthenticated: boolean;
  token?: string;
}

export interface WishlistState extends LoadingState {
  wishlist?: Wishlist;
}

// Component props types
export interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
  className?: string;
}

export interface CategoryCardProps {
  category: ProductCategory;
  productCount?: number;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}