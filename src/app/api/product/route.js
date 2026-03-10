import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/productModel";

// GET /api/product - Lấy data sản phẩm từ db
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    
    let query = {};
    
    if (category && category !== "All") {
      query.category = category;
    }
    
    if (status && status !== "All") {
      query.status = status;
    }
    
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Lỗi đấy data sản phẩm:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/product - Add
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    if (!body.name || body.price === "" || body.price === null || body.price === undefined || body.stockQuantity === "" || body.stockQuantity === null || body.stockQuantity === undefined) {
      return NextResponse.json(
        { success: false, error: "Thiếu các trường bắt buộc: name, price, stockQuantity" },
        { status: 400 }
      );
    }
    
    const product = await Product.create(body);
    
    return NextResponse.json({
      success: true,
      data: product,
    }, { status: 201 });
  } catch (error) {
    console.error("Lỗi tạo sản phẩm:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT /api/product - Update
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { _id, ...updateData } = body;
    
    const product = await Product.findByIdAndUpdate(
      _id,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/product - Delete
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID sản phẩm là lỗi" },
        { status: 400 }
      );
    }
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Lỗi xóa sản phẩm:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

