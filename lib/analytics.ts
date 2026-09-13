function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let vid = localStorage.getItem('warishlabs_vid');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2) + '_' + Date.now().toString(36);
    localStorage.setItem('warishlabs_vid', vid);
  }
  return vid;
}

export async function trackPageView(path?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const visitorId = getOrCreateVisitorId();
    const payload = {
      projectSlug: process.env.NEXT_PUBLIC_ANALYTICS_PROJECT_ID || 'forgeflow',
      projectId: process.env.NEXT_PUBLIC_ANALYTICS_PROJECT_ID || 'forgeflow',
      eventName: 'page_view',
      url: window.location.href,
      path: path || window.location.pathname,
      referrer: document.referrer || null,
      visitorId,
    };
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_API_URL || 'https://warishlabs.in/api/analytics/event', {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null);
  } catch {
    // Fail silently
  }
}
