"use client";

import React, { useState, useEffect } from "react";
import { Package, CheckCircle, XCircle, Activity } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import CategoryChart from "@/components/dashboard/CategoryChart";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from API
    const fetchData = async () => {
      try {
        const response = await fetch("/api/product");
        const result = await response.json();
        
        if (result.success && result.data) {
          const products = result.data;
          
          const total = products.length;
          const active = products.filter((p) => p.status === "active").length;
          const outOfStock = products.filter((p) => p.stockQuantity === 0).length;

          // Calculate products by category
          const categoryMap = {};
          products.forEach((product) => {
            categoryMap[product.category] = (categoryMap[product.category] || 0) + 1;
          });

          const categories = Object.keys(categoryMap).map((category) => ({
            category,
            count: categoryMap[category],
          }));

          setStats({ totalProducts: total, activeProducts: active, outOfStock });
          setCategoryData(categories);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
        <p className="text-muted-foreground">Chào mừng đến với trang quản lý</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Tổng sản phẩm"
          value={stats.totalProducts}
          icon={Package}
          color="default"
        />
        <StatCard
          title="Sản phẩm hoạt động"
          value={stats.activeProducts}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Hết hàng"
          value={stats.outOfStock}
          icon={XCircle}
          color="danger"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={categoryData} />
        
        {/* Additional Info Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Tình trạng cửa hàng</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Tổng sản phẩm</span>
              <span className="text-sm font-bold">{stats.totalProducts}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Còn hàng</span>
              <span className="text-sm font-bold text-green-600">
                {stats.totalProducts - stats.outOfStock}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Hết hàng</span>
              <span className="text-sm font-bold text-red-600">{stats.outOfStock}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Hoạt động</span>
              <span className="text-sm font-bold text-blue-600">{stats.activeProducts}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

