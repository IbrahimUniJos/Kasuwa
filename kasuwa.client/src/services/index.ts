// Export all services for easy importing
export * from './api';
export * from './auth';
export * from './products';
export * from './cart';
export * from './orders';

// Re-export service instances for convenience
export { authService } from './auth';
export { productService, categoryService } from './products';
export { cartService, wishlistService } from './cart';
export { orderService, reviewService, paymentService } from './orders';

// Setup function to initialize all services
export function setupServices(): void {
  // Initialize any global service configurations
  if (import.meta.env.DEV) {
    console.log('Kasuwa services initialized in development mode');
  }
}