// Alla objekt och koordinater i denna fil är SYNTETISKA TESTDATA.
// Inga verkliga API-svar, nätverksanrop eller källrättigheter används.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as v from '../src/domain/validation.ts';

const unknown = { status: 'unknown', reason: 'syntetiskt okänt' };
const known = value => ({ status: 'known', value });
const crs = { status: 'known', identifier: 'EPSG:4326', axisOrder: 'longitude-latitude' };
const projected = { status: 'known', identifier: 'EPSG:3006', axisOrder: 'easting-northing' };
const polygon = { type: 'Polygon', coordinates: [[[10, 50], [11, 50], [11, 51], [10, 50]]] };
const time = known({ kind: 'date', date: '2024-02-29' });
const measure = (unit, value = { status: 'available', value: 0 }) => ({ unit, value, referenceTime: time });
const source = {
  provider: 'Syntetisk leverantör', dataset: 'Syntetiskt dataset',
  sourceUrl: 'https://example.invalid/synthetic',
  license: known({ name: 'Syntetisk licensetikett', url: 'https://example.invalid/license' }),
  attribution: known(['Syntetisk källa']), referenceTime: time,
  retrievedAt: known('2026-10-22T12:00:00Z'), sourceCrs: projected,
  geographicCoverage: known({ description: 'Syntetiskt utsnitt', limitations: ['Enbart testdata'] }),
};
const area = {
  id: 'synthetic-area', name: 'Syntetiskt område',
  selection: { kind: 'municipality', municipalityCode: '0001' },
  geometry: polygon, geometryVintage: unknown, geometrySource: source,
};
const statistics = {
  municipalityCode: '0001', divisionVintage: unknown,
  population: measure('persons'), landArea: measure('km2'), density: measure('persons/km2'), source,
};
const cell = {
  id: 'synthetic-cell', geometry: polygon, geometryVintage: unknown,
  population: measure('persons'), source,
};
const complete = { status: 'complete', scope: 'Syntetiskt utsnitt' };
const result = {
  metric: 'synthetic-population', value: { status: 'available', value: 0 }, unit: 'persons',
  geographicReference: { area, basis: 'whole-grid-cells', description: 'Syntetiska hela rutor' },
  referenceTime: time, method: { id: 'synthetic', description: 'Endast kontraktsprov' },
  sources: [source], completeness: complete, limitations: ['Syntetiskt resultat'],
};

function rejects(run, path) {
  assert.throws(run, error => {
    assert.ok(error instanceof v.ValidationError);
    assert.equal(error.name, 'ValidationError');
    assert.equal(error.path, path);
    assert.ok(error.message.startsWith(`${path}: `));
    assert.ok(error.message.length > path.length + 2);
    return true;
  });
}

test('Fyrsiffriga strängar godtas och inledande nollor bevaras', () => {
  for (const code of ['0001', '0123', '1234']) assert.equal(v.parseMunicipalityCode(code), code);
});
test('Tal, fel längd, blanksteg och andra tecken avvisas som kommunkoder', () => {
  for (const code of [1, 1234, '123', '12345', ' 0123', '01a3', '', null, undefined]) {
    rejects(() => v.parseMunicipalityCode(code), 'municipalityCode');
  }
});
test('Noll, saknat och sekretess bevaras som tre skilda tillstånd', () => {
  for (const value of [{ status: 'available', value: 0 }, { status: 'missing', reason: 'syntetisk' }, { status: 'suppressed', reason: 'syntetisk' }]) {
    assert.deepEqual(v.parseNumericValue(value), value);
  }
});
test('NaN, Infinity och andra icke-numeriska värden avvisas', () => {
  for (const value of [NaN, Infinity, -Infinity, '0', null, undefined]) {
    rejects(() => v.parseNumericValue({ status: 'available', value }), 'value.value');
  }
});
test('Saknat och sekretess får inte bära tal eller sakna orsak', () => {
  for (const status of ['missing', 'suppressed']) {
    rejects(() => v.parseNumericValue({ status, reason: 'syntetisk', value: 0 }), 'value.value');
    rejects(() => v.parseNumericValue({ status }), 'value.reason');
  }
  rejects(() => v.parseNumericValue({ status: 'other' }), 'value.status');
});
test('Känt, okänt och ej tillämpligt käll-CRS hålls åtskilda', () => {
  for (const value of [crs, projected, unknown, { status: 'not-applicable' }]) assert.deepEqual(v.parseSourceCrs(value), value);
  rejects(() => v.parseSourceCrs({ status: 'known', identifier: 'EPSG:4326' }), 'sourceCrs.axisOrder');
  rejects(() => v.parseSourceCrs({ status: 'unknown' }), 'sourceCrs.reason');
});
test('Polygon och MultiPolygon kan valideras med uttryckligt WGS84 och rätt axelordning', () => {
  const multi = { type: 'MultiPolygon', coordinates: [polygon.coordinates] };
  assert.deepEqual(v.parseWgs84AreaGeometry(polygon, crs), polygon);
  assert.deepEqual(v.parseWgs84AreaGeometry(multi, crs), multi);
});
test('EPSG:3006, okänt och ej tillämpligt CRS kan inte märkas som WGS84', () => {
  for (const value of [projected, unknown, { status: 'not-applicable' }, { ...crs, axisOrder: 'latitude-longitude' }]) {
    rejects(() => v.parseWgs84AreaGeometry(polygon, value), 'geometry');
  }
});
test('Projicerade koordinater och separat CRS-fält avvisas även vid påstått WGS84', () => {
  const raw = { type: 'Polygon', coordinates: [[[500000, 6500000], [501000, 6500000], [501000, 6501000], [500000, 6500000]]] };
  rejects(() => v.parseWgs84AreaGeometry(raw, crs), 'geometry.coordinates[0][0]');
  rejects(() => v.parseWgs84AreaGeometry({ ...polygon, crs: projected }, crs), 'geometry.crs');
});
test('Tomma, öppna och degenererade ringar samt ogiltiga koordinater avvisas', () => {
  for (const coordinates of [[], [[]], [[[10, 50], [11, 50], [11, 51], [10, 51]]], [[[10, 50], [10, 50], [10, 50], [10, 50]]], [[[NaN, 50], [11, 50], [11, 51], [NaN, 50]]]]) {
    assert.throws(() => v.parseWgs84AreaGeometry({ type: 'Polygon', coordinates }, crs), v.ValidationError);
  }
});

const contracts = [
  ['AreaOfInterest', area, x => v.parseAreaOfInterest(x, crs), 'area'],
  ['SourceMetadata', source, v.parseSourceMetadata, 'source'],
  ['MunicipalityStatistics', statistics, v.parseMunicipalityStatistics, 'statistics'],
  ['PopulationGridCell', cell, x => v.parsePopulationGridCell(x, crs), 'cell'],
  ['AnalysisResult', result, x => v.parseAnalysisResult(x, crs), 'result'],
];
for (const [name, data, parse, root] of contracts) {
  test(`${name}: syntetiskt komplett kontrakt godtas utan att ändra indata`, () => {
    const before = structuredClone(data);
    assert.deepEqual(parse(data), data);
    assert.deepEqual(data, before);
  });
  test(`${name}: varje obligatoriskt toppnivåfält krävs`, () => {
    for (const field of Object.keys(data)) {
      const incomplete = structuredClone(data);
      delete incomplete[field];
      assert.throws(() => parse(incomplete), error => error instanceof v.ValidationError && error.path.startsWith(`${root}.${field}`));
    }
  });
}
test('Nästlade fel har exakt fältsökväg och blir inte tomma resultat', () => {
  const invalid = structuredClone(result);
  invalid.geographicReference.area.selection.municipalityCode = 1;
  rejects(() => v.parseAnalysisResult(invalid, crs), 'result.geographicReference.area.selection.municipalityCode');
});
test('Ritat område godtas med null källa och utan kommunkod', () => {
  const drawn = { ...area, selection: { kind: 'drawn' }, geometrySource: null };
  assert.deepEqual(v.parseAreaOfInterest(drawn, crs), drawn);
});
test('Källans EPSG:3006 bevaras separat från validerad webbgeometri', () => {
  assert.deepEqual(v.parsePopulationGridCell(cell, crs).source.sourceCrs, projected);
  rejects(() => v.parsePopulationGridCell(cell, projected), 'cell.geometry');
});
test('Metadata med uttryckligt okända uppgifter godtas utan antaganden', () => {
  const data = { ...source, license: unknown, attribution: unknown, referenceTime: unknown, retrievedAt: unknown, sourceCrs: unknown, geographicCoverage: unknown };
  assert.deepEqual(v.parseSourceMetadata(data), data);
});
test('Måtten bevarar skilda referensdagar och avvisar fel enhet', () => {
  const data = structuredClone(statistics);
  data.landArea.referenceTime = known({ kind: 'date', date: '2025-01-01' });
  assert.deepEqual(v.parseMunicipalityStatistics(data), data);
  data.landArea.unit = 'persons';
  rejects(() => v.parseMunicipalityStatistics(data), 'statistics.landArea.unit');
});
test('Referenstid stöder år, giltigt skottdatum och period', () => {
  for (const data of [{ kind: 'year', year: 2024 }, { kind: 'date', date: '2024-02-29' }, { kind: 'period', start: '2024-01-01', end: '2024-12-31' }]) assert.deepEqual(v.parseReferenceTime(data), data);
  rejects(() => v.parseReferenceTime({ kind: 'date', date: '2025-02-29' }), 'referenceTime.date');
  rejects(() => v.parseReferenceTime({ kind: 'period', start: '2025-01-01', end: '2024-01-01' }), 'referenceTime');
});
test('Fullständighet bevarar uttagets omfattning och begränsningar', () => {
  for (const data of [complete, { status: 'limited', scope: 'syntetisk BBOX', reasons: ['avbruten sida'] }, { status: 'unknown', scope: 'syntetisk BBOX', reason: 'antal okänt' }]) assert.deepEqual(v.parseCompleteness(data), data);
  rejects(() => v.parseCompleteness({ status: 'limited', scope: 'test' }), 'completeness.reasons');
  rejects(() => v.parseCompleteness({ status: 'complete' }), 'completeness.scope');
});
test('Loading, ready, empty och error förblir olika svarstillstånd', () => {
  const states = [
    { status: 'loading' },
    { status: 'ready', data: { status: 'available', value: 0 }, completeness: { status: 'limited', scope: 'test', reasons: ['tak'] } },
    { status: 'empty', reason: 'syntetiskt filter', completeness: complete, sources: [source] },
    { status: 'error', error: { kind: 'http', message: 'syntetiskt fel', httpStatus: 422 } },
    { status: 'error', error: { kind: 'network', message: 'syntetiskt nätverksfel', httpStatus: null } },
    { status: 'error', error: { kind: 'invalid-data', message: 'syntetiskt datafel', httpStatus: null } },
  ];
  for (const state of states) assert.deepEqual(v.parseDataState(state, v.parseNumericValue), state);
});
test('Ogiltiga svarstillstånd och saknade nästlade fält ger fel', () => {
  rejects(() => v.parseDataState({ status: 'ready', completeness: complete }, v.parseNumericValue), 'state.data');
  rejects(() => v.parseDataState({ status: 'ready', data: { status: 'available', value: Infinity }, completeness: complete }, v.parseNumericValue), 'state.data.value');
  rejects(() => v.parseDataState({ status: 'empty', completeness: complete, sources: [] }, v.parseNumericValue), 'state.reason');
  rejects(() => v.parseDataState({ status: 'error', error: {} }, v.parseNumericValue), 'state.error.kind');
  rejects(() => v.parseDataState({ status: 'other' }, v.parseNumericValue), 'state.status');
});
