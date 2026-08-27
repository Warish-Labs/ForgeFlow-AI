"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormattedMarkdown } from "@/components/ui/FormattedMarkdown";
import { sendChatMessageAction } from "@/lib/actions/ai";
import { HammerIcon, SendIcon, XIcon, UserIcon, SparklesIcon } from "lucide-react";

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
      content: `Hello! I am **ForgeFlow Agent**, your AI agent for **${projectName}**.\n\nI can answer questions grounded in this project's stored state or propose technical stack and architecture updates.\n\nTry asking: *"change the stack from Next.js to React.js"* or *"how do I see the roadmap?"*`,
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
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#1b2338] bg-[#070a14] shadow-2xl backdrop-blur-xl transition-all"
      role="dialog"
      aria-modal="true"
      aria-label={`ForgeFlow Agent for ${projectName}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1b2338] px-4 py-3.5 bg-[#0d1220]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-[#1060ee]/40 bg-[#131a2c] text-[#38b6ff]">
            <HammerIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#f3f6fc]">
              ForgeFlow Agent
            </h3>
            <p className="text-[11px] text-[#9aa4b8] line-clamp-1">{projectName}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded p-1.5 text-[#9aa4b8] hover:bg-[#131a2c] hover:text-[#f3f6fc]"
          aria-label="Close ForgeFlow Agent chat drawer"
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
                  ? "border-[#1060ee] bg-[#131a2c] text-[#38b6ff]"
                  : "border-[#1b2338] bg-[#0d1220] text-[#f3f6fc]"
              }`}
            >
              {msg.role === "user" ? <UserIcon className="h-3.5 w-3.5" /> : <HammerIcon className="h-3.5 w-3.5 text-[#38b6ff]" />}
            </div>

            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 leading-relaxed border ${
                msg.role === "user"
                  ? "bg-[#131a2c] text-[#f3f6fc] border-[#1060ee]/40"
                  : "bg-[#0d1220] text-[#f3f6fc] border-[#1b2338]"
              }`}
            >
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <FormattedMarkdown content={msg.content} projectId={projectId} />
              )}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-[11px] text-[#9aa4b8] italic pl-9">
            <SparklesIcon className="h-3.5 w-3.5 animate-spin text-[#38b6ff]" />
            ForgeFlow Agent is analyzing project state...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="border-t border-[#1b2338] p-3 bg-[#0d1220]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ForgeFlow Agent or request stack updates..."
            className="flex-1 rounded border border-[#1b2338] bg-[#070a14] px-3 py-2 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isSending}
            className="px-3 bg-[#1060ee] text-white hover:bg-[#0a2a9c] font-semibold"
          >
            <SendIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
