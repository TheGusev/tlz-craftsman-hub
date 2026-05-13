import { useEffect } from "react";
import { captureUtm, trackPageview } from "@/lib/analytics";
import { useRouter } from "@tanstack/react-router";

export function useAnalytics() {
  const router = useRouter();

  // Capture UTM on first visit
  useEffect(() => {
    captureUtm();
  }, []);

  // Track SPA pageviews
  useEffect(() => {
    const unsub = router.subscribe("onResolved", () => {
      const url = window.location.pathname + window.location.search;
      trackPageview(url);
    });
    return unsub;
  }, [router]);
}
