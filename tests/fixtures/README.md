# P2-fixturer: syntetiska och verkliga SCB-utdrag

Filer med ändelsen `.synthetic.json` är påhittade testdata skrivna för projektet. Deras namn, identifierare, texter och koordinater är syntetiska; leverantörsnamn, endpoints och fältnamn anger vilket kontrakt som undersöks. Syntetiska attributioner är teststrängar, inte verkliga licensuppgifter. Filer med `.real.json` innehåller däremot små verkliga SCB-svar enligt avsnittet nedan. Inga verkliga kart-api-svar finns här.

Underlag: [DATA_SOURCES.md](../../docs/DATA_SOURCES.md), P2 i [ROADMAP.md](../../ROADMAP.md) samt [ARCHITECTURE.md](../../ARCHITECTURE.md). De syntetiska fixturerna skapades 22 oktober 2026 utan datahämtning. Verkliga SCB-utdrag tillkom 28 oktober 2026. Geocodes fem obligatoriska träfffält är `lat`, `lon`, `namn`, `tier`, `kalla`; OpenAPI kontrollerades 28 oktober enligt DATA_SOURCES.

## Verkliga SCB-utdrag, hämtade 28 oktober 2026

| Fil | Begränsat urval |
| --- | --- |
| `scb-tab628.real.json` | Uppsala `0380`, Malmö `1280`, Kiruna `2584`; totalt kön, år 2025, publicerad täthet/folkmängd/landareal: nio dataceller. |
| `scb-wfs-limited.real.json` | En hel ruta ur `stat:befolkning_1km_2025`; svaret har 1 av 17 matchande objekt i BBOX. EPSG:3006, referenstid 2025-12-31. |
| `scb-wfs-empty.real.json` | Geografiskt tomt utsnitt från samma lager: inga objekt, `crs=null`. Begärt CRS dokumenteras separat från svarskroppen. |

SCB:s [officiella användningsvillkor](https://www.scb.se/om-scb/om-scb.se-och-anvandningsvillkor/), kontrollerade 28 oktober, anger **CC0 1.0** för öppna statistikdata och geodata i Statistikdatabasen/geodataplattformen. Detta stöder lagring och återpublicering av dessa små utdrag. `Källa: SCB` bevaras för projektets spårbarhet. Rättigheterna för kart-api-fixturer är fortsatt oklara; de verkliga exemplen kommer uteslutande direkt från SCB.

Varje verklig fil är en behållare med `synthetic=false`, `source`, observerad `httpStatus` och `body`. `source` innehåller exakt GET-URL, hämtningsögonblick i UTC (`retrievedAt`), licens och villkorslänk, datum för rättighetskontrollen, attribution, referenstider, CRS-underlag och bearbetningsbeskrivning. `body` bevarar hela hämtade JSON-svaret semantiskt; endast formatering och omslutande projektmetadata har tillkommit. Ett litet urval begärdes från API:t; inga objekt klipptes ur ett större svar. TAB628:s folkmängd avser 2025-12-31 och landarealen 2026-01-01. Hämtningsdatum är ett annat slags datum.

Testerna körs utan nätverk via `npm.cmd test`. De kontrollerar proveniens, kommun-/dimensionskoppling via JSON-stat-index (inte objektens nyckelordning), publicerad täthets avrundning i dessa prov, begränsat WFS-uttag, tomt CRS och att projicerad geometri inte blir WGS84 genom ometikettering. Exemplen bevisar inte nationell täckning eller framtida tjänstetillgänglighet. Befolkningsrutornas röjandeskydd gäller fortsatt; delvärden får inte förutsättas summera till totalen.

## Format och användning

Varje `.synthetic.json`-fil är en **testbehållare**, inte ett leverantörssvar. `synthetic`, `description`, `endpoint`/`table`/`layer`, `cases`, `id`, `purpose`, `httpStatus`, `bodySubset`, `omittedFields`, `expectedResultsLength` och `limitation` är projektets testmetadata.

- `body` innehåller en syntetisk svarskropp med kända fält. Detta är inte en certifiering av fullständigt leverantörsschema.
- `bodySubset` är uttryckligen ett fältutdrag. Det får inte användas som komplett giltigt svar eller passera en framtida fullständig svarvalidator utan komplettering.
- `httpStatus` är ett simulerat testvillkor, inte en mätning. Inga CORS-headers simuleras; JSON-filer belägger inte browseråtkomst.
- Alla filer är syntaktiskt giltig JSON. Felaktiga fall bryter avsiktligt mot datakontrakt, inte JSON-syntax.
- Fixturerna används av `tests/source-fixtures.test.mjs` för delscheman och kart-api-adaptrarnas hantering av syntetiska svar. De separata domäntesterna ligger i `tests/validation.test.mjs`. Ordinarie tester gör inga nätverksanrop. Råa källsvar är inte samma sak som projektets normaliserade interna kontrakt.

## Urval

| Fil | Fall och syfte |
| --- | --- |
| `kart-api-geocode.synthetic.json` | Begränsad lyckad sökning med ett påhittat träffobjekt och samtliga fem redovisade obligatoriska GeoTraff-fält, tomt efter kommunfilter, strukturerat 422-fel och felaktig resultattyp. Resultatlistans antal hålls åtskilt från spridningen. |
| `kart-api-lookup.synthetic.json` | Normalt uppslag, 404 utan träff och felaktig numerisk kommunkod. `0001` är en syntetisk kod för formatkontroll, inte en verklig kommun. |
| `scb-tab628.synthetic.json` | Minimalt JSON-stat2-dataset med de dokumenterade dimensionerna/måttkoderna samt ett ofullständigt och därmed felaktigt värdeutdrag. Testar noll, null och antal datapositioner. |
| `scb-wfs.synthetic.json` | Normal men begränsad sida med hel syntetisk ruta i EPSG:3006, tomt uttag och felaktigt objektutdrag. Serverns antal får inte likställas med hämtad fullständighet. |

## Begränsningar och öppna kontraktsfrågor

- Geocodes begränsade fall innehåller `results` med `lat`, `lon`, `namn`, `tier` och `kalla`. `antal` och listlängd är båda 1 medan spridningen är större. Alla träffvärden är syntetiska. Vid OpenAPI-kontrollen 28 oktober 2026 bekräftades att `tier` och `kalla` är strängar; de dokumenterade exemplen är inte enums. Fixturen används som positivt adaptertest, men är inte ett verkligt provsvar eller belägg för källans CRS.
- TAB628-exemplet är inte SCB:s fullständiga metadata, dimensionstexter eller ett verkligt uttag. Det syntetiska året 2000 påstår inte att tabellen erbjuder den årgången. Ingen normal tom TAB628-svarstruktur eller SCB-felkropp är belagd här; sådana svar har inte uppfunnits. Dimensionsbortfall är ogiltigt data, inte ett dokumenterat pagineringsprotokoll.
- WFS-exemplet använder GeoJSON-liknande källstruktur med uttryckligt EPSG:3006 enligt redovisningen. Det är **inte färdig GeoJSON/WGS84 vid webbgränsen** och får inte bara etiketteras om. Datum och rut-ID är syntetiska. Tillåtna ID-format och fullständiga fälttyper måste bekräftas före adapterimplementation.
- `null` är inte automatiskt noll eller sekretess. Ingen leverantörsspecifik sekretesskod är belagd och ingen sådan kod har hittats på. Skillnaden mellan noll, saknat och sekretess testas redan separat i domäntesterna.
- För att undvika dubbletter finns strukturerat 422-fel bara i geocode-filen. Lookup har sitt särskilda 404-fall. HTTP-/nätverksfel för SCB behöver framtida transporttester; någon påhittad officiell felstruktur har inte skapats.
- Rättigheter för verkliga svar, serverbehov, källa och CRS-uppgifter som är öppna i DATA_SOURCES/DECISIONS förblir öppna. Syntetiska fixturer verifierar varken leverantörsbeteende eller färdig P2-integration.

## Kontroll

Efter tillägget av de tre verkliga SCB-fixturerna passerade typkontrakt och **63 runtime-tester**, inklusive fyra nya kontroller, samt `npm.cmd run typecheck`. Första nya TAB628-testet använde felaktigt objektens nyckelordning; det rättades till dimensionsindex utan ändring av källdata eller produktionskod. Testkörningen krävde åter körning utanför sandlådan efter `spawn EPERM`.

Den 28 oktober 2026 passerade `npm.cmd test` med typkontrakt och 59 runtime-tester (29 domäntester och 30 käll-/adaptertester); även `npm.cmd run typecheck` passerade. Sandlådans `spawn EPERM` krävde att testkörningen gjordes utanför sandlådan. Separata liveprov av båda kart-api-adaptrarna finns i [DATA_SOURCES](../../docs/DATA_SOURCES.md#livekontroll-av-projektets-adaptrar-28-oktober-2026); de kördes via standardindata i Node och sparades inte som tester eller fixturer. Inget nytt browsertest gjordes.

JSON-syntax kan kontrolleras från reporoten utan nätverk eller filändringar:

```powershell
node --input-type=module -e "import {readdirSync,readFileSync} from 'node:fs'; for (const name of readdirSync('tests/fixtures').filter(n=>n.endsWith('.json'))) { JSON.parse(readFileSync('tests/fixtures/'+name,'utf8')); console.log(name); }"
git diff --check
```
