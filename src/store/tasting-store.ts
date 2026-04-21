import { useState, useCallback } from "react";

export interface WineResponse {
  wineId: number;
  rating: number;
  quizAnswer: string[];
  upsellClicked: string | null;
}

export interface TastingSession {
  userName: string;
  responses: Record<number, WineResponse>;
  vibeCheck: string | null;
  favoriteWineId: number | null;
  completed: boolean;
  contactInfo: string;
  phone: string;
  city: string;
  email: string;
}

const defaultSession: TastingSession = {
  userName: "",
  responses: {},
  vibeCheck: null,
  favoriteWineId: null,
  completed: false,
  contactInfo: "",
  phone: "",
  city: "",
  email: "",
};

let globalSession: TastingSession = { ...defaultSession };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function useTastingStore() {
  const [, setTick] = useState(0);

  const subscribe = useCallback(() => {
    const rerender = () => setTick((t) => t + 1);
    listeners.add(rerender);
    return () => listeners.delete(rerender);
  }, []);

  useState(() => {
    const unsub = subscribe();
    return unsub;
  });

  const session = globalSession;

  const setUserName = (name: string) => {
    globalSession = { ...globalSession, userName: name };
    notify();
  };

  const setWineRating = (wineId: number, rating: number) => {
    const existing = globalSession.responses[wineId] || {
      wineId,
      rating: 0,
      quizAnswer: [],
      upsellClicked: null,
    };
    globalSession = {
      ...globalSession,
      responses: {
        ...globalSession.responses,
        [wineId]: { ...existing, rating },
      },
    };
    notify();
  };

  const setQuizAnswer = (wineId: number, answers: string[]) => {
    const existing = globalSession.responses[wineId] || {
      wineId,
      rating: 0,
      quizAnswer: [],
      upsellClicked: null,
    };
    globalSession = {
      ...globalSession,
      responses: {
        ...globalSession.responses,
        [wineId]: { ...existing, quizAnswer: answers },
      },
    };
    notify();
  };

  const setUpsellClick = (wineId: number, action: string) => {
    const existing = globalSession.responses[wineId] || {
      wineId,
      rating: 0,
      quizAnswer: [],
      upsellClicked: null,
    };
    globalSession = {
      ...globalSession,
      responses: {
        ...globalSession.responses,
        [wineId]: { ...existing, upsellClicked: action },
      },
    };
    notify();
  };

  const setVibeCheck = (vibe: string) => {
    globalSession = { ...globalSession, vibeCheck: vibe };
    notify();
  };

  const setContactInfo = (info: string) => {
    globalSession = { ...globalSession, contactInfo: info, completed: true };
    notify();
  };

  const setEmail = (email: string) => {
    globalSession = { ...globalSession, email };
    notify();
  };

  const setGuestProfile = (data: { phone: string; city: string; name?: string; email?: string }) => {
    globalSession = {
      ...globalSession,
      phone: data.phone,
      city: data.city,
      userName: data.name?.trim() || globalSession.userName,
      email: data.email?.trim() || globalSession.email,
      contactInfo: data.phone,
      completed: true,
    };
    notify();
  };

  const getPersonality = (): string => {
    const responses = Object.values(globalSession.responses);
    if (responses.length === 0) return "Cheerful";

    let bestWineId = 1;
    let bestRating = 0;
    responses.forEach((r) => {
      if (r.rating > bestRating) {
        bestRating = r.rating;
        bestWineId = r.wineId;
      }
    });

    globalSession = { ...globalSession, favoriteWineId: bestWineId };

    const personalityMap: Record<number, string> = {
      1: "Cheerful",
      2: "Refined",
      3: "Romantic",
      4: "Bold Explorer",
      5: "Playful",
    };
    return personalityMap[bestWineId] || "Cheerful";
  };

  const resetSession = () => {
    globalSession = { ...defaultSession };
    notify();
  };

  return {
    session,
    setUserName,
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
