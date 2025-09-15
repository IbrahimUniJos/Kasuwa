import React, { useState, useEffect } from 'react';
import { 
  PhotoIcon, 
  XMarkIcon, 
  PlusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { productService, categoryService } from '../../services/products';
import type { CreateProductDto, UpdateProductDto, CategoryDto, ProductDto } from '../../types/api';

interface ProductFormProps {
  productId?: number; // If provided, this is an edit form
  onSubmit: (product: ProductDto) => void;
  onCancel: () => void;
  className?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  categoryId: number;
  comparePrice?: number;
  weight: number;
  weightUnit: string;
  requiresShipping: boolean;
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

interface ProductVariantForm {
  name: string;
  value: string;
  priceAdjustment: number;
  stockQuantity: number;
  sku?: string;
}

export default function ProductForm({
  productId,
  onSubmit,
  onCancel,
  className = ''
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariantForm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    sku: '',
    categoryId: 0,
    comparePrice: undefined,
    weight: 0,
    weightUnit: 'kg',
    requiresShipping: true,
    trackQuantity: true,
    continueSellingWhenOutOfStock: false,
    metaTitle: '',
    metaDescription: ''
  });

  // Fetch categories and product (if editing)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesData, productData] = await Promise.all([
          categoryService.getCategories(),
          productId ? productService.getProduct(productId) : Promise.resolve(null)
        ]);

        setCategories(categoriesData);

        if (productData) {
          setFormData({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stockQuantity: productData.stockQuantity,
            sku: productData.sku,
            categoryId: productData.categoryId,
            comparePrice: productData.comparePrice,
            weight: productData.weight,
            weightUnit: productData.weightUnit || 'kg',
            requiresShipping: productData.requiresShipping,
            trackQuantity: productData.trackQuantity,
            continueSellingWhenOutOfStock: productData.continueSellingWhenOutOfStock,
            metaTitle: productData.metaTitle,
            metaDescription: productData.metaDescription
          });

          if (productData.variants) {
            setVariants(productData.variants.map(v => ({
              name: v.name,
              value: v.value,
              priceAdjustment: v.priceAdjustment,
              stockQuantity: v.stockQuantity,
              sku: v.sku
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // Generate SKU automatically
  const generateSKU = () => {
    const prefix = formData.name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${randomSuffix}`;
  };

  // Handle form input changes
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.slice(0, 5 - imageFiles.length); // Max 5 images
    setImageFiles(prev => [...prev, ...newFiles]);

    // Generate previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle variant changes
  const addVariant = () => {
    setVariants(prev => [...prev, {
      name: '',
      value: '',
      priceAdjustment: 0,
      stockQuantity: 0,
      sku: ''
    }]);
  };

  const updateVariant = (index: number, field: keyof ProductVariantForm, value: any) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (formData.categoryId === 0) newErrors.categoryId = 'Please select a category';
    if (formData.weight <= 0) newErrors.weight = 'Weight must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let product: ProductDto;

      if (productId) {
        // Update existing product
        const updateData: UpdateProductDto = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          categoryId: formData.categoryId,
          comparePrice: formData.comparePrice,
          weight: formData.weight,
          weightUnit: formData.weightUnit,
          requiresShipping: formData.requiresShipping,
          trackQuantity: formData.trackQuantity,
          continueSellingWhenOutOfStock: formData.continueSellingWhenOutOfStock,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          isActive: true
        };
        product = await productService.updateProduct(productId, updateData);
      } else {
        // Create new product
        const createData: CreateProductDto = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          sku: formData.sku,
          categoryId: formData.categoryId,
          comparePrice: formData.comparePrice,
          weight: formData.weight,
          weightUnit: formData.weightUnit,
          requiresShipping: formData.requiresShipping,
          trackQuantity: formData.trackQuantity,
          continueSellingWhenOutOfStock: formData.continueSellingWhenOutOfStock,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          images: [],
          variants: variants.map(v => ({
            name: v.name,
            value: v.value,
            priceAdjustment: v.priceAdjustment,
            stockQuantity: v.stockQuantity,
            sku: v.sku
          }))
        };
        product = await productService.createProduct(createData);
      }

      // Upload images if any
      if (imageFiles.length > 0) {
        await productService.uploadProductImages(product.id, imageFiles);
      }

      onSubmit(product);
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Get flat categories for dropdown
  const flatCategories = React.useMemo(() => {
    const flattenCategories = (cats: CategoryDto[], level = 0): CategoryDto[] => {
      let result: CategoryDto[] = [];
      for (const cat of cats) {
        result.push({ ...cat, name: '  '.repeat(level) + cat.name });
        if (cat.subCategories && cat.subCategories.length > 0) {
          result = result.concat(flattenCategories(cat.subCategories, level + 1));
        }
      }
      return result;
    };
    return flattenCategories(categories);
  }, [categories]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-kasuwa-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className={`flex-1 border rounded-l-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                    errors.sku ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter SKU"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('sku', generateSKU())}
                  className="px-4 py-2 bg-kasuwa-primary-600 text-white rounded-r-md hover:bg-kasuwa-primary-700 border border-l-0 border-kasuwa-primary-600"
                >
                  Generate
                </button>
              </div>
              {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your product"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', Number(e.target.value))}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value={0}>Select a category</option>
                {flatCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₦) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compare at Price (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.comparePrice || ''}
                onChange={(e) => handleInputChange('comparePrice', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Show a higher original price to display savings
              </p>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trackQuantity"
                checked={formData.trackQuantity}
                onChange={(e) => handleInputChange('trackQuantity', e.target.checked)}
                className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
              />
              <label htmlFor="trackQuantity" className="text-sm text-gray-700">
                Track quantity
              </label>
            </div>

            {formData.trackQuantity && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="continueSellingWhenOutOfStock"
                    checked={formData.continueSellingWhenOutOfStock}
                    onChange={(e) => handleInputChange('continueSellingWhenOutOfStock', e.target.checked)}
                    className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
                  />
                  <label htmlFor="continueSellingWhenOutOfStock" className="text-sm text-gray-700">
                    Continue selling when out of stock
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipping</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requiresShipping"
                checked={formData.requiresShipping}
                onChange={(e) => handleInputChange('requiresShipping', e.target.checked)}
                className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
              />
              <label htmlFor="requiresShipping" className="text-sm text-gray-700">
                This product requires shipping
              </label>
            </div>

            {formData.requiresShipping && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.0"
                  />
                  {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight Unit
                  </label>
                  <select
                    value={formData.weightUnit}
                    onChange={(e) => handleInputChange('weightUnit', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="lb">Pounds (lb)</option>
                    <option value="oz">Ounces (oz)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Images</h3>
          
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload product images
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB each (max 5 images)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                  <span className="mt-4 inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-md hover:bg-kasuwa-primary-700">
                    Choose Images
                  </span>
                </label>
              </div>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-kasuwa-primary-600 bg-kasuwa-primary-50 rounded-md hover:bg-kasuwa-primary-100"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No variants added. Click "Add Variant" to create different options for your product.
            </p>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Variant {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option Name
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        placeholder="e.g., Size, Color"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option Value
                      </label>
                      <input
                        type="text"
                        value={variant.value}
                        onChange={(e) => updateVariant(index, 'value', e.target.value)}
                        placeholder="e.g., Large, Red"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Adjustment (₦)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.priceAdjustment}
                        onChange={(e) => updateVariant(index, 'priceAdjustment', Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.stockQuantity}
                        onChange={(e) => updateVariant(index, 'stockQuantity', Number(e.target.value))}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={variant.sku || ''}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        placeholder="Optional"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">SEO</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.metaTitle || ''}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                placeholder="Product page title for search engines"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.metaTitle || '').length}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription || ''}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                placeholder="Product description for search engines"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.metaDescription || '').length}/160 characters
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center px-6 py-2 bg-kasuwa-primary-600 text-white rounded-md hover:bg-kasuwa-primary-700 focus:ring-2 focus:ring-kasuwa-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {productId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                {productId ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}