import { create } from "zustand";
import { PRESET_TOWNS, type Coordinates, type TownName } from "@/lib/resources";

const SAVED_KEY = "baseimpact_saved";

function readSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(SAVED_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeSaved(ids: string[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  } catch {
    /* private mode */
  }
}

type SavedState = {
  savedIds: string[];
  hydrate: () => void;
  toggleSaved: (id: string) => void;
};

export const useSavedStore = create<SavedState>((set, get) => ({
  savedIds: [],
  hydrate: () => set({ savedIds: readSaved() }),
  toggleSaved: (id) => {
    const current = get().savedIds;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    writeSaved(next);
    set({ savedIds: next });
  },
}));

type LocationState = {
  town: TownName | "Current GPS";
  coords: Coordinates;
  setTown: (town: TownName) => void;
  setGps: (coords: Coordinates) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  town: "Scottsmoor",
  coords: PRESET_TOWNS.Scottsmoor,
  setTown: (town) => set({ town, coords: PRESET_TOWNS[town] }),
  setGps: (coords) => set({ town: "Current GPS", coords }),
}));

type UiState = {
  triageOpen: boolean;
  openTriage: () => void;
  closeTriage: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  triageOpen: false,
  openTriage: () => set({ triageOpen: true }),
  closeTriage: () => set({ triageOpen: false }),
}));
