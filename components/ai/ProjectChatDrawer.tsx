"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FormattedMarkdown } from "@/components/ui/FormattedMarkdown";
import { sendChatMessageAction, getChatHistoryAction, ChatMessageItem } from "@/lib/actions/ai";
import { HammerIcon, SendIcon, XIcon, UserIcon, SparklesIcon, RefreshCwIcon, AlertCircleIcon } from "lucide-react";

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
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Fetch persistent chat history when drawer is opened
  useEffect(() => {
    if (!isOpen) return;

    async function loadHistory() {
      setIsLoadingHistory(true);
      const result = await getChatHistoryAction(projectId);
      setIsLoadingHistory(false);
      if (result.success) {
        setMessages(result.data);
      }
    }

    loadHistory();
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput("");
    setSendError(null);

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
      setSendError(result.error.message);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Error processing message**: ${result.error.message}`,
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg md:max-w-xl flex-col border-l border-[#1b2338] bg-[#070a14] shadow-2xl backdrop-blur-xl transition-all"
      role="dialog"
      aria-modal="true"
      aria-label={`ForgeFlow Agent for ${projectName}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1b2338] px-4 py-3.5 bg-[#0d1220]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#1060ee]/40 bg-[#131a2c] text-[#38b6ff] shadow-sm">
            <HammerIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#f3f6fc]">
                ForgeFlow Agent Copilot
              </h3>
              <span className="rounded bg-[#1060ee]/20 px-1.5 py-0.5 text-[9px] font-mono text-[#38b6ff] border border-[#1060ee]/30 uppercase">
                Grounded
              </span>
            </div>
            <p className="text-[11px] text-[#9aa4b8] line-clamp-1">{projectName}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[#9aa4b8] hover:bg-[#131a2c] hover:text-[#f3f6fc] transition-colors"
          aria-label="Close ForgeFlow Agent chat drawer"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Loading History Indicator */}
      {isLoadingHistory && (
        <div className="flex items-center justify-center gap-2 py-3 bg-[#0d1220]/80 border-b border-[#1b2338] text-xs text-[#38b6ff]">
          <SparklesIcon className="h-3.5 w-3.5 animate-spin" />
          Loading persistent chat history...
        </div>
      )}

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
              className={`max-w-[85%] rounded-xl px-4 py-3 leading-relaxed border shadow-md ${
                msg.role === "user"
                  ? "bg-[#131a2c] text-[#f3f6fc] border-[#1060ee]/40"
                  : "bg-[#0d1220] text-[#f3f6fc] border-[#1b2338]"
              }`}
            >
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap font-sans text-xs text-[#f3f6fc]">{msg.content}</div>
              ) : (
                <FormattedMarkdown content={msg.content} projectId={projectId} />
              )}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-[11px] text-[#9aa4b8] italic pl-9">
            <SparklesIcon className="h-3.5 w-3.5 animate-spin text-[#38b6ff]" />
            ForgeFlow Agent is analyzing live project context...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Send Error Toast */}
      {sendError && (
        <div className="mx-3 mb-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-[11px] text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <span>{sendError}</span>
          </div>
          <button
            onClick={() => handleSend()}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-[#38b6ff] underline hover:text-[#1060ee]"
          >
            <RefreshCwIcon className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="border-t border-[#1b2338] p-3 bg-[#0d1220]">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Ask ForgeFlow Agent, update stack, or request tool actions... (Press Enter to send)"
            className="flex-1 rounded-xl border border-[#1b2338] bg-[#070a14] px-3.5 py-2.5 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none resize-none leading-relaxed"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isSending}
            className="h-10 px-3.5 bg-[#1060ee] text-white hover:bg-[#0a2a9c] font-semibold rounded-xl"
          >
            <SendIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-[#5c6980]">
          <span>Shift + Enter for new line</span>
          <span>Enter to send</span>
        </div>
      </form>
    </div>
  );
}
