// Product Components
export { default as ProductCard } from './products/ProductCard';
export { default as ProductDetail } from './products/ProductDetail';
export { default as ProductForm } from './products/ProductForm';
export { default as ProductListing } from './products/ProductListing';

// Category Components
export { default as CategoryBrowse } from './categories/CategoryBrowse';

// Admin Components
export { default as CategoryManagement } from './admin/CategoryManagement';

// Pages
export { default as HomePage } from '../pages/HomePage';

// New Pages
export { default as ProductsPage } from '../pages/ProductsPage';
export { default as ProductDetailPage } from '../pages/ProductDetailPage';

// Export types for convenience
export type {
  ProductDto,
  ProductListDto,
  ProductVariantDto,
  ProductImageDto,
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams
} from '../types/api';