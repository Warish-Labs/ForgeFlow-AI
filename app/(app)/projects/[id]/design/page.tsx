"use client";

import { useState, use } from "react";
import { generateUiDesignAction } from "@/lib/actions/design";
import { DesignSpec } from "@/lib/validations/design";
import { PaletteIcon, UploadIcon, SparklesIcon, CheckCircle2Icon, LayoutIcon, FileTextIcon, SlidersIcon, AlertCircleIcon } from "lucide-react";

interface DesignPageProps {
  params: Promise<{ id: string }>;
}

export default function UiDesignPage({ params }: DesignPageProps) {
  const { id: projectId } = use(params);

  const [inputMode, setInputMode] = useState<"markdown" | "presets">("presets");

  // Markdown Mode state
  const [mdPrompt, setMdPrompt] = useState(
    `# UI Design Specification Prompt\n\n## Visual Theme\n- Primary Accent: #1060EE (Electric Blue)\n- Secondary Bright: #38B6FF (Cyan Glow)\n- Background Surface: #070A14 (Deep Obsidian)\n- Card Base: #0D1220\n\n## Component Layout Guidelines\n- Border Radius: 12px (rounded-xl)\n- Padding: Generous side padding px-6 md:px-12\n- Typography: Monospace labels with Geist Sans body\n- Micro-animations: Hover scale and subtle glows`
  );

  // Presets Mode state
  const [presets, setPresets] = useState({
    visualStyle: "Developer Tool",
    theme: "Dark",
    accent: "Electric Blue",
    density: "Comfortable",
    corners: "Rounded (12px)",
    typography: "Modern Sans + Mono Accent",
    layout: "Sidebar + Dashboard Grid",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [generatedDesign, setGeneratedDesign] = useState<DesignSpec>({
    themeName: "Obsidian Neon",
    visualStyle: "Developer Tool",
    palette: [
      { name: "Background Canvas", hex: "#070A14", role: "Page Surface Canvas" },
      { name: "Raised Surface Card", hex: "#0D1220", role: "Container & Sidebar" },
      { name: "Primary Electric", hex: "#1060EE", role: "Main Interactive CTAs" },
      { name: "Bright Cyan", hex: "#38B6FF", role: "Highlights & Badges" },
      { name: "Success Mint", hex: "#2FE6B0", role: "Validated State & ADR Badges" },
    ],
    typography: {
      fontFamily: "Inter, Geist Sans, sans-serif",
      accentFont: "JetBrains Mono, monospace",
    },
    components: [
      {
        name: "Pill Tag Badge",
        type: "badge",
        spec: "Rounded 100px border with 10% opacity backdrop fill.",
        cssSnippet: "rounded-full border border-[#1060ee]/40 bg-[#1060ee]/15 px-3 py-1 font-mono text-[10px]",
      },
      {
        name: "Glass Workspace Card",
        type: "card",
        spec: "1px border #1B2338 with 12px border radius and hover shadow.",
        cssSnippet: "rounded-xl border border-[#1b2338] bg-[#0d1220] p-5 shadow-xl",
      },
      {
        name: "Primary Electric Button",
        type: "button",
        spec: "Electric blue gradient fill with white text and 25% shadow glow.",
        cssSnippet: "rounded-xl bg-[#1060ee] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a2a9c]",
      },
    ],
    presetTags: ["Dark Mode", "Developer Tool", "Electric Blue", "Comfortable"],
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

  async function handleGenerateDesign() {
    setIsGenerating(true);
    setErrorMessage(null);

    const inputData =
      inputMode === "markdown"
        ? { markdown: mdPrompt }
        : { presets };

    const result = await generateUiDesignAction(projectId, inputData);
    setIsGenerating(false);

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    setGeneratedDesign(result.data);
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
              AI UI Design System & Live Component Generator
            </h1>
            <p className="text-xs text-[#9aa4b8]">
              Supply Markdown design guidelines or select design presets to synthesize color tokens, typography stacks, and live component previews.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-2.5 shadow-lg">
          <AlertCircleIcon className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold text-rose-200">Design Synthesis Error</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input Selection (Markdown vs Presets) */}
        <div className="rounded-2xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-5 shadow-xl">
          {/* Mode Switcher */}
          <div className="flex items-center justify-between border-b border-[#1b2338] pb-3">
            <div className="flex items-center gap-1 bg-[#070a14] p-1 rounded-xl border border-[#1b2338]">
              <button
                onClick={() => setInputMode("presets")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  inputMode === "presets"
                    ? "bg-[#1060ee] text-white shadow-sm"
                    : "text-[#9aa4b8] hover:text-[#f3f6fc]"
                }`}
              >
                <SlidersIcon className="h-3.5 w-3.5" /> Presets & Tags
              </button>
              <button
                onClick={() => setInputMode("markdown")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  inputMode === "markdown"
                    ? "bg-[#1060ee] text-white shadow-sm"
                    : "text-[#9aa4b8] hover:text-[#f3f6fc]"
                }`}
              >
                <FileTextIcon className="h-3.5 w-3.5" /> Markdown Spec
              </button>
            </div>

            {inputMode === "markdown" && (
              <label className="inline-flex items-center gap-1.5 rounded-xl border border-[#1060ee]/40 bg-[#131a2c] px-3 py-1.5 text-xs font-medium text-[#38b6ff] hover:bg-[#1060ee] hover:text-white transition-all cursor-pointer">
                <UploadIcon className="h-3.5 w-3.5" />
                Upload .md
                <input
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Mode A: Presets Input */}
          {inputMode === "presets" ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-mono text-[#9aa4b8] block mb-1.5 uppercase">Visual Style</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Developer Tool", "Glassmorphism", "Minimal SaaS", "Enterprise Cyber", "Editorial"].map((style) => (
                    <button
                      key={style}
                      onClick={() => setPresets((p) => ({ ...p, visualStyle: style }))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        presets.visualStyle === style
                          ? "border-[#1060ee] bg-[#1060ee]/20 text-[#38b6ff] font-semibold"
                          : "border-[#1b2338] bg-[#070a14] text-[#9aa4b8] hover:border-[#38b6ff]/40"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#9aa4b8] block mb-1 uppercase">Theme Mode</label>
                  <select
                    value={presets.theme}
                    onChange={(e) => setPresets((p) => ({ ...p, theme: e.target.value }))}
                    className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-2.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
                  >
                    <option value="Dark">Dark Mode</option>
                    <option value="Light">Light Mode</option>
                    <option value="System">System Auto</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#9aa4b8] block mb-1 uppercase">Accent Color</label>
                  <select
                    value={presets.accent}
                    onChange={(e) => setPresets((p) => ({ ...p, accent: e.target.value }))}
                    className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-2.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
                  >
                    <option value="Electric Blue">Electric Blue (#1060EE)</option>
                    <option value="Cyan Glow">Cyan Glow (#38B6FF)</option>
                    <option value="Emerald Mint">Emerald Mint (#2FE6B0)</option>
                    <option value="Violet Purple">Violet Purple (#8B5CF6)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#9aa4b8] block mb-1 uppercase">Spacing Density</label>
                  <select
                    value={presets.density}
                    onChange={(e) => setPresets((p) => ({ ...p, density: e.target.value }))}
                    className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-2.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
                  >
                    <option value="Compact">Compact</option>
                    <option value="Comfortable">Comfortable</option>
                    <option value="Spacious">Spacious</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#9aa4b8] block mb-1 uppercase">Corner Radius</label>
                  <select
                    value={presets.corners}
                    onChange={(e) => setPresets((p) => ({ ...p, corners: e.target.value }))}
                    className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-2.5 text-xs text-[#f3f6fc] focus:border-[#38b6ff] focus:outline-none"
                  >
                    <option value="Sharp (4px)">Sharp (4px)</option>
                    <option value="Rounded (12px)">Rounded (12px)</option>
                    <option value="Pill (24px)">Pill (24px)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Mode B: Markdown Prompt Input */
            <textarea
              value={mdPrompt}
              onChange={(e) => setMdPrompt(e.target.value)}
              rows={12}
              className="w-full rounded-xl border border-[#1b2338] bg-[#070a14] p-4 font-mono text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none leading-relaxed"
            />
          )}

          <button
            onClick={handleGenerateDesign}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1060ee] py-3 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
          >
            <SparklesIcon className="h-4 w-4" />
            {isGenerating ? "Synthesizing Design System..." : "Generate AI Design System & Preview"}
          </button>
        </div>

        {/* Right Column: Generated Design Spec Preview */}
        <div className="space-y-6">
          {/* Theme Meta & Preset Tags */}
          <div className="rounded-2xl border border-[#1b2338] bg-[#0d1220] p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#f3f6fc]">{generatedDesign.themeName}</h3>
                <p className="text-xs text-[#38b6ff] font-mono">{generatedDesign.visualStyle}</p>
              </div>
              <span className="pill-tag text-[10px] uppercase font-mono">
                AI DESIGN SPEC
              </span>
            </div>

            {generatedDesign.presetTags && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {generatedDesign.presetTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#1060ee]/40 bg-[#1060ee]/15 px-2.5 py-0.5 text-[10px] font-mono text-[#38b6ff]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

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
                    className="h-9 w-9 rounded-lg border border-[#1b2338] shrink-0 shadow-inner"
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
                  <CheckCircle2Icon className="h-3 w-3" /> Validated DesignSpec Tokens
                </span>
              </div>

              <h4 className="text-base font-bold text-[#f3f6fc]">
                Enterprise Workspace Spec Card
              </h4>
              <p className="text-xs text-[#9aa4b8] leading-relaxed">
                Rendered live preview derived from AI design synthesis. Typography:{" "}
                <code className="font-mono text-[#38b6ff] text-[11px]">
                  {generatedDesign.typography?.fontFamily || "Inter"}
                </code>
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button className="rounded-xl bg-[#1060ee] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a2a9c] transition-all shadow-md">
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
