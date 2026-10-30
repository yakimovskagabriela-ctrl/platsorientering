import type { DataState, MunicipalityLookupResponse } from '../domain/contracts';
import { parseMunicipalityLookupResponse } from '../domain/validation.ts';

// Namngivna lat/lon enligt API-kontraktet. Ingen CRS-bekräftelse eller
// geometri skapas av uppslaget. Attribution bevaras i det validerade råsvaret.
export async function lookupMunicipality(
  coordinates: { lat: number; lon: number },
  fetcher: typeof fetch = globalThis.fetch,
): Promise<DataState<MunicipalityLookupResponse>> {
  const scope = 'Kommunuppslag för den efterfrågade punkten';
  if (!Number.isFinite(coordinates.lat) || Math.abs(coordinates.lat) > 90
    || !Number.isFinite(coordinates.lon) || Math.abs(coordinates.lon) > 180) {
    return {
      status: 'error',
      error: { kind: 'invalid-data', message: 'Latitud eller longitud är ogiltig.', httpStatus: null },
    };
  }
  const url = new URL('https://api.kart-api.se/v1/kommun/lookup');
  url.searchParams.set('lat', String(coordinates.lat));
  url.searchParams.set('lon', String(coordinates.lon));
  let response: Response;
  try {
    response = await fetcher(url);
  } catch {
    return {
      status: 'error',
      error: { kind: 'network', message: 'Kommunuppslaget kunde inte nås.', httpStatus: null },
    };
  }
  if (response.status === 404) {
    return {
      status: 'empty', reason: 'Ingen kommunträff för punkten.', sources: [],
      completeness: { status: 'unknown', scope, reason: 'API:t returnerade 404; täckningen är inte verifierad.' },
    };
  }
  if (!response.ok) {
    return {
      status: 'error',
      error: {
        kind: 'http', httpStatus: response.status,
        message: response.status === 422
          ? 'API:t kunde inte godta koordinaterna.'
          : `Kommunuppslaget misslyckades (HTTP ${response.status}).`,
      },
    };
  }
  try {
    return {
      status: 'ready', data: parseMunicipalityLookupResponse(await response.json()),
      completeness: { status: 'complete', scope },
    };
  } catch {
    return {
      status: 'error',
      error: { kind: 'invalid-data', message: 'Kommunuppslaget gav ett ogiltigt svar.', httpStatus: response.status },
    };
  }
}
