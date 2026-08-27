import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/ui/Footer";

export const metadata = {
  title: "Privacy Policy | ForgeFlow AI",
  description: "Privacy policy and data protection practices for ForgeFlow AI.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070a14] text-[#f3f6fc] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[900px] mx-auto px-6 pt-32 pb-20 space-y-8 text-xs md:text-sm leading-relaxed text-[#9aa4b8]">
        <div className="space-y-2 border-b border-[#1b2338] pb-6">
          <h1 className="text-3xl font-bold text-[#f3f6fc]">Privacy Policy</h1>
          <p className="text-xs text-[#5c6980]">Last Updated: August 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f3f6fc]">1. Introduction</h2>
          <p>
            ForgeFlow AI ("we", "our", or "us"), operated by WarishLabs, respects your privacy and is committed to protecting the personal information you share with us when using our platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f3f6fc]">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Account Information</strong>: Email address, user ID, and profile details managed securely through authentication provider Clerk.</li>
            <li><strong>Project Content</strong>: Software vision prompts, requirements, architecture specs, and roadmaps created within your workspaces.</li>
            <li><strong>Usage Data</strong>: Aggregated, anonymized telemetry data (e.g., page views, feature usage duration, system performance logs).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f3f6fc]">3. How We Use Information</h2>
          <p>
            We use collected data exclusively to provide, maintain, and optimize our services, manage user accounts, store persistent project state, and respond to support queries. We do not sell or rent user data to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f3f6fc]">4. Single-Tenant Data Isolation</h2>
          <p>
            Project specifications and requirements created in ForgeFlow AI are strictly isolated by owner ID constraints at the database level to ensure privacy and data security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#f3f6fc]">5. Cookies and Analytics</h2>
          <p>
            We may use session cookies and privacy-preserving web analytics to analyze traffic patterns and improve application performance.
          </p>
        </section>

        <section className="space-y-3 border-t border-[#1b2338] pt-6">
          <h2 className="text-base font-semibold text-[#f3f6fc]">6. Contact Us</h2>
          <p>
            For questions regarding this Privacy Policy or data requests, please visit{" "}
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
