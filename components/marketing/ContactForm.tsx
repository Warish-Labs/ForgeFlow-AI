"use client";

import { useState } from "react";
import { submitContactMessageAction } from "@/lib/actions/contact";
import { SendIcon, Loader2Icon, CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Site key from env or Cloudflare testing sitekey (0x4AAAAAAAAAAAAAAAAAAAAAAAAA always passes)
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAAAAAAAAAAAAAAAAAAAA";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setIsSubmitting(true);
    setStatus(null);

    const res = await submitContactMessageAction({
      name,
      email,
      subject,
      message,
      turnstileToken: token || "dev-bypass-token",
    });

    setStatus(res);
    setIsSubmitting(false);

    if (res.success) {
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setToken("");
    }
  }

  return (
    <div className="rounded-2xl border border-[#1b2338] bg-[#0d1220] p-6 md:p-8 space-y-6 shadow-2xl">
      <div>
        <h3 className="text-lg font-bold text-[#f3f6fc]">Send Us a Message</h3>
        <p className="text-xs text-[#9aa4b8]">Fill out the form below to reach our team.</p>
      </div>

      {status && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            status.success
              ? "bg-[#2fe6b0]/10 border-[#2fe6b0]/40 text-[#2fe6b0]"
              : "bg-rose-500/10 border-rose-500/40 text-rose-400"
          }`}
        >
          {status.success ? (
            <CheckCircle2Icon className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircleIcon className="h-5 w-5 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9aa4b8]">Your Name *</label>
            <input
              type="text"
              placeholder="Alex Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] px-4 py-2.5 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9aa4b8]">Email Address *</label>
            <input
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] px-4 py-2.5 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono text-[#9aa4b8]">Subject *</label>
          <input
            type="text"
            placeholder="Enterprise Plan Inquiry / Feedback"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] px-4 py-2.5 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono text-[#9aa4b8]">Message *</label>
          <textarea
            rows={5}
            placeholder="Tell us about your project requirements or question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-3 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none leading-relaxed"
          />
        </div>

        {/* Cloudflare Turnstile bot widget */}
        <div className="py-1">
          <Turnstile
            siteKey={siteKey}
            onSuccess={(t) => setToken(t)}
            options={{ theme: "dark" }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !name || !email || !subject || !message}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1060ee] py-3 text-xs font-bold text-white hover:bg-[#0a2a9c] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <SendIcon className="h-4 w-4" /> Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
