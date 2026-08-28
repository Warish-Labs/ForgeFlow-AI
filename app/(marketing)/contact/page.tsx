import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { MailIcon, MessageSquareIcon, ShieldCheckIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — ForgeFlow AI",
  description: "Get in touch with the ForgeFlow AI engineering and support team. Inquiries, enterprise plans, and technical assistance.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc] flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-[#1b2338] bg-[#070a14]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-[#1060ee] bg-[#1060ee]/20 px-4 py-1.5 text-xs font-mono font-bold text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all"
          >
            Launch Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1100px] mx-auto px-6 py-12 md:py-20 flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Info Column */}
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="pill-tag uppercase">CONTACT SUPPORT & SALES</span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#f3f6fc]">
              Let's talk architecture.
            </h1>
            <p className="text-sm text-[#9aa4b8] leading-relaxed">
              Have questions about platform integration, enterprise token limits, or feature requests?
              Send us a message and our team will get back to you within 24 hours.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl border border-[#1b2338] bg-[#0d1220]">
              <div className="h-10 w-10 rounded-xl bg-[#1060ee]/20 border border-[#1060ee]/40 flex items-center justify-center text-[#38b6ff] shrink-0">
                <MailIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#f3f6fc]">Direct Email Support</h4>
                <p className="text-xs text-[#9aa4b8]">warishdeveloper@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl border border-[#1b2338] bg-[#0d1220]">
              <div className="h-10 w-10 rounded-xl bg-[#2fe6b0]/20 border border-[#2fe6b0]/40 flex items-center justify-center text-[#2fe6b0] shrink-0">
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#f3f6fc]">Protected & Verified</h4>
                <p className="text-xs text-[#9aa4b8]">Cloudflare Turnstile bot verification & encrypted message delivery.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl border border-[#1b2338] bg-[#0d1220]">
              <div className="h-10 w-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                <MessageSquareIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#f3f6fc]">In-App Admin Dispatch</h4>
                <p className="text-xs text-[#9aa4b8]">Replies dispatched straight to your inbox from admin control center.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <ContactForm />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#1b2338] py-6 text-center text-xs text-[#5c6980]">
        ForgeFlow AI · Built by <a href="https://github.com/mdwarishansari" target="_blank" rel="noopener noreferrer" className="text-[#38b6ff] hover:underline">mdwarishansari</a>
      </footer>
    </div>
  );
}
