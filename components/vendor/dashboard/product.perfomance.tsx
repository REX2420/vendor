"use client";

import {
  getTopSellingProducts,
  sizeAnalytics,
} from "@/lib/database/actions/vendor/analytics/analytics.actions";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm text-gray-600">Value: {payload[0].value}</p>
        <p className="text-sm text-gray-600">
          Percentage: {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const ProductData = () => {
  const [sizeData, setSizeData] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  useEffect(() => {
    async function fetchSizeDataForProduct() {
      await sizeAnalytics()
        .then((res) => setSizeData(res))
        .catch((err) => console.log(err));
    }
    fetchSizeDataForProduct();
    async function topSellingProducts() {
      await getTopSellingProducts()
        .then((res) => setTopSellingProducts(res))
        .catch((err) => console.log(err));
    }
    topSellingProducts();
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Product Performance</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Size Performance Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">
            Size Performance
          </h3>
          <div className="h-[400px]">
            {sizeData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sizeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sizeData?.map((entry: any, index: any) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                No Data Available
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Products Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">
            Top Selling Products
          </h3>
          <div className="h-[400px]">
            {topSellingProducts?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topSellingProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topSellingProducts?.map((entry: any, index: any) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                No Data Available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductData;
