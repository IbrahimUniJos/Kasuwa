import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PhotoIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stockQuantity: number;
  status: 'Active' | 'Inactive' | 'OutOfStock';
  imageUrl?: string;
  description: string;
  tags: string[];
  createdAt: string;
  views: number;
  sales: number;
}

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: number;
  stockQuantity: number;
  tags: string;
  status: 'Active' | 'Inactive';
}

interface VendorProductManagementProps {
  vendorId?: string;
}

export default function VendorProductManagement({ vendorId }: VendorProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    tags: '',
    status: 'Active'
  });

  const categories = ['Crafts', 'Textiles', 'Pottery', 'Jewelry', 'Clothing', 'Art', 'Home Decor'];

  useEffect(() => {
    loadProducts();
  }, [vendorId]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Traditional Woven Basket',
          sku: 'TWB001',
          category: 'Crafts',
          price: 299.99,
          stockQuantity: 15,
          status: 'Active',
          imageUrl: '/api/placeholder/150/150',
          description: 'Beautiful handwoven basket made from local materials',
          tags: ['handmade', 'traditional', 'storage'],
          createdAt: '2024-01-15',
          views: 156,
          sales: 14
        },
        {
          id: '2',
          name: 'Handcrafted Leather Bag',
          sku: 'HLB002',
          category: 'Accessories',
          price: 499.99,
          stockQuantity: 8,
          status: 'Active',
          imageUrl: '/api/placeholder/150/150',
          description: 'Premium leather bag crafted by local artisans',
          tags: ['leather', 'handcrafted', 'premium'],
          createdAt: '2024-01-10',
          views: 128,
          sales: 12
        },
        {
          id: '3',
          name: 'Ceramic Pottery Set',
          sku: 'CPS003',
          category: 'Pottery',
          price: 159.99,
          stockQuantity: 0,
          status: 'OutOfStock',
          imageUrl: '/api/placeholder/150/150',
          description: 'Set of 4 ceramic bowls with traditional patterns',
          tags: ['ceramic', 'traditional', 'dining'],
          createdAt: '2024-01-05',
          views: 94,
          sales: 8
        }
      ];

      setProducts(mockProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update existing product
        const updatedProduct: Product = {
          ...editingProduct,
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          status: formData.stockQuantity === 0 ? 'OutOfStock' : formData.status
        };
        
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
      } else {
        // Create new product
        const newProduct: Product = {
          id: Date.now().toString(),
          ...formData,
          sku: `SKU${Date.now()}`,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          createdAt: new Date().toISOString().split('T')[0],
          views: 0,
          sales: 0,
          status: formData.stockQuantity === 0 ? 'OutOfStock' : formData.status
        };
        
        setProducts(prev => [newProduct, ...prev]);
      }

      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      tags: product.tags.join(', '),
      status: product.status === 'OutOfStock' ? 'Active' : product.status
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      tags: '',
      status: 'Active'
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      OutOfStock: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-kasuwa-primary-600 text-white px-4 py-2 rounded-md hover:bg-kasuwa-primary-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="OutOfStock">Out of Stock</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <FunnelIcon className="w-5 h-5 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100">
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                {getStatusBadge(product.status)}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-kasuwa-primary-600">₦{product.price}</span>
                <span className="text-sm text-gray-600">Stock: {product.stockQuantity}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  {product.views} views
                </span>
                <span>{product.sales} sales</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 flex items-center justify-center"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter || statusFilter 
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by adding your first product.'
            }
          </p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="handmade, traditional, premium"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-kasuwa-primary-600 text-white px-4 py-2 rounded-md hover:bg-kasuwa-primary-700"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}