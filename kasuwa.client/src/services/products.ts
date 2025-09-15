// Product service for Kasuwa platform
import { apiClient, unwrapApiResponse, unwrapPaginatedResponse } from './api';
import type { 
  ProductDto, 
  CategoryDto,
  ProductQueryParams,
  CreateProductDto,
  UpdateProductDto,
  PaginatedApiResponse,
  ApiResponseDto 
} from '../types/api';

export class ProductService {
  /**
   * Get paginated list of products with filters
   */
  async getProducts(params?: ProductQueryParams): Promise<PaginatedApiResponse<ProductDto>> {
    const response = await apiClient.get<PaginatedApiResponse<ProductDto>>('/products', params);
    return unwrapPaginatedResponse(response);
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: number): Promise<ProductDto> {
    const response = await apiClient.get<ApiResponseDto<ProductDto>>(`/products/${id}`);
    return unwrapApiResponse(response);
  }

  /**
   * Get featured products for homepage
   */
  async getFeaturedProducts(limit: number = 8): Promise<ProductDto[]> {
    const response = await apiClient.get<ApiResponseDto<ProductDto[]>>('/products/featured', { 
      pageSize: limit 
    });
    return unwrapApiResponse(response);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: number, params?: ProductQueryParams): Promise<PaginatedApiResponse<ProductDto>> {
    const response = await apiClient.get<PaginatedApiResponse<ProductDto>>(`/products/category/${categoryId}`, params);
    return unwrapPaginatedResponse(response);
  }

  /**
   * Search products
   */
  async searchProducts(searchTerm: string, params?: ProductQueryParams): Promise<PaginatedApiResponse<ProductDto>> {
    const searchParams = { ...params, searchTerm };
    const response = await apiClient.get<PaginatedApiResponse<ProductDto>>('/products/search', searchParams);
    return unwrapPaginatedResponse(response);
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: number, limit: number = 4): Promise<ProductDto[]> {
    const response = await apiClient.get<ApiResponseDto<ProductDto[]>>(`/products/${productId}/related`, {
      pageSize: limit
    });
    return unwrapApiResponse(response);
  }

  /**
   * Get products by vendor
   */
  async getProductsByVendor(vendorId: string, params?: ProductQueryParams): Promise<PaginatedApiResponse<ProductDto>> {
    const response = await apiClient.get<PaginatedApiResponse<ProductDto>>(`/products/vendor/${vendorId}`, params);
    return unwrapPaginatedResponse(response);
  }

  /**
   * Create a new product (vendor only)
   */
  async createProduct(productData: CreateProductDto): Promise<ProductDto> {
    const response = await apiClient.post<ApiResponseDto<ProductDto>>('/products', productData);
    return unwrapApiResponse(response);
  }

  /**
   * Update an existing product (vendor only)
   */
  async updateProduct(id: number, productData: UpdateProductDto): Promise<ProductDto> {
    const response = await apiClient.put<ApiResponseDto<ProductDto>>(`/products/${id}`, productData);
    return unwrapApiResponse(response);
  }

  /**
   * Delete a product (vendor only)
   */
  async deleteProduct(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponseDto<void>>(`/products/${id}`);
    unwrapApiResponse(response);
  }

  /**
   * Upload product image
   */
  async uploadProductImage(productId: number, imageFile: File, isMain: boolean = false): Promise<string> {
    const response = await apiClient.uploadFile<ApiResponseDto<{ imageUrl: string }>>(
      `/products/${productId}/images`,
      imageFile,
      { isMain: isMain.toString() }
    );
    const imageData = unwrapApiResponse(response);
    return imageData.imageUrl;
  }

  /**
   * Delete product image
   */
  async deleteProductImage(productId: number, imageId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponseDto<void>>(`/products/${productId}/images/${imageId}`);
    unwrapApiResponse(response);
  }
}

export class CategoryService {
  /**
   * Get all categories in a hierarchical structure
   */
  async getCategories(): Promise<CategoryDto[]> {
    const response = await apiClient.get<ApiResponseDto<CategoryDto[]>>('/categories');
    return unwrapApiResponse(response);
  }

  /**
   * Get a single category by ID
   */
  async getCategory(id: number): Promise<CategoryDto> {
    const response = await apiClient.get<ApiResponseDto<CategoryDto>>(`/categories/${id}`);
    return unwrapApiResponse(response);
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<CategoryDto> {
    const response = await apiClient.get<ApiResponseDto<CategoryDto>>(`/categories/slug/${slug}`);
    return unwrapApiResponse(response);
  }

  /**
   * Get top-level categories (no parent)
   */
  async getTopLevelCategories(): Promise<CategoryDto[]> {
    const response = await apiClient.get<ApiResponseDto<CategoryDto[]>>('/categories/top-level');
    return unwrapApiResponse(response);
  }

  /**
   * Get subcategories of a specific category
   */
  async getSubcategories(parentId: number): Promise<CategoryDto[]> {
    const response = await apiClient.get<ApiResponseDto<CategoryDto[]>>(`/categories/${parentId}/subcategories`);
    return unwrapApiResponse(response);
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(categoryData: Omit<CategoryDto, 'id' | 'subCategories'>): Promise<CategoryDto> {
    const response = await apiClient.post<ApiResponseDto<CategoryDto>>('/categories', categoryData);
    return unwrapApiResponse(response);
  }

  /**
   * Update an existing category (admin only)
   */
  async updateCategory(id: number, categoryData: Partial<CategoryDto>): Promise<CategoryDto> {
    const response = await apiClient.put<ApiResponseDto<CategoryDto>>(`/categories/${id}`, categoryData);
    return unwrapApiResponse(response);
  }

  /**
   * Delete a category (admin only)
   */
  async deleteCategory(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponseDto<void>>(`/categories/${id}`);
    unwrapApiResponse(response);
  }
}

// Create and export default instances
export const productService = new ProductService();
export const categoryService = new CategoryService();