// Product service for Kasuwa platform
import { apiClient, unwrapApiResponse } from './api';
import type { 
  ProductDto, 
  ProductListDto,
  CategoryDto,
  ProductQueryParams,
  CreateProductDto,
  UpdateProductDto,
  PaginatedApiResponse,
  ApiResponseDto 
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7155/api';

export class ProductService {
  /**
   * Get paginated list of products with filters
   */
  async getProducts(params?: ProductQueryParams): Promise<PaginatedApiResponse<ProductListDto>> {
    try {
      // Transform frontend params to backend expected format
      const backendParams = {
        searchTerm: params?.searchTerm,
        categoryId: params?.categoryId,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
        inStockOnly: params?.inStockOnly,
        vendorId: params?.vendorId,
        sortBy: params?.sortBy || 'name',
        sortDirection: params?.sortDirection || 'asc',
        pageNumber: params?.pageNumber || 1,
        pageSize: params?.pageSize || 20
      };

      const response = await apiClient.get<any>('/products', backendParams);
      
      // Transform backend response structure to match frontend expectation
      const products = (response.products || []).map((product: any) => ({
        ...product,
        // Ensure inStock is computed
        inStock: product.stockQuantity > 0 || product.continueSellingWhenOutOfStock
      }));

      return {
        data: products,
        totalCount: response.totalCount || 0,
        pageSize: response.pageSize || backendParams.pageSize,
        currentPage: response.pageNumber || backendParams.pageNumber,
        totalPages: Math.ceil((response.totalCount || 0) / (response.pageSize || backendParams.pageSize)),
        hasNextPage: response.hasNextPage || false,
        hasPreviousPage: response.hasPreviousPage || false
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty result on error
      return {
        data: [],
        totalCount: 0,
        pageSize: params?.pageSize || 20,
        currentPage: params?.pageNumber || 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: number): Promise<ProductDto> {
    const response = await apiClient.get<ProductDto>(`/products/${id}`);
    return response;
  }

  /**
   * Get featured products for homepage (using regular search with limit)
   */
  async getFeaturedProducts(limit: number = 8): Promise<ProductListDto[]> {
    try {
      const response = await this.getProducts({ 
        pageSize: limit,
        sortBy: 'rating',
        sortDirection: 'desc'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: number, params?: ProductQueryParams): Promise<PaginatedApiResponse<ProductListDto>> {
    const searchParams = { ...params, categoryId };
    return this.getProducts(searchParams);
  }

  /**
   * Search products
   */
  async searchProducts(searchTerm: string, params?: ProductQueryParams): Promise<PaginatedApiResponse<ProductListDto>> {
    const searchParams = { ...params, searchTerm };
    return this.getProducts(searchParams);
  }

  /**
   * Get related products (simulate by getting products from same category)
   */
  async getRelatedProducts(productId: number, limit: number = 4): Promise<ProductListDto[]> {
    try {
      const product = await this.getProduct(productId);
      const response = await this.getProductsByCategory(product.categoryId, {
        pageSize: limit + 1 // Get one extra to exclude current product
      });
      // Filter out the current product and return up to limit
      return response.data.filter(p => p.id !== productId).slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * Get products by vendor
   */
  async getProductsByVendor(vendorId: string, params?: ProductQueryParams): Promise<PaginatedApiResponse<ProductListDto>> {
    const searchParams = { ...params, vendorId };
    return this.getProducts(searchParams);
  }

  /**
   * Create a new product (vendor only)
   */
  async createProduct(productData: CreateProductDto): Promise<ProductDto> {
    const response = await apiClient.post<ProductDto>('/products', productData);
    return response;
  }

  /**
   * Update an existing product (vendor only)
   */
  async updateProduct(id: number, productData: UpdateProductDto): Promise<ProductDto> {
    const response = await apiClient.put<ProductDto>(`/products/${id}`, productData);
    return response;
  }

  /**
   * Delete a product (vendor only)
   */
  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  /**
   * Upload product images
   */
  async uploadProductImages(productId: number, imageFiles: File[]): Promise<any[]> {
    const formData = new FormData();
    imageFiles.forEach(file => formData.append('images', file));
    
    const headers: HeadersInit = {};
    if (apiClient.getToken()) {
      headers.Authorization = `Bearer ${apiClient.getToken()}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Delete product image
   */
  async deleteProductImage(imageId: number): Promise<void> {
    await apiClient.delete(`/products/images/${imageId}`);
  }

  /**
   * Set primary image
   */
  async setPrimaryImage(imageId: number): Promise<void> {
    await apiClient.put(`/products/images/${imageId}/set-primary`);
  }
}

export class CategoryService {
  /**
   * Get all categories in a hierarchical structure
   */
  async getCategories(): Promise<CategoryDto[]> {
    try {
      const response = await apiClient.get<any[]>('/products/categories');
      
      // Transform backend CategoryDto to frontend CategoryDto
      return response.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
        isActive: cat.isActive,
        displayOrder: cat.sortOrder || 0,
        sortOrder: cat.sortOrder || 0,
        parentCategoryId: cat.parentCategoryId,
        subCategories: (cat.subCategories || []).map((subCat: any) => ({
          id: subCat.id,
          name: subCat.name,
          description: subCat.description || '',
          slug: subCat.slug || subCat.name.toLowerCase().replace(/\s+/g, '-'),
          isActive: subCat.isActive,
          displayOrder: subCat.sortOrder || 0,
          sortOrder: subCat.sortOrder || 0,
          parentCategoryId: subCat.parentCategoryId,
          subCategories: [],
          productCount: subCat.productCount || 0
        })),
        productCount: cat.productCount || 0
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get a single category by ID
   */
  async getCategory(id: number): Promise<CategoryDto> {
    const response = await apiClient.get<any>(`/products/categories/${id}`);
    return {
      id: response.id,
      name: response.name,
      description: response.description || '',
      slug: response.slug || response.name.toLowerCase().replace(/\s+/g, '-'),
      isActive: response.isActive,
      displayOrder: response.sortOrder || 0,
      sortOrder: response.sortOrder || 0,
      parentCategoryId: response.parentCategoryId,
      subCategories: (response.subCategories || []).map((subCat: any) => ({
        id: subCat.id,
        name: subCat.name,
        description: subCat.description || '',
        slug: subCat.slug || subCat.name.toLowerCase().replace(/\s+/g, '-'),
        isActive: subCat.isActive,
        displayOrder: subCat.sortOrder || 0,
        sortOrder: subCat.sortOrder || 0,
        parentCategoryId: subCat.parentCategoryId,
        subCategories: [],
        productCount: subCat.productCount || 0
      })),
      productCount: response.productCount || 0
    };
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(categoryData: Omit<CategoryDto, 'id' | 'subCategories' | 'productCount'>): Promise<CategoryDto> {
    const response = await apiClient.post<any>('/products/categories', {
      name: categoryData.name,
      description: categoryData.description,
      parentCategoryId: categoryData.parentCategoryId,
      isActive: categoryData.isActive,
      sortOrder: categoryData.sortOrder
    });
    return this.getCategory(response.id);
  }

  /**
   * Update an existing category (admin only)
   */
  async updateCategory(id: number, categoryData: Partial<CategoryDto>): Promise<CategoryDto> {
    const response = await apiClient.put<any>(`/products/categories/${id}`, {
      name: categoryData.name,
      description: categoryData.description,
      parentCategoryId: categoryData.parentCategoryId,
      isActive: categoryData.isActive,
      sortOrder: categoryData.sortOrder
    });
    return this.getCategory(response.id);
  }

  /**
   * Delete a category (admin only)
   */
  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/products/categories/${id}`);
  }
}

// Create and export default instances
export const productService = new ProductService();
export const categoryService = new CategoryService();