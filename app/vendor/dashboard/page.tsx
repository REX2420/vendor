import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { SlEye } from "react-icons/sl";
import { HiCurrencyRupee } from "react-icons/hi";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  calculateTotalOrders,
  getDashboardData,
} from "@/lib/database/actions/vendor/dashboard/dashboard.actions";
import DashboardCard from "@/components/vendor/dashboard/dashboardCard";
import ProductData from "@/components/vendor/dashboard/product.perfomance";
import LowStockProducts from "@/components/vendor/dashboard/low-stock-products";
import OutOfStockProducts from "@/components/vendor/dashboard/out-of-stock-products";

const VendorDashboardPage = async () => {
  const data = await getDashboardData().catch((err) => console.log(err));
  const allOrdersData = await calculateTotalOrders().catch((err) =>
    console.log(err)
  );

  return (
    <div className="container">
      <div className="my-[20px]">
        <DashboardCard data={data} />
      </div>
      
      <div className="titleStyle">Orders</div>
      
      <div className="flex justify-evenly items-center my-[20px]">
        <div className="bg-white h-[120px] gap-[10px] border border-gray-200 p-[15px] w-[220px] shadow-lg flex items-center justify-center rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="bg-green-50 p-2 rounded-full mb-2">
              <HiCurrencyRupee size={30} className="text-green-600" />
            </div>
            <span className="text-gray-600 text-sm">Total Sales</span>
            <span className="text-xl font-semibold text-gray-800">MVR{allOrdersData?.totalSales}</span>
          </div>
        </div>

        <div className="bg-white h-[120px] gap-[10px] border border-gray-200 p-[15px] w-[220px] shadow-lg flex items-center justify-center rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="bg-blue-50 p-2 rounded-full mb-2">
              <HiCurrencyRupee size={30} className="text-blue-600" />
            </div>
            <span className="text-gray-600 text-sm">Last Month Sales</span>
            <span className="text-xl font-semibold text-gray-800">MVR{allOrdersData?.lastMonthSales}</span>
          </div>
        </div>

        <div className="bg-white h-[120px] gap-[10px] border border-gray-200 p-[15px] w-[220px] shadow-lg flex items-center justify-center rounded-xl hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="bg-purple-50 p-2 rounded-full mb-2">
              <HiCurrencyRupee size={30} className="text-purple-600" />
            </div>
            <span className="text-gray-600 text-sm">Growth</span>
            <span className="text-xl font-semibold text-gray-800">{allOrdersData?.growthPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="my-[20px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
            <span className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {data?.orders?.length || 0} Orders
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
              View All
            </button>
          </div>
        </div>
        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <TableContainer component={Paper} className="shadow-none">
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold text-gray-700 py-4">Customer</TableCell>
                  <TableCell className="font-semibold text-gray-700 py-4">Order Total</TableCell>
                  <TableCell className="font-semibold text-gray-700 py-4">Payment Status</TableCell>
                  <TableCell className="font-semibold text-gray-700 py-4">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.orders?.map((order: any, index: any) => (
                  <TableRow 
                    key={index} 
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-medium">{order?.user?.email}</span>
                        <span className="text-gray-500 text-sm">Order #{order._id.slice(-6)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center">
                        <span className="text-gray-800 font-semibold">MVR{order.total}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {order.isPaid ? (
                        <div className="flex items-center">
                          <div className="bg-green-50 px-3 py-1 rounded-full flex items-center">
                            <FaCheckCircle size={16} className="text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-700">Paid</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="bg-red-50 px-3 py-1 rounded-full flex items-center">
                            <IoIosCloseCircle size={16} className="text-red-600 mr-2" />
                            <span className="text-sm font-medium text-red-700">Pending</span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <Link 
                        href={`/order/${order._id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                      >
                        <SlEye size={18} />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      <ProductData />
      <LowStockProducts />
      <OutOfStockProducts />
    </div>
  );
};

export default VendorDashboardPage;
