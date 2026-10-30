// Interna P2-kontrakt. Innehåller inga anrop, beräkningar eller runtime-validerare.
export type Known<T> =
  | { status: 'known'; value: T }
  | { status: 'unknown'; reason: string };

export type ReferenceTime =
  | { kind: 'date'; date: string } // ISO-datum.
  | { kind: 'year'; year: number }
  | { kind: 'period'; start: string; end: string };

// Noll är ett tillgängligt värde. Saknat och sekretess får inte bli noll.
export type NumericValue =
  | { status: 'available'; value: number }
  | { status: 'missing'; reason: string }
  | { status: 'suppressed'; reason: string };

export type Unit = 'persons' | 'km2' | 'persons/km2' | 'cells';

export interface Measure<U extends Unit> {
  value: NumericValue;
  unit: U;
  referenceTime: Known<ReferenceTime>;
}

// Fullständighet gäller angivet uttag, inte automatiskt hela källans täckning.
export type Completeness =
  | { status: 'complete'; scope: string }
  | { status: 'limited'; scope: string; reasons: readonly string[] }
  | { status: 'unknown'; scope: string; reason: string };

declare const municipalityCodeBrand: unique symbol;

// Sträng med exakt fyra siffror, t.ex. "0562". Kräver framtida runtime-validering.
export type MunicipalityCode = string & {
  readonly [municipalityCodeBrand]: true;
};

// Validerat råsvar från kart-api:s kommunuppslag, utan geometri.
export interface MunicipalityLookupResponse {
  kommunkod: MunicipalityCode;
  kommunnamn: string;
  lanskod: string;
  lansnamn?: string | null;
  attribution: readonly string[];
}

// Geocode-råsvar. Lat/lon och bbox innebär ingen bekräftad CRS-märkning.
export interface GeocodeHit {
  lat: number;
  lon: number;
  namn: string;
  tier: string;
  kalla: string;
  typ?: string | null;
  kommunkod?: MunicipalityCode | null;
  lanskod?: string | null;
  bbox?: readonly number[] | null;
}

export interface GeocodeResponse {
  query: string;
  antal: number;
  results: readonly GeocodeHit[];
  attribution: readonly string[];
  spridning?: {
    traffar: number;
    kommuner: number;
    entydig: boolean | null;
    skal?: string | null;
  } | null;
  kommunfilter?: {
    begard: MunicipalityCode;
    bortfiltrerade: number;
    skal: string;
  } | null;
}

export type Position = [x: number, y: number];
export type LinearRing = Position[];

export type PolygonGeometry = {
  type: 'Polygon';
  coordinates: LinearRing[];
};

export type MultiPolygonGeometry = {
  type: 'MultiPolygon';
  coordinates: LinearRing[][];
};

export type AreaGeometry = PolygonGeometry | MultiPolygonGeometry;

declare const wgs84Brand: unique symbol;

// Endast validerad EPSG:4326, [longitud, latitud]. Märkningen transformerar inget.
// EPSG:3006 får inte typkonverteras hit utan korrekt transformation/validering.
export type Wgs84AreaGeometry = AreaGeometry & {
  readonly [wgs84Brand]: true;
};

// Ursprungligt käll-CRS hålls åtskilt från normaliserad webbgeometri.
export type SourceCrs =
  | { status: 'known'; identifier: string; axisOrder: string }
  | { status: 'unknown'; reason: string }
  | { status: 'not-applicable' };

export type AreaSelection =
  | { kind: 'municipality'; municipalityCode: MunicipalityCode }
  | { kind: 'drawn' };

export interface AreaOfInterest {
  id: string;
  name: string;
  selection: AreaSelection;
  geometry: Wgs84AreaGeometry;
  geometryVintage: Known<string>;
  // null för användarritad geometri.
  geometrySource: SourceMetadata | null;
}

export interface SourceMetadata {
  provider: string;
  dataset: string;
  sourceUrl: string;
  license: Known<{ name: string; url: string }>;
  attribution: Known<readonly string[]>;
  referenceTime: Known<ReferenceTime>;
  retrievedAt: Known<string>; // ISO-datum eller tidsstämpel; inte referenstid.
  sourceCrs: SourceCrs;
  geographicCoverage: Known<{
    description: string;
    limitations: readonly string[];
  }>;
}

export interface MunicipalityStatistics {
  municipalityCode: MunicipalityCode;
  divisionVintage: Known<string>;
  population: Measure<'persons'>;
  landArea: Measure<'km2'>; // Publicerad officiell landareal, inte polygonyta.
  density: Measure<'persons/km2'>;
  source: SourceMetadata;
}

export interface PopulationGridCell {
  id: string; // Stabilt rut-ID inom vald datavariant; källfält måste beläggas.
  geometry: Wgs84AreaGeometry; // Hela rutan, inte klippt mot ett urval.
  geometryVintage: Known<string>;
  population: Measure<'persons'>;
  source: SourceMetadata;
}

export interface AnalysisResult {
  metric: string;
  value: NumericValue;
  unit: Unit;
  geographicReference: {
    area: AreaOfInterest;
    basis: 'municipality' | 'whole-grid-cells';
    description: string;
  };
  referenceTime: Known<ReferenceTime>;
  method: {
    id: string;
    description: string;
  };
  sources: readonly SourceMetadata[];
  completeness: Completeness;
  limitations: readonly string[];
}

// Ett lyckat svar kan vara begränsat. Tomt utfall är inte ett anropsfel.
export type DataState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T; completeness: Completeness }
  | {
      status: 'empty';
      reason: string;
      completeness: Completeness;
      sources: readonly SourceMetadata[];
    }
  | {
      status: 'error';
      error: {
        kind: 'network' | 'http' | 'invalid-data';
        message: string;
        httpStatus: number | null;
      };
    };
