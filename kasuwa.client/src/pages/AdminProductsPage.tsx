import { useState, useEffect } from 'react';
import { 
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { productService, categoryService } from '../services/products';
import type { ProductListDto, ProductQueryParams, CategoryDto, ProductDto, UpdateProductDto, ProductImageDto } from '../types/api';

interface ProductImageManagerProps {
  productId: number;
  images: ProductImageDto[];
  onImagesUpdate: (images: ProductImageDto[]) => void;
}

function ProductImageManager({ productId, images, onImagesUpdate }: ProductImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Debug function to test API connectivity
  const testApiConnection = async () => {
    try {
      console.log('?? DEBUG: Testing API connection...');
      
      // Test basic API connectivity
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://localhost:7155/api'}/products/categories`);
      console.log('?? DEBUG: Categories endpoint response:', response.status, response.statusText);
      
      // Test authentication
      const token = localStorage.getItem('kasuwa_auth_token');
      if (token) {
        console.log('?? DEBUG: Auth token available, testing authenticated endpoint...');
        const authResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://localhost:7155/api'}/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('?? DEBUG: Product endpoint response:', authResponse.status, authResponse.statusText);
        
        if (authResponse.ok) {
          const productData = await authResponse.json();
          console.log('?? DEBUG: Product data:', productData);
        }
      } else {
        console.log('?? DEBUG: No auth token found');
      }
    } catch (error) {
      console.error('?? DEBUG: API connection test failed:', error);
    }
  };

  // Run API test when component mounts in development
  useEffect(() => {
    if (import.meta.env.DEV && productId) {
      testApiConnection();
    }
  }, [productId]);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    // Debug logging
    console.log('?? DEBUG: Starting file upload process...', {
      productId,
      fileCount: files.length,
      files: Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }))
    });

    // Debug API configuration
    console.log('?? DEBUG: API Configuration:', {
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7155/api',
      authToken: !!localStorage.getItem('kasuwa_auth_token'),
      isDev: import.meta.env.DEV
    });

    // Validate files
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      // Check file type
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        errors.push(`${file.name}: Unsupported file type. Please use JPG, PNG, GIF, or WebP.`);
        continue;
      }
      
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`);
        continue;
      }
      
      // Check if file name is valid
      if (file.name.length > 255) {
        errors.push(`${file.name}: File name too long. Please rename the file.`);
        continue;
      }
      
      validFiles.push(file);
    }

    // Show validation errors
    if (errors.length > 0) {
      setUploadError(errors.join('\n'));
      return;
    }

    if (!validFiles.length) {
      setUploadError('No valid files selected.');
      return;
    }

    // Check total number of images (limit to 10 per product)
    const maxImagesPerProduct = 10;
    if (images.length + validFiles.length > maxImagesPerProduct) {
      setUploadError(`Cannot upload ${validFiles.length} images. Maximum ${maxImagesPerProduct} images per product (currently have ${images.length}).`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    
    try {
      console.log(`?? DEBUG: Uploading ${validFiles.length} valid files for product ${productId}`);
      
      const uploadedImages = await productService.uploadProductImages(productId, validFiles);
      onImagesUpdate([...images, ...uploadedImages]);
      
      // Show success message
      if (import.meta.env.DEV) {
        console.log(`? DEBUG: Successfully uploaded ${validFiles.length} image(s)`, uploadedImages);
      }
    } catch (error) {
      console.error('? DEBUG: Error uploading images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images. Please try again.';
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await productService.deleteProductImage(imageId);
      onImagesUpdate(images.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image. Please try again.';
      setUploadError(errorMessage);
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await productService.setPrimaryImage(imageId);
      onImagesUpdate(images.map(img => ({ ...img, isMain: img.id === imageId })));
    } catch (error) {
      console.error('Error setting primary image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to set primary image. Please try again.';
      setUploadError(errorMessage);
    }
  };

  const clearError = () => {
    setUploadError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">Product Images</h4>
        <div className="flex items-center space-x-2">
          {import.meta.env.DEV && (
            <button
              onClick={testApiConnection}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              title="Test API Connection"
            >
              ?? Test API
            </button>
          )}
          {import.meta.env.DEV && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              Development Mode
            </span>
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex justify-between items-start">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
                <div className="mt-1 text-sm text-red-700">
                  {uploadError.split('\n').map((line, index) => (
                    <p key={index} className="mb-1 last:mb-0">{line}</p>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? 'border-kasuwa-primary-500 bg-kasuwa-primary-50' : 'border-gray-300'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          className="hidden"
          id="image-upload"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          disabled={uploading}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-kasuwa-primary-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">JPG, PNG, GIF, WebP up to 10MB each (max 10 images)</p>
            {import.meta.env.DEV && (
              <p className="text-xs text-blue-600 mt-1">Development: Mock uploads enabled for testing</p>
            )}
          </div>
        </label>
        {uploading && (
          <div className="mt-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-kasuwa-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-1">Uploading images...</p>
          </div>
        )}
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image.imageUrl}
                  alt={image.altText || `Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Handle broken image
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50%" y="50%" font-size="12" text-anchor="middle" dy=".3em" fill="%236b7280">Image not found</text></svg>';
                  }}
                />
              </div>
              
              {/* Image overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                  {!image.isMain && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      className="p-1 bg-white rounded-full text-gray-700 hover:text-kasuwa-primary-600 shadow-sm"
                      title="Set as primary"
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="p-1 bg-white rounded-full text-gray-700 hover:text-red-600 shadow-sm"
                    title="Delete image"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Primary badge */}
              {image.isMain && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-kasuwa-primary-100 text-kasuwa-primary-800 shadow-sm">
                    <StarIcon className="h-3 w-3 mr-1" />
                    Primary
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number | null;
  onProductUpdated: () => void;
}

function ProductEditModal({ isOpen, onClose, productId, onProductUpdated }: ProductEditModalProps) {
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateProductDto>({
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    categoryId: 0,
    comparePrice: 0,
    weight: 0,
    weightUnit: 'kg',
    requiresShipping: true,
    trackQuantity: true,
    continueSellingWhenOutOfStock: false,
    metaTitle: '',
    metaDescription: '',
    isActive: true
  });

  useEffect(() => {
    if (isOpen && productId) {
      fetchProductData();
    }
  }, [isOpen, productId]);

  const fetchProductData = async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);
    
    try {
      const [productData, categoriesData] = await Promise.all([
        productService.getProduct(productId),
        categoryService.getCategories()
      ]);

      setProduct(productData);
      setCategories(categoriesData);
      setFormData({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stockQuantity: productData.stockQuantity,
        categoryId: productData.categoryId,
        comparePrice: productData.comparePrice || 0,
        weight: productData.weight,
        weightUnit: productData.weightUnit || 'kg',
        requiresShipping: productData.requiresShipping,
        trackQuantity: productData.trackQuantity,
        continueSellingWhenOutOfStock: productData.continueSellingWhenOutOfStock,
        metaTitle: productData.metaTitle || '',
        metaDescription: productData.metaDescription || '',
        isActive: productData.isActive
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load product data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setSaving(true);
    setError(null);

    try {
      await productService.updateProduct(productId, formData);
      onProductUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UpdateProductDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImagesUpdate = (images: ProductImageDto[]) => {
    if (product) {
      setProduct({ ...product, images });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Product {product ? `- ${product.name}` : ''}
              </h3>
              {import.meta.env.DEV && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                  Development Mode
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Development Notice */}
          {import.meta.env.DEV && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Development Mode Active</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Some features may use mock data if backend endpoints are not implemented yet. This allows you to test the UI functionality.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setError(null)}
                      className="text-sm bg-red-100 text-red-800 rounded-md px-2 py-1 hover:bg-red-200"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kasuwa-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading product data...</p>
            </div>
          ) : product ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={product.sku}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (?) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compare Price (?)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => handleInputChange('comparePrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                  />
                </div>
              </div>

              {/* Inventory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                    />
                    <select
                      value={formData.weightUnit}
                      onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Product Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.trackQuantity}
                      onChange={(e) => handleInputChange('trackQuantity', e.target.checked)}
                      className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Track quantity</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.continueSellingWhenOutOfStock}
                      onChange={(e) => handleInputChange('continueSellingWhenOutOfStock', e.target.checked)}
                      className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Continue selling when out of stock</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresShipping}
                      onChange={(e) => handleInputChange('requiresShipping', e.target.checked)}
                      className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">This product requires shipping</span>
                  </label>
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">SEO Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <ProductImageManager
                productId={product.id}
                images={product.images}
                onImagesUpdate={handleImagesUpdate}
              />

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-4 py-2 bg-kasuwa-primary-600 text-white rounded-md hover:bg-kasuwa-primary-700 transition-colors ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface ProductTableProps {
  products: ProductListDto[];
  onEditProduct: (productId: number) => void;
  onDeleteProduct: (productId: number) => void;
  onToggleStatus: (productId: number) => void;
  onViewProduct: (productId: number) => void;
}

function ProductTable({ products, onEditProduct, onDeleteProduct, onToggleStatus, onViewProduct }: ProductTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    {product.primaryImageUrl ? (
                      <img 
                        className="h-12 w-12 rounded-lg object-cover shadow-sm" 
                        src={product.primaryImageUrl} 
                        alt={product.name} 
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {product.categoryName}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">
                  {formatPrice(product.price)}
                </div>
                {product.comparePrice && product.comparePrice > product.price && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {product.stockQuantity}
                </div>
                <div className={`text-xs ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? 'In stock' : 'Out of stock'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircleIcon className="h-3 w-3 mr-1" />
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.averageRating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600">
                    ({product.reviewCount})
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(product.createdDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onViewProduct(product.id)}
                    className="p-1 text-gray-600 hover:text-kasuwa-primary-600 transition-colors"
                    title="View product"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditProduct(product.id)}
                    className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Edit product"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggleStatus(product.id)}
                    className={`p-1 transition-colors ${product.isActive ? 'text-gray-600 hover:text-red-600' : 'text-gray-600 hover:text-green-600'}`}
                    title={product.isActive ? "Deactivate" : "Activate"}
                  >
                    {product.isActive ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                    title="Delete product"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AdminProductsPageProps {
  className?: string;
}

export default function AdminProductsPage({ className = '' }: AdminProductsPageProps) {
  const { isAdmin, isLoading } = useAuth();
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<string>('');

  useEffect(() => {
    if (!isLoading && isAdmin) {
      fetchInitialData();
    }
  }, [isAdmin, isLoading]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [pagination.currentPage, searchTerm, categoryFilter, statusFilter, stockFilter]);

  const fetchInitialData = async () => {
    try {
      // Fetch categories for filter dropdown
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
      
      // Fetch products
      await fetchProducts();
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load data');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: ProductQueryParams = {
        pageNumber: pagination.currentPage,
        pageSize: pagination.pageSize,
        searchTerm: searchTerm || undefined,
        categoryId: categoryFilter ? parseInt(categoryFilter) : undefined,
        inStockOnly: stockFilter === 'instock' ? true : undefined
      };

      const response = await productService.getProducts(params);
      setProducts(response.data);
      setPagination(prev => ({
        ...prev,
        totalCount: response.totalCount,
        totalPages: response.totalPages
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (productId: number) => {
    setEditingProductId(productId);
    setShowEditModal(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await productService.deleteProduct(productId);
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleToggleStatus = async (productId: number) => {
    try {
      await productService.toggleProductStatus(productId);
      await fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Failed to toggle product status');
    }
  };

  const handleViewProduct = (productId: number) => {
    // Navigate to product detail page
    window.open(`/products/${productId}`, '_blank');
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleProductUpdated = () => {
    fetchProducts();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kasuwa-primary-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access product management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-2">
                Manage all products on the platform with advanced editing capabilities.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.open('/admin/categories', '_blank')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Manage Categories
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-kasuwa-primary-500 transition-colors"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-kasuwa-primary-500 transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-kasuwa-primary-500 transition-colors"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-kasuwa-primary-500 transition-colors"
              >
                <option value="">All Stock Levels</option>
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>
              
              <button
                onClick={fetchProducts}
                className="inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-md hover:bg-kasuwa-primary-700 transition-colors"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Products</h2>
              <p className="text-sm text-gray-600">
                {pagination.totalCount} products total
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kasuwa-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-3">Loading products...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kasuwa-primary-600 hover:bg-kasuwa-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBagIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No products found</p>
            </div>
          ) : (
            <>
              <ProductTable
                products={products}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onToggleStatus={handleToggleStatus}
                onViewProduct={handleViewProduct}
              />
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{' '}
                    {pagination.totalCount} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm bg-white rounded border">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product Edit Modal */}
      <ProductEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProductId(null);
        }}
        productId={editingProductId}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
}