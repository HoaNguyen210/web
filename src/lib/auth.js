import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production"
);

// Cookie name
export const AUTH_COOKIE_NAME = "auth_token";

// Demo user credentials (hardcoded as requested)
// const DEMO_USER = {
//   email: "admin@gmail.com",
//   password: "Admin@123",
//   name: "Admin User",
// };

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Create JWT token
 */
export async function createToken(user) {
  const token = await new SignJWT({
    userId: user._id?.toString() || "demo",
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Set auth cookie
 * @param {string} token - JWT token to set
 * @param {NextResponse} response - NextResponse object to set cookie on
 */
export async function setAuthCookie(token, response = null) {
  if (response) {
    // Set cookie directly on the response object
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  } else {
    // Fallback: use cookies() from next/headers
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  }
}

/**
 * Get auth cookie
 */
export async function getAuthCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return token?.value || null;
}

//Remove auth cookie

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/*Get current user from cookie*/
export async function getCurrentUser() {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return payload;
}

/**
 * Get current user account from database
 * This fetches the full user data including sensitive fields
 */
export async function getCurrentUserAccount() {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Import database modules here to avoid edge runtime issues
  const { default: connectDB } = await import("@/lib/db");
  const { default: User } = await import("@/models/userModel");

  // Connect to database
  await connectDB();

  const user = await User.findById(payload.userId).select("-password");
  
  if (!user) return null;

  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

/**
 * Xác thực thông tin đăng nhập
 */
// export async function validateCredentials(email, password) {
//   // Demo: Check against hardcoded credentials
//   if (email === DEMO_USER.email && password === DEMO_USER.password) {
//     return {
//       _id: "demo-user-id",
//       email: DEMO_USER.email,
//       name: DEMO_USER.name,
//     };
//   }

//   // In production, you would query the database:
//   // const user = await User.findOne({ email });
//   // if (user && await comparePassword(password, user.password)) {
//   //   return user;
//   // 

//   return null;
// }

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

