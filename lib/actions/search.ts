"use server";

import { auth } from "@clerk/nextjs/server";
import { searchTavily, TavilySearchResponse } from "@/lib/tools/tavily";

export type SearchActionResponse =
  | { success: true; data: TavilySearchResponse }
  | { success: false; error: { code: string; message: string } };

export async function searchTechTavilyAction(query: string): Promise<SearchActionResponse> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be signed in to perform searches." },
    };
  }

  if (!query.trim()) {
    return {
      success: false,
      error: { code: "INVALID_INPUT", message: "Search query cannot be empty." },
    };
  }

  try {
    const result = await searchTavily(query, "basic", 5);
    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: { code: "SEARCH_FAILED", message: err?.message || "Search failed." },
    };
  }
}
