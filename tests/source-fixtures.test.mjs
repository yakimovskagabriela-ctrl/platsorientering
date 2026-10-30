// Offlinekontroller av delscheman samt produktionsvalidering av kommunuppslag.
// Ingen normalisering, transformation eller nätverksadapter implementeras här.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lookupMunicipality } from '../src/providers/municipalityLookup.ts';
import { geocode } from '../src/providers/geocode.ts';
import {
  parseMunicipalityCode, parseMunicipalityStatistics, parsePopulationGridCell,
  parseWgs84AreaGeometry, parseMunicipalityLookupResponse, parseGeocodeResponse, ValidationError,
} from '../src/domain/validation.ts';

const fixtures = Object.fromEntries([
  'kart-api-geocode', 'kart-api-lookup', 'scb-tab628', 'scb-wfs',
].map(name => [name, JSON.parse(readFileSync(new URL(`./fixtures/${name}.synthetic.json`, import.meta.url), 'utf8'))]));
function scenario(source, id) {
  const entry = fixtures[source].cases.find(value => value.id === id);
  assert.ok(entry, `Fixturfall saknas: ${source}/${id}`);
  return entry;
}

// Små verkliga CC0-utdrag hämtas inte om av testsviten.
const realScb = Object.fromEntries(['scb-tab628', 'scb-wfs-limited', 'scb-wfs-empty']
  .map(name => [name, JSON.parse(readFileSync(new URL(`./fixtures/${name}.real.json`, import.meta.url), 'utf8'))]));

test('Verkliga SCB-fixturer: spårbart ursprung, hämtningsdatum och CC0', () => {
  for (const fixture of Object.values(realScb)) {
    assert.equal(fixture.synthetic, false);
    assert.equal(fixture.source.provider, 'SCB');
    assert.ok(['statistikdatabasen.scb.se', 'geodata.scb.se'].includes(new URL(fixture.source.url).hostname));
    assert.equal(fixture.httpStatus, 200);
    assert.equal(fixture.source.license, 'CC0-1.0');
    assert.equal(fixture.source.licenseUrl, 'https://www.scb.se/om-scb/om-scb.se-och-anvandningsvillkor/');
    assert.ok(Number.isFinite(Date.parse(fixture.source.retrievedAt)));
    assert.equal(fixture.source.referenceTimes.population, '2025-12-31');
  }
});

test('Verklig TAB628: kommuner, dimensionsordning och mått går att läsa utan felaktig join', () => {
  const { body, source } = realScb['scb-tab628'];
  tabValuesSubset(body);
  assert.deepEqual(body.size, [3, 1, 3, 1]);
  const regions = body.dimension.Region.category;
  // JavaScript räknar upp heltalslika nycklar före '0380'; använd JSON-stat-indexet.
  const orderedRegions = Object.keys(regions.index).sort((a, b) => regions.index[a] - regions.index[b]);
  assert.deepEqual(orderedRegions, ['0380', '1280', '2584']);
  for (const [code, name] of [['0380', 'Uppsala'], ['1280', 'Malmö'], ['2584', 'Kiruna']]) {
    assert.equal(parseMunicipalityCode(code), code);
    assert.equal(regions.label[code], name);
  }
  assert.deepEqual(Object.keys(body.dimension.Kon.category.index), ['1+2']);
  assert.deepEqual(Object.keys(body.dimension.Tid.category.index), ['2025']);
  assert.deepEqual(Object.keys(body.dimension.ContentsCode.category.index), ['BE0101U1', 'BE0101U2', 'BE0101U3']);
  for (const [i, code] of orderedRegions.entries()) {
    assert.equal(regions.index[code], i);
    const [density, population, landArea] = body.value.slice(i * 3, i * 3 + 3);
    assert.ok(population > 0 && Number.isInteger(population));
    assert.ok(landArea > 0);
    // Publicerad täthet har en decimal; jämför endast inom avrundningstoleransen.
    assert.ok(Math.abs(density - population / landArea) <= 0.05);
  }
  assert.equal(source.referenceTimes.landArea, '2026-01-01');
  assert.equal(source.crs.status, 'not-applicable');
});

test('Verklig WFS-ruta: begränsning, nullable kontrakt och käll-CRS bevaras', () => {
  const { body, source } = realScb['scb-wfs-limited'];
  wfsSubset(body);
  assert.equal(body.numberReturned, 1);
  assert.ok(body.numberMatched > body.numberReturned);
  assert.equal(body.crs.properties.name, 'urn:ogc:def:crs:EPSG::3006');
  const feature = body.features[0];
  assert.equal(feature.properties.referenstid, '20251231');
  assert.equal(feature.properties.rutstorl, 1000);
  assert.equal(source.crs.identifier, 'EPSG:3006');
  assert.throws(() => parseWgs84AreaGeometry(feature.geometry, {
    status: 'known', identifier: source.crs.identifier, axisOrder: 'easting-northing',
  }), ValidationError);
});

test('Verkligt tomt WFS-utdrag: inga träffar och null CRS är inte ogiltig geometri eller nollbefolkning', () => {
  const { body, source } = realScb['scb-wfs-empty'];
  wfsSubset(body);
  assert.equal(body.numberMatched, 0);
  assert.equal(body.numberReturned, 0);
  assert.deepEqual(body.features, []);
  assert.equal(body.crs, null);
  // Begärt CRS finns i proveniens, men ett tomt svar har ingen geometri att omprojektera.
  assert.equal(new URL(source.url).searchParams.get('srsName'), 'EPSG:3006');
});

test('Geocode-adapter: kodade parametrar, begränsad träfflista och bevarad attribution', async () => {
  const body = scenario('kart-api-geocode', 'limited-results').body;
  const before = structuredClone(body);
  let calls = 0;
  const result = await geocode({ q: 'Å & Ö', limit: 3, kommunkod: '0001' }, async url => {
    calls++;
    assert.equal(url.origin + url.pathname, 'https://api.kart-api.se/v1/geocode');
    assert.equal(url.searchParams.get('q'), 'Å & Ö');
    assert.equal(url.searchParams.get('limit'), '3');
    assert.equal(url.searchParams.get('kommunkod'), '0001');
    return Response.json(body);
  });
  assert.equal(calls, 1);
  assert.equal(result.status, 'ready');
  assert.deepEqual(result.data, body);
  assert.deepEqual(body, before);
  assert.notEqual(result.completeness.status, 'complete');
  assert.equal(Object.hasOwn(result.data.results[0], 'sourceCrs'), false);
});

test('Geocode-adapter: tomt filtrerat svar bevarar metadata och standardlimit', async () => {
  const body = scenario('kart-api-geocode', 'filtered-empty').body;
  const result = await geocode({ q: 'Test' }, async url => {
    assert.equal(url.searchParams.get('limit'), '5');
    assert.equal(url.searchParams.has('kommunkod'), false);
    return Response.json(body);
  });
  assert.equal(result.status, 'empty');
  assert.deepEqual(result.data, body);
  assert.equal(result.data.kommunfilter.begard, '0001');
});

test('Geocode-validering: valfria nullable fält och okänd entydighet bevaras', () => {
  const original = scenario('kart-api-geocode', 'limited-results').body;
  for (const mode of ['missing', 'null', 'values']) {
    const body = structuredClone(original);
    delete body.spridning;
    if (mode === 'null') {
      body.spridning = null;
      body.kommunfilter = null;
      Object.assign(body.results[0], { typ: null, kommunkod: null, lanskod: null, bbox: null });
    }
    if (mode === 'values') {
      body.spridning = { traffar: 0, kommuner: 0, entydig: null, skal: 'Omätt' };
      Object.assign(body.results[0], { typ: 'ort', kommunkod: '0001', lanskod: '00', bbox: [16, 60, 17, 61] });
    }
    assert.deepEqual(parseGeocodeResponse(body), body);
  }
});

test('Geocode-adapter: HTTP-fel, nätverksfel och ogiltiga svar skiljs åt', async () => {
  for (const status of [404, 422, 429, 502]) {
    const result = await geocode({ q: 'Test' }, async () => new Response('fel', { status }));
    assert.equal(result.status, 'error');
    assert.equal(result.error.kind, 'http');
    assert.equal(result.error.httpStatus, status);
  }
  const network = await geocode({ q: 'Test' }, async () => { throw new TypeError(); });
  assert.equal(network.error.kind, 'network');
  assert.equal(network.error.httpStatus, null);
  const original = scenario('kart-api-geocode', 'limited-results').body;
  for (const response of [new Response('{'), Response.json({ ...original, antal: 99 }),
    Response.json({ ...original, results: 'fel' })]) {
    const result = await geocode({ q: 'Test' }, async () => response);
    assert.equal(result.error.kind, 'invalid-data');
    assert.equal(result.error.httpStatus, 200);
  }
});

test('Geocode: felaktiga fält och inparametrar avvisas', async () => {
  const original = scenario('kart-api-geocode', 'limited-results').body;
  for (const field of ['lat', 'lon', 'namn', 'tier', 'kalla']) {
    const body = structuredClone(original);
    delete body.results[0][field];
    assert.throws(() => parseGeocodeResponse(body), ValidationError);
  }
  for (const change of [
    { tier: 1 }, { kalla: null }, { lat: Infinity }, { kommunkod: '1' }, { bbox: ['fel'] },
  ]) {
    const body = structuredClone(original);
    Object.assign(body.results[0], change);
    assert.throws(() => parseGeocodeResponse(body), ValidationError);
  }
  for (const input of [{ q: '' }, { q: ' ' }, { q: 'x', limit: 0 },
    { q: 'x', limit: 21 }, { q: 'x', limit: 1.5 }, { q: 'x', kommunkod: '1' }]) {
    const result = await geocode(input, async () => { assert.fail('Inget anrop ska göras'); });
    assert.equal(result.error.kind, 'invalid-data');
    assert.equal(result.error.httpStatus, null);
  }
});

test('Lookup-adapter: rätt URL, validerat svar och oförändrad attribution utan CRS-antagande', async () => {
  const body = scenario('kart-api-lookup', 'municipality-found').body;
  let calls = 0;
  const result = await lookupMunicipality({ lat: 59.3293, lon: 18.0686 }, async url => {
    calls++;
    assert.equal(String(url), 'https://api.kart-api.se/v1/kommun/lookup?lat=59.3293&lon=18.0686');
    return Response.json(body);
  });
  assert.equal(calls, 1);
  assert.equal(result.status, 'ready');
  assert.deepEqual(result.data, body);
  assert.equal(result.data.kommunkod, '0001');
  assert.deepEqual(result.data.attribution, body.attribution);
  assert.equal(Object.hasOwn(result.data, 'sourceCrs'), false);
  assert.equal(Object.hasOwn(result.data, 'geometry'), false);
});

test('Lookup-adapter: 404 är tom träff, 422 och andra HTTP-fel är fel', async () => {
  for (const status of [404, 422, 429, 500]) {
    const result = await lookupMunicipality({ lat: 59, lon: 18 }, async () =>
      new Response('inte JSON', { status }));
    if (status === 404) {
      assert.equal(result.status, 'empty');
      assert.equal(result.completeness.status, 'unknown');
    } else {
      assert.equal(result.status, 'error');
      assert.equal(result.error.kind, 'http');
      assert.equal(result.error.httpStatus, status);
    }
  }
});

test('Lookup-adapter: nätverksfel skiljs från felaktig JSON och ogiltigt svar', async () => {
  const network = await lookupMunicipality({ lat: 59, lon: 18 }, async () => {
    throw new TypeError('syntetiskt nätverksfel');
  });
  assert.equal(network.status, 'error');
  assert.equal(network.error.kind, 'network');
  assert.equal(network.error.httpStatus, null);
  for (const response of [new Response('{'), Response.json({ kommunkod: 180 })]) {
    const result = await lookupMunicipality({ lat: 59, lon: 18 }, async () => response);
    assert.equal(result.status, 'error');
    assert.equal(result.error.kind, 'invalid-data');
    assert.equal(result.error.httpStatus, 200);
  }
});

test('Lookup-adapter: ogiltiga koordinater stoppas före nätverksanrop', async () => {
  for (const coordinates of [
    { lat: NaN, lon: 18 }, { lat: 91, lon: 18 },
    { lat: 59, lon: Infinity }, { lat: 59, lon: -181 },
  ]) {
    const result = await lookupMunicipality(coordinates, async () => {
      assert.fail('Inget nätverksanrop får göras');
    });
    assert.equal(result.status, 'error');
    assert.equal(result.error.kind, 'invalid-data');
    assert.equal(result.error.httpStatus, null);
  }
});
function strings(value) {
  assert.ok(Array.isArray(value));
  for (const item of value) assert.equal(typeof item, 'string');
}
function geocodeSubset(body) {
  assert.equal(typeof body.query, 'string');
  assert.ok(Number.isInteger(body.antal) && body.antal >= 0);
  assert.ok(Array.isArray(body.results), 'results måste vara en lista');
  assert.equal(body.antal, body.results.length);
  strings(body.attribution);
  for (const hit of body.results) {
    for (const field of ['lat', 'lon', 'namn', 'tier', 'kalla']) assert.ok(Object.hasOwn(hit, field), `GeoTraff saknar ${field}`);
    assert.ok(Number.isFinite(hit.lat));
    assert.ok(Number.isFinite(hit.lon));
    assert.equal(typeof hit.namn, 'string');
    // tier/kalla: endast närvaro belagd. Ingen typ eller enum antas.
  }
  assert.ok(Number.isInteger(body.spridning.traffar));
  assert.ok(Number.isInteger(body.spridning.kommuner));
  assert.ok([true, false, null].includes(body.spridning.entydig));
}
function lookupSubset(body) {
  return parseMunicipalityLookupResponse(body);
}
function tabValuesSubset(body) {
  assert.deepEqual(body.id, ['Region', 'Kon', 'ContentsCode', 'Tid']);
  assert.equal(body.size.length, body.id.length);
  assert.ok(body.size.every(n => Number.isInteger(n) && n >= 0));
  assert.ok(Array.isArray(body.value));
  assert.equal(body.value.length, body.size.reduce((a, b) => a * b, 1), 'Antalet datapositioner stämmer inte med dimensionerna');
  for (const value of body.value) assert.ok(value === null || Number.isFinite(value));
  // Endast fixturens täta arrayformat, inte alla JSON-stat2-representationer.
}
function wfsSubset(body) {
  assert.equal(body.type, 'FeatureCollection');
  assert.ok(Array.isArray(body.features));
  assert.ok(Number.isInteger(body.numberMatched) && body.numberMatched >= 0);
  assert.equal(body.numberReturned, body.features.length);
  assert.ok(body.numberReturned <= body.numberMatched);
  for (const feature of body.features) {
    assert.equal(feature.type, 'Feature');
    assert.ok(feature.properties.beftotalt === null || Number.isFinite(feature.properties.beftotalt), 'beftotalt har fel typ');
    for (const field of ['objectid', 'rutid_inspire', 'rutid_scb', 'rutstorl', 'referenstid']) assert.ok(Object.hasOwn(feature.properties, field), `Rutobjekt saknar ${field}`);
    assert.equal(feature.geometry?.type, 'Polygon');
    assert.ok(Array.isArray(feature.geometry.coordinates));
  }
  // Gäller bara det undersökta delschemat; inga generella WFS-garantier.
}

for (const [name, fixture] of Object.entries(fixtures)) {
  test(`${name}: JSON kan läsas, är syntetiskt märkt och har unika fall`, () => {
    assert.equal(fixture.synthetic, true);
    assert.equal(typeof fixture.description, 'string');
    assert.ok(fixture.cases.length > 0);
    assert.equal(new Set(fixture.cases.map(c => c.id)).size, fixture.cases.length);
    for (const entry of fixture.cases) {
      assert.equal(typeof entry.purpose, 'string');
      assert.ok(Number.isInteger(entry.httpStatus));
      assert.notEqual(Object.hasOwn(entry, 'body'), Object.hasOwn(entry, 'bodySubset'));
    }
  });
}
test('Geocode: kända träfffält och antal är konsekventa i begränsat svar', () => {
  const entry = scenario('kart-api-geocode', 'limited-results');
  assert.equal(entry.httpStatus, 200);
  geocodeSubset(entry.body);
  assert.equal(entry.body.results.length, entry.expectedResultsLength);
  assert.ok(entry.body.spridning.traffar > entry.body.antal);
  assert.equal(entry.body.spridning.entydig, false);
});
test('Geocode: varje redovisat obligatoriskt GeoTraff-fält krävs av delschemat', () => {
  for (const field of ['lat', 'lon', 'namn', 'tier', 'kalla']) {
    const body = structuredClone(scenario('kart-api-geocode', 'limited-results').body);
    delete body.results[0][field];
    assert.throws(() => geocodeSubset(body), /GeoTraff saknar/);
  }
});
test('Geocode: tomt efter filter hålls åtskilt från namnets spridning', () => {
  const body = scenario('kart-api-geocode', 'filtered-empty').body;
  geocodeSubset(body);
  assert.deepEqual(body.results, []);
  assert.equal(parseMunicipalityCode(body.kommunfilter.begard), '0001');
  assert.ok(body.kommunfilter.bortfiltrerade > 0);
  assert.equal(typeof body.kommunfilter.skal, 'string');
  assert.ok(body.spridning.traffar > 0);
});
test('Geocode: strukturerat 422-fel är inte en tom lyckad resultatlista', () => {
  const entry = scenario('kart-api-geocode', 'required-query-error');
  assert.equal(entry.httpStatus, 422);
  assert.equal(typeof entry.body.detail, 'string');
  assert.equal(typeof entry.body.skal, 'string');
  assert.ok(entry.body.fel.length > 0);
  assert.equal(entry.body.fel[0].falt, 'q');
  assert.equal(typeof entry.body.fel[0].varfor, 'string');
  assert.throws(() => geocodeSubset(entry.body));
});
test('Geocode: felaktig resultattyp avvisas av delschemat', () => {
  assert.throws(() => geocodeSubset(scenario('kart-api-geocode', 'invalid-results-type').body), /results måste/);
});
test('Lookup: kända fält, strängkod och attribution bevaras i råsvaret', () => {
  const body = scenario('kart-api-lookup', 'municipality-found').body;
  lookupSubset(body);
  assert.equal(body.kommunkod, '0001');
  assert.ok(body.attribution.length > 0);
});
test('Lookup: länsnamn kan saknas eller vara null, utan att indata ändras', () => {
  const original = scenario('kart-api-lookup', 'municipality-found').body;
  for (const mode of ['string', 'missing', 'null']) {
    const body = structuredClone(original);
    if (mode === 'missing') delete body.lansnamn;
    if (mode === 'null') body.lansnamn = null;
    const before = structuredClone(body);
    const parsed = lookupSubset(body);
    assert.deepEqual(parsed, body);
    assert.deepEqual(body, before);
    assert.equal(Object.hasOwn(parsed, 'lansnamn'), mode !== 'missing');
    assert.equal(parsed.kommunkod, '0001');
    assert.deepEqual(parsed.attribution, original.attribution);
  }
});

test('Lookup: obligatoriska fält och felaktiga fälttyper ger exakt felväg', () => {
  const original = scenario('kart-api-lookup', 'municipality-found').body;
  for (const field of ['kommunkod', 'kommunnamn', 'lanskod', 'attribution']) {
    const body = structuredClone(original);
    delete body[field];
    assert.throws(() => lookupSubset(body), error =>
      error instanceof ValidationError && error.path === `lookup.${field}`);
  }
  for (const [field, value, path] of [
    ['kommunkod', '180', 'kommunkod'],
    ['kommunnamn', null, 'kommunnamn'],
    ['lanskod', 1, 'lanskod'],
    ['lansnamn', 1, 'lansnamn'],
    ['lansnamn', undefined, 'lansnamn'],
    ['attribution', 'text', 'attribution'],
    ['attribution', [1], 'attribution[0]'],
  ]) {
    assert.throws(() => lookupSubset({ ...original, [field]: value }), error =>
      error instanceof ValidationError && error.path === `lookup.${path}`);
  }
  for (const value of [null, [], 'text']) {
    assert.throws(() => lookupSubset(value), ValidationError);
  }
});

test('Lookup: 404 utan träff är ett eget råsvar, inte ett lyckat kommunobjekt', () => {
  const entry = scenario('kart-api-lookup', 'outside-municipalities');
  assert.equal(entry.httpStatus, 404);
  assert.equal(typeof entry.body.detail, 'string');
  assert.throws(() => lookupSubset(entry.body), ValidationError);
});
test('Lookup: numerisk kommunkod avvisas utan utfyllnad', () => {
  assert.throws(() => lookupSubset(scenario('kart-api-lookup', 'invalid-municipality-code').body), ValidationError);
});
test('TAB628: JSON-stat2-dimensioner, måttkoder, noll och null kan granskas offline', () => {
  const body = scenario('scb-tab628', 'three-measures-zero-and-missing').body;
  assert.equal(body.version, '2.0');
  assert.equal(body.class, 'dataset');
  tabValuesSubset(body);
  for (const [i, id] of body.id.entries()) {
    const indexes = Object.values(body.dimension[id].category.index);
    assert.equal(indexes.length, body.size[i]);
    assert.deepEqual([...indexes].sort((a, b) => a - b), Array.from({ length: body.size[i] }, (_, n) => n));
  }
  assert.equal(parseMunicipalityCode(Object.keys(body.dimension.Region.category.index)[0]), '0001');
  assert.deepEqual(Object.keys(body.dimension.ContentsCode.category.index), ['BE0101U1', 'BE0101U2', 'BE0101U3']);
  assert.ok(Object.hasOwn(body.dimension.Kon.category.index, '1+2'));
  assert.equal(body.value[0], 0);
  assert.equal(body.value[2], null); // Ingen gissad klassificering som sekretess.
});
test('TAB628: ofullständigt värdeutdrag kan inte räknas som komplett dataset', () => {
  const entry = scenario('scb-tab628', 'incomplete-values');
  assert.ok(!Object.hasOwn(entry, 'body'));
  assert.throws(() => tabValuesSubset(entry.bodySubset), /Antalet datapositioner/);
});
test('WFS: antal skiljer en giltig begränsad sida från ett komplett uttag', () => {
  const body = scenario('scb-wfs', 'limited-page-projected-geometry').body;
  wfsSubset(body);
  assert.ok(body.numberMatched > body.numberReturned);
  const properties = body.features[0].properties;
  assert.equal(properties.beftotalt, 0);
  assert.equal(properties.man, null);
  assert.equal(properties.kvinna, null);
});
test('WFS: tom FeatureCollection godtas som tomt uttag i delschemat', () => {
  const body = scenario('scb-wfs', 'empty-selection').body;
  wfsSubset(body);
  assert.equal(body.numberMatched, 0);
  assert.deepEqual(body.features, []);
});
test('WFS: felaktigt befolkningsfält avvisas, inte omvandlas till noll', () => {
  const body = scenario('scb-wfs', 'invalid-population-type').bodySubset;
  assert.throws(() => wfsSubset(body), /beftotalt har fel typ/);
});
test('WFS: källgeometrin i EPSG:3006 får inte bli färdig WGS84', () => {
  const body = scenario('scb-wfs', 'limited-page-projected-geometry').body;
  assert.equal(body.crs.properties.name, 'urn:ogc:def:crs:EPSG::3006');
  assert.throws(() => parseWgs84AreaGeometry(body.features[0].geometry, {
    status: 'known', identifier: 'EPSG:3006', axisOrder: 'easting-northing',
  }), ValidationError);
});
test('Råa TAB628- och WFS-svar är inte interna domänobjekt', () => {
  assert.throws(() => parseMunicipalityStatistics(scenario('scb-tab628', 'three-measures-zero-and-missing').body), ValidationError);
  assert.throws(() => parsePopulationGridCell(scenario('scb-wfs', 'limited-page-projected-geometry').body.features[0], {
    status: 'known', identifier: 'EPSG:3006', axisOrder: 'easting-northing',
  }), ValidationError);
});

// Dokumenterade luckor, inga gissade normaliserare eller schemafält:
// - GeoTraff tier/kalla: typ/enum inte belagda, bara fältnärvaro testas.
// - TAB628: ingen leverantörsspecifik sekretesskod eller fel-/tomsvarsstruktur belagd.
// - WFS: stabilt ID-format och fullständiga fälttyper inte belagda.
// - Fixturernas simulerade HTTP-status säger inget om verklig transport eller CORS.
// - Fullständig normalisering, CRS-transformation och adapterintegration testas inte.
