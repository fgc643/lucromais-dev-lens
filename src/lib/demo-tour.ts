export const DEMO_EMAIL = "demo@lucromais.com";
export const DEMO_TOUR_KEY = "lucro_mais_demo_tour_seen_v1";

export function shouldShowDemoTour(email: string | undefined, seen: string | null) {
  return email?.toLowerCase() === DEMO_EMAIL && seen !== "true";
}