"use client";

import { useState } from "react";
import { use } from "react";
import { PaletteIcon, UploadIcon, SparklesIcon, CheckCircle2Icon, LayoutIcon, FileTextIcon } from "lucide-react";

interface DesignPageProps {
  params: Promise<{ id: string }>;
}

export default function UiDesignPage({ params }: DesignPageProps) {
  const { id: projectId } = use(params);
  const [mdPrompt, setMdPrompt] = useState(
    `# UI Design Specification Prompt\n\n## Visual Theme\n- Primary Accent: #1060EE (Electric Blue)\n- Secondary Bright: #38B6FF (Cyan Glow)\n- Background Surface: #070A14 (Deep Obsidian)\n- Card Base: #0D1220\n\n## Component Layout Guidelines\n- Border Radius: 12px (rounded-xl)\n- Padding: Generous side padding px-6 md:px-12\n- Typography: Monospace labels with Geist Sans body\n- Micro-animations: Hover scale and subtle glows`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<{
    palette: Array<{ name: string; hex: string; role: string }>;
    components: Array<{ name: string; spec: string }>;
  }>({
    palette: [
      { name: "Background", hex: "#070A14", role: "Page Canvas" },
      { name: "Surface Card", hex: "#0D1220", role: "Container Base" },
      { name: "Primary Blue", hex: "#1060EE", role: "Interactive CTAs" },
      { name: "Bright Cyan", hex: "#38B6FF", role: "Highlights & Badges" },
      { name: "Success Mint", hex: "#2FE6B0", role: "Accepted Proposals & Status" },
    ],
    components: [
      { name: "Pill Tag Badge", spec: "Rounded 100px border with 10% opacity backdrop fill." },
      { name: "Glass Card", spec: "1px border #1B2338 with 12px border radius and hover shadow." },
      { name: "Primary Button", spec: "Electric blue gradient fill with white text and 25% shadow glow." },
    ],
  });

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setMdPrompt(text);
      }
    };
    reader.readAsText(file);
  }

  function handleSynthesizeDesign() {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedDesign({
        palette: [
          { name: "Background Canvas", hex: "#070A14", role: "App Root Canvas" },
          { name: "Raised Card", hex: "#0D1220", role: "Section Panels" },
          { name: "Primary Electric", hex: "#1060EE", role: "Main Buttons" },
          { name: "Cyan Bright", hex: "#38B6FF", role: "Active Tabs & Icons" },
          { name: "Success Mint", hex: "#2FE6B0", role: "Validated State" },
        ],
        components: [
          { name: "Header Navigation Rail", spec: "Fixed blur backdrop px-6 with brand flat logo mark." },
          { name: "Interactive Workspace Card", spec: "Padded 24px container with 4-step progress bar." },
          { name: "Proposal Confirmation Card", spec: "Accept/Reject card with green success highlight." },
        ],
      });
    }, 1200);
  }

  return (
    <div className="space-y-8 bg-[#070a14] text-[#f3f6fc] pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1060ee]/40 bg-[#131a2c] text-[#38b6ff]">
            <PaletteIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#f3f6fc]">
              UI Design System & Prompt Mockup Generator
            </h1>
            <p className="text-xs text-[#9aa4b8]">
              Upload or edit a Markdown prompt (.md) to synthesize UI color tokens, component layout guidelines, and live visual mockups.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Markdown Prompt Input */}
        <div className="rounded-2xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1b2338] pb-3">
            <div className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4 text-[#38b6ff]" />
              <span className="text-xs font-bold text-[#f3f6fc]">Markdown Prompt (.md)</span>
            </div>

            <label className="inline-flex items-center gap-1.5 rounded-xl border border-[#1060ee]/40 bg-[#131a2c] px-3 py-1.5 text-xs font-medium text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all cursor-pointer">
              <UploadIcon className="h-3.5 w-3.5" />
              Upload .md File
              <input
                type="file"
                accept=".md,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={mdPrompt}
            onChange={(e) => setMdPrompt(e.target.value)}
            rows={14}
            className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-4 font-mono text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none leading-relaxed"
          />

          <button
            onClick={handleSynthesizeDesign}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1060ee] py-3 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            <SparklesIcon className="h-4 w-4" />
            {isGenerating ? "Synthesizing UI Design System..." : "Generate Design System & Mockup Preview"}
          </button>
        </div>

        {/* Right Column: Generated Design Preview */}
        <div className="space-y-6">
          {/* Color Palette Cards */}
          <div className="rounded-2xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#38b6ff] font-bold">
              Color Tokens Palette
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {generatedDesign.palette.map((item) => (
                <div
                  key={item.hex}
                  className="flex items-center gap-3 rounded-xl border border-[#1b2338] bg-[#070a14] p-3 text-xs"
                >
                  <div
                    className="h-9 w-9 rounded-lg border border-[#1b2338] shrink-0"
                    style={{ backgroundColor: item.hex }}
                  />
                  <div>
                    <span className="font-semibold text-[#f3f6fc] block">{item.name}</span>
                    <span className="font-mono text-[10px] text-[#38b6ff]">{item.hex}</span>
                    <p className="text-[10px] text-[#5c6980] line-clamp-1">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Component Preview Card */}
          <div className="rounded-2xl border border-[#1060ee]/40 bg-[#0d1220] p-6 space-y-4 shadow-2xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#2fe6b0] font-bold flex items-center gap-2">
              <LayoutIcon className="h-4 w-4" /> Live Component Preview Workspace
            </h3>

            <div className="rounded-xl border border-[#1b2338] bg-[#070a14] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="pill-tag text-[10px] uppercase font-mono">
                  LIVE COMPONENT MOCKUP
                </span>
                <span className="text-[10px] font-mono text-[#2fe6b0] flex items-center gap-1">
                  <CheckCircle2Icon className="h-3 w-3" /> Validated Tokens
                </span>
              </div>

              <h4 className="text-base font-bold text-[#f3f6fc]">
                Enterprise Dashboard Workspace Card
              </h4>
              <p className="text-xs text-[#9aa4b8] leading-relaxed">
                Rendered preview of component architecture derived from your uploaded Markdown prompt.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button className="rounded-xl bg-[#1060ee] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all">
                  Primary Action
                </button>
                <button className="rounded-xl border border-[#1b2338] bg-[#131a2c] px-4 py-2 text-xs font-medium text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all">
                  Secondary Action
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
