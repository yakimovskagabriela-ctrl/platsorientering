import type { DataState, GeocodeResponse, MunicipalityCode } from '../domain/contracts';
import { parseGeocodeResponse, parseMunicipalityCode } from '../domain/validation.ts';

// Även tomma svar behåller attribution, spridning och kommunfilter i data.
export type GeocodeResult = Exclude<DataState<GeocodeResponse>, { status: 'empty' }>
  | (Extract<DataState<GeocodeResponse>, { status: 'empty' }> & { data: GeocodeResponse });

export async function geocode(
  input: { q: string; limit?: number; kommunkod?: MunicipalityCode },
  fetcher: typeof fetch = globalThis.fetch,
): Promise<GeocodeResult> {
  const scope = 'Resultat för den efterfrågade sökningen och kommunfiltret';
  const limit = input.limit ?? 5;
  try {
    if (typeof input.q !== 'string' || input.q.trim().length === 0
      || !Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error();
    if (input.kommunkod !== undefined) parseMunicipalityCode(input.kommunkod);
  } catch {
    return { status: 'error', error: {
      kind: 'invalid-data', message: 'Ange söktext, limit 1–20 och giltig kommunkod.', httpStatus: null,
    } };
  }
  const url = new URL('https://api.kart-api.se/v1/geocode');
  url.searchParams.set('q', input.q);
  url.searchParams.set('limit', String(limit));
  if (input.kommunkod !== undefined) url.searchParams.set('kommunkod', input.kommunkod);
  let response: Response;
  try {
    response = await fetcher(url);
  } catch {
    return { status: 'error', error: {
      kind: 'network', message: 'Platsökningen kunde inte nås.', httpStatus: null,
    } };
  }
  if (!response.ok) {
    return { status: 'error', error: {
      kind: 'http', httpStatus: response.status,
      message: response.status === 422 ? 'API:t kunde inte godta sökningen.'
        : `Platsökningen misslyckades (HTTP ${response.status}).`,
    } };
  }
  try {
    const data = parseGeocodeResponse(await response.json());
    // spridning räknar exakta ortnamn före limit, inte samtliga sökträffar.
    // Ingen träff väljs automatiskt och inget svar påstås vara uttömmande.
    const completeness = {
      status: 'unknown' as const, scope,
      reason: 'Resultatet begränsas av limit; fullständig söktäckning är inte verifierad.',
    };
    if (data.results.length === 0) {
      return { status: 'empty', data, completeness, sources: [],
        reason: 'Inga träffar i detta svar. Platsen kan ändå finnas, även utanför kommunfiltret.' };
    }
    return { status: 'ready', data, completeness };
  } catch {
    return { status: 'error', error: {
      kind: 'invalid-data', message: 'Platsökningen gav ett ogiltigt svar.', httpStatus: response.status,
    } };
  }
}
