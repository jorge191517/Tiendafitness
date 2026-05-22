import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome-email";

export async function POST(request: NextRequest) {
  console.log("[WELCOME_EMAIL_API] Recibido");

  try {
    const body = await request.json();
    const userName = body?.userName || "atleta";
    const userEmail = body?.userEmail;

    if (!userEmail || typeof userEmail !== "string") {
      console.warn("[WELCOME_EMAIL_API] userEmail invalido");
      return NextResponse.json(
        { ok: false, error: "userEmail invalido" },
        { status: 400 }
      );
    }

    await sendWelcomeEmail({
      userName,
      userEmail,
    });

    console.log("[WELCOME_EMAIL_API] Enviado a:", userEmail);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[WELCOME_EMAIL_API] Error:", error);

    return NextResponse.json(
      { ok: false, error: "Error enviando email de bienvenida" },
      { status: 500 }
    );
  }
}