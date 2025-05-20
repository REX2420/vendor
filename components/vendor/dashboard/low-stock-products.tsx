import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { FaExclamationTriangle } from "react-icons/fa";
import { getLowStockProducts } from "@/lib/database/actions/vendor/dashboard/dashboard.actions";
const LowStockProducts = async () => {
  const products = await getLowStockProducts().catch((err) => console.log(err));
  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-yellow-700 mb-4 flex items-center gap-2">
        <FaExclamationTriangle className="text-yellow-500" /> Low Stock Products
      </h3>
      <div className="bg-yellow-50 rounded-xl shadow p-4">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="font-semibold text-gray-700 bg-yellow-100">Product Name</TableCell>
                <TableCell className="font-semibold text-gray-700 bg-yellow-100">Size</TableCell>
                <TableCell className="font-semibold text-gray-700 bg-yellow-100">Stock Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products?.lowStockProducts?.length > 0 ? (
                products?.lowStockProducts.map((product: any) =>
                  product.subProducts?.map((subProduct: any) =>
                    subProduct.sizes?.map((size: any) => {
                      if (size && size.qty < 2) {
                        return (
                          <TableRow key={size._id} className="hover:bg-yellow-100">
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{size.size}</TableCell>
                            <TableCell className="text-red-600 font-bold">{size.qty}</TableCell>
                          </TableRow>
                        );
                      }
                      return null;
                    })
                  )
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No low stock products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default LowStockProducts;
