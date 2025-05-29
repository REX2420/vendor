"use server";

import Order from "@/lib/database/models/order.model";
import { generateLast12MonthsData } from "./analytics.generator";
import Product from "@/lib/database/models/product.model";
import { connectToDatabase } from "@/lib/database/connect";
import { verify_vendor } from "@/utils";
const jwt = require("jsonwebtoken");
import { cookies } from "next/headers";
import mongoose from "mongoose";

// get Order analytics fro vendor
export const getOrderAnalytics = async () => {
  try {
    const orders = await generateLast12MonthsData(Order, "order");
    return { orders };
  } catch (error: any) {
    console.log(error);
  }
};

// get Product analytics fro vendor
export const getProductAnalytics = async () => {
  try {
    const products = await generateLast12MonthsData(Product, "product");
    return { products };
  } catch (error: any) {
    console.log(error);
  }
};

// get product size analytics for vendor
export const sizeAnalytics = async () => {
  try {
    await connectToDatabase();
    const vendor = await verify_vendor();
    const products = await Product.find({
      "vendor._id": vendor?.id,
    }).lean();
    
    if (!products || products.length === 0) {
      return [];
    }
    
    const individualSizeAnalytics = products.reduce(
      (acc: any, product: any) => {
        product.subProducts.forEach((subProduct: any) => {
          subProduct.sizes?.forEach((size: any) => {
            if (acc[size.size]) {
              acc[size.size] += Number(size.sold || 0);
            } else {
              acc[size.size] = Number(size.sold || 0);
            }
          });
        });
        return acc;
      },
      {}
    );
    
    const sizeData = Object.keys(individualSizeAnalytics).map((size) => ({
      name: String(size),
      value: Number(individualSizeAnalytics[size]),
    }));
    
    return sizeData;
  } catch (error: any) {
    console.log(error);
    return [];
  }
};

// get top selling products for vendor
export const getTopSellingProducts = async () => {
  try {
    await connectToDatabase();
    const vendor = await verify_vendor();
    
    const topSellingProducts = await Product.find({
      "vendor._id": vendor?.id,
    })
      .sort({ "subProducts.sold": -1 })
      .limit(5)
      .lean();
      
    const pieChartData = topSellingProducts.map((product) => ({
      name: String(product.name || ''),
      value: Number(product.subProducts[0]?.sold || 0),
    }));
    
    return pieChartData;
  } catch (error: any) {
    console.log(error);
    return [];
  }
};

// get detailed top selling products with more information for table display
export const getDetailedTopSellingProducts = async () => {
  try {
    await connectToDatabase();
    const vendor = await verify_vendor();
    
    const products = await Product.find({
      "vendor._id": vendor?.id,
    })
      .populate('category', 'name')
      .sort({ "subProducts.sold": -1 })
      .limit(10)
      .lean();

    const detailedProducts = products.map((product) => {
      const subProduct = product.subProducts[0] || {};
      const totalSold = product.subProducts.reduce(
        (total: number, sub: any) => total + (sub.sold || 0),
        0
      );
      const totalRevenue = product.subProducts.reduce(
        (total: number, sub: any) => {
          const sizeRevenue = sub.sizes?.reduce(
            (sizeTotal: number, size: any) => sizeTotal + (size.sold * size.price || 0),
            0
          ) || 0;
          return total + sizeRevenue;
        },
        0
      );
      const averagePrice = subProduct.sizes?.[0]?.price || 0;
      const stockLevel = product.subProducts.reduce(
        (total: number, sub: any) => {
          const sizeStock = sub.sizes?.reduce(
            (sizeTotal: number, size: any) => sizeTotal + (size.stock || 0),
            0
          ) || 0;
          return total + sizeStock;
        },
        0
      );

      return {
        _id: String(product._id),
        name: String(product.name || ''),
        category: String(product.category?.name || 'N/A'),
        image: String(subProduct.images?.[0]?.url || ''),
        totalSold: Number(totalSold),
        totalRevenue: String(totalRevenue.toFixed(2)),
        averagePrice: String(averagePrice.toFixed(2)),
        stockLevel: Number(stockLevel),
        status: stockLevel > 10 ? 'In Stock' : stockLevel > 0 ? 'Low Stock' : 'Out of Stock',
        performance: totalSold > 50 ? 'Excellent' : totalSold > 20 ? 'Good' : totalSold > 5 ? 'Average' : 'Poor'
      };
    });

    return detailedProducts;
  } catch (error: any) {
    console.log(error);
    return [];
  }
};

// get detailed size analytics with more information for table display
export const getDetailedSizeAnalytics = async () => {
  try {
    await connectToDatabase();
    const vendor = await verify_vendor();
    
    const products = await Product.find({
      "vendor._id": vendor?.id,
    }).lean();

    const sizeAnalytics: any = {};
    
    products.forEach((product: any) => {
      product.subProducts.forEach((subProduct: any) => {
        subProduct.sizes?.forEach((size: any) => {
          if (!sizeAnalytics[size.size]) {
            sizeAnalytics[size.size] = {
              size: String(size.size),
              totalSold: 0,
              totalStock: 0,
              totalRevenue: 0,
              productCount: 0,
              averagePrice: 0,
              priceSum: 0
            };
          }
          
          sizeAnalytics[size.size].totalSold += Number(size.sold || 0);
          sizeAnalytics[size.size].totalStock += Number(size.stock || 0);
          sizeAnalytics[size.size].totalRevenue += Number((size.sold * size.price) || 0);
          sizeAnalytics[size.size].productCount += 1;
          sizeAnalytics[size.size].priceSum += Number(size.price || 0);
        });
      });
    });

    const detailedSizeData = Object.values(sizeAnalytics).map((data: any) => ({
      size: String(data.size),
      totalSold: Number(data.totalSold),
      totalStock: Number(data.totalStock),
      totalRevenue: String(data.totalRevenue.toFixed(2)),
      productCount: Number(data.productCount),
      averagePrice: String((data.priceSum / data.productCount).toFixed(2)),
      stockStatus: data.totalStock > 50 ? 'High Stock' : data.totalStock > 20 ? 'Medium Stock' : data.totalStock > 0 ? 'Low Stock' : 'Out of Stock',
      popularity: data.totalSold > 100 ? 'Very Popular' : data.totalSold > 50 ? 'Popular' : data.totalSold > 10 ? 'Moderate' : 'Low Demand'
    }));

    return detailedSizeData;
  } catch (error: any) {
    console.log(error);
    return [];
  }
};
