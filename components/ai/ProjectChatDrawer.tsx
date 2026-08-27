"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
      content: `Hello! I'm your ForgeFlow AI Architecture Copilot for **${projectName}**. Ask me anything about technology trade-offs, architecture patterns, or requirement details!`,
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
          content: `⚠️ Failed to get response: ${result.error.message}`,
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
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[var(--border-accent)] bg-[var(--navy-900)] shadow-2xl backdrop-blur-lg transition-all"
      role="dialog"
      aria-modal="true"
      aria-label={`AI Chat for ${projectName}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3.5 bg-[var(--navy-800)]/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-glow)] border border-[var(--border-accent)]">
            <BotIcon className="h-4 w-4 text-[var(--accent-cyan)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Architecture Copilot
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">{projectName}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--navy-700)] hover:text-[var(--text-primary)]"
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
                  ? "border-blue-700 bg-blue-950 text-blue-300"
                  : "border-[var(--border-accent)] bg-[var(--navy-800)] text-[var(--accent-cyan)]"
              }`}
            >
              {msg.role === "user" ? <UserIcon className="h-3.5 w-3.5" /> : <SparklesIcon className="h-3.5 w-3.5" />}
            </div>

            <div
              className={`max-w-[82%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--accent-blue)] text-white"
                  : "border border-[var(--border-subtle)] bg-[var(--navy-800)]/70 text-[var(--text-secondary)]"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] italic pl-9">
            <SparklesIcon className="h-3.5 w-3.5 animate-spin text-[var(--accent-cyan)]" />
            Copilot is thinking...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="border-t border-[var(--border-subtle)] p-3 bg-[var(--navy-800)]/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about tech stack, patterns, or architecture..."
            className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--navy-800)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
          />
          <Button
            type="submit"
            variant="accent"
            size="sm"
            disabled={!input.trim() || isSending}
            className="px-3"
          >
            <SendIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
