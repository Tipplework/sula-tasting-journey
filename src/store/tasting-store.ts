import { useState, useCallback, useEffect } from "react";
import { wines } from "@/data/wines";



export interface WineResponse {
  wineId: number;
  rating: number;
  quizAnswer: string[];
  upsellClicked: string | null;
}

export interface CookiePrefs {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  set: boolean; // has user made a choice?
}

export interface ConsentRecord {
  accepted: boolean;
  version: string;
  ts: string | null;
}

export interface TastingSession {
  userName: string;
  selectedFlightId: string | null;
  responses: Record<number, WineResponse>;
  vibeCheck: string | null;
  favoriteWineId: number | null;
  completed: boolean;
  contactInfo: string;
  phone: string;
  city: string;
  email: string;
  consent: ConsentRecord;
  cookies: CookiePrefs;
}

export const CURRENT_PRIVACY_VERSION = "1.0.0";

const defaultSession: TastingSession = {
  userName: "",
  selectedFlightId: null,
  responses: {},
  vibeCheck: null,
  favoriteWineId: null,
  completed: false,
  contactInfo: "",
  phone: "",
  city: "",
  email: "",
  consent: { accepted: false, version: CURRENT_PRIVACY_VERSION, ts: null },
  cookies: { essential: true, analytics: false, marketing: false, set: false },
};

const STORAGE_KEY = "sulaTastingSession/v2";

function loadInitial(): TastingSession {
  if (typeof window === "undefined") return { ...defaultSession };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSession };
    const parsed = JSON.parse(raw) as Partial<TastingSession>;
    return { ...defaultSession, ...parsed, cookies: { ...defaultSession.cookies, ...(parsed.cookies || {}) }, consent: { ...defaultSession.consent, ...(parsed.consent || {}) } };
  } catch {
    return { ...defaultSession };
  }
}

let globalSession: TastingSession = loadInitial();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalSession));
  } catch {
    /* quota / unavailable */
  }
}

function commit(next: TastingSession) {
  globalSession = next;
  persist();
  listeners.forEach((l) => l());
}

export function useTastingStore() {
  const [, setTick] = useState(0);

  const subscribe = useCallback(() => {
    const rerender = () => setTick((t) => t + 1);
    listeners.add(rerender);
    return () => {
      listeners.delete(rerender);
    };
  }, []);

  useEffect(() => subscribe(), [subscribe]);

  const session = globalSession;

  const setUserName = (name: string) => commit({ ...globalSession, userName: name });

  const setSelectedFlight = (flightId: string | null) => {
    // Clear responses when switching flights
    if (globalSession.selectedFlightId !== flightId) {
      commit({ ...globalSession, selectedFlightId: flightId, responses: {}, favoriteWineId: null });
    } else {
      commit({ ...globalSession, selectedFlightId: flightId });
    }
  };

  const setConsent = (accepted: boolean) =>
    commit({
      ...globalSession,
      consent: {
        accepted,
        version: CURRENT_PRIVACY_VERSION,
        ts: accepted ? new Date().toISOString() : null,
      },
    });

  const setCookiePrefs = (prefs: Partial<CookiePrefs>) =>
    commit({
      ...globalSession,
      cookies: { ...globalSession.cookies, ...prefs, essential: true, set: true },
    });

  const setWineRating = (wineId: number, rating: number) => {
    const existing = globalSession.responses[wineId] || {
      wineId, rating: 0, quizAnswer: [], upsellClicked: null,
    };
    commit({
      ...globalSession,
      responses: { ...globalSession.responses, [wineId]: { ...existing, rating } },
    });
  };

  const setQuizAnswer = (wineId: number, answers: string[]) => {
    const existing = globalSession.responses[wineId] || {
      wineId, rating: 0, quizAnswer: [], upsellClicked: null,
    };
    commit({
      ...globalSession,
      responses: { ...globalSession.responses, [wineId]: { ...existing, quizAnswer: answers } },
    });
  };

  const setUpsellClick = (wineId: number, action: string) => {
    const existing = globalSession.responses[wineId] || {
      wineId, rating: 0, quizAnswer: [], upsellClicked: null,
    };
    commit({
      ...globalSession,
      responses: { ...globalSession.responses, [wineId]: { ...existing, upsellClicked: action } },
    });
  };

  const setVibeCheck = (vibe: string) => commit({ ...globalSession, vibeCheck: vibe });
  const setContactInfo = (info: string) => commit({ ...globalSession, contactInfo: info, completed: true });
  const setEmail = (email: string) => commit({ ...globalSession, email });

  const setGuestProfile = (data: { phone: string; city: string; name?: string; email?: string }) => {
    commit({
      ...globalSession,
      phone: data.phone,
      city: data.city,
      userName: data.name?.trim() || globalSession.userName,
      email: data.email?.trim() || globalSession.email,
      contactInfo: data.phone,
      completed: true,
    });
  };

  const getPersonality = (): string => {
    const responses = Object.values(globalSession.responses);
    if (responses.length === 0) return "Cheerful";
    let bestWineId = responses[0].wineId;
    let bestRating = 0;
    responses.forEach((r) => {
      if (r.rating > bestRating) {
        bestRating = r.rating;
        bestWineId = r.wineId;
      }
    });
    commit({ ...globalSession, favoriteWineId: bestWineId });
    const w = wines.find((x) => x.id === bestWineId);
    return w?.personalityLabel || "Cheerful";
  };

  const resetSession = () => commit({ ...defaultSession, cookies: globalSession.cookies });

  return {
    session,
    setUserName,
    setSelectedFlight,
    setConsent,
    setCookiePrefs,
    setWineRating,
    setQuizAnswer,
    setUpsellClick,
    setVibeCheck,
    setContactInfo,
    setEmail,
    setGuestProfile,
    getPersonality,
    resetSession,
  };
}
