import type {
  AnalysisResult, AreaOfInterest, AreaSelection, Completeness, DataState, GeocodeResponse,
  Known, Measure, MunicipalityCode, MunicipalityLookupResponse, MunicipalityStatistics, NumericValue,
  PopulationGridCell, ReferenceTime, SourceCrs, SourceMetadata, Unit,
  Wgs84AreaGeometry, LinearRing, Position,
} from './contracts';

export class ValidationError extends Error {
  constructor(public readonly path: string, description: string) {
    super(`${path}: ${description}`);
    this.name = 'ValidationError';
  }
}

type Parser<T> = (value: unknown, path: string) => T;

function fail(path: string, message: string): never {
  throw new ValidationError(path, message);
}

function object(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return fail(path, 'förväntade ett objekt');
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, path: string): string {
  if (typeof value !== 'string') return fail(path, 'förväntade en sträng');
  return value;
}

function finite(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fail(path, 'förväntade ett ändligt tal');
  }
  return value;
}

function list<T>(value: unknown, path: string, parse: Parser<T>): T[] {
  if (!Array.isArray(value)) return fail(path, 'förväntade en lista');
  // Array.from kontrollerar även luckor i glesa JavaScript-arrayer.
  return Array.from(value, (item, index) => parse(item, `${path}[${index}]`));
}

function choice<T extends string>(value: unknown, path: string, choices: readonly T[]): T {
  if (!choices.includes(value as T)) {
    return fail(path, `förväntade något av: ${choices.join(', ')}`);
  }
  return value as T;
}

export function parseKnown<T>(value: unknown, parse: Parser<T>, path = 'known'): Known<T> {
  const item = object(value, path);
  if (item.status === 'known') {
    return { status: 'known', value: parse(item.value, `${path}.value`) };
  }
  if (item.status === 'unknown') {
    return { status: 'unknown', reason: text(item.reason, `${path}.reason`) };
  }
  return fail(`${path}.status`, 'förväntade known eller unknown');
}

export function parseMunicipalityCode(value: unknown, path = 'municipalityCode'): MunicipalityCode {
  if (typeof value !== 'string' || !/^\d{4}$/.test(value)) {
    return fail(path, 'kommunkod måste vara en sträng med exakt fyra siffror');
  }
  return value as MunicipalityCode;
}

export function parseMunicipalityLookupResponse(
  value: unknown, path = 'lookup',
): MunicipalityLookupResponse {
  const item = object(value, path);
  return {
    kommunkod: parseMunicipalityCode(item.kommunkod, `${path}.kommunkod`),
    kommunnamn: text(item.kommunnamn, `${path}.kommunnamn`),
    lanskod: text(item.lanskod, `${path}.lanskod`),
    ...(Object.hasOwn(item, 'lansnamn') ? {
      lansnamn: item.lansnamn === null ? null : text(item.lansnamn, `${path}.lansnamn`),
    } : {}),
    attribution: list(item.attribution, `${path}.attribution`, text),
  };
}

export function parseGeocodeResponse(value: unknown, path = 'geocode'): GeocodeResponse {
  const item = object(value, path);
  function count(value: unknown, path: string): number {
    const n = finite(value, path);
    if (!Number.isInteger(n) || n < 0) return fail(path, 'förväntade ett icke-negativt heltal');
    return n;
  }
  function optional<T>(item: Record<string, unknown>, key: string, path: string, parse: Parser<T>) {
    return Object.hasOwn(item, key)
      ? { [key]: item[key] === null ? null : parse(item[key], `${path}.${key}`) } : {};
  }
  const results = list(item.results, `${path}.results`, (value, p) => {
    const hit = object(value, p);
    return {
      lat: finite(hit.lat, `${p}.lat`), lon: finite(hit.lon, `${p}.lon`),
      namn: text(hit.namn, `${p}.namn`), tier: text(hit.tier, `${p}.tier`),
      kalla: text(hit.kalla, `${p}.kalla`),
      ...optional(hit, 'typ', p, text),
      ...optional(hit, 'kommunkod', p, parseMunicipalityCode),
      ...optional(hit, 'lanskod', p, text),
      ...optional(hit, 'bbox', p, (v, p) => list(v, p, finite)),
    };
  });
  const antal = count(item.antal, `${path}.antal`);
  if (antal !== results.length) return fail(`${path}.antal`, 'antal stämmer inte med results');
  return {
    query: text(item.query, `${path}.query`), antal, results,
    attribution: list(item.attribution, `${path}.attribution`, text),
    ...optional(item, 'spridning', path, (v, p) => {
      const spread = object(v, p);
      if (spread.entydig !== null && typeof spread.entydig !== 'boolean') {
        return fail(`${p}.entydig`, 'förväntade boolean eller null');
      }
      return {
        traffar: count(spread.traffar, `${p}.traffar`),
        kommuner: count(spread.kommuner, `${p}.kommuner`),
        entydig: spread.entydig,
        ...optional(spread, 'skal', p, text),
      };
    }),
    ...optional(item, 'kommunfilter', path, (v, p) => {
      const filter = object(v, p);
      return {
        begard: parseMunicipalityCode(filter.begard, `${p}.begard`),
        bortfiltrerade: count(filter.bortfiltrerade, `${p}.bortfiltrerade`),
        skal: text(filter.skal, `${p}.skal`),
      };
    }),
  };
}

export function parseNumericValue(value: unknown, path = 'value'): NumericValue {
  const item = object(value, path);
  if (item.status === 'available') {
    return { status: 'available', value: finite(item.value, `${path}.value`) };
  }
  if (item.status === 'missing' || item.status === 'suppressed') {
    if ('value' in item) return fail(`${path}.value`, 'saknat eller sekretessmarkerat värde får inte bära ett talvärde');
    return { status: item.status, reason: text(item.reason, `${path}.reason`) };
  }
  return fail(`${path}.status`, 'förväntade available, missing eller suppressed');
}

function date(value: unknown, path: string): string {
  const result = text(value, path);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) return fail(path, 'förväntade ISO-datum ÅÅÅÅ-MM-DD');
  const parsed = new Date(`${result}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== result) {
    return fail(path, 'ogiltigt kalenderdatum');
  }
  return result;
}

function dateOrTimestamp(value: unknown, path: string): string {
  const result = text(value, path);
  if (result.length === 10) return date(result, path);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(result)
      || !Number.isFinite(Date.parse(result))) {
    return fail(path, 'förväntade ISO-datum eller tidsstämpel med tidszon');
  }
  date(result.slice(0, 10), path);
  return result;
}

export function parseReferenceTime(value: unknown, path = 'referenceTime'): ReferenceTime {
  const item = object(value, path);
  switch (item.kind) {
    case 'date': return { kind: 'date', date: date(item.date, `${path}.date`) };
    case 'year': {
      const year = finite(item.year, `${path}.year`);
      if (!Number.isInteger(year)) return fail(`${path}.year`, 'förväntade ett helt årtal');
      return { kind: 'year', year };
    }
    case 'period': {
      const start = date(item.start, `${path}.start`);
      const end = date(item.end, `${path}.end`);
      if (start > end) return fail(path, 'periodens start ligger efter dess slut');
      return { kind: 'period', start, end };
    }
    default: return fail(`${path}.kind`, 'förväntade date, year eller period');
  }
}

export function parseSourceCrs(value: unknown, path = 'sourceCrs'): SourceCrs {
  const item = object(value, path);
  switch (item.status) {
    case 'known': return {
      status: 'known', identifier: text(item.identifier, `${path}.identifier`),
      axisOrder: text(item.axisOrder, `${path}.axisOrder`),
    };
    case 'unknown': return { status: 'unknown', reason: text(item.reason, `${path}.reason`) };
    case 'not-applicable': return { status: 'not-applicable' };
    default: return fail(`${path}.status`, 'ogiltigt CRS-tillstånd');
  }
}

/** CRS gäller den inkommande geometrin, inte dess ursprungliga källmetadata.
 * Ingen transformation utförs. Anroparen måste belägga CRS och axelordning.
 * Endast den uttryckliga beteckningen longitude-latitude accepteras här.
 */
export function parseWgs84AreaGeometry(
  value: unknown, geometryCrs: SourceCrs, path = 'geometry',
): Wgs84AreaGeometry {
  const crs = parseSourceCrs(geometryCrs, `${path}.crs`);
  if (crs.status !== 'known' || crs.identifier !== 'EPSG:4326'
      || crs.axisOrder !== 'longitude-latitude') {
    return fail(path, 'kräver känt EPSG:4326 med longitude-latitude; okänt CRS eller EPSG:3006 kan inte godtas utan transformation');
  }
  const item = object(value, path);
  // Avvisa separat CRS i geometriobjektet i stället för att ignorera en konflikt.
  if ('crs' in item) return fail(`${path}.crs`, 'separat CRS-fält måste hanteras före validering av webbgeometri');
  const position: Parser<Position> = (input, field) => {
    const pair = list(input, field, finite);
    if (pair.length !== 2) return fail(field, 'förväntade [longitud, latitud]');
    const [lon, lat] = pair;
    if (Math.abs(lon) > 180 || Math.abs(lat) > 90) return fail(field, 'koordinater utanför WGS84-intervall');
    return [lon, lat];
  };
  const ring: Parser<LinearRing> = (input, field) => {
    const points = list(input, field, position);
    if (points.length < 4) return fail(field, 'en sluten ring behöver minst fyra positioner');
    const first = points[0];
    const last = points[points.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) return fail(field, 'ringen är inte sluten');
    if (new Set(points.slice(0, -1).map(([x, y]) => `${x},${y}`)).size < 3) {
      return fail(field, 'ringen behöver minst tre olika hörn');
    }
    return points;
  };
  const polygon: Parser<LinearRing[]> = (input, field) => {
    const rings = list(input, field, ring);
    if (!rings.length) return fail(field, 'polygonen saknar ytterring');
    return rings;
  };
  if (item.type === 'Polygon') {
    return { type: 'Polygon', coordinates: polygon(item.coordinates, `${path}.coordinates`) } as Wgs84AreaGeometry;
  }
  if (item.type === 'MultiPolygon') {
    const coordinates = list(item.coordinates, `${path}.coordinates`, polygon);
    if (!coordinates.length) return fail(path, 'MultiPolygon är tom');
    return { type: 'MultiPolygon', coordinates } as Wgs84AreaGeometry;
  }
  return fail(`${path}.type`, 'förväntade Polygon eller MultiPolygon');
}

export function parseSourceMetadata(value: unknown, path = 'source'): SourceMetadata {
  const item = object(value, path);
  return {
    provider: text(item.provider, `${path}.provider`),
    dataset: text(item.dataset, `${path}.dataset`),
    sourceUrl: text(item.sourceUrl, `${path}.sourceUrl`),
    license: parseKnown(item.license, (v, p) => {
      const license = object(v, p);
      return { name: text(license.name, `${p}.name`), url: text(license.url, `${p}.url`) };
    }, `${path}.license`),
    attribution: parseKnown(item.attribution, (v, p) => list(v, p, text), `${path}.attribution`),
    referenceTime: parseKnown(item.referenceTime, parseReferenceTime, `${path}.referenceTime`),
    retrievedAt: parseKnown(item.retrievedAt, dateOrTimestamp, `${path}.retrievedAt`),
    sourceCrs: parseSourceCrs(item.sourceCrs, `${path}.sourceCrs`),
    geographicCoverage: parseKnown(item.geographicCoverage, (v, p) => {
      const coverage = object(v, p);
      return { description: text(coverage.description, `${p}.description`), limitations: list(coverage.limitations, `${p}.limitations`, text) };
    }, `${path}.geographicCoverage`),
  };
}

export function parseCompleteness(value: unknown, path = 'completeness'): Completeness {
  const item = object(value, path);
  const scope = text(item.scope, `${path}.scope`);
  switch (item.status) {
    case 'complete': return { status: 'complete', scope };
    case 'limited': return { status: 'limited', scope, reasons: list(item.reasons, `${path}.reasons`, text) };
    case 'unknown': return { status: 'unknown', scope, reason: text(item.reason, `${path}.reason`) };
    default: return fail(`${path}.status`, 'ogiltigt fullständighetstillstånd');
  }
}

export function parseAreaOfInterest(value: unknown, geometryCrs: SourceCrs, path = 'area'): AreaOfInterest {
  const item = object(value, path);
  const selected = object(item.selection, `${path}.selection`);
  let selection: AreaSelection;
  if (selected.kind === 'municipality') {
    selection = { kind: 'municipality', municipalityCode: parseMunicipalityCode(selected.municipalityCode, `${path}.selection.municipalityCode`) };
  } else if (selected.kind === 'drawn') {
    selection = { kind: 'drawn' };
  } else return fail(`${path}.selection.kind`, 'förväntade municipality eller drawn');
  return {
    id: text(item.id, `${path}.id`), name: text(item.name, `${path}.name`), selection,
    geometry: parseWgs84AreaGeometry(item.geometry, geometryCrs, `${path}.geometry`),
    geometryVintage: parseKnown(item.geometryVintage, text, `${path}.geometryVintage`),
    geometrySource: item.geometrySource === null ? null : parseSourceMetadata(item.geometrySource, `${path}.geometrySource`),
  };
}

export function parseMeasure<U extends Unit>(value: unknown, unit: U, path = 'measure'): Measure<U> {
  const item = object(value, path);
  if (item.unit !== unit) return fail(`${path}.unit`, `förväntade ${unit}`);
  return {
    unit, value: parseNumericValue(item.value, `${path}.value`),
    referenceTime: parseKnown(item.referenceTime, parseReferenceTime, `${path}.referenceTime`),
  };
}

export function parseMunicipalityStatistics(value: unknown, path = 'statistics'): MunicipalityStatistics {
  const item = object(value, path);
  return {
    municipalityCode: parseMunicipalityCode(item.municipalityCode, `${path}.municipalityCode`),
    divisionVintage: parseKnown(item.divisionVintage, text, `${path}.divisionVintage`),
    population: parseMeasure(item.population, 'persons', `${path}.population`),
    landArea: parseMeasure(item.landArea, 'km2', `${path}.landArea`),
    density: parseMeasure(item.density, 'persons/km2', `${path}.density`),
    source: parseSourceMetadata(item.source, `${path}.source`),
  };
}

export function parsePopulationGridCell(value: unknown, geometryCrs: SourceCrs, path = 'cell'): PopulationGridCell {
  const item = object(value, path);
  return {
    id: text(item.id, `${path}.id`),
    geometry: parseWgs84AreaGeometry(item.geometry, geometryCrs, `${path}.geometry`),
    geometryVintage: parseKnown(item.geometryVintage, text, `${path}.geometryVintage`),
    population: parseMeasure(item.population, 'persons', `${path}.population`),
    source: parseSourceMetadata(item.source, `${path}.source`),
  };
}

export function parseAnalysisResult(value: unknown, geometryCrs: SourceCrs, path = 'result'): AnalysisResult {
  const item = object(value, path);
  const geographic = object(item.geographicReference, `${path}.geographicReference`);
  const method = object(item.method, `${path}.method`);
  return {
    metric: text(item.metric, `${path}.metric`), value: parseNumericValue(item.value, `${path}.value`),
    unit: choice(item.unit, `${path}.unit`, ['persons', 'km2', 'persons/km2', 'cells'] as const),
    geographicReference: {
      area: parseAreaOfInterest(geographic.area, geometryCrs, `${path}.geographicReference.area`),
      basis: choice(geographic.basis, `${path}.geographicReference.basis`, ['municipality', 'whole-grid-cells'] as const),
      description: text(geographic.description, `${path}.geographicReference.description`),
    },
    referenceTime: parseKnown(item.referenceTime, parseReferenceTime, `${path}.referenceTime`),
    method: { id: text(method.id, `${path}.method.id`), description: text(method.description, `${path}.method.description`) },
    sources: list(item.sources, `${path}.sources`, parseSourceMetadata),
    completeness: parseCompleteness(item.completeness, `${path}.completeness`),
    limitations: list(item.limitations, `${path}.limitations`, text),
  };
}

export function parseDataState<T>(value: unknown, parseData: Parser<T>, path = 'state'): DataState<T> {
  const item = object(value, path);
  switch (item.status) {
    case 'loading': return { status: 'loading' };
    case 'ready': {
      if (!('data' in item)) return fail(`${path}.data`, 'obligatoriskt fält saknas');
      return { status: 'ready', data: parseData(item.data, `${path}.data`), completeness: parseCompleteness(item.completeness, `${path}.completeness`) };
    }
    case 'empty': return {
      status: 'empty', reason: text(item.reason, `${path}.reason`),
      completeness: parseCompleteness(item.completeness, `${path}.completeness`),
      sources: list(item.sources, `${path}.sources`, parseSourceMetadata),
    };
    case 'error': {
      const error = object(item.error, `${path}.error`);
      return { status: 'error', error: {
        kind: choice(error.kind, `${path}.error.kind`, ['network', 'http', 'invalid-data'] as const),
        message: text(error.message, `${path}.error.message`),
        httpStatus: error.httpStatus === null ? null : finite(error.httpStatus, `${path}.error.httpStatus`),
      } };
    }
    default: return fail(`${path}.status`, 'förväntade loading, ready, empty eller error');
  }
}
