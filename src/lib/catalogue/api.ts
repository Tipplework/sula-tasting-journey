// DB-backed catalogue API: wines, flights, flight_wines.
// Reader falls back to the in-code seed catalogue for images or when DB is empty.

import { supabase } from "@/integrations/supabase/client";
import { wines as seedWines, flights as seedFlights, type Wine, type Flight, type Award } from "@/data/wines";

const defaultSteps = [
  "Swirl gently in the glass",
  "Breathe in the aromas",
  "Take a slow, thoughtful sip",
];

interface WineRow {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  journey_tag: string;
  description: string;
  tasting_notes: string;
  food_pairing: unknown;
  vivino: string;
  usp: string;
  personality: string;
  personality_label: string;
  image: string;
  question: string;
  options: unknown;
  sommelier_note: string;
  tasting_steps: unknown;
  next_pour: string;
  next_pour_reason: string;
  notes: unknown;
  awards: unknown;
  active: boolean;
  sort_order: number;
}

interface FlightRow {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  description: string;
  glyph: string;
  active: boolean;
  sort_order: number;
}

interface FlightWineRow {
  flight_id: string;
  wine_id: number;
  position: number;
}

function arr<T>(v: unknown, fallback: T[] = []): T[] {
  return Array.isArray(v) ? (v as T[]) : fallback;
}

function seedImageFor(id: number): string {
  return seedWines.find((w) => w.id === id)?.image || "";
}

export function rowToWine(row: WineRow): Wine {
  const seed = seedWines.find((w) => w.id === row.id);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    journeyTag: row.journey_tag,
    tastingNotes: row.tasting_notes,
    foodPairing: arr<string>(row.food_pairing),
    vivino: row.vivino,
    usp: row.usp,
    personality: row.personality,
    personalityLabel: row.personality_label || "Cheerful",
    image: row.image || seedImageFor(row.id),
    question: row.question,
    options: arr<string>(row.options),
    sommelierNote: row.sommelier_note,
    tastingSteps: arr<string>(row.tasting_steps).length ? arr<string>(row.tasting_steps) : (seed?.tastingSteps || defaultSteps),
    nextPour: row.next_pour,
    nextPourReason: row.next_pour_reason,
    description: row.description,
    awards: arr<Award>(row.awards),
    notes: arr<string>(row.notes),
    active: row.active,
  };
}

export function wineToRow(w: Wine, sortOrder: number): Omit<WineRow, "created_at" | "updated_at"> {
  return {
    id: w.id,
    slug: w.slug,
    name: w.name,
    subtitle: w.subtitle,
    journey_tag: w.journeyTag,
    description: w.description,
    tasting_notes: w.tastingNotes,
    food_pairing: w.foodPairing,
    vivino: w.vivino,
    usp: w.usp,
    personality: w.personality,
    personality_label: w.personalityLabel,
    image: w.image,
    question: w.question,
    options: w.options,
    sommelier_note: w.sommelierNote,
    tasting_steps: w.tastingSteps,
    next_pour: w.nextPour,
    next_pour_reason: w.nextPourReason,
    notes: w.notes,
    awards: w.awards,
    active: w.active,
    sort_order: sortOrder,
  };
}

export function rowToFlight(row: FlightRow, wineIds: number[]): Flight {
  return {
    id: row.id as Flight["id"],
    code: row.code,
    name: row.name,
    subtitle: row.subtitle,
    description: row.description,
    wineIds,
    glyph: row.glyph as Flight["glyph"],
    active: row.active,
  };
}

export interface CatalogueSnapshot {
  wines: Wine[];
  flights: Flight[];
}

export async function fetchCatalogue(includeInactive = false): Promise<CatalogueSnapshot> {
  const wineQuery = supabase.from("wines").select("*").order("sort_order", { ascending: true });
  const flightQuery = supabase.from("flights").select("*").order("sort_order", { ascending: true });
  const fwQuery = supabase.from("flight_wines").select("*").order("position", { ascending: true });

  const [wineRes, flightRes, fwRes] = await Promise.all([wineQuery, flightQuery, fwQuery]);
  if (wineRes.error) throw wineRes.error;
  if (flightRes.error) throw flightRes.error;
  if (fwRes.error) throw fwRes.error;

  const wineRows = (wineRes.data as WineRow[]) || [];
  const flightRows = (flightRes.data as FlightRow[]) || [];
  const fwRows = (fwRes.data as FlightWineRow[]) || [];

  const wines = wineRows
    .filter((r) => includeInactive || r.active)
    .map(rowToWine);

  const flights = flightRows
    .filter((r) => includeInactive || r.active)
    .map((r) => {
      const ids = fwRows.filter((fw) => fw.flight_id === r.id).map((fw) => fw.wine_id);
      return rowToFlight(r, ids);
    });

  return {
    wines: wines.length ? wines : seedWines,
    flights: flights.length ? flights : seedFlights,
  };
}

// ─── Admin CRUD ───────────────────────────────────────────

export async function upsertWine(w: Wine, sortOrder: number): Promise<void> {
  const { error } = await supabase.from("wines").upsert(wineToRow(w, sortOrder) as never);
  if (error) throw error;
}

export async function deleteWine(id: number): Promise<void> {
  const { error } = await supabase.from("wines").delete().eq("id", id);
  if (error) throw error;
}

export async function upsertFlight(f: Flight, sortOrder: number): Promise<void> {
  const { error } = await supabase.from("flights").upsert({
    id: f.id,
    code: f.code,
    name: f.name,
    subtitle: f.subtitle,
    description: f.description,
    glyph: f.glyph,
    active: f.active,
    sort_order: sortOrder,
  });
  if (error) throw error;
}

export async function deleteFlight(id: string): Promise<void> {
  const { error } = await supabase.from("flights").delete().eq("id", id);
  if (error) throw error;
}

export async function setFlightWines(flightId: string, wineIds: number[]): Promise<void> {
  const del = await supabase.from("flight_wines").delete().eq("flight_id", flightId);
  if (del.error) throw del.error;
  if (wineIds.length === 0) return;
  const rows = wineIds.map((wine_id, i) => ({ flight_id: flightId, wine_id, position: i + 1 }));
  const ins = await supabase.from("flight_wines").insert(rows);
  if (ins.error) throw ins.error;
}
