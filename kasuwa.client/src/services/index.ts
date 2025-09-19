// Export all services for easy importing
export * from './api';
export * from './auth';
export * from './products';
export * from './cart';
export * from './orders';
export * from './user';
export * from './reviews';
export * from './vendor';
export * from './admin';

// Re-export service instances for convenience
export { authService } from './auth';
export { productService, categoryService } from './products';
export { cartService, wishlistService } from './cart';
export { orderService, paymentService } from './orders';
export { reviewService } from './reviews';
export { userService, addressService } from './user';
export { vendorService } from './vendor';
export { adminService } from './admin';

// Setup function to initialize all services
export function setupServices(): void {
  // Initialize any global service configurations
  if (import.meta.env.DEV) {
    console.log('Kasuwa services initialized in development mode');
  }
}