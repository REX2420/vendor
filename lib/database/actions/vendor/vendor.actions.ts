"use server";
import mongoose from "mongoose";
import Vendor from "../../models/vendor.model";
import { connectToDatabase } from "./../../connect";
import { cookies } from "next/headers";
const jwt = require("jsonwebtoken");
const { ObjectId } = mongoose.Types;

// get vendor cookies for vendor
export const getVendorCookiesandFetchVendor = async () => {
  try {
    const cookieStore = await cookies();
    const vendor_token = cookieStore.get("vendor_token");
    
    if (!vendor_token) {
      return {
        message: "Vendor token is invalid!",
        vendor: [],
        success: false,
      };
    }

    let decode;
    try {
      decode = jwt.verify(vendor_token?.value, process.env.JWT_SECRET);
    } catch (jwtError) {
      // If JWT is invalid, delete the cookie and return false
      cookieStore.delete("vendor_token");
      return {
        message: "Invalid token!",
        vendor: [],
        success: false,
      };
    }

    await connectToDatabase();
    const vendor = await Vendor.findById(decode.id);
    
    if (!vendor) {
      cookieStore.delete("vendor_token");
      return {
        message: "Vendor doesn't exist.",
        vendor: [],
        success: false,
      };
    }

    return {
      message: "Successfully found vendor on database.",
      vendor: JSON.parse(JSON.stringify(vendor)),
      success: true,
    };
  } catch (error: any) {
    console.error("Error in getVendorCookiesandFetchVendor:", error);
    return {
      message: "An error occurred while fetching vendor data.",
      vendor: [],
      success: false,
    };
  }
};

// get single vendor
export const getSingleVendor = async (vendorId: string) => {
  try {
    await connectToDatabase();
    const vendorObjectId = new ObjectId(vendorId);

    const vendor = await Vendor.findById(vendorObjectId);
    if (!vendor) {
      return {
        message: "Vendor does'nt exists.",
        success: false,
        vendor: [],
      };
    }
    return {
      success: true,
      message: "Successfully vendor found",
      vendor,
    };
  } catch (error: any) {
    console.log(error);
  }
};

// check vendor for vendor
export const checkVendor = async (vendorId: string) => {
  try {
    await connectToDatabase();
    const vendorObjectId = new ObjectId(vendorId);

    const vendor = await Vendor.findById(vendorObjectId);
    if (!vendor) {
      return {
        message: "Vendor not found.",
        success: false,
      };
    }
    return {
      message: "Vendor found",
      success: true,
    };
  } catch (error: any) {
    console.log(error);
  }
};

// check vendor if he was verified by an admin for vendor
export const checkVendorVerified = async (vendorId: string) => {
  try {
    await connectToDatabase();
    const vendorObjectId = new ObjectId(vendorId);

    const vendor = await Vendor.findById(vendorObjectId);
    if (!vendor) {
      return {
        message: "Vendor not found.",
        success: false,
      };
    }
    const isVerified = vendor.verified;
    if (isVerified) {
      return {
        message: "Vendor was verified.",
        success: true,
      };
    } else {
      return {
        message: "Vendor was not verified!",
        success: false,
      };
    }
  } catch (error: any) {
    console.log(error);
  }
};
