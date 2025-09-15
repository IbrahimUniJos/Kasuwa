// Cart and Wishlist services for Kasuwa platform
import { apiClient, unwrapApiResponse } from './api';
import type { 
  CartDto, 
  CartItemDto,
  AddToCartDto,
  UpdateCartItemDto,
  WishlistDto,
  WishlistItemDto,
  AddToWishlistDto,
  ApiResponseDto 
} from '../types/api';

export class CartService {
  /**
   * Get current user's cart
   */
  async getCart(): Promise<CartDto> {
    const response = await apiClient.get<ApiResponseDto<CartDto>>('/cart');
    return unwrapApiResponse(response);
  }

  /**
   * Add item to cart
   */
  async addToCart(item: AddToCartDto): Promise<CartDto> {
    const response = await apiClient.post<ApiResponseDto<CartDto>>('/cart/items', item);
    return unwrapApiResponse(response);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(updateData: UpdateCartItemDto): Promise<CartDto> {
    const response = await apiClient.put<ApiResponseDto<CartDto>>(`/cart/items/${updateData.cartItemId}`, {
      quantity: updateData.quantity
    });
    return unwrapApiResponse(response);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: number): Promise<CartDto> {
    const response = await apiClient.delete<ApiResponseDto<CartDto>>(`/cart/items/${cartItemId}`);
    return unwrapApiResponse(response);
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    const response = await apiClient.delete<ApiResponseDto<void>>('/cart');
    unwrapApiResponse(response);
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart();
      return cart.totalItems;
    } catch (error) {
      // If cart doesn't exist or user is not logged in, return 0
      return 0;
    }
  }

  /**
   * Merge guest cart with user cart after login
   */
  async mergeGuestCart(guestCartItems: AddToCartDto[]): Promise<CartDto> {
    const response = await apiClient.post<ApiResponseDto<CartDto>>('/cart/merge', { items: guestCartItems });
    return unwrapApiResponse(response);
  }
}

export class WishlistService {
  /**
   * Get current user's wishlist
   */
  async getWishlist(): Promise<WishlistDto> {
    const response = await apiClient.get<ApiResponseDto<WishlistDto>>('/wishlist');
    return unwrapApiResponse(response);
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(item: AddToWishlistDto): Promise<WishlistDto> {
    const response = await apiClient.post<ApiResponseDto<WishlistDto>>('/wishlist/items', item);
    return unwrapApiResponse(response);
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(wishlistItemId: number): Promise<WishlistDto> {
    const response = await apiClient.delete<ApiResponseDto<WishlistDto>>(`/wishlist/items/${wishlistItemId}`);
    return unwrapApiResponse(response);
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(productId: number): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.items.some(item => item.productId === productId);
    } catch (error) {
      // If wishlist doesn't exist or user is not logged in, return false
      return false;
    }
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(): Promise<void> {
    const response = await apiClient.delete<ApiResponseDto<void>>('/wishlist');
    unwrapApiResponse(response);
  }

  /**
   * Move item from wishlist to cart
   */
  async moveToCart(wishlistItemId: number, quantity: number = 1): Promise<{ cart: CartDto; wishlist: WishlistDto }> {
    const response = await apiClient.post<ApiResponseDto<{ cart: CartDto; wishlist: WishlistDto }>>(
      `/wishlist/items/${wishlistItemId}/move-to-cart`,
      { quantity }
    );
    return unwrapApiResponse(response);
  }

  /**
   * Get wishlist item count
   */
  async getWishlistItemCount(): Promise<number> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.items.length;
    } catch (error) {
      // If wishlist doesn't exist or user is not logged in, return 0
      return 0;
    }
  }
}

// Create and export default instances
export const cartService = new CartService();
export const wishlistService = new WishlistService();