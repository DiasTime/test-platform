import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { createSession, findOrCreateUser } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(`login:${clientIp}`, { maxRequests: 5, windowMs: 60000 });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "Слишком много попыток. Попробуйте позже." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const sanitizedBody = {
      email: sanitizeInput(body.email || ""),
      iin: sanitizeInput(body.iin || ""),
      firstName: sanitizeInput(body.firstName || ""),
      lastName: sanitizeInput(body.lastName || ""),
    };

    const validatedData = loginSchema.parse(sanitizedBody);

    const user = await findOrCreateUser(validatedData);
    const token = await createSession(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Ошибка авторизации" }, { status: 500 });
  }
}
