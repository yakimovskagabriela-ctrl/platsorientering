# Datakällor och API-utvärdering

Sammanställt 22 oktober 2026 för P2, uppdaterat 28 oktober 2026 med projektets livekontroller av kart-api, senaste testkörning och en separat metadatakontroll enligt nedan. Äldre underlag är Gabrielas redovisade externa tester, utkastet ”P2 – Datakällor: verifierade fynd och öppna punkter” (2026-10-22) och dokumentationsgenomgångar i Codex-konversationen. Vid metadatakompletteringen hämtades officiell dokumentation, TAB628-metadata, WFS-metadata, en befolkningsruta och kommungränsarkivet på nytt. Inga kodändringar eller nya körningar av den ordinarie testsviten gjordes.

- **Observation:** äldre redovisat externt testresultat, om inget annat anges. Avsnittet om livekontroll 28 oktober anger vilka prov AI faktiskt körde med projektets adaptrar.
- **Dokumentation:** leverantörsuppgift, inte uppmätt beteende.
- **Öppet:** underlag eller beslut saknas. Sammanställningsdatum är inte automatiskt hämtningsdatum.

De fem interna datakontrakten och gemensamma stödtyper finns i [contracts.ts](../src/domain/contracts.ts), med runtime-validering i [validation.ts](../src/domain/validation.ts). Senaste körningen den 28 oktober, efter tillägget av verkliga SCB-fixturer, gav **63 passerade runtime-tester** (29 domäntester och 34 käll-/adaptertester) samt godkända typkontrakt. Även `npm.cmd run typecheck` passerade. Testkörningen behövde ske utanför Codex-sandlådan efter `spawn EPERM`; detta var ett miljöhinder, inte ett konstaterat kodfel. Inga tester kördes om vid denna dokumentsynkronisering.

Fyra märkta syntetiska API-fixturfiler finns under `tests/fixtures/` och används av [käll-/adaptertesterna](../tests/source-fixtures.test.mjs). Adaptrarna [municipalityLookup.ts](../src/providers/municipalityLookup.ts) och [geocode.ts](../src/providers/geocode.ts) finns och har provats mot riktiga API-svar. De är ännu inte inkopplade i gränssnittet. Tre verkliga SCB-svar har nu sparats som fixturer enligt avsnittet nedan; SCB-normalisering och adapterintegration återstår. GitHub Issue #2 kunde inte läsas direkt, men Gabriela har därefter tillhandahållit dess fem klartkriterier i konversationen. De motsvarar P2 i [ROADMAP](../ROADMAP.md); jämförelsen nedan använder denna kravtext och [ARCHITECTURE](../ARCHITECTURE.md). För kart-api är direkt browseråtkomst utan API-nyckel beslutad i samråd med Henrik den 28 oktober 2026; se [DECISIONS](DECISIONS.md#p2--api-åtkomst-28-oktober-2026). Åtkomstlösningar för SCB och kommungränser är inte slutligt avgjorda.

## Daterad metadatakontroll, 28 oktober 2026

### Sparade verkliga SCB-fixturer, 28 oktober 2026

Efter metadatakontrollerna sparades tre små, verkliga JSON-svar direkt från SCB i [tests/fixtures](../tests/fixtures/README.md), med CC0-stöd från [SCB:s användningsvillkor](https://www.scb.se/om-scb/om-scb.se-och-anvandningsvillkor/), återkontrollerade samma dag:

- [scb-tab628.real.json](../tests/fixtures/scb-tab628.real.json): nio publicerade värden, tre mått för Uppsala, Malmö och Kiruna, totalt kön, år 2025. Folkmängd avser 2025-12-31 och landareal 2026-01-01; tabellsvaret saknar geometri.
- [scb-wfs-limited.real.json](../tests/fixtures/scb-wfs-limited.real.json): en hel ruta, 1 av 17 BBOX-träffar, EPSG:3006 och referenstid 20251231.
- [scb-wfs-empty.real.json](../tests/fixtures/scb-wfs-empty.real.json): geografiskt tomt utsnitt, 0 träffar och `crs=null`.

Varje fil innehåller exakt käll-URL, hämtningsögonblick i UTC, observerad HTTP-status, licens/villkorslänk, attribution, referenstider, CRS-underlag och hela JSON-svaret under `body`. Ingen semantisk bearbetning av svarskropparna gjordes. Dessa begränsade API-uttag är sparade provsvar, inte en egen nationell databas. Inga verkliga kart-api-data hämtades eller sparades i detta steg.

`npm.cmd test` passerade med typkontrakt och **63 runtime-tester** (fyra nya); `npm.cmd run typecheck` passerade också. Nya tester kontrollerar proveniens, JSON-stat-dimensionsindex och kommunkoder, avrundad täthet för provvärdena, begränsat WFS-svar, tomt CRS och skydd mot ometikettering av EPSG:3006 till WGS84. Testsviten använder sparade svar utan nätverk. Första nya TAB628-testets antagande om JavaScripts nyckelordning rättades i testet till JSON-stat-index; inga källdata eller produktionsfunktioner ändrades. Körningen behövde ske utanför sandlådan efter `spawn EPERM`.

Nedanstående redovisningar av att inga verkliga provsvar sparades gäller de tidigare kontrollstegen. De tre filerna ovan är ett senare, uttryckligt fixturtillägg; kart-api:s fixturrättigheter är fortfarande öppna.

AI hämtade nedanstående resurser från leverantörernas officiella adresser. Angivna datum är nya kontroll-/hämtningsdatum och ersätter inte okända datum för Gabrielas äldre uttag. API- och ZIP-innehåll lästes i minnet; inga nya rådatafiler eller fixturer lades i repot. Kontrollen gjordes via Node/PowerShell, inte i webbläsaren.

| Källa och hämtat underlag | Bekräftat | Fortsatt öppet |
| --- | --- | --- |
| kart-api: [OpenAPI](https://api.kart-api.se/openapi.json), [Kom igång](https://kart-api.se/docs/), [attribution](https://kart-api.se/docs/attribution/), [API-referens](https://kart-api.se/docs/referens/), [kommunguiden](https://kart-api.se/guider/vilken-kommun/) och [Om talen](https://kart-api.se/om-talen/) | OpenAPI hämtades med HTTP 200. Kommunguiden anger punkt-i-polygon mot Lantmäteriets gränser. OpenAPI:s `KommunFeature.geometry` beskrivs som WGS84, förenklad för visning. Detta gäller geometri från kommunendpointen, inte ett uttryckligt CRS-besked för geocode/lookup. | Uttryckligt CRS/datum för geocodes `lat`/`lon` och lookup-indata, källdatats referenstid/version, uppdateringsfrekvens och kommunindelningens årgång kunde inte beläggas i dessa källor. |
| SCB [TAB628-metadata](https://statistikdatabasen.scb.se/api/v2/tables/TAB628/metadata?lang=sv), HTTP 200 | `ContentsCode.extension.refperiod` anger befolkning 31 december och landareal 1 januari följande år. Urvalet 2025 avser alltså 2025-12-31 respektive 2026-01-01; tätheten relaterar dessa mått. `updated=2026-02-24T07:00:00Z` bekräftades. Tabellen saknar geometri: CRS är inte tillämpligt på tabellsvaret. | Matchning mot vald gränsårgång återstår. Metadatafältet `updated` är inte ett hämtningsdatum eller ett generellt besked om uppdateringsfrekvens. |
| SCB [WFS GetCapabilities](https://geodata.scb.se/geoserver/stat/wfs?service=wfs&version=1.1.0&request=GetCapabilities), HTTP 200, samt dess länkade [ISO-metadata](https://www.geodata.se/geodataportalen/oppnadata/swe/csw?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=1c1d36c5-58b5-4447-94ab-36b57e818931&outputSchema=csw:IsoRecord), HTTP 200 | `stat:befolkning_1km_2025` har `DefaultSRS=urn:x-ogc:def:crs:EPSG:3006`. ISO-posten anger också EPSG:3006, nationella data utan INSPIRE och tidsutsträckning 2015-12-31–2025-12-31. Ett nytt GetFeature-prov gav `referenstid="20251231"` och uttryckligt EPSG:3006. | Ingen omprojektion eller generell kontroll av axelordning för alla WFS-format gjordes. Full sidindelning återtestades inte. |
| SCB [Digitala gränser](https://www.scb.se/hitta-statistik/regional-statistik-och-kartor/regionala-indelningar/digitala-granser/) och sidans [shape_svenska_260225.zip](https://www.scb.se/contentassets/3443fea3fa6640f7a57ea15d9a372d33/shape_svenska_260225.zip) | Arkivet hämtades och `Kommun_Sweref99TM.zip/Kommun_Sweref99TM.prj` lästes. SCB anger SWEREF99 TM; projektionens parametrar överensstämmer med Lantmäteriets officiella definition nedan. | Varken produktsidan eller kommunarkivets innehåll fastställer gränsernas giltighetsdag/årgång. ZIP-tidsstämplar är inte en sådan uppgift. Äldre nedladdningsdatum är fortsatt okänt. |

### Underlag för kommungränsernas CRS och årgång

Kommunarkivet innehöll `.dbf`, `.prj`, `.shp` och `.shx`, utan separat text-/XML-metadata om årgång. `.prj` anger `PROJECTION["Transverse_Mercator"]`, GRS 80 (`6378137.0`, `298.257222101`), centralmeridian 15°, skalfaktor 0,9996, falsk öst 500000 m, falsk nord 0 m, latitud för origo 0° och enhet meter. Namnen är `unnamed`/`D_GRS_80`; explicit EPSG-auktoritet och AXIS-poster saknas.

SCB:s uttryckliga uppgift SWEREF99 TM tillsammans med parameterkontrollen stöder **SWEREF 99 TM/EPSG:3006 för den nu hämtade gränsfilen**. Jämförelsekällor, kontrollerade 28 oktober: [Lantmäteriets referenssystem och projektionsparametrar](https://www.lantmateriet.se/en/geodata/gps-geodesy-and-swepos/swedish-reference-systems/) och [Svenska transformationer i PROJ, tabell 1](https://www.lantmateriet.se/globalassets/geodata/gps-och-geodetisk-matning/svenska-transformationer-i-proj-web.pdf), som kopplar SWEREF 99 TM till EPSG:3006. `.prj` ensam namnger inte datumet tillräckligt; SCB:s produktbeskrivning ingår därför i belägget. Ingen omprojektion eller kontroll av samtliga koordinater gjordes.

Ytterarkivets kommun-ZIP hade tidsstämpel 2023-11-13 och de fyra kommunfilerna 2023-05-16. Dessa är observerade arkivtidsstämplar, **inte bekräftad gränsårgång**. Varken `260225` i nedladdningsnamnet eller de äldre filstämplarna används som referenstid. Nästa steg är att få produktens giltighetsdag/indelningsår från SCB, exempelvis via den publicerade kontakten `uppdrag@scb.se`; inget meddelande har skickats.

### Nytt begränsat WFS-prov för referenstid och CRS

Exakt GET-URL, hämtad 28 oktober 2026 med HTTP 200:

```text
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Abefolkning_1km_2025&outputFormat=application%2Fjson&srsName=EPSG%3A3006&BBOX=825000%2C7328000%2C828000%2C7332000%2CEPSG%3A3006&maxFeatures=1&sortBy=objectid&startIndex=0
```

Svaret innehöll en Polygon, `objectid=454820`, `rutstorl=1000`, `referenstid="20251231"`, `crs.properties.name="urn:ogc:def:crs:EPSG::3006"`, `numberMatched=17` och `numberReturned=1`. Detta bekräftar endast ett begränsat prov och ersätter inte återtest av de fyra rekonstruerade sidorna med `maxFeatures=5`. Begärans BBOX och det returnerade GeoJSON-liknande svaret använder här öst/nord; det innebär inte att EPSG-definitionens formella axelordning eller andra WFS-format får antas vara samma.

Den länkade ISO-postens `dateStamp=2026-03-31T12:43:33.031Z` är metadatarevision. Posten listar två publiceringsdatum, 2025-04-15 och 2026-04-01; inget av dem används här som entydigt publiceringsdatum för just 2025-lagret. SCB:s [produktsida](https://www.scb.se/vara-tjanster/oppna-data/oppna-geodata/statistik-pa-rutor/), kontrollerad 28 oktober, anger årlig RTB-uppdatering och skiljer mellan europeiska ETRS89-rutor och nationella SWEREF99TM-rutor. CRS för det valda lagret fastställs av dess egna metadata ovan.

**Viktig metoduppgift från ISO-postens lineage:** data omfattar befolkade rutor; obefolkade rutor ingår inte. SCB beskriver ett nollvärde som en befolkad men röjandegranskad ruta. Noll får därför inte automatiskt visas som obebodd yta i denna produkt. Tolkning per variabel samt null-/saknatillstånd behöver fortfarande kontrolleras före normalisering; detta är ingen kodändring eller generell regel för andra SCB-produkter.

### Avgränsning av återstående kart-api-metadata

OpenAPI:s explicita WGS84-beskrivning för `KommunFeature.geometry` överförs inte till andra endpoints. De granskade beskrivningarna av geocode/lookup anger fältnamn och talvärden men fastställer inte uttryckligen deras geodetiska datum. Kommunguiden bekräftar Lantmäteriet som gränskälla; årgång och importdatum saknas fortfarande. Guidens uppgift om 422 utanför Sverige-fönstret avviker dessutom från det tidigare observerade 404-svaret för `(0,0)`; observationen behålls.

Sidan Om talen redovisar räkning av ortnamn och kommunpolygoner den 2026-09-11. Detta är ett mätdatum för antal i leverantörens databas, inte källdatats referenstid, gränsårgång eller senaste import. För att stänga metadatafrågorna behövs ytterligare officiellt belägg eller leverantörsbesked via den publicerade kontakten `api@autonomousmedia.io`; inget meddelande har skickats.

## kart-api: dokumentation och gemensamma villkor

Gabriela kontrollerade [OpenAPI](https://api.kart-api.se/openapi.json), [villkor](https://kart-api.se/villkor/) och [attribution](https://kart-api.se/docs/attribution/) **22 oktober 2026**. Dokumentation hade även granskats 15 oktober enligt den tidigare projekttexten. Den 28 oktober hämtade AI OpenAPI med Node (`HTTP 200`, `info.version=1.0.0`) och kontrollerade parametrar och svarsscheman för geocode/kommunuppslag. `GeoTraff.tier` och `kalla` är strängar; valfria fält och `spridning.entydig=null` stöds av schemat. Ingen lokal kontraktskopia finns. Villkorssidorna lästes inte om i den senaste testomgången.

Dokumenterade uppgifter:

- API-sökväg `/v1`, kontraktets `info.version=1.0.0`, specifikationsformat OpenAPI 3.1.0.
- 200 anrop/dygn/IP utan nyckel; 10 000 anrop/månad med nyckel under betan. Den nyckellösa kvoten och attributionskravet stöds även av Gabrielas nu redovisade kontroll av [Kom igång](https://kart-api.se/docs/). Datum för just den kontrollen är inte angivet. Kvottillämpning och nyckelbaserad åtkomst är inte browsertestade; kvoten är en teknisk begränsning, attributionskravet ett användningsvillkor.
- Visning, uppslag och rimlig cache tillåts med korrekt attribution. Egen databas för vidare distribution som dataprodukt eller bulk tillåts inte.
- Beta utan garanterad servicenivå. Dokumentationen avgränsar tjänsten till Sverige; det belägger inte fullständighet för alla svenska platser.
- Attribution ska följa med där data visas. Faktiska svarets lista har företräde framför attributionssidans sammanställning. För geocode anger sidan Lantmäteriet / Ortnamn / CC BY 4.0 / Bearbetad, med OpenStreetMap när träffen är en adress.

### Kommunuppslag: observationer

Exakta GET-anrop och redovisade svar:

| Anrop | Resultat |
| --- | --- |
| `https://api.kart-api.se/v1/kommun/lookup?lat=58.705&lon=15.77` | HTTP 200; `kommunkod="0562"`, `kommunnamn="Finspång"`, `lanskod="05"`, `lansnamn="Östergötland"`. Attribution: Lantmäteriet / Administrativ indelning / CC BY 4.0. |
| `https://api.kart-api.se/v1/kommun/lookup?lat=999&lon=15.77` | HTTP 422; fälten `detail`, `skal`, `fel`; `fel[0].falt="lat"`. |
| `https://api.kart-api.se/v1/kommun/lookup?lat=58.0&lon=20.0` | HTTP 404; `detail="utanför Sveriges kommuner"`. |

GET från lokal Vite-origin uppges ge läsbart JSON. `Access-Control-Allow-Origin: *` observerades uttryckligen för 422-anropet; detta fastställer inte headern för samtliga statuskoder. Exakt lokal origin och individuella test-/hämtningsdatum saknas; resultaten ingick i utkastet sammanställt 2026-10-22.

Parametrarna anges i geografiska grader. Ett felmeddelande angav ungefärligt Sverige-fönster latitud 55–69,5 och longitud 10–24,5. Detta är en observerad valideringsgräns, inte belägg för CRS, gränsårgång eller full geografisk täckning.

### Platsökning: dokumenterat kontrakt

[Kom igång](https://kart-api.se/docs/) och det granskade OpenAPI-kontraktet beskriver `/v1/geocode` med obligatorisk `q`, valfri `kommunkod` och `limit` 1–20, standard 5. Ingen offset- eller pagineringsparameter är dokumenterad. Kontraktet anger ortnamn/kommunnamn från Lantmäteriet och gatuadresser från OpenStreetMap. Detta är dokumentationsuppgifter, inte observationer om varje träff.

### Platsökning: observationer

Testerna redovisades som genomförda **22 oktober 2026** i Microsoft Edge från lokal Vite-miljö. För felprovet anges exakt origin `http://127.0.0.1:5173/`; samma exakta origin är inte separat angiven för varje övrigt prov.

| Exakt GET-anrop | Observerat resultat |
| --- | --- |
| `https://api.kart-api.se/v1/geocode?q=Fridhem&limit=3` | HTTP 200; `antal=3`, `results.length=3`, resultat med koordinater. `spridning.traffar=1198`, `spridning.kommuner=217`, `spridning.entydig=false`. För Fridhem-provet redovisas läsbart svar och `Access-Control-Allow-Origin: *`. |
| `https://api.kart-api.se/v1/geocode?q=Fridhem&limit=5` | HTTP 200; `antal=5`, `results.length=5`; samma spridningsvärden: 1198 träffar, 217 kommuner, `entydig=false`. CORS-header inte separat redovisad. |
| `https://api.kart-api.se/v1/geocode?q=Stockholm&limit=3&kommunkod=0562` | `query="Stockholm"`, `antal=0`, `results=[]`, `kommunfilter.begard="0562"`, `kommunfilter.bortfiltrerade=1`. `spridning.traffar=63`, `spridning.kommuner=48`, `spridning.entydig=false`. Statuskod och CORS-header inte separat redovisade. |
| `https://api.kart-api.se/v1/geocode?limit=3` | HTTP 422 Unprocessable Content; `detail="parametern q ligger utanför tillåtet intervall"`, `fel[0].falt="q"`, `fel[0].varfor="Field required"`. `skal` innehåller en generell förklaring om Sveriges koordinatfönster. |

Kommunfiltrets `skal` var: ”1 träff(ar) låg i en annan kommun och togs bort. Noll kvar betyder att ingen träff låg i 0562, inte att platsen inte finns.” Tomt filtrerat svar betyder inte att Stockholm saknas. Testet belägger bortfiltrering av den redovisade träffen, inte att alla tänkbara matchningar i kommunen genomsökts.

Fridhem-proven den 22 oktober visar att resultatlistan begränsas av `limit` medan spridningsuppgifterna är oförändrade. Tre eller fem resultat är inte alla matchningar. Spridningsuppgifter ska hållas åtskilda från resultatlistans antal och kommunfiltrets utfall. Limit-gränserna 1 och 20 provades senare den 28 oktober, se nedan.

422-provet belägger ett strukturerat felsvar för saknad `q`. Koordinatförklaringen i `skal` är inte specifik för detta fel. Proven verifierar API-beteende, inte projektets källspecifika felhantering eller gränssnitt. Separat runtime-validering och tester av de interna datakontrakten finns enligt statusen ovan.

### Livekontroll av projektets adaptrar, 28 oktober 2026

AI körde de befintliga TypeScript-funktionerna med Node.js 24.20.0 och `--experimental-transform-types --input-type=module`, via ett tillfälligt skript på standardindata. Inga filer ändrades eller verkliga svar sparades. Nätverksfunktionen gjorde verkliga `fetch`-anrop utan nyckel, läste en kopia av JSON-svaret och lämnade det ursprungliga svaret till adaptern. För lyckade och tomma geocode-svar jämfördes adapterdata med hela råsvaret; detsamma gjordes för lyckade kommunuppslag. Inledande testfel berodde på PowerShell-pipens teckenkodning för å/ö och en felaktig förväntan om 422 för `(0,0)`. Efter Unicode-escapning och korrigerad förväntan passerade dessa fall; inget produktionsfel konstaterades.

Bas-URL för samtliga anrop nedan: `https://api.kart-api.se/v1`. Sökväg och frågesträng anger de exakta korrigerade anropen.

| GET-sökväg och parametrar | Observerat resultat och adapterkontroll |
| --- | --- |
| `/kommun/lookup?lat=58.705&lon=15.77` | 200, `ready`, Finspång `0562`, län `05`. |
| `/kommun/lookup?lat=59.8586&lon=17.6389` | 200, `ready`, Uppsala `0380`, län `03`. |
| `/kommun/lookup?lat=55.605&lon=13.0038` | 200, `ready`, Malmö `1280`, län `12`. |
| `/kommun/lookup?lat=67.8558&lon=20.2253` | 200, `ready`, Kiruna `2584`, län `25`. |
| `/kommun/lookup?lat=58&lon=20` och `/kommun/lookup?lat=0&lon=0` | 404, `empty`, fullständighet `unknown`. `(0,0)` visar att det tidigare felmeddelandets Sverige-fönster inte kan behandlas som en generellt tillämpad 422-gräns. |
| `/geocode?q=Uppsala&limit=1`, `/geocode?q=Malm%C3%B6&limit=1`, `/geocode?q=Kiruna&limit=1` | 200, `ready`, en kommunträff med rätt namn och kod `0380`, `1280` respektive `2584`. |
| `/geocode?q=Fridhem&limit=3` och `/geocode?q=Fridhem&limit=20` | 200, `ready`, 3 respektive 20 träffar; båda anger 1198 exakta namnträffar i 217 kommuner och `entydig=false`. |
| `/geocode?q=Stockholm&limit=3&kommunkod=0562` | 200, `empty`, 0 träffar, `kommunfilter.begard="0562"`, `bortfiltrerade=1`; spridning 63 träffar i 48 kommuner bevarades. |
| `/geocode?q=Finsp%C3%A5ng&limit=5&kommunkod=0562` | 200, `ready`, 4 träffar, alla med kod `0562`. Spridning 3 exakta namnträffar i 2 kommuner; den räknar något annat än resultatlistan, som även innehöll Finspångsån. |
| `/geocode?q=zzzxqvnonexistent987654321&limit=5` | 200, `empty`, 0 träffar, `spridning.entydig=null`; attribution och förklaring bevarades. |
| `/kommun/lookup?lat=999&lon=18` och `/geocode?limit=5` | Verkliga 422-svar blev `error`, `kind="http"`, `httpStatus=422`. Testets nätverksfunktion ändrade avsiktligt koordinaten respektive tog bort `q` för att nå API:s felväg. Vanliga ogiltiga funktionsindata stoppas lokalt. |

Fyrsiffriga kommunkoder och attribution bevarades. Lookup-svaren angav Lantmäteriet/Administrativ indelning/CC BY 4.0. Geocode-svaren angav Lantmäteriet/Ortnamn/CC BY 4.0/Bearbetad, Lantmäteriet/Administrativ indelning/CC BY 4.0 och OpenStreetMap/ODbL 1.0. Ingen träff valdes automatiskt. `geocode` markerade sökfullständighet som `unknown`.

Anropen skickade `Origin: http://127.0.0.1:5173`. I första livekörningen observerades `Access-Control-Allow-Origin: *` för svaren med status 200 och 404. Headern loggades inte vid den korrigerade körningen eller de nya 422-proven. **Node upprätthåller inte webbläsarens CORS-regler:** detta är inget nytt browsertest och ingen verifiering av gränssnittet. Tidigare Edge-prov gäller fortsatt med sina avgränsningar. Nätverksfel, ogiltig JSON och 429/500 provades med simulerade svar i den ordinarie testsviten; tjänsten belastades inte för att framkalla sådana fel.

Kontrollera lokalt med `npm.cmd test` och `npm.cmd run typecheck`. Dessa kommandon använder syntetiska data och upprepar inte liveproven. För ett nytt liveprov: importera respektive adapter i Node med flaggorna ovan och anropa den med tabellens indata utan att ange en simulerad fetcher. Spara datum, HTTP-status och jämförelse mot råsvaret; håll antalet anrop begränsat. Testdatumet är inte källdatats referenstid. Inga fel hittades i de verifierade fallen; fullständig geografisk täckning, CRS och dataårgång fastställdes inte.

### Öppet för kart-api

Metadataavgränsning utifrån befintligt underlag: `lat`/`lon` och observerade koordinater belägger inte ett visst geodetiskt datum eller en CRS-definition. Källhänvisningen till Lantmäteriet/OSM fastställer inte vilken dataversion kart-api använder. Kontrolldatumet 22 oktober 2026 och API-versionen `/v1` är inte datats referenstid eller uppdateringsfrekvens. Dessa uppgifter förblir obekräftade; inga metadata om CRS eller uppdatering har härletts från testvärdena.

- Uttryckligt CRS/datum och axelordning för koordinaterna. Rimliga talvärden bevisar inte EPSG:4326.
- Källdatats referenstid/version, uppdateringsfrekvens hos kart-api och fördröjning gentemot Lantmäteriet/OSM.
- Geografiska luckor och sökbegränsningar samt geometriårgång för kommunuppslag och geocodes kommunfilter. Lantmäteriet är nu dokumenterad gränskälla för kommunuppslag enligt kommunguiden; detta fastställer inte årgången.
- Närmare cachevillkor, inklusive lagringstid. Visnings- och cacherätt avgör inte automatiskt rätt till versionshantering av verkliga provsvar.
- Verkliga provsvar i **privat GitHub-repo: öppet**. Villkoren nämner inte testfixturer eller privat versionshantering; privat repo är inte automatiskt lokal cache.
- Verkliga provsvar i **offentligt GitHub-repo: öppet**. Villkoren tillåter uppslagssvar men klargör inte uttryckligen publicerade testfixturer. Varken generellt tillstånd eller förbud mot varje litet svar är fastställt. Leverantörens klargörande behövs för båda fallen; attribution ska bevaras.
- Fullständig rutleverans via kart-api är inte verifierad här. Direkt SCB WFS har undersökts som alternativ.
- För kart-api är direkt browseråtkomst utan API-nyckel beslutad den 28 oktober 2026; serveradapter behövs inte i nuläget. Lösningen omprövas vid nya behov eller begränsningar. Lokala browserprov belägger bara testade anrop. Hemliga nycklar ska inte läggas i klientkod.

Bedömning av kvarstående osäkerheter för kart-api:

| Osäkerhet | Påverkan och motivering |
| --- | --- |
| CRS/datum och axelordning | Blockerar beroende koordinatimplementation, men inte fortsatt P2-bedömning som kandidat. [OpenAPI](https://api.kart-api.se/openapi.json) är kontraktskällan; dokumenterade `lat`/`lon` är inte i sig uttrycklig CRS-bekräftelse. Utred före användning som validerad WGS84. |
| Dataårgång, uppdateringsfrekvens och kommunindelning | Behöver utredas före beroende implementation och årgångskoppling. Källvalet förblir föreslaget tills användbarheten kan bedömas; API-version eller testdatum får inte ersätta dessa uppgifter. |
| Exakt cachetid och rätt till verkliga testfixturer | Dokumenteras som öppet utan att hindra kandidatbedömning med syntetiska fixturer. Långvarig lagring eller återpublicering av verkliga svar förutsätter klarlagd rätt för just den användningen. |
| Luckor och sökbegränsningar | Kända begränsningar dokumenteras i P2; ingen fullständig täckning utlovas. Nytt användningskrav som kräver alla träffar kan påverka senare källval, eftersom paginering inte är dokumenterad. |

## SCB TAB628: kommunstatistik

### Observationer

Leverantör SCB, PxWeb API v2. Redovisade adresser:

```text
Metadata: https://statistikdatabasen.scb.se/api/v2/tables/TAB628/metadata?lang=sv
Data: GET https://statistikdatabasen.scb.se/api/v2/tables/TAB628/data
```

Äldre redovisat urval (den fullständiga URL-kodade adressen för just det äldre anropet saknas):

```text
lang=sv
outputFormat=json-stat2
codelist[Region]=vs_RegionKommun07EjAggr
valueCodes[Region]=*
valueCodes[Kon]=1+2
valueCodes[ContentsCode]=BE0101U1,BE0101U2,BE0101U3
valueCodes[Tid]=2025
```

Uttaget gav 290 kommuner och 870 datapositioner. JSON-stat2: `id=[Region,Kon,ContentsCode,Tid]`, `size=[290,1,3,1]`. Inga nullvärden redovisades i kontrollerat uttag; detta bevisar inte att alla andra saknatillstånd/statusmarkeringar saknas.

| Kod | Mått enligt underlaget | Enhet/referenstid |
| --- | --- | --- |
| `BE0101U1` | Befolkningstäthet | Invånare/km²; tabellens definition och avrundning ska följas. |
| `BE0101U2` | Folkmängd | Personer, 2025-12-31. |
| `BE0101U3` | Landareal | km², 2026-01-01. |

Båda referensdagarna ska bevaras; olika dagar betyder inte automatiskt fel årgång. Röjandeskydd kan ge differenser vid summering enligt underlaget. Tabellen saknar geometri; CRS är inte tillämpligt på statistiksvaret.

Äldre browserprov från `http://127.0.0.1:5173`: HTTP 200, `type=cors`, `Access-Control-Allow-Origin: *`, `Content-Type: application/json; charset=UTF-8`. Observerade headers: `X-Rate-Limit-Remaining: 29`, `X-Rate-Limit-Limit: 10s`. Headers ensamma fastställer inte hela kvotregeln. Individuellt test-/hämtningsdatum saknas; resultaten ingick i utkastet sammanställt 2026-10-22.

#### Ny datakontroll 22 oktober 2026

Gabriela redovisar ett nytt dataanrop den **22 oktober 2026** med följande exakta reproducerbara GET-URL:

```text
https://statistikdatabasen.scb.se/api/v2/tables/TAB628/data?lang=sv&outputFormat=json-stat2&codelist%5BRegion%5D=vs_RegionKommun07EjAggr&valueCodes%5BRegion%5D=*&valueCodes%5BKon%5D=1%2B2&valueCodes%5BContentsCode%5D=BE0101U1%2CBE0101U2%2CBE0101U3&valueCodes%5BTid%5D=2025
```

Observerat resultat: ett läsbart JSON-stat2-svar med `version="2.0"`, `class="dataset"`, `id=[Region,Kon,ContentsCode,Tid]` och `size=[290,1,3,1]`. `value` innehöll 870 numeriska datapositioner. Urvalet var `Kon=1+2`, `Tid=2025` och måtten `BE0101U1`, `BE0101U2`, `BE0101U3`. I URL:en är plustecknet i `1+2` kodat som `%2B`.

Detta är en separat datakontroll från det äldre browserprovet. Ingen specifik HTTP-status, CORS-header eller annan response-header har redovisats för det nya anropet; sådana uppgifter tillskrivs det inte.

### Dokumentationsuppgifter och öppet

#### Metadatakontroll 22 oktober 2026

Gabriela redovisar kontroll av [TAB628-metadata](https://statistikdatabasen.scb.se/api/v2/tables/TAB628/metadata?lang=sv) den **22 oktober 2026**. Följande är metadatauppgifter, inte nya browserobservationer av datauttaget ovan:

- Tabell `TAB628`, PxWeb API v2. Titel: ”Befolkningstäthet (invånare per kvadratkilometer), folkmängd och landareal efter region och kön. År 1991–2025.” Den tidigare projekttextens [tabellreferens](https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__BE__BE0101__BE0101C/BefArealTathetKon/) behålls för spårbarhet.
- Metadatafältet `updated` är `2026-02-24T07:00:00Z`. Det är metadatauppgiften om uppdatering, inte kontroll-/hämtningsdatum, statistikens referenstid eller belägg för uppdateringsfrekvens.
- `BE0101U1`: befolkningstäthet, invånare per km², en decimal.
- `BE0101U2`: folkmängd, personer, noll decimaler.
- `BE0101U3`: landareal, km², två decimaler.
- `Kon=1+2` betyder totalt. Kodlistan `vs_RegionKommun07EjAggr` anges för kommunurval.
- Befolkningens referenstid är 31 december respektive år. Landarealens referenstid är 1 januari följande år. För uttaget 2025 motsvarar detta 2025-12-31 respektive 2026-01-01 enligt tabellen ovan.
- Från referensåret 2025 tillämpar SCB Cell Key Method (CKM), vilket kan påverka summerbarheten. Summeringar får därför inte automatiskt förutsättas motsvara publicerade totaler.

Kontrollen kompletterar måttdefinitioner och redovisad precision. Ett metadatautdrag behöver fortfarande bevaras för reproducerbarhet. Datumet ovan gäller metadatakontrollen; tidigare datauttags- och browserdatum förblir okända.

- Enligt Gabrielas nu redovisade kontroll av [SCB:s PxWeb API-dokumentation](https://www.scb.se/vara-tjanster/oppna-data/pxwebapi/) tillåter API v2 högst **150 000 dataceller per uttag och 30 anrop per 10 sekunder och IP-adress**. Datum för just dokumentationskontrollen är inte angivet. Detta är dokumenterade tekniska gränser, inte licensvillkor eller en ny uppmätning av kvottillämpningen.
- Exakt URL med kodning av `1+2` finns nu för den nya datakontrollen ovan. Adress och individuellt datum för det äldre anropet är fortfarande okända.
- Praktiska cache-/uppdateringsvillkor, nyckelbehov och felkontrakt behöver fortfarande beläggas. Licensunderlaget för statistikdata framgår separat nedan.
- Statistikens gränsindelning måste kontrolleras mot kommungeometrierna. Källval och eventuellt serverbehov är öppna.

Rättighetsstatus för TAB628: enligt Gabrielas nu redovisade kontroll av [SCB:s användningsvillkor](https://www.scb.se/om-scb/om-scb.se-och-anvandningsvillkor/) omfattas öppna statistikdata i Statistikdatabasen av **CC0 1.0**. Detta ger licensstöd för användning/visning, lagring och återpublicering av dessa data, inklusive provsvar; bedömningen bygger på statistikdatats egna villkor, inte på kommungränsernas licens. Datum för just villkorskontrollen är inte angivet. Tekniska anropsgränser och praktisk cachehantering är separata frågor. CKM är en statistisk metodbegränsning, inte ett licensvillkor.

Bedömning: befintlig dokumentation av **referenstider, licens och API-begränsningar är tillräcklig för nuvarande P2-källbedömning av TAB628**. Dessa punkter behöver inte behandlas som obelagda hinder för källvalet. Praktisk cache-/uppdateringsstrategi och felkontrakt hör till senare beroende implementation; okänt datum för den separata villkorskontrollen dokumenteras utan att något datum antas. Kontroll av indelning mot vald geometri återstår före join, men ändrar inte de belagda egenskaperna hos statistikprodukten. Bedömningen avgör inte serverbehovet.

## SCB WFS: befolkningsrutor

### Observationer

- Endpoint: `https://geodata.scb.se/geoserver/stat/wfs`; WFS 1.1.0; lager `stat:befolkning_1km_2025`.
- `GetCapabilities`, `DescribeFeatureType` och begränsat `GetFeature` i GeoJSON uppges kontrollerade i det äldre underlaget. Ursprungliga fullständiga anrops-URL:er saknas. Rekonstruerade GetFeature-URL:er och schema återtestades den 28 oktober enligt nedan; detta ger nya daterade prov utan att återskapa äldre hämtningsdatum.
- Fält omfattar `objectid`, `rutid_inspire`, `rutid_scb`, `rutstorl`, `beftotalt`, `man`, `kvinna`, åldersfält, `referenstid`, `sp_geometry`. Flera fält är nillable.
- Observerade geometrier: Polygon, EPSG:3006, `rutstorl=1000` m, `referenstid="20251231"`.
- Servern rapporterade `numberMatched=115118` för lagret i ett begränsat exempeluttag. **Hela Sveriges lager har inte hämtats eller verifierats.**
- Separat browserprov från `http://127.0.0.1:5173`: HTTP 200, `type=cors`, tre GeoJSON-features, `Access-Control-Allow-Origin: http://127.0.0.1:5173`, `Access-Control-Allow-Credentials: true`. Det belägger inte samtliga sidors headers.

### BBOX och paginering: observationer

Redovisade parametrar: `BBOX=825000,7328000,828000,7332000,EPSG:3006`, `maxFeatures=5`, `sortBy=objectid`. Servern rapporterade `numberMatched=17` för utsnittet. Enstaka objekt kan tangera BBOX-gränsen; uttaget är inte en exakt befolkningsberäkning inom utsnittet.

| startIndex | Returnerade objekt | Underlag |
| --- | --- | --- |
| 0 | 5 | Ursprunglig redovisning. |
| 5 | 5 | Ursprunglig redovisning; skilda ordnade objekt. |
| 10 | 5 | Komplettering, kontroll-/hämtningsdatum 22 oktober 2026: `numberMatched=17`, `numberReturned=5`, objectid 456198, 456199, 456200, 456658, 456659. EPSG:3006 och referenstid 20251231. |
| 15 | 2 | Ursprunglig redovisning. |

#### Rekonstruerade GetFeature-anrop – återtestade 28 oktober 2026

URL:erna nedan rekonstruerades 23 oktober 2026 från redovisade parametrar och är inte bevarade originalanrop. De återtestades av AI den 28 oktober 2026 enligt avsnittet nedan. Det fullständiga lagernamnet `stat:befolkning_1km_2025` används i `typeName`.

Rekonstruktionen använder WFS 1.1.0, `request=GetFeature`, `outputFormat=application/json` för GeoJSON och `srsName=EPSG:3006`. Formatsträngen är ett rekonstruktionsval, inte en bevarad uppgift om det ursprungliga anropet. Kolon, kommatecken och snedstreck i parametervärdena är procentkodade:

```text
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Abefolkning_1km_2025&outputFormat=application%2Fjson&srsName=EPSG%3A3006&BBOX=825000%2C7328000%2C828000%2C7332000%2CEPSG%3A3006&maxFeatures=5&sortBy=objectid&startIndex=0
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Abefolkning_1km_2025&outputFormat=application%2Fjson&srsName=EPSG%3A3006&BBOX=825000%2C7328000%2C828000%2C7332000%2CEPSG%3A3006&maxFeatures=5&sortBy=objectid&startIndex=5
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Abefolkning_1km_2025&outputFormat=application%2Fjson&srsName=EPSG%3A3006&BBOX=825000%2C7328000%2C828000%2C7332000%2CEPSG%3A3006&maxFeatures=5&sortBy=objectid&startIndex=10
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Abefolkning_1km_2025&outputFormat=application%2Fjson&srsName=EPSG%3A3006&BBOX=825000%2C7328000%2C828000%2C7332000%2CEPSG%3A3006&maxFeatures=5&sortBy=objectid&startIndex=15
```

Tidigare observerad sidindelning är **5 + 5 + 5 + 2 = 17 objekt**. Det nya återprovet av URL:erna bekräftade samma antal och identifierare enligt nedan; de äldre observationernas okända datum ändras inte.

#### Liveprov av sidor, tomt svar och fel, 28 oktober 2026

AI körde URL:erna ovan sekventiellt via Node `fetch`, utan nyckel eller autentisering, med `Origin: http://127.0.0.1:5173`. Assertioner kontrollerade HTTP-status, antal, sortering, referenstid, rutstorlek, geometri och identifierarnas unikhet. Svaren lästes i minnet; inga verkliga fixturer sparades.

| startIndex | HTTP | numberMatched / numberReturned | objectid |
| --- | --- | --- | --- |
| 0 | 200 | 17 / 5 | 454820, 454821, 454822, 455279, 455280 |
| 5 | 200 | 17 / 5 | 455281, 455282, 455738, 455739, 455740 |
| 10 | 200 | 17 / 5 | 456198, 456199, 456200, 456658, 456659 |
| 15 | 200 | 17 / 2 | 457118, 457119 |
| 20 | 200 | 17 / 0 | Tom lista; provat genom samma URL med `startIndex=20`. |

Sammanlagt **17 unika `objectid`, 17 unika `rutid_inspire` och 17 unika `rutid_scb`**, inga dubbletter mellan de fyra innehållande sidorna och stigande objectid. Alla 17 objekt hade Polygon, `rutstorl=1000`, `referenstid="20251231"`; svaren med objekt angav EPSG:3006. Detta belägger fullständighet i just utsnittet vid testet, inte nationell täckning eller ID-stabilitet mellan leverantörsuppdateringar.

Samtliga fem sidor angav `Access-Control-Allow-Origin: http://127.0.0.1:5173`; första körningen loggade även `Access-Control-Allow-Credentials: true` för de fyra sidorna med objekt. Inga cache-/kvot-/Retry-After-headers observerades på dessa fyra svar. Avsaknad av headers bevisar inte obegränsad kapacitet. Node genomdriver inte CORS: detta ersätter inte tidigare browserprov eller ett nytt prov i webbläsaren.

Två tomfall och ett verkligt felprov:

- Sidan efter sista träffen (`startIndex=20`) gav `features=[]`, `numberMatched=17`, `numberReturned=0` och **`crs=null`**. Första testskriptet antog felaktigt ett CRS-objekt även för tomt svar och avbröts där; efter korrigerat test passerade kontrollerna. Inget produktionsfel rättades.
- Geografiskt tomt BBOX gav HTTP 200, `numberMatched=0`, `numberReturned=0`, `features=[]`, `crs=null`:

```text
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Abefolkning_1km_2025&outputFormat=application%2Fjson&srsName=EPSG%3A3006&BBOX=0%2C0%2C1000%2C1000%2CEPSG%3A3006&maxFeatures=5&sortBy=objectid&startIndex=0
```

- Ogiltigt lagernamn gav **HTTP 200 men `Content-Type: application/xml` och `ows:ExceptionReport`**, `exceptionCode="InvalidParameterValue"`, `locator="typeName"`. HTTP 200 får alltså inte ensamt tolkas som lyckat datauttag. Felprovet begärde inte JSON-format, så det belägger inte svarets format när `outputFormat=application/json` uttryckligen begärs:

```text
https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=stat%3Ap2_nonexistent_layer&maxFeatures=1
```

Även [DescribeFeatureType](https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=1.1.0&request=DescribeFeatureType&typeName=stat%3Abefolkning_1km_2025) hämtades med HTTP 200. Schemat anger `objectid` som obligatorisk, icke-null `xsd:int`; rut-ID och referenstid som valfria nullable strängar; rutstorlek och befolknings-/åldersfält som valfria nullable heltal; geometri som nullable `gml:SurfacePropertyType`. Det är tjänstens schema, inte belägg för att varje objekt alltid har rut-ID eller Polygon. Det observerade Polygon-utfallet gäller dessa 17 objekt.

#### API-begränsningar och lagring av verkliga provsvar, kontrollerat 28 oktober 2026

| Tjänst | Bekräftade tekniska uppgifter | Kvarvarande avgränsning |
| --- | --- | --- |
| SCB PxWeb v2/TAB628 | [SCB:s API-sida](https://www.scb.se/vara-tjanster/oppna-data/pxwebapi/) anger 150 000 dataceller per uttag och 30 anrop per 10 sekunder och IP. [Officiella användarhandledningen](https://www.pxtools.net/PxWebApi/documentation/user-guide/), länkad av SCB, beskriver 400 för felaktigt/för stort urval, 404 för saknad resurs, 429 för för hög anropstakt, 503 för otillgänglighet samt cirka 2100 tecken som GET-URL-begränsning. | Gränserna är dokumentationsuppgifter, inte belastningsprov. Den generella handledningens taktbeskrivning ersätter inte SCB:s numeriska IP-gräns. Praktisk cachetid och felkropparnas exakta SCB-format är fortfarande inte verifierade. |
| SCB WFS | Begränsade nyckellösa uttag och paginering verifierade ovan. [GetCapabilities 2.0.0](https://geodata.scb.se/geoserver/stat/wfs?service=WFS&version=2.0.0&request=GetCapabilities), HTTP 200, annonserar `CountDefault=1000000`, `ImplementsResultPaging=TRUE`, `PagingIsTransactionSafe=FALSE`. | `CountDefault` är en annonserad standardgräns, inte en uppmätt hård maxgräns eller kapacitetsgaranti; överförs inte automatiskt till 1.1.0-anropens `maxFeatures`. Ingen numerisk anropskvot eller exakt cachetid hittades i granskade SCB-sidor, WFS-guide eller capabilities. Ingen belastning/nationell nedladdning gjordes. Pagineringsmetadata garanterar inte en oföränderlig ögonblicksbild vid samtidiga uppdateringar. |
| kart-api | [Autentisering och takt](https://kart-api.se/docs/autentisering/) anger 200 anrop/dygn/IP utan nyckel, 10 000/månad med nyckel och takt 10 anrop/sekund med utrymme för skurar. JSON, rendering, routing och MCP räknas; tiles/stilar/typsnitt undantas från periodkvoten. Dokumenterade kvotheaders: `X-Kartapi-Kvar`, `X-Kartapi-Tak`, `X-Kartapi-Nyckel`; `X-Kartapi-Kvot: omatt` betyder att mätningen saknades. 429 med `Retry-After` i sekunder och 401 för ogiltig nyckel beskrivs. | Ingen kvotgräns framkallades. Geocode har fortsatt dokumenterad limit 1–20 utan dokumenterad paginering. [Villkoren](https://kart-api.se/villkor/) tillåter rimlig cache men anger ingen exakt lagringstid. Uppgiften att kommungränser ändras årligen är inte belägg för tjänstens importårgång. |

SCB:s [WMS-/WFS-guide](https://www.scb.se/contentassets/302de7b6076847e08e260d112475dfc5/scbs-oppna-geodata-via-wms-och-wfs-tjanster_20250303.pdf), avsnittet om WFS i QGIS, rekommenderar uttryckligen att spara data lokalt eller på egen server för bearbetning. Guidens 3000-objektsgräns gäller ArcGIS-klientens standardinställning, **inte SCB-serverns maxgräns**. Guiden anger att tjänsterna levererar senaste versionen och kan rättas; en sparad fixtur måste därför ha eget hämtningsdatum och får inte beskrivas som alltid aktuell.

**Rättighetsbedömning, skild från tekniska kvoter:** SCB:s [användningsvillkor](https://www.scb.se/om-scb/om-scb.se-och-anvandningsvillkor/), återlästa 28 oktober, anger CC0 1.0 för öppna data i Statistikdatabasen och geodataplattformen. Detta ger stöd för att spara och återpublicera små verkliga TAB628-/WFS-utdrag som testfixturer, även i privat eller offentligt Git-repo. Det är projektets tillämpning av den angivna licensen; sidan behöver inte särskilt nämna GitHub för varje filformat. Bevara källa, exakt anrop, hämtningsdatum, referenstid, CRS och bearbetning för projektets spårbarhet. Inga sådana fixturfiler skapades i denna dokumentationsuppgift.

kart-api:s villkor, gällande från 2026-09-12 och återlästa 28 oktober, tillåter cache och uppslagssvar med attribution men förbjuder återdistribution som egen dataprodukt/bulk. **Lokal rimlig cache har uttryckligt stöd; rätt att versionshantera verkliga provsvar som testfixturer i privat respektive offentligt repo är fortsatt oklar.** Granskningen hittade varken ett uttryckligt fixturetillstånd eller ett generellt förbud mot varje litet provsvar. Ingen rätt härleds enbart från lyckade anrop eller repots privata status. Nästa steg är leverantörsklargörande om just denna användning; inget meddelande har skickats.

Gabriela redovisar totalt **17 olika objectid**, i överensstämmelse med `numberMatched=17`. Luckan för sidan med startIndex 10 är därmed stängd i redovisningen. Detta stöder paginering och fullständighet i just BBOX-testet, inte nationell fullständighet eller obegränsad kapacitet. Individuella test-/hämtningsdatum för de tidigare testerna är fortfarande okända. Ursprungliga tester ingick i utkastet sammanställt 2026-10-22.

### Dokumentationsuppgifter och öppet

[SCB:s Statistik på rutor](https://www.scb.se/vara-tjanster/oppna-data/oppna-geodata/statistik-pa-rutor/) är tidigare dokumentationsreferens. Enligt redovisningen anger WFS GetCapabilities CC0 1.0, utan avgift eller åtkomstbegränsning på servicenivå. Det är inte ett löfte om obegränsad teknisk kapacitet. Metadatautdrag och datum behöver bevaras. `Källa: SCB` rekommenderas för spårbarhet enligt underlaget.

- `beftotalt` får inte ersättas av `man + kvinna`; observerade värden kan avvika. ISO-metadata kontrollerad 28 oktober anger att produkten innehåller befolkade rutor och beskriver noll som befolkad men röjandegranskad ruta, se metadatakontrollen ovan. Variabelspecifik tolkning och null-/saknatillstånd återstår före normalisering.
- Unikhet för tre ID-fält, exakta anrop, tomsvar och ett fel med ogiltigt lager verifierades 28 oktober enligt ovan. Schemat är kontrollerat. ID-stabilitet mellan uppdateringar, variabelspecifika saknatillstånd och en eventuell hård servergräns/numerisk anropskvot är fortfarande öppna. Begränsade anrop utan nyckel fungerar; detta är ingen garanti om framtida åtkomst.
- Licensstödet för användning, lagring och återpublicering framgår nedan. WFS-specifika tekniska uttags- och cachevillkor är fortfarande obekräftade; bulkbegränsning är inte konstaterad.
- EPSG:3006 är nu bekräftat för det valda lagret genom GetCapabilities, länkad ISO-metadata och ett nytt provsvar den 28 oktober. Omprojektion till projektets webbgräns, GeoJSON/WGS 84 med longitud före latitud, är fortfarande inte implementerad eller testad; CRS får inte bara etiketteras om.
- Valet mellan direkt SCB-åtkomst och kart-api för rutor samt serverbehov är öppet.

Dokumentationskomplettering enligt Gabrielas nu lämnade underlag: [SCB:s produktsida Statistik på rutor](https://www.scb.se/vara-tjanster/oppna-data/oppna-geodata/statistik-pa-rutor/) anger **årlig uppdatering av befolkningsregistret och tillgänglighet via WFS**. Datum för just denna dokumentationskontroll är inte angivet. Detta är en leverantörsuppgift, inte ett nytt API-prov eller belägg för exakt publiceringsdatum/uppdateringstid i det testade WFS-lagret.

Samlad WFS-status efter återprovet 28 oktober: de rekonstruerade URL:erna är verifierade för det begränsade BBOX-testet med 17 unika objekt. Reproducerbarhetsluckan för dessa nya anrop är stängd; äldre exakta anrop/datum har inte rekonstruerats som historiska fakta. SCB:s CC0-villkor är återlästa och stöder lagring/återpublicering av små verkliga provutdrag enligt bedömningen ovan. `CountDefault=1000000` är annonserat i WFS 2.0.0-metadata; hård maxgräns, numerisk anropskvot och exakt cachetid är inte belagda. PxWebs tekniska gränser överförs inte till WFS.

Bedömning av kvarstående WFS-osäkerheter:

| Osäkerhet | Påverkan och motivering |
| --- | --- |
| Reproducerbarhet för rekonstruerade GetFeature-URL:er | Stängd genom återprov 28 oktober av alla fyra sidor samt en tom slutsida. Äldre saknade originalanrop förblir okända men behövs inte för att reproducera de nya proven. |
| Tjänstespecifika kvoter, maxgränser och cachevillkor | Förblir obekräftade och dokumenteras som begränsning i källbedömningen, inte som påhittade tillstånd eller kvoter. Blockerar inte kandidatval i sig; måste utredas före uttags-/cachelösning som förutsätter viss kapacitet eller lagringstid. |
| Lagrets exakta uppdateringstid och äldre testdatum | Dokumenteras som okända; blockerar inte bedömningen av den uttryckliga referenstiden 20251231. Årlig registeruppdatering fastställer inte tjänstens publiceringstid. |
| Stabilt rut-ID, saknatillstånd och fullständiga fälttyper | Behöver beläggas före beroende normalisering och avduplicering. Kandidatbedömningen kan fortsätta, men dessa egenskaper får ännu inte påstås verifierade. |

## Uppföljning av kvarvarande källmetadata

Detta är uppföljning efter de daterade kontrollerna ovan, inte ett påstående att samtliga punkter blockerar P2-källvalet. Beslutet om kart-api den 28 oktober gäller fortsatt; åtkomstlösningar och eventuellt serverbehov för SCB och kommungränser återstår separat.

1. **kart-api – källmetadata:** kontrollera [OpenAPI](https://api.kart-api.se/openapi.json) och [attributionsdokumentationen](https://kart-api.se/docs/attribution/) för uttryckligt CRS/datum, axelordning, dataversion/referenstid och uppdateringsfrekvens för geocode/kommunuppslag. Om uppgifterna saknas, begär klargörande från leverantörens tidigare dokumenterade kontakt `api@autonomousmedia.io`; inget meddelande har skickats. Bevara dokumentationshänvisning och kontrolldatum, även om svaret blir att uppgiften inte publiceras.
2. **SCB TAB628 – senare driftuppföljning:** referenstider, licens och numeriska API-gränser är tillräckligt belagda för nuvarande P2-källbedömning. Inför beroende implementation följs kvarvarande cache-/uppdateringsstrategi, nyckelbehov och felkontrakt upp via [PxWeb API-dokumentationen](https://www.scb.se/vara-tjanster/oppna-data/pxwebapi/) och [TAB628-metadata](https://statistikdatabasen.scb.se/api/v2/tables/TAB628/metadata?lang=sv).
3. **SCB WFS – kvarvarande tekniska frågor:** reproducerbarhet, schema, tomfall och ett felprov är nu dokumenterade med exakta URL:er ovan. Små verkliga CC0-fixturer med proveniens är sparade och offlinekontrollerade. Numerisk anropskvot, hård maxgräns och exakt cachetid hittades inte i granskade officiella källor; om vald uttagslösning kräver bestämda värden behöver SCB klargöra dem. Nationell nedladdning eller belastningstest behövs inte för denna kontroll.

## SCB: förenklade kommungränser

### Observationer

Redovisad nedladdningsadress:

```text
https://www.scb.se/contentassets/3443fea3fa6640f7a57ea15d9a372d33/shape_svenska_260225.zip
```

Observerad fil: `Kommun_Sweref99TM.shp`, med `KnKod`, `KnNamn` och geometri. Underlaget redovisar 290 kommunobjekt, 290 unika kommunkoder, inga saknade koder/namn, 277 Polygon och 13 MultiPolygon samt inga ogiltiga geometrier i kontrollen.

290 av 290 fyrsiffriga `KnKod` matchade PxWebs `Region`. Inledande nollor ska bevaras. Kodmatchningen bevisar inte att gränsårgång och statistikindelning är desamma.

SWEREF 99 TM identifierades enligt den äldre redovisningen utifrån `.prj`. Den 28 oktober hämtades ZIP-filen på nytt och den faktiska definitionen jämfördes med SCB:s produktbeskrivning och Lantmäteriets parametrar; tillsammans stöder de EPSG:3006 enligt avsnittet om metadatakontroll ovan. Filnamnet används inte som CRS-belägg. Exakt äldre hämtnings-/kontrolldatum och verktyg/metod för geometri- och kodkontrollen saknas fortfarande; det äldre resultatet ingick i utkastet sammanställt 2026-10-22. Den nya läsningen av arkiv och `.prj` upprepar inte geometri- eller kodkontrollen.

### Dokumentationsuppgifter och öppet

Gabriela redovisar kontroll av [SCB:s officiella sida för digitala gränser](https://www.scb.se/hitta-statistik/regional-statistik-och-kartor/regionala-indelningar/digitala-granser/) den **22 oktober 2026**. Följande är dokumentationsuppgifter, inte nya kontroller av den tidigare nedladdade ZIP-filens innehåll:

- SCB:s öppna digitala kommungränser har licensen **CC0**. Data får användas, delas och tillgängliggöras utan krav på källangivelse. SCB rekommenderar ändå `Källa: SCB`.
- Koordinatsystemet anges som **SWEREF99 TM**. Detta kompletterar CRS-underlaget, men ersätter inte kontroll av den faktiska ZIP-filens `.prj` inför omprojektion.
- Gränserna är förenklade och avsedda för tematisering av statistik. **SCB anger uttryckligen att gränserna inte är lämpliga för analyser.** För exakta gränser hänvisar SCB till Lantmäteriet.

Val av geometri för framtida analyser är därför fortsatt öppet och kan behöva diskuteras med Henrik. Denna dokumentationskomplettering fastställer inte ett sådant källval och ändrar inte DECISIONS.md. Kontrolldatumet för webbsidan är inte den tidigare ZIP-filens hämtningsdatum eller geometriårgång.

Bedömning: SCB:s förenklade kommungränser rekommenderas som **kandidat för visualisering, inte för geografisk analys**. Detta är en rekommendation inom P2, inte ett fastställt geometribeslut. Okänd exakt geometriårgång hindrar inte kandidatbedömningen, men behöver klarläggas före årgångsberoende join eller presentation som en bestämd gränsårgång. Framtida analysgeometri är en öppen metod-/källfråga att stämma av med Henrik före geografisk analys; SCB:s angivna olämplighet får inte kringgås genom att kalla visualiseringsgeometrin analysunderlag. Saknade äldre hämtningsdatum och praktisk uppdateringsstrategi dokumenteras som sådana och gör inte CC0- eller visualiseringsbedömningen obekräftad.

- **Geografisk årgång är okänd.** `260225` i filnamnet fastställer inte indelningsår eller referensår.
- `.prj`-parametrarna och kontrollmetoden för den nya hämtningen är dokumenterade ovan. Geometriårgång och närmare förenklings-/bearbetningsuppgifter är fortfarande öppna. Omprojektion har inte testats i projektet.
- Uppdateringsfrekvens och praktisk cache-/lagringsstrategi återstår att fastställa. CC0 och SCB:s rekommenderade, inte obligatoriska, källangivelse är dokumenterade ovan; geometriårgång och bearbetning behöver fortfarande följas för spårbarhet.
- Lokal browserleverans av vald gränsprodukt, storleksgränser och eventuellt server-/bearbetningsbehov är inte avgjorda.
- Tidigare DeSO-data är referensmaterial, inte fastställd produktionskälla. Härledda kommunpolygoner måste i så fall beskrivas med ursprung, bearbetning och datum.

## Bakgrundskarta

Bakgrundskarta väljs separat med kontroll av visningsvillkor, attribution och användningsvolym. Ett öppet kartbibliotek ger inte obegränsad rätt till någon annans kartserver. P1:s befintliga beslut ändras inte av detta dokumentationssteg.

## Återstående P2-dokumentation och beslut

**Bedömning 28 oktober 2026: P2 är delvis uppfyllt och kan inte markeras klart utifrån underlaget.** Tabellen jämför med de fem klartkriterier som Gabriela tillhandahållit från [Issue #2](https://github.com/gislab-se/platsorientering/issues/2); de motsvarar ROADMAP. Direkt GitHub-åtkomst saknas men kravtexten är nu tillgänglig. Avsaknad av gränssnittskoppling för adaptrarna är kommande funktionsarbete, inte ett extra P2-krav.

| Krav i P2 | Status efter denna sammanställning |
| --- | --- |
| Endpoints, parametrar, täckning, referenstider, CRS, rättigheter, kvoter och hämtningsdatum | Nya metadata-/hämtningsdatum 28 oktober dokumenterade ovan. TAB628:s referensdagar är återbekräftade; WFS-lagrets EPSG:3006 och referensdag är bekräftade. Kommunfilens CRS stöds av faktisk `.prj` och officiella produktuppgifter. kart-api:s CRS för geocode/lookup, dataversioner och kommungränsernas årgång förblir öppna; äldre okända datum har inte skrivits över. |
| Lokala browserprov, nycklar, CORS, paginering och storleksgränser | Tidigare browserprov finns. Nyckellösa WFS-sidor återtestade via Node 28 oktober med rätt CORS-headers, 17 unika objekt och tom-/felprov. PxWeb- och kart-api-kvoter är daterat dokumenterade; WFS annonserar CountDefault i 2.0.0 men hård maxgräns, numerisk anropskvot och exakt cachetid hittades inte. Inget nytt browsertest gjordes. |
| Små tillåtna provsvar, interna typer, hantering av tomma/felaktiga/begränsade svar | Fem interna kontrakt, runtime-validering, fyra syntetiska och tre verkliga SCB-fixturer finns nu. Typkontrakt, 63 runtime-tester och typkontroll passerade efter SCB-tillägget. Båda kart-api-adaptrarna är syntetiskt fixturtestade och tidigare liveprovade. Verkliga kart-api-fixturer saknas av rättighetsskäl. SCB-proven kontrolleras med delscheman och semantiska kontroller, inte färdiga adaptrar. |
| Återpublicering bedömd separat från visning | Skillnaden dokumenterad. kart-api-fixturer i privat/offentligt repo är öppna. SCB:s CC0 1.0 för öppna statistikdata och geodata har nu officiellt villkorsunderlag; tekniska gränser/cachefrågor kvarstår enligt respektive avsnitt. |
| Serverbehov avgjort i DECISIONS före beroende funktioner | Avgjort för kart-api den 28 oktober 2026 i samråd med Henrik: direkt browseråtkomst utan API-nyckel, ingen serveradapter i nuläget. Omprövas vid nya behov eller begränsningar. Övriga källval, årgångar och åtkomstlösningar för SCB och kommungränser återstår att avgöra. |

Närmaste återstående P2-arbete:

1. Kravtexten från Issue #2 har nu jämförts med ROADMAP och stämmer överens; ingen issue-checklista har ändrats. Slutför kvarvarande källkontroller nedan före slutlig P2-bedömning.
2. Komplettera kart-api:s CRS/axelordning, referenstid och indelningsårgång med primärkällebelägg eller dokumenterat leverantörsbesked. Klargör kvarvarande cache- och fixturrättigheter utan att anta att alla öppna metadatafrågor i sig stoppar kandidatbedömningen.
3. WFS-återproven är genomförda och små verkliga SCB-prov är nu sparade med proveniens och offlinekontroller. Kvar före beroende implementation: adapterhantering av tomt `crs`, XML-fel med HTTP 200, nullable fält, variabelspecifika saknatillstånd och ID-stabilitet vid uppdateringar.
4. Fastställ källval och åtkomstlösningar för SCB och kommungränser i DECISIONS. Det aktuella förslaget är direkt TAB628/WFS-åtkomst och lokalt förberedda, statiskt levererade SCB-gränser för visualisering, utan extra server i drift. Det är inte ett bekräftat Henrik-beslut för SCB. Gränsproduktens CRS-underlag är kontrollerat; giltighetsdag/årgång återstår. Små verkliga SCB-provsvar är redan sparade med proveniens. Analysgeometri avgörs före beroende geografisk analys.

Källregistret ska per faktiskt vald källa innehålla leverantör, dokumentationslänk, exakt endpoint/metod, parametrar, områdesfilter, paginering, hämtningsdatum, täckning/luckor, storleksgränser, referenstid/geometriårgång, CRS/axelordning/upplösning, enheter/saknatillstånd/röjandeskydd, CORS/nycklar/kvoter/cache/fel, licens/attribution/lagring/återdistribution och hur provsvaret jämförts med källan. Okänt ska förbli okänt tills underlag finns.

Lägg inga hemligheter i registret. Små testfiler får bara innehålla data som får distribueras i repot. Syntetiska testdata ska märkas och ersätter inte kontroll mot verkliga svar. Produktionsfunktioner för kommunval, statistikvisning, ritning och rutanalys ingår inte i denna ändring.
