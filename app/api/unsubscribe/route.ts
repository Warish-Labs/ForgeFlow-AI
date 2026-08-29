import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email || !email.includes("@")) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Invalid Request — ForgeFlow AI</title></head>
        <body style="background:#070a14; color:#f3f6fc; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="background:#0d1220; border:1px solid #1b2338; padding:32px; border-radius:16px; text-align:center; max-width:400px;">
            <h2 style="color:#f43f5e; margin-top:0;">Invalid Unsubscribe Link</h2>
            <p style="color:#9aa4b8; font-size:14px;">The email parameter provided is missing or invalid.</p>
          </div>
        </body>
      </html>`,
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    await prisma.watchlist.updateMany({
      where: { email: cleanEmail },
      data: { status: "unsubscribed" },
    });

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>Unsubscribed — ForgeFlow AI</title></head>
        <body style="background:#070a14; color:#f3f6fc; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="background:#0d1220; border:1px solid #1060ee; padding:40px 32px; border-radius:20px; text-align:center; max-width:450px; shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
            <div style="background:rgba(47,230,176,0.1); border:1px solid rgba(47,230,176,0.3); color:#2fe6b0; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:24px; font-weight:bold;">✓</div>
            <h2 style="color:#f3f6fc; margin:0 0 8px 0; font-size:20px;">You Have Been Unsubscribed</h2>
            <p style="color:#9aa4b8; font-size:13px; line-height:1.6; margin-bottom:24px;">
              <strong>${cleanEmail}</strong> has been successfully removed from all ForgeFlow AI announcement & waitlist mailings.
            </p>
            <a href="https://forgeflow.warishlabs.in" style="background:#1060ee; color:#ffffff; padding:10px 24px; border-radius:10px; font-size:13px; font-weight:bold; text-decoration:none; display:inline-block;">Return to ForgeFlow AI</a>
          </div>
        </body>
      </html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error("[Unsubscribe Route] Failed to update watchlist status:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
