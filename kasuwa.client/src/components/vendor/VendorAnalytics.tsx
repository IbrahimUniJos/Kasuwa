import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface VendorAnalyticsProps {
  vendorId?: string;
}

interface AnalyticsData {
  salesTrend: {
    labels: string[];
    revenue: number[];
    orders: number[];
  };
  categoryBreakdown: {
    labels: string[];
    data: number[];
    colors: string[];
  };
  topProducts: {
    name: string;
    revenue: number;
    sales: number;
    views: number;
  }[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalViews: number;
    conversionRate: number;
    avgOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
  };
}

export default function VendorAnalytics({ vendorId }: VendorAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, vendorId]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        salesTrend: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          revenue: [2400, 3200, 2800, 4100],
          orders: [12, 15, 13, 18]
        },
        categoryBreakdown: {
          labels: ['Crafts', 'Textiles', 'Pottery', 'Jewelry', 'Others'],
          data: [35, 25, 20, 15, 5],
          colors: ['#F97316', '#EAB308', '#10B981', '#3B82F6', '#8B5CF6']
        },
        topProducts: [
          { name: 'Traditional Woven Basket', revenue: 4200, sales: 14, views: 156 },
          { name: 'Handcrafted Leather Bag', revenue: 3600, sales: 12, views: 128 },
          { name: 'Ceramic Pottery Set', revenue: 2800, sales: 8, views: 94 },
          { name: 'Silver Jewelry Collection', revenue: 2400, sales: 6, views: 78 },
          { name: 'Woven Table Runner', revenue: 1800, sales: 9, views: 67 }
        ],
        summary: {
          totalRevenue: 15420,
          totalOrders: 45,
          totalViews: 1247,
          conversionRate: 3.6,
          avgOrderValue: 342.67,
          revenueGrowth: 15.2,
          orderGrowth: 8.7
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const salesChartData = {
    labels: analyticsData.salesTrend.labels,
    datasets: [
      {
        label: 'Revenue (₦)',
        data: analyticsData.salesTrend.revenue,
        borderColor: '#F97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Orders',
        data: analyticsData.salesTrend.orders,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const salesChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Trend'
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue (₦)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Orders'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  const categoryChartData = {
    labels: analyticsData.categoryBreakdown.labels,
    datasets: [
      {
        data: analyticsData.categoryBreakdown.data,
        backgroundColor: analyticsData.categoryBreakdown.colors,
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const categoryChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Sales by Category (%)'
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { label: '7 days', value: '7d' },
            { label: '30 days', value: '30d' },
            { label: '90 days', value: '90d' },
            { label: '1 year', value: '1y' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-white text-kasuwa-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{analyticsData.summary.totalRevenue.toLocaleString()}
              </p>
              <p className={`text-sm flex items-center mt-1 ${
                analyticsData.summary.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analyticsData.summary.revenueGrowth >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                {Math.abs(analyticsData.summary.revenueGrowth)}% from last period
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalOrders}</p>
              <p className={`text-sm flex items-center mt-1 ${
                analyticsData.summary.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analyticsData.summary.orderGrowth >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                )}
                {Math.abs(analyticsData.summary.orderGrowth)}% from last period
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalViews.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">
                {analyticsData.summary.conversionRate}% conversion rate
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{analyticsData.summary.avgOrderValue.toFixed(0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Per order average
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <Line data={salesChartData} options={salesChartOptions} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Doughnut data={categoryChartData} options={categoryChartOptions} />
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.topProducts.map((product, index) => {
                const conversionRate = product.views > 0 ? (product.sales / product.views * 100) : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₦{product.revenue.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.sales}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.views}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{conversionRate.toFixed(1)}%</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}