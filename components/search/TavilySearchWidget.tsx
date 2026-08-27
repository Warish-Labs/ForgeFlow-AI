"use client";

import { useState } from "react";
import { searchTechTavilyAction } from "@/lib/actions/search";
import { FormattedMarkdown } from "@/components/ui/FormattedMarkdown";
import { Button } from "@/components/ui/button";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { SearchIcon, GlobeIcon, Loader2Icon, ExternalLinkIcon } from "lucide-react";

interface TavilySearchWidgetProps {
  defaultQuery?: string;
}

export function TavilySearchWidget({ defaultQuery = "" }: TavilySearchWidgetProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    answer?: string;
    results: Array<{ title: string; url: string; content: string }>;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setErrorMsg(null);
    setResults(null);

    const res = await searchTechTavilyAction(query.trim());
    setIsSearching(false);

    if (!res.success) {
      setErrorMsg(res.error.message);
      return;
    }

    setResults(res.data);
  }

  return (
    <div className="rounded-xl border border-[#c8ad86]/40 bg-[#000000] p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GlobeIcon className="h-4 w-4 text-[#c8ad86]" />
          <h3 className="text-sm font-semibold text-[#fff7dd]">
            Tavily Live Web Tech Research Engine
          </h3>
          <HelpTooltip
            title="Tavily Live Web Search"
            text="Query real-time web documentation, benchmarks, library updates, and tech comparisons via Tavily API."
          />
        </div>
        <span className="pill-tag uppercase">TAVILY API INTEGRATED</span>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#66635f]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search web for latest tech docs, benchmarks, or library versions (e.g. Next.js 15 Server Actions vs Fastify)..."
            className="w-full rounded border border-[#fff7dd]/20 bg-[#0a0a0a] pl-9 pr-3 py-2 text-xs text-[#fff7dd] placeholder-[#66635f] focus:border-[#c8ad86] focus:outline-none"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={!query.trim() || isSearching}
          className="bg-[#c8ad86] text-[#000000] hover:bg-[#b09570] font-semibold text-xs px-4"
        >
          {isSearching ? (
            <>
              <Loader2Icon className="h-3.5 w-3.5 animate-spin mr-1" /> Searching...
            </>
          ) : (
            <>
              <SearchIcon className="h-3.5 w-3.5 mr-1" /> Search Tavily
            </>
          )}
        </Button>
      </form>

      {/* Error Message */}
      {errorMsg && (
        <p className="text-xs text-red-400 font-mono bg-red-950/20 border border-red-900/30 p-2.5 rounded">
          ⚠️ {errorMsg}
        </p>
      )}

      {/* Results View */}
      {results && (
        <div className="space-y-3 pt-2 border-t border-[#fff7dd]/15">
          {results.answer && (
            <div className="rounded border border-[#c8ad86]/30 bg-[#0a0a0a] p-3 text-xs space-y-1">
              <span className="font-mono text-[10px] uppercase text-[#c8ad86] font-bold">
                Tavily AI Direct Answer Summary
              </span>
              <FormattedMarkdown content={results.answer} />
            </div>
          )}

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#66635f] tracking-wider block">
              Top Web Sources ({results.results.length})
            </span>
            {results.results.map((item, idx) => (
              <div
                key={idx}
                className="rounded border border-[#fff7dd]/10 bg-[#0a0a0a] p-3 text-xs space-y-1 hover:border-[#c8ad86]/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#fff7dd] hover:text-[#c8ad86] transition-colors inline-flex items-center gap-1.5 line-clamp-1"
                  >
                    {item.title} <ExternalLinkIcon className="h-3 w-3 text-[#66635f] shrink-0" />
                  </a>
                  <span className="text-[9px] font-mono text-[#66635f] shrink-0">{new URL(item.url).hostname}</span>
                </div>
                <p className="text-[11px] text-[#fff7dd]/70 leading-relaxed line-clamp-2">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
