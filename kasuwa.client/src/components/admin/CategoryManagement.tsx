import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon
} from '@heroicons/react/24/outline';
import { categoryService } from '../../services/products';
import type { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '../../types/api';

interface CategoryManagementProps {
  className?: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  parentCategoryId?: number;
  isActive: boolean;
  sortOrder: number;
}

export default function CategoryManagement({ className = '' }: CategoryManagementProps) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentCategoryId: undefined,
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentCategoryId: undefined,
      isActive: true,
      sortOrder: 0
    });
    setEditingCategory(null);
  };

  const handleCreateCategory = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditCategory = (category: CategoryDto) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      parentCategoryId: category.parentCategoryId,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. It may have products or subcategories.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        const updateData: UpdateCategoryDto = {
          name: formData.name,
          description: formData.description,
          parentCategoryId: formData.parentCategoryId,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder
        };
        await categoryService.updateCategory(editingCategory.id, updateData);
      } else {
        const createData: CreateCategoryDto = {
          name: formData.name,
          description: formData.description,
          parentCategoryId: formData.parentCategoryId,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder
        };
        await categoryService.createCategory(createData);
      }
      
      setShowForm(false);
      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const buildCategoryTree = (categories: CategoryDto[], parentId?: number): CategoryDto[] => {
    return categories
      .filter(cat => cat.parentCategoryId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const renderCategoryRow = (category: CategoryDto, level: number = 0) => {
    const children = buildCategoryTree(categories, category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50">
          <div className="flex items-center space-x-3" style={{ paddingLeft: level * 24 }}>
            {hasChildren ? (
              <button
                onClick={() => toggleCategoryExpansion(category.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronRightIcon 
                  className={`h-4 w-4 text-gray-400 transform transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              </button>
            ) : (
              <div className="w-6 h-6" />
            )}
            
            {hasChildren ? (
              isExpanded ? (
                <FolderOpenIcon className="h-5 w-5 text-blue-500" />
              ) : (
                <FolderIcon className="h-5 w-5 text-blue-500" />
              )
            ) : (
              <div className="h-5 w-5 rounded bg-gray-300" />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <span className={`font-medium ${category.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {category.name}
                </span>
                {!category.isActive && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Inactive
                  </span>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {category.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                <span>Products: {category.productCount || 0}</span>
                <span>Order: {category.sortOrder}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditCategory(category)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Edit category"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Delete category"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderCategoryRow(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getFlatCategoriesForSelect = (categories: CategoryDto[]): Array<{ value: number; label: string }> => {
    const result: Array<{ value: number; label: string }> = [];
    
    const rootCategories = buildCategoryTree(categories);
    
    const processCategory = (category: CategoryDto, currentLevel: number) => {
      const indent = '—'.repeat(currentLevel);
      result.push({
        value: category.id,
        label: `${indent} ${category.name}`
      });
      
      const children = buildCategoryTree(categories, category.id);
      children.forEach(child => processCategory(child, currentLevel + 1));
    };
    
    rootCategories.forEach(category => processCategory(category, 0));
    return result;
  };

  if (loading) {
    return (
      <div className={`max-w-6xl mx-auto p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">
            Organize and manage your product categories
          </p>
        </div>
        
        <button
          onClick={handleCreateCategory}
          className="inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 font-medium"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentCategoryId || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      parentCategoryId: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                  >
                    <option value="">No parent (Root category)</option>
                    {getFlatCategoriesForSelect(categories)
                      .filter(cat => !editingCategory || cat.value !== editingCategory.id)
                      .map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kasuwa-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-kasuwa-primary-600 focus:ring-kasuwa-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-kasuwa-primary-600 text-white rounded-md hover:bg-kasuwa-primary-700"
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Categories</h2>
          <p className="text-sm text-gray-600 mt-1">
            {categories.length} categories total
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first category to start organizing your products.
            </p>
            <button
              onClick={handleCreateCategory}
              className="inline-flex items-center px-4 py-2 bg-kasuwa-primary-600 text-white rounded-lg hover:bg-kasuwa-primary-700 font-medium"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Category
            </button>
          </div>
        ) : (
          <div>
            {buildCategoryTree(categories).map(category => renderCategoryRow(category))}
          </div>
        )}
      </div>
    </div>
  );
}