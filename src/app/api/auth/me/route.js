import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    // Lấy thông tin user hiện tại từ token
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Không xác thực được người dùng" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

