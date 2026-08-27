"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormattedMarkdown } from "@/components/ui/FormattedMarkdown";
import { sendChatMessageAction } from "@/lib/actions/ai";
import { BotIcon, SendIcon, XIcon, UserIcon, SparklesIcon } from "lucide-react";

interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ProjectChatDrawerProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectChatDrawer({
  projectId,
  projectName,
  isOpen,
  onClose,
}: ProjectChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I am your **ForgeFlow Architecture Copilot** for **${projectName}**.\n\nAsk me anything about technology trade-offs, architecture patterns, or requirement details! You can also ask me to **search Tavily** for live web research.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput("");

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    const result = await sendChatMessageAction(projectId, userText);
    setIsSending(false);

    if (!result.success) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Failed to get response**: ${result.error.message}`,
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: result.data.userMessageId,
        role: "assistant",
        content: result.data.assistantContent,
      },
    ]);
  }

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#3b82f6]/40 bg-[#050814] shadow-2xl backdrop-blur-xl transition-all"
      role="dialog"
      aria-modal="true"
      aria-label={`AI Chat for ${projectName}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#3b82f6]/20 px-4 py-3.5 bg-[#0b1120]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-[#3b82f6]/40 bg-[#151f32]">
            <BotIcon className="h-4 w-4 text-[#38bdf8]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f8fafc]">
              Architecture Copilot
            </h3>
            <p className="text-[11px] text-[#64748b] line-clamp-1">{projectName}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded p-1.5 text-[#64748b] hover:bg-[#151f32] hover:text-[#f8fafc]"
          aria-label="Close chat drawer"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                msg.role === "user"
                  ? "border-[#3b82f6]/40 bg-[#151f32] text-[#38bdf8]"
                  : "border-[#3b82f6]/50 bg-[#0b1120] text-[#f8fafc]"
              }`}
            >
              {msg.role === "user" ? <UserIcon className="h-3.5 w-3.5" /> : <SparklesIcon className="h-3.5 w-3.5 text-[#38bdf8]" />}
            </div>

            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 leading-relaxed border ${
                msg.role === "user"
                  ? "bg-[#151f32] text-[#f8fafc] border-[#3b82f6]/40"
                  : "bg-[#0b1120] text-[#f8fafc] border-[#3b82f6]/20"
              }`}
            >
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <FormattedMarkdown content={msg.content} />
              )}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-[11px] text-[#64748b] italic pl-9">
            <SparklesIcon className="h-3.5 w-3.5 animate-spin text-[#38bdf8]" />
            Copilot is analyzing project state & Tavily web findings...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="border-t border-[#3b82f6]/20 p-3 bg-[#0b1120]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask architecture question or search Tavily..."
            className="flex-1 rounded border border-[#3b82f6]/30 bg-[#050814] px-3 py-2 text-xs text-[#f8fafc] placeholder-[#64748b] focus:border-[#38bdf8] focus:outline-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isSending}
            className="px-3 bg-[#2563eb] text-white hover:bg-[#1d4ed8] font-medium"
          >
            <SendIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
