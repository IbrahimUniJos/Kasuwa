// Cart and Wishlist services for Kasuwa platform
import { apiClient } from './api';
import type { 
  CartDto, 
  AddToCartDto,
  UpdateCartItemDto,
  WishlistDto,
  WishlistItemDto,
  AddToWishlistDto
} from '../types/api';

export class CartService {
  /**
   * Get current user's cart
   */
  async getCart(): Promise<CartDto> {
    const response = await apiClient.get<CartDto>('/cart');
    return response;
  }

  /**
   * Add item to cart
   */
  async addToCart(item: AddToCartDto): Promise<CartDto> {
    const response = await apiClient.post<CartDto>('/cart/items', item);
    return response;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(updateData: UpdateCartItemDto): Promise<CartDto> {
    const response = await apiClient.put<CartDto>(`/cart/items/${updateData.cartItemId}`, {
      quantity: updateData.quantity
    });
    return response;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: number): Promise<CartDto> {
    const response = await apiClient.delete<CartDto>(`/cart/items/${cartItemId}`);
    return response;
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    await apiClient.delete<void>('/cart');
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(): Promise<number> {
    try {
      const response = await apiClient.get<number>('/cart/count');
      return response;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }

  /**
   * Get cart summary with totals
   */
  async getCartSummary(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/cart/summary');
      return response;
    } catch (error) {
      console.error('Error getting cart summary:', error);
      throw error;
    }
  }

  /**
   * Validate cart items
   */
  async validateCart(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/cart/validate');
      return response;
    } catch (error) {
      console.error('Error validating cart:', error);
      throw error;
    }
  }

  /**
   * Merge guest cart with user cart after login
   */
  async mergeGuestCart(guestUserId: string): Promise<CartDto> {
    const response = await apiClient.post<CartDto>('/cart/merge', { guestUserId });
    return response;
  }
}

export class WishlistService {
  /**
   * Get current user's wishlist
   */
  async getWishlist(): Promise<WishlistDto> {
    const response = await apiClient.get<WishlistDto>('/wishlist');
    return response;
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(item: AddToWishlistDto): Promise<WishlistDto> {
    await apiClient.post<WishlistItemDto>('/wishlist/items', item);
    // Return the updated wishlist
    return this.getWishlist();
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(wishlistItemId: number): Promise<WishlistDto> {
    await apiClient.delete<any>(`/wishlist/items/${wishlistItemId}`);
    // Return the updated wishlist
    return this.getWishlist();
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(productId: number): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.items.some(item => item.productId === productId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(): Promise<void> {
    await apiClient.delete<any>('/wishlist');
  }

  /**
   * Move item from wishlist to cart
   */
  async moveToCart(wishlistItemId: number, quantity: number = 1): Promise<{ cart: CartDto; wishlist: WishlistDto }> {
    const response = await apiClient.post<{ cart: CartDto; wishlist: WishlistDto }>(
      `/wishlist/items/${wishlistItemId}/move-to-cart`,
      { quantity }
    );
    return response;
  }

  /**
   * Get wishlist item count
   */
  async getWishlistItemCount(): Promise<number> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.items.length;
    } catch (error) {
      return 0;
    }
  }
}

// Create and export default instances
export const cartService = new CartService();
export const wishlistService = new WishlistService();