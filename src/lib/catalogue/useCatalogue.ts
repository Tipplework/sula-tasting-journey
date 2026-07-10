import { useEffect, useState } from "react";
import type { Wine, Flight } from "@/data/wines";
import { wines as seedWines, flights as seedFlights, getFlightWines as seedGetFlightWines } from "@/data/wines";
import { fetchCatalogue, type CatalogueSnapshot } from "./api";

// Module-scoped cache so pages don't refetch on every mount
let cache: CatalogueSnapshot | null = null;
let inflight: Promise<CatalogueSnapshot> | null = null;

async function loadOnce(): Promise<CatalogueSnapshot> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetchCatalogue(false)
    .then((snap) => {
      cache = snap;
      inflight = null;
      return snap;
    })
    .catch((e) => {
      inflight = null;
      throw e;
    });
  return inflight;
}

export function invalidateCatalogue() {
  cache = null;
  inflight = null;
}

export interface UseCatalogueResult {
  wines: Wine[];
  flights: Flight[];
  getFlightWines: (flightId: string | null | undefined) => Wine[];
  loading: boolean;
  error: Error | null;
}

/**
 * Live DB catalogue with the code-driven seed as instant fallback,
 * so the reader never flashes empty even before the fetch resolves.
 */
export function useCatalogue(): UseCatalogueResult {
  const [snap, setSnap] = useState<CatalogueSnapshot | null>(cache);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cache) {
      setSnap(cache);
      return;
    }
    let cancelled = false;
    loadOnce()
      .then((s) => {
        if (!cancelled) setSnap(s);
      })
      .catch((e) => {
        if (!cancelled) setError(e as Error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const wines = snap?.wines ?? seedWines;
  const flights = snap?.flights ?? seedFlights;
  const getFlightWines = (flightId: string | null | undefined): Wine[] => {
    if (!flightId) return [];
    if (!snap) return seedGetFlightWines(flightId);
    const flight = flights.find((f) => f.id === flightId);
    if (!flight) return [];
    return flight.wineIds
      .map((id) => wines.find((w) => w.id === id))
      .filter((w): w is Wine => Boolean(w));
  };

  return { wines, flights, getFlightWines, loading: !snap && !error, error };
}
