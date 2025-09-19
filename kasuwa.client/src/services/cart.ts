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
      const response = await apiClient.get<boolean>(`/wishlist/contains/${productId}`);
      return response;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
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
    const cart = await apiClient.post<CartDto>(
      `/wishlist/items/${wishlistItemId}/move-to-cart`,
      { quantity }
    );
    const wishlist = await this.getWishlist();
    return { cart, wishlist };
  }

  /**
   * Move all items from wishlist to cart
   */
  async moveAllToCart(): Promise<{ cart: CartDto; wishlist: WishlistDto }> {
    const cart = await apiClient.post<CartDto>('/wishlist/move-all-to-cart');
    const wishlist = await this.getWishlist();
    return { cart, wishlist };
  }

  /**
   * Toggle product in wishlist
   */
  async toggleWishlist(productId: number): Promise<{ isInWishlist: boolean; message: string }> {
    const response = await apiClient.post<{ isInWishlist: boolean; message: string }>(
      `/wishlist/toggle/${productId}`
    );
    return response;
  }

  /**
   * Get wishlist item count
   */
  async getWishlistItemCount(): Promise<number> {
    try {
      const response = await apiClient.get<number>('/wishlist/count');
      return response;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }

  /**
   * Get wishlist recommendations
   */
  async getRecommendations(limit: number = 10): Promise<WishlistItemDto[]> {
    try {
      const response = await apiClient.get<WishlistItemDto[]>(`/wishlist/recommendations?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error getting wishlist recommendations:', error);
      return [];
    }
  }
}

// Create and export default instances
export const cartService = new CartService();
export const wishlistService = new WishlistService();