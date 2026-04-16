// Deprecated: localStorage persistence used during early MVP.
// Kept temporarily to avoid breaking other modules; new source of truth is Supabase `saved_scenarios`.
import type { SavedScenario, SimulationType } from "@/lib/simulations/types";

const KEY = "ep.saved_scenarios.v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadScenarios(): SavedScenario[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<SavedScenario[]>(window.localStorage.getItem(KEY));
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((s) => s && typeof s.id === "string" && typeof s.type === "string")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function saveScenario(s: SavedScenario) {
  if (typeof window === "undefined") return;
  const list = loadScenarios();
  const next = [s, ...list.filter((x) => x.id !== s.id)].slice(0, 50);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function deleteScenario(id: string) {
  if (typeof window === "undefined") return;
  const list = loadScenarios();
  window.localStorage.setItem(KEY, JSON.stringify(list.filter((s) => s.id !== id)));
}

export function newScenarioId(type: SimulationType) {
  // No crypto randomness required; deterministic enough for local MVP.
  return `${type}_${Date.now().toString(36)}`;
}

