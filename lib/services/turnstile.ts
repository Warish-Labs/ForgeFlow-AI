/**
 * lib/services/turnstile.ts
 *
 * Cloudflare Turnstile bot verification helper.
 */

export async function verifyTurnstileToken(
  token?: string,
  ip?: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // In development, if secret key is not set or test key is used, auto-pass
  if (!secretKey || secretKey === "0x4AAAAAAAAAAAAAAAAAAAAAAAAA") {
    return true;
  }

  if (!token) return false;

  try {
    const body = new URLSearchParams();
    body.append("secret", secretKey);
    body.append("response", token);
    if (ip) body.append("remoteip", ip);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
      }
    );

    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch (err) {
    console.error("[verifyTurnstileToken] Error validating token:", err);
    return false;
  }
}
