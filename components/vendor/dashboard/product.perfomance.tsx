"use client";

import {
  getDetailedTopSellingProducts,
  getDetailedSizeAnalytics,
} from "@/lib/database/actions/vendor/analytics/analytics.actions";
import { useEffect, useState } from "react";
import { FaTrophy, FaChartLine, FaBoxes, FaStar, FaShoppingCart } from "react-icons/fa";

const ProductData = () => {
  const [detailedProducts, setDetailedProducts] = useState<any[]>([]);
  const [detailedSizes, setDetailedSizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch detailed data for tables
        const [detailedProductsRes, detailedSizesRes] = await Promise.all([
          getDetailedTopSellingProducts(),
          getDetailedSizeAnalytics(),
        ]);

        setDetailedProducts(detailedProductsRes || []);
        setDetailedSizes(detailedSizesRes || []);
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      'In Stock': 'bg-green-100 text-green-800',
      'Low Stock': 'bg-yellow-100 text-yellow-800',
      'Out of Stock': 'bg-red-100 text-red-800',
      'High Stock': 'bg-blue-100 text-blue-800',
      'Medium Stock': 'bg-indigo-100 text-indigo-800',
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPerformanceBadge = (performance: string) => {
    const styles = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Average': 'bg-yellow-100 text-yellow-800',
      'Poor': 'bg-red-100 text-red-800',
      'Very Popular': 'bg-purple-100 text-purple-800',
      'Popular': 'bg-blue-100 text-blue-800',
      'Moderate': 'bg-yellow-100 text-yellow-800',
      'Low Demand': 'bg-gray-100 text-gray-800',
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[performance as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-3">
          <FaChartLine className="text-2xl text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Product Performance</h2>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <FaChartLine className="text-2xl text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Product Performance</h2>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-2xl font-bold">{detailedProducts?.length || 0}</p>
            </div>
            <FaBoxes className="text-2xl text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">
                MVR{detailedProducts?.reduce((sum, p: any) => sum + (parseFloat(p?.totalRevenue || '0') || 0), 0).toFixed(0) || '0'}
              </p>
            </div>
            <FaShoppingCart className="text-2xl text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Sold</p>
              <p className="text-2xl font-bold">
                {detailedProducts?.reduce((sum, p: any) => sum + (Number(p?.totalSold) || 0), 0) || 0}
              </p>
            </div>
            <FaTrophy className="text-2xl text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Available Sizes</p>
              <p className="text-2xl font-bold">{detailedSizes?.length || 0}</p>
            </div>
            <FaStar className="text-2xl text-orange-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Selling Products Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FaTrophy /> Top Selling Products
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">Product</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">Sold</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">Revenue</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedProducts?.slice(0, 6).map((product: any, index) => (
                    <tr key={product?._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {product?.image ? (
                              <img 
                                src={String(product.image)} 
                                alt={String(product?.name || '')}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <FaBoxes className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm truncate max-w-[120px]" title={String(product?.name || '')}>
                              {String(product?.name || 'N/A')}
                            </p>
                            <p className="text-xs text-gray-500">{String(product?.category || 'N/A')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-gray-900">{Number(product?.totalSold) || 0}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-green-600">MVR{String(product?.totalRevenue || '0')}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={getPerformanceBadge(String(product?.performance || 'Poor'))}>
                          {String(product?.performance || 'Poor')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!detailedProducts || detailedProducts.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <FaBoxes className="mx-auto text-3xl mb-2 text-gray-300" />
                  <p>No product data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Size Performance Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FaStar /> Size Performance
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">Size</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">Sold</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">Revenue</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm">Popularity</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedSizes?.sort((a: any, b: any) => (Number(b?.totalSold) || 0) - (Number(a?.totalSold) || 0)).slice(0, 6).map((size: any, index) => (
                    <tr key={String(size?.size) || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                            {String(size?.size || 'N/A')}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-gray-900">{Number(size?.totalSold) || 0}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-green-600">MVR{String(size?.totalRevenue || '0')}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={getPerformanceBadge(String(size?.popularity || 'Low Demand'))}>
                          {String(size?.popularity || 'Low Demand')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!detailedSizes || detailedSizes.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <FaStar className="mx-auto text-3xl mb-2 text-gray-300" />
                  <p>No size data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductData;
