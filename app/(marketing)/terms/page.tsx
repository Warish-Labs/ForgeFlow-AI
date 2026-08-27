import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/ui/Footer";

export const metadata = {
  title: "Terms of Service | ForgeFlow AI",
  description: "Terms of service and user agreements for ForgeFlow AI.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[900px] mx-auto px-6 pt-32 pb-20 space-y-8 text-xs md:text-sm leading-relaxed text-[#9aa4b8]">
        <div className="space-y-2 border-b border-[#1b2338] pb-6">
          <h1 className="text-3xl font-bold text-[#f3f6fc]">Terms of Service</h1>
          <p className="text-xs text-[#5c6980]">Last Updated: August 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f3f6fc]">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ForgeFlow AI, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f3f6fc]">2. Description of Platform</h2>
          <p>
            ForgeFlow AI provides software architecture synthesis, requirements extraction, technology stack recommendations, and execution roadmap generation tools.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f3f6fc]">3. User Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to use the platform for unlawful, harmful, or unauthorized activities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f3f6fc]">4. Intellectual Property</h2>
          <p>
            You retain all rights to project ideas, requirements, and content created within your workspace. ForgeFlow AI and WarishLabs retain all rights to platform architecture, source code, visual branding, and trademarks.
          </p>
        </section>

        <section className="space-y-3 border-t border-[#1b2338] pt-6">
          <h2 className="text-base font-semibold text-[#f3f6fc]">5. Inquiries</h2>
          <p>
            For questions regarding these Terms, contact us via{" "}
            <a
              href="https://warishlabs.in/contact"
              target="_blank"
              rel="noreferrer"
              className="text-[#38b6ff] underline"
            >
              WarishLabs Contact Page
            </a>.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
