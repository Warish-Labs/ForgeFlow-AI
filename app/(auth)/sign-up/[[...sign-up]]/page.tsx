import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--navy-950)]">
      {/* Ambient background */}
      <div
        className="absolute inset-0 bg-grid opacity-60"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[var(--accent-cyan)] opacity-5 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md px-4">
        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#1a6fff",
              colorBackground: "#0d1529",
              colorInputBackground: "#121d38",
              colorText: "#e8f0ff",
              colorTextSecondary: "#8ab3ff",
              colorInputText: "#e8f0ff",
              borderRadius: "0.5rem",
            },
            elements: {
              card: "bg-[#0d1529] border border-[rgba(26,111,255,0.2)] shadow-2xl",
              headerTitle: "text-[#e8f0ff]",
              headerSubtitle: "text-[#8ab3ff]",
              socialButtonsBlockButton:
                "border border-[rgba(26,111,255,0.2)] bg-[#121d38] text-[#e8f0ff] hover:bg-[#1a2544]",
              formFieldInput:
                "bg-[#121d38] border-[rgba(26,111,255,0.2)] text-[#e8f0ff] focus:border-[#1a6fff]",
              formButtonPrimary:
                "bg-gradient-to-r from-[#1a6fff] to-[#00d4ff] hover:opacity-90",
              footerActionLink: "text-[#1a6fff] hover:text-[#00d4ff]",
            },
          }}
        />
      </div>
    </div>
  );
}
