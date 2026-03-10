"use client";

import React from "react";
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductTable({
  products,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) {
  if (products.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">Không tìm thấy sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Hình ảnh</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Tên sản phẩm</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Danh mục</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Giá</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Kho</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Trạng thái</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product._id}
                className={`border-b border-border hover:bg-muted/30 transition-colors ${
                  index % 2 === 0 ? "bg-background" : "bg-muted/10"
                }`}
              >
                {/* Image */}
                <td className="px-4 py-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        Không có ảnh
                      </div>
                    )}
                  </div>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <span className="font-medium text-sm">{product.name}</span>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {product.category}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-3">
                  <span className="font-semibold">
                    {new Intl.NumberFormat('vi-VN').format(product.price)}đ
                  </span>
                </td>

                {/* Stock */}
                <td className="px-4 py-3">
                  <span
                    className={`font-medium ${
                      product.stockQuantity === 0
                        ? "text-red-600"
                        : product.stockQuantity < 10
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {product.stockQuantity}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                    }`}
                  >
                    {product.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onView(product)}
                      title="Xem"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(product)}
                      title="Sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(product._id)}
                      title="Xóa"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <div className="text-sm text-muted-foreground">
            Trang {currentPage} của {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

