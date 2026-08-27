import "server-only";

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface TavilySearchResponse {
  query: string;
  answer?: string;
  results: TavilySearchResult[];
}

/**
 * Perform a live web search using Tavily API
 */
export async function searchTavily(
  query: string,
  searchDepth: "basic" | "advanced" = "basic",
  maxResults: number = 5
): Promise<TavilySearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn("TAVILY_API_KEY is not configured in environment variables.");
    return {
      query,
      answer: "Tavily search key not configured.",
      results: [
        {
          title: "Search Unavailable",
          url: "https://tavily.com",
          content: "Please configure TAVILY_API_KEY in .env.local to enable live web search.",
        },
      ],
    };
  }

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: searchDepth,
        max_results: maxResults,
        include_answer: true,
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Tavily API response error:", res.status, errText);
      return {
        query,
        answer: `Tavily API HTTP error ${res.status}`,
        results: [],
      };
    }

    const data = await res.json();
    return {
      query,
      answer: data.answer,
      results: (data.results || []).map((item: any) => ({
        title: item.title,
        url: item.url,
        content: item.content,
        score: item.score,
      })),
    };
  } catch (error: any) {
    console.error("Error calling Tavily API:", error);
    return {
      query,
      answer: `Failed to fetch web search results: ${error?.message || "Unknown error"}`,
      results: [],
    };
  }
}
