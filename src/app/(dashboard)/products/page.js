"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, AlertCircle } from "lucide-react";
import ProductFilters from "@/components/products/ProductFilters";
import ProductTable from "@/components/products/ProductTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

// Categories
const CATEGORIES = ["T-Shirt", "Mug", "Hoodie", "Phone Case"];

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("price-asc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, view, edit
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "T-Shirt",
    price: "",
    stockQuantity: "",
    status: "active",
    imageUrl: "",
    description: "",
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/product");
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      } else {
        addToast("Failed to load products", "error");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      addToast("Error loading products", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((product) => product.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== "All") {
      result = result.filter((product) => product.status === selectedStatus);
    }

    // Sort by price or name
    result.sort((a, b) => {
      if (sortOrder === "price-asc") {
        return a.price - b.price;
      } else if (sortOrder === "price-desc") {
        return b.price - a.price;
      } else if (sortOrder === "name-asc") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return result;
  }, [products, searchTerm, selectedCategory, selectedStatus, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, sortOrder]);

  // Handlers
  const handleAddNew = () => {
    setModalMode("add");
    setFormData({
      name: "",
      category: "T-Shirt",
      price: "",
      stockQuantity: "",
      status: "active",
      imageUrl: "",
      description: "",
    });
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleView = (product) => {
    setModalMode("view");
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      status: product.status,
      imageUrl: product.imageUrl || "",
      description: product.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/product?id=${id}`, {
          method: "DELETE",
        });
        const result = await response.json();
        
        if (result.success) {
          setProducts(products.filter((p) => p._id !== id));
          addToast("Product deleted successfully!", "success");
        } else {
          addToast("Failed to delete product", "error");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        addToast("Error deleting product", "error");
      }
    }
  };

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    }
    
    // Price validation
    if (formData.price === "" || formData.price === null || formData.price === undefined) {
      errors.price = "Price is required";
    } else if (parseFloat(formData.price) < 0) {
      errors.price = "Price must be a positive number";
    }
    
    // Stock validation
    if (formData.stockQuantity === "" || formData.stockQuantity === null || formData.stockQuantity === undefined) {
      errors.stockQuantity = "Stock quantity is required";
    } else if (parseInt(formData.stockQuantity) < 0) {
      errors.stockQuantity = "Stock must be a positive number";
    }
    
    // Image validation (now checks if image is selected - base64 string)
    if (!formData.imageUrl || !formData.imageUrl.trim()) {
      errors.imageUrl = "Image is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      addToast("Please fill in all required fields", "error");
      return;
    }
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
    };

    try {
      if (modalMode === "add") {
        // Tạo mới san phẩm 
        const response = await fetch("/api/product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        });
        const result = await response.json();
        
        if (result.success) {
          setProducts([...products, result.data]);
          addToast("Product added successfully!", "success");
        } else {
          addToast("Failed to add product", "error");
          return;
        }
      } else if (modalMode === "edit") {
        // Cập nhật sản phẩm
        const response = await fetch("/api/product", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: selectedProduct._id, ...productData }),
        });
        const result = await response.json();
        
        if (result.success) {
          setProducts(
            products.map((p) =>
              p._id === selectedProduct._id ? result.data : p
            )
          );
          addToast("Product updated successfully!", "success");
        } else {
          addToast("Failed to update product", "error");
          return;
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      addToast("Error saving product", "error");
      return;
    }
    
    setShowModal(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-muted-foreground">Manage your product inventory</p>
      </div>

      {/* Filters */}
      <ProductFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onAddNew={handleAddNew}
      />

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {paginatedProducts.length} of {filteredProducts.length} products
      </div>

      {/* Product Table */}
      <ProductTable
        products={paginatedProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">
                {modalMode === "add" && "Add New Product"}
                {modalMode === "view" && "Product Details"}
                {modalMode === "edit" && "Edit Product"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            {modalMode === "view" ? (
              <div className="p-6 space-y-6">
                {/* Large Image */}
                {selectedProduct?.imageUrl && (
                  <div className="w-full h-64 rounded-xl overflow-hidden bg-muted">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Product Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedProduct?.name}</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mt-2">
                      {selectedProduct?.category}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-2xl font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN').format(selectedProduct?.price)}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Stock</p>
                      <p className={`text-2xl font-bold ${
                        selectedProduct?.stockQuantity === 0
                          ? "text-red-500"
                          : selectedProduct?.stockQuantity < 10
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}>
                        {selectedProduct?.stockQuantity}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedProduct?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {selectedProduct?.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  {selectedProduct?.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-foreground">{selectedProduct?.description}</p>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this product?")) {
                        try {
                          const response = await fetch(`/api/product?id=${selectedProduct._id}`, {
                            method: "DELETE",
                          });
                          const result = await response.json();
                          
                          if (result.success) {
                            setProducts(products.filter((p) => p._id !== selectedProduct._id));
                            addToast("Product deleted successfully!", "success");
                            setShowModal(false);
                          } else {
                            addToast("Failed to delete product", "error");
                          }
                        } catch (error) {
                          console.error("Error deleting product:", error);
                          addToast("Error deleting product", "error");
                        }
                      }
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setModalMode("edit");
                      setFormData({
                        name: selectedProduct.name,
                        category: selectedProduct.category,
                        price: selectedProduct.price.toString(),
                        stockQuantity: selectedProduct.stockQuantity.toString(),
                        status: selectedProduct.status,
                        imageUrl: selectedProduct.imageUrl || "",
                        description: selectedProduct.description || "",
                      });
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter product name"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <div className="flex items-center gap-2 h-10">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: "active" })}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          formData.status === "active"
                            ? "bg-green-100 border-green-300 text-green-700"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: "inactive" })}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          formData.status === "inactive"
                            ? "bg-gray-100 border-gray-300 text-gray-700"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (đ) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="0"
                    />
                    {formErrors.price && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {formErrors.price}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Stock Quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="0"
                    />
                    {formErrors.stockQuantity && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {formErrors.stockQuantity}
                      </p>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">Image <span className="text-red-500">*</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full h-10 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {formErrors.imageUrl && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {formErrors.imageUrl}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-24 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Enter product description (optional)"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {modalMode === "add" ? "Save" : "Update"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

