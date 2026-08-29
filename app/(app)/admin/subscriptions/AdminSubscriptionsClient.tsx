"use client";

import { useState } from "react";
import { WatchlistSubscriberInfo } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellIcon, SearchIcon } from "lucide-react";

export function AdminSubscriptionsClient({ subscribers }: { subscribers: WatchlistSubscriberInfo[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = subscribers.filter((s) => {
    const matchSearch = s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <Card className="border-[#1b2338] bg-[#0d1220]">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-sm font-bold text-[#f3f6fc] flex items-center gap-2">
              <BellIcon className="h-4 w-4 text-amber-400" /> Watchlist Subscribers ({subscribers.length})
            </CardTitle>
            <p className="text-[11px] text-[#9aa4b8] mt-0.5">Priority launch waitlist signups from landing page</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#070a14] border border-[#1b2338] p-1 rounded-lg">
              {["all", "active", "unsubscribed"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-0.5 text-[10px] font-mono rounded transition-all ${statusFilter === s ? "bg-[#1060ee] text-white" : "text-[#9aa4b8] hover:text-[#f3f6fc]"}`}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="relative w-44">
              <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5c6980]" />
              <input placeholder="Filter email..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#1b2338] bg-[#070a14] pl-8 pr-3 py-1 text-xs text-[#f3f6fc] placeholder-[#5c6980] focus:border-[#38b6ff] focus:outline-none" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1b2338] text-[#5c6980] font-mono">
                <th className="pb-2.5 font-normal">Email</th>
                <th className="pb-2.5 font-normal">Account Type</th>
                <th className="pb-2.5 font-normal">Source</th>
                <th className="pb-2.5 font-normal">Status</th>
                <th className="pb-2.5 font-normal">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2338]/60">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-[#5c6980]">No subscribers match your filter.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#131a2c]/50">
                  <td className="py-2.5 font-mono text-[11px] text-[#38b6ff]">{s.email}</td>
                  <td className="py-2.5">
                    {s.isRegisteredUser ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-[#38b6ff]/30 text-[#38b6ff] bg-[#1060ee]/10">
                        REGISTERED USER
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#5c6980]/30 text-[#9aa4b8] bg-[#070a14]">
                        ANONYMOUS
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{s.source}</td>
                  <td className="py-2.5">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${s.status === "active" ? "text-[#2fe6b0] bg-[#2fe6b0]/10 border-[#2fe6b0]/30" : "text-rose-400 bg-rose-500/10 border-rose-500/30"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-[11px] text-[#9aa4b8]">{s.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
