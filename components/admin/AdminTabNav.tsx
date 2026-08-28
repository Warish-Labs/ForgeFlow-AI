"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  UsersIcon,
  BellIcon,
  CpuIcon,
  ScrollTextIcon,
  FileTextIcon,
  MessageSquareIcon,
  SettingsIcon,
} from "lucide-react";

interface Tab {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const ADMIN_TABS: Tab[] = [
  { label: "Overview", href: "/admin", icon: <LayoutDashboardIcon className="h-3.5 w-3.5" /> },
  { label: "Users", href: "/admin/users", icon: <UsersIcon className="h-3.5 w-3.5" /> },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: <BellIcon className="h-3.5 w-3.5" /> },
  { label: "AI Usage", href: "/admin/ai-usage", icon: <CpuIcon className="h-3.5 w-3.5" /> },
  { label: "Logs", href: "/admin/logs", icon: <ScrollTextIcon className="h-3.5 w-3.5" /> },
  { label: "Documents", href: "/admin/documents", icon: <FileTextIcon className="h-3.5 w-3.5" /> },
  { label: "Messages", href: "/admin/messages", icon: <MessageSquareIcon className="h-3.5 w-3.5" /> },
  { label: "Settings", href: "/admin/settings", icon: <SettingsIcon className="h-3.5 w-3.5" /> },
];

interface AdminTabNavProps {
  unreadMessages?: number;
}

/**
 * AdminTabNav — top tab bar for the admin panel.
 * Uses usePathname() for live active tab state — no stale state possible.
 * Active indicator: bottom border in green (#2fe6b0), text white.
 */
export function AdminTabNav({ unreadMessages = 0 }: AdminTabNavProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Admin panel sections"
      className="border-b border-[#1b2338] bg-[#070a14]"
    >
      <div className="max-w-[1450px] mx-auto px-4 md:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {ADMIN_TABS.map((tab) => {
            const active = isActive(tab.href);
            const isMessages = tab.href === "/admin/messages";
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-selected={active}
                role="tab"
                className={`relative inline-flex items-center gap-1.5 px-4 py-3 text-xs font-mono font-medium whitespace-nowrap transition-all group ${
                  active
                    ? "text-[#f3f6fc]"
                    : "text-[#9aa4b8] hover:text-[#f3f6fc]"
                }`}
              >
                {tab.icon}
                {tab.label}
                {/* Unread badge on Messages tab */}
                {isMessages && unreadMessages > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
                {/* Active indicator: green bottom border */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t transition-all ${
                    active ? "bg-[#2fe6b0]" : "bg-transparent group-hover:bg-[#1b2338]"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
