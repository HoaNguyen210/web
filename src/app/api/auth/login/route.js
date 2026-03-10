import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/userModel";
import { createToken, setAuthCookie, comparePassword } from "@/lib/auth";

export async function POST(request) {
  try {
    // Connect database
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 400 }
      );
    }

    // Xác thực định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Định dạng mail không hợp lệ" },
        { status: 400 }
      );
    }

    // Tim kiếm người dùng theo email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Xác thực mật khẩu
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Tạo JWT token
    const token = await createToken(user);

    // Tạo response object và set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });

    await setAuthCookie(token, response);


    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

