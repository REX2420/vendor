"use client";
import { GiTakeMyMoney } from "react-icons/gi";
import { SiProducthunt } from "react-icons/si";
import { SlHandbag } from "react-icons/sl";
import React from "react";

const DashboardCard = ({ data }: { data: any }) => {
  const totalEarnings = data.orders.reduce((a: any, val: any) => a + val.total, 0);
  const unpaidAmount = data.orders
    .filter((o: any) => !o.isPaid)
    .reduce((a: any, val: any) => a + val.total, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orders Card */}
        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-lg p-6 transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Orders</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {data.orders.length}
              </h3>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <SlHandbag className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-lg p-6 transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Products</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {data.products.length}
              </h3>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <SiProducthunt className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl shadow-lg p-6 transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Earnings</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                ₹{totalEarnings.toLocaleString()}
              </h3>
              <p className="text-white/80 text-sm mt-2">
                ₹{unpaidAmount.toLocaleString()} unpaid
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <GiTakeMyMoney className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
