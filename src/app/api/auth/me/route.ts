import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ success: false, error: "Не авторизован" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: session.id,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
      role: session.role,
    },
  });
}
