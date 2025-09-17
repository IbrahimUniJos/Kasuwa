import { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  currentStock: number;
  lowStockThreshold: number;
  reservedStock: number;
  availableStock: number;
  status: 'InStock' | 'LowStock' | 'OutOfStock';
  lastUpdated: string;
  location?: string;
}

interface VendorInventoryProps {
  vendorId?: string;
}

export default function VendorInventory({ vendorId }: VendorInventoryProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentNote, setAdjustmentNote] = useState('');

  useEffect(() => {
    loadInventory();
  }, [vendorId]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          productName: 'Traditional Woven Basket',
          sku: 'TWB001',
          currentStock: 15,
          lowStockThreshold: 5,
          reservedStock: 3,
          availableStock: 12,
          status: 'InStock',
          lastUpdated: '2024-01-15T10:30:00Z',
          location: 'Warehouse A'
        },
        {
          id: '2',
          productName: 'Handcrafted Leather Bag',
          sku: 'HLB002',
          currentStock: 4,
          lowStockThreshold: 5,
          reservedStock: 1,
          availableStock: 3,
          status: 'LowStock',
          lastUpdated: '2024-01-14T14:20:00Z',
          location: 'Warehouse A'
        },
        {
          id: '3',
          productName: 'Ceramic Pottery Set',
          sku: 'CPS003',
          currentStock: 0,
          lowStockThreshold: 3,
          reservedStock: 0,
          availableStock: 0,
          status: 'OutOfStock',
          lastUpdated: '2024-01-16T09:15:00Z',
          location: 'Warehouse B'
        }
      ];

      setInventoryItems(mockInventory);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const adjustStock = async (itemId: string, adjustment: number, _note: string) => {
    try {
      // Update local state - replace with actual API call
      setInventoryItems(prev => prev.map(item => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.currentStock + adjustment);
          const newAvailable = Math.max(0, newStock - item.reservedStock);
          let newStatus: InventoryItem['status'] = 'InStock';
          
          if (newStock === 0) {
            newStatus = 'OutOfStock';
          } else if (newStock <= item.lowStockThreshold) {
            newStatus = 'LowStock';
          }

          return {
            ...item,
            currentStock: newStock,
            availableStock: newAvailable,
            status: newStatus,
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      }));

      // Reset form
      setSelectedItem(null);
      setAdjustmentQuantity(0);
      setAdjustmentNote('');
    } catch (error) {
      console.error('Failed to adjust stock:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      InStock: 'bg-green-100 text-green-800',
      LowStock: 'bg-yellow-100 text-yellow-800',
      OutOfStock: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status === 'InStock' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
        {status === 'LowStock' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
        {status === 'OutOfStock' && <XCircleIcon className="w-3 h-3 mr-1" />}
        {status.replace(/([A-Z])/g, ' $1').trim()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Monitor and manage your product stock levels</p>
        </div>
        <button
          onClick={loadInventory}
          className="flex items-center bg-kasuwa-primary-600 text-white px-4 py-2 rounded-md hover:bg-kasuwa-primary-700"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventoryItems.filter(item => item.status === 'InStock').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventoryItems.filter(item => item.status === 'LowStock').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventoryItems.filter(item => item.status === 'OutOfStock').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                      {item.location && (
                        <div className="text-sm text-gray-500">Location: {item.location}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.currentStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.availableStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.reservedStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.lastUpdated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-kasuwa-primary-600 hover:text-kasuwa-primary-900"
                        title="Adjust Stock"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Adjust Stock - {selectedItem.productName}
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Current Stock:</span>
                      <span className="ml-2 text-gray-900">{selectedItem.currentStock}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Available:</span>
                      <span className="ml-2 text-gray-900">{selectedItem.availableStock}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Reserved:</span>
                      <span className="ml-2 text-gray-900">{selectedItem.reservedStock}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedItem.status)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Quantity
                  </label>
                  <input
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                    placeholder="Enter positive or negative number"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    New stock will be: {Math.max(0, selectedItem.currentStock + adjustmentQuantity)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjustment Note
                  </label>
                  <textarea
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                    rows={3}
                    placeholder="Reason for stock adjustment (optional)"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-kasuwa-primary-500 focus:ring-kasuwa-primary-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => adjustStock(selectedItem.id, adjustmentQuantity, adjustmentNote)}
                    disabled={adjustmentQuantity === 0}
                    className="flex-1 bg-kasuwa-primary-600 text-white px-4 py-2 rounded-md hover:bg-kasuwa-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Adjustment
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}