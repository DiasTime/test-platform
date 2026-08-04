import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Сайт заблокирован: все запросы получают страницу «Сайт недоступен» (503).
// Чтобы снова открыть сайт, поставьте false.
const SITE_UNAVAILABLE = true;

const unavailableHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Сайт недоступен</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background: #f3f4f6;
      color: #111827;
      text-align: center;
      padding: 24px;
    }
    .box { max-width: 480px; }
    .icon { font-size: 64px; margin-bottom: 24px; }
    h1 { font-size: 28px; margin-bottom: 12px; }
    p { font-size: 16px; color: #6b7280; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="box">
    <div class="icon">&#128679;</div>
    <h1>Сайт недоступен</h1>
    <p>В данный момент сайт временно не работает. Пожалуйста, зайдите позже.</p>
  </div>
</body>
</html>`;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
);

const publicPaths = ["/", "/login", "/api/auth/login", "/api/admin/create-first-admin", "/setup"];
const adminPaths = ["/admin"];

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SITE_UNAVAILABLE) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Сайт недоступен" },
        { status: 503, headers: { "Retry-After": "3600", ...securityHeaders } }
      );
    }
    return new NextResponse(unavailableHtml, {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "3600",
        ...securityHeaders,
      },
    });
  }

  if (publicPaths.some((path) => pathname === path || pathname.startsWith("/api/auth"))) {
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (adminPaths.some((path) => pathname.startsWith(path))) {
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/test", request.url));
      }
    }

    const response = NextResponse.next();
    response.headers.set("X-User-Id", payload.id as string);
    response.headers.set("X-User-Role", payload.role as string);
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
