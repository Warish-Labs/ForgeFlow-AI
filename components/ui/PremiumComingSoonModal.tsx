"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { SparklesIcon, ZapIcon, CheckCircle2Icon, ShieldCheckIcon, XIcon } from "lucide-react";

interface PremiumComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function PremiumComingSoonModal({
  isOpen,
  onClose,
  title = "ForgeFlow Premium — Coming Soon",
  description = "You've reached a free tier boundary or discovered a premium capability. Upgrade to unlock full scale autonomous software architecture tools.",
}: PremiumComingSoonModalProps) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail("");
      onClose();
    }, 2500);
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border border-[#1060ee]/40 bg-[#070a14] text-[#f3f6fc] p-6 shadow-2xl rounded-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-[#1060ee]/20 border border-[#1060ee]/40 flex items-center justify-center text-[#38b6ff] shrink-0">
                <SparklesIcon className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#1060ee]/20 text-[#38b6ff] border border-[#1060ee]/30">
                  PREMIUM — COMING SOON
                </span>
                <Dialog.Title className="text-base md:text-lg font-bold text-[#f3f6fc] mt-1">
                  {title}
                </Dialog.Title>
              </div>
            </div>
            <Dialog.Close onClick={onClose} className="rounded-lg p-1 text-[#9aa4b8] hover:text-[#f3f6fc] hover:bg-[#1b2338]">
              <XIcon className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-xs text-[#9aa4b8] leading-relaxed mt-3">
            {description}
          </Dialog.Description>

          {/* Feature Highlights Grid */}
          <div className="my-4 space-y-2.5 rounded-xl border border-[#1b2338] bg-[#0d1220] p-4">
            <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#38b6ff] flex items-center gap-1.5">
              <ZapIcon className="h-3.5 w-3.5" /> Upcoming Pro Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-[#f3f6fc]">
              <li className="flex items-center gap-2">
                <CheckCircle2Icon className="h-4 w-4 text-[#2fe6b0] shrink-0" />
                <span>Unlimited Active Software Projects</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2Icon className="h-4 w-4 text-[#2fe6b0] shrink-0" />
                <span>5,000,000 Monthly AI Token Quota</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2Icon className="h-4 w-4 text-[#2fe6b0] shrink-0" />
                <span>Instant GitHub & Jira Blueprint Export</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2Icon className="h-4 w-4 text-[#2fe6b0] shrink-0" />
                <span>Real-Time Team Architecture Collaboration</span>
              </li>
            </ul>
          </div>

          {/* Priority Waitlist Form */}
          {!isSubscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <label className="text-[11px] font-medium text-[#9aa4b8] block">
                Get early priority notification & launch access:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="developer@warishlabs.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-xl border border-[#1b2338] bg-[#070a14] px-3.5 py-2 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#1060ee] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all shadow-lg shrink-0"
                >
                  Join Waitlist
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl bg-[#2fe6b0]/10 border border-[#2fe6b0]/40 p-3 text-center text-xs text-[#2fe6b0] font-semibold flex items-center justify-center gap-2">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>✓ You're on the priority notification list!</span>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
