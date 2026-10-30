// Syntetiska typkontroller. Körs med tsc via npm test, aldrig mot API-data.
import type {
  AreaOfInterest, SourceMetadata, MunicipalityStatistics, PopulationGridCell,
  AnalysisResult, MunicipalityCode, Wgs84AreaGeometry, PolygonGeometry,
  NumericValue, DataState, MunicipalityLookupResponse, GeocodeResponse,
} from '../src/domain/contracts';
import {
  parseAreaOfInterest, parseSourceMetadata, parseMunicipalityStatistics,
  parsePopulationGridCell, parseAnalysisResult, parseMunicipalityLookupResponse, parseGeocodeResponse,
} from '../src/domain/validation';

type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;

export type ContractChecks = [
  Assert<Equal<ReturnType<typeof parseGeocodeResponse>, GeocodeResponse>>,
  Assert<Equal<ReturnType<typeof parseMunicipalityLookupResponse>, MunicipalityLookupResponse>>,
  Assert<Equal<ReturnType<typeof parseAreaOfInterest>, AreaOfInterest>>,
  Assert<Equal<ReturnType<typeof parseSourceMetadata>, SourceMetadata>>,
  Assert<Equal<ReturnType<typeof parseMunicipalityStatistics>, MunicipalityStatistics>>,
  Assert<Equal<ReturnType<typeof parsePopulationGridCell>, PopulationGridCell>>,
  Assert<Equal<ReturnType<typeof parseAnalysisResult>, AnalysisResult>>,
];

// @ts-expect-error Ovalidierad sträng får inte bli märkt kommunkod.
const code: MunicipalityCode = '0001';
declare const rawPolygon: PolygonGeometry;
// @ts-expect-error Ovalidierad geometri får inte bli märkt WGS84-geometri.
const geometry: Wgs84AreaGeometry = rawPolygon;
// @ts-expect-error Sekretessmarkerat värde får inte bära ett numeriskt värde.
const suppressed: NumericValue = { status: 'suppressed', reason: 'syntetisk', value: 0 };
// @ts-expect-error Ready kräver fullständighetsinformation.
const state: DataState<number> = { status: 'ready', data: 0 };
void [code, geometry, suppressed, state];
