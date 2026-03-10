import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    // Remove auth cookie
    await removeAuthCookie();

    return NextResponse.json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

