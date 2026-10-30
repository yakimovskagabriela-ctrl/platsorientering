# Beslut och öppna frågor

## Offentlig källkod och GitHub Pages, 30 oktober 2026

Gabriela har uttryckligen beslutat att publicera hela den aktuella källkodskopian i `yakimovskagabriela-ctrl/platsorientering`. Kopian omfattar P1 och pågående P2, men inte den privata Git-historiken, hemligheter, beroendekataloger eller byggresultat. Ursprungliga lokala arbetsfiler bevaras. Historiska beslut nedan beskriver tidigare upplägg.

GitHub Actions i det offentliga repot testar och bygger efter push till dess `main` och publicerar endast `dist/` via GitHub Pages. Detta ersätter det tidigare upplägget med överföring från privat repo. Det befintliga `PAGES_DEPLOY_TOKEN` används inte och lämnas orört. Källkodens offentlighet innebär inte att någon öppen källkodslicens har beslutats.

## Beslutade ramar den 15 oktober 2026

| Beslut | Motiv |
| --- | --- |
| Sverige i version 1 | Beställarens uttryckliga avgränsning |
| Gabriela ansvarar för hela produktionen | Beställarens ansvarsfördelning; Henrik handleder och granskar |
| Lärande och användning är likvärdiga mål | Gabriela ska förstå och själv kunna förvalta det som byggs samtidigt som LABLAB får ett användbart tittfönster |
| Separat privat repo under gislab-se | Tydlig projektgräns och gemensam GitHub-åtkomst |
| Första publicering via `yakimovskagabriela-ctrl` | Ger en stegvis förhandsversion; exakt repo, metod och URL verifieras före publicering |
| Publik app på gislab.se som slutmål | Beställarens slutliga publiceringsmål; den privata källkodens synlighet ändras inte automatiskt |
| TypeScript, Vite och Leaflet som startarkitektur | Liten statisk klient som bygger på Gabrielas erfarenhet |
| API-adaptrar med egna datatyper | Isolerar leverantörsförändringar från kartan och analysen |
| Först kommunöversikt, sedan platsökning och rutanalys | Gör första resultatet litet och demonstrerbart |
| Havsnivåanalys efter version 1 | Kräver separat datakontroll och metodval |

Teknikvalen kan ändras av Gabriela när ett konkret behov visas. Dokumentera orsak och konsekvens innan större omtag.

## Öppna frågor och ansvar

| Fråga | Nästa steg | Ansvarig |
| --- | --- | --- |
| Slutliga API:er, villkor, CORS och nyckelbehov | P2, verifiera mot riktiga svar | Gabriela |
| Gemensam statistikårgång och gränsindelning | P2, kontrollera källmetadata | Gabriela |
| Ritbibliotek och geometrioperationer | P1/P5, välj underhållna verktyg med lämpliga licenser | Gabriela |
| Åtkomstlösning för SCB och kommungränser | Avgör före beroende implementation. Direktåtkomst till kart-api utan serveradapter är beslutad 28 oktober 2026. | Gabriela med Henrik |
| Repo, metod och URL för första GitHub-publiceringen | Välj en stabil commit och verifiera åtkomst, bygge och Pages-stöd | Gabriela |
| Exakt URL och åtkomst till webbhotell | Före P8 och efter GitHub-förhandsversionen | Henrik tillhandahåller, Gabriela verifierar |
| Visuellt uttryck och eventuell GISLAB-profil | Före användartest i P7 | Gabriela med Henrik |
| Öppen källkodslicens för projektet | Beslut före eventuell publik källkod | Henrik |
| Förvaltning efter LIA-perioden | Fyll HANDOVER före avslut | Gabriela och Henrik |

## Arkitekturbeslut

### P1 – bakgrundskarta för lokal utveckling, 15 oktober 2026

- Leaflet visar OpenStreetMaps standardraster via `https://tile.openstreetmap.org/{z}/{x}/{y}.png` med synlig attribution. Kartbilder laddas för aktuell vy; ingen egen offlinecache eller masshämtning införs.
- Villkor lästa: https://operations.osmfoundation.org/policies/tiles/ . Tjänsten har ingen tillgänglighetsgaranti. Lämpligheten för publik drift ska bedömas före P8.
- Node.js 24.20.0 LTS och npm 11.19.0 är installerade. Exakta installerade versioner: Leaflet 1.9.4, TypeScript 7.0.2, Vite 8.3.4 och @types/leaflet 1.9.22. Låsfil finns. Ren installation med `npm ci`, typkontroll, bygge och serverstart har verifierats i en separat kopia av arbetsfilerna. Gabriela har bekräftat kartvisning, zoom, panorering, återställning och layout på dator och i simulerat mobilformat med smal skärm. Faktisk ny klon och test på fysisk mobil återstår.
- Musrullszoom är aktiverad för att underlätta utforskning på dator. Gabriela har bekräftat funktionen med musens scrollhjul. Kartan använder rullningen för zoom när pekaren är över kartan; sidrullningen påverkas där. Zoomknapparna finns kvar. Typkontroll och produktionsbygge passerade med inställningen aktiverad.
- Grundfilerna håller kartstarten separat från sidans uppstart. Vites relativa bas tillåter framtida publicering i underkatalog.
- Startvyns koordinater ligger i `src/config/mapConfig.ts` och läses av kartmodulen. De behåller Leaflets ordning [latitud, longitud] och är en visningsutbredning, inte en administrativ gräns. Flytten ändrar inte kartans startvy och inför inga nya beroenden.
- Gabriela identifierade [issue #1 – Skapa och förstå en körbar projektgrund](https://github.com/gislab-se/platsorientering/issues/1) manuellt på GitHub. AI:n har inte läst issue-innehållet; genomförandet kontrolleras mot P1 i ROADMAP.md. Ingen ändring på GitHub, commit, push, PR eller publicering är genomförd.

## P2 – beslutsunderlag för källval och åtkomst, 22 oktober 2026

**Status den 22 oktober: föreslagen arbetsinriktning, inte slutligt fastställda beslut.** Underlaget har därefter kompletterats med kontroller och det avgränsade kart-api-beslutet nedan. Underlag: [DATA_SOURCES.md](DATA_SOURCES.md), [P2 i ROADMAP](../ROADMAP.md#p2--verifiera-datakällor-och-skriv-datakontrakt) och [ARCHITECTURE.md](../ARCHITECTURE.md). Gabriela har tillhandahållit de fem klartkriterierna från [Issue #2](https://github.com/gislab-se/platsorientering/issues/2); de motsvarar ROADMAP. Direkt läsning av issuen och PR #11 på GitHub har inte verifierats.


Statusuppdatering 28 oktober 2026: För kart-api ersätts den föreslagna åtkomsten av beslutet i samråd med Henrik nedan. För SCB och kommungränser finns verifieringsunderlag och ett åtkomstförslag, men inget bekräftat slutligt åtkomstbeslut. P2 är därför fortsatt delvis uppfyllt. Denna dokumentsynkronisering inför inga nya beslut eller testresultat.

### Föreslagna källor och deras underlag

Underlaget nedan omfattar både Gabrielas tidigare redovisade browserprov och projektets senare live-/fixturkontroller enligt DATA_SOURCES. Dokumenterade villkor hålls åtskilda från observerade svar. Färdiga gränssnittsfunktioner ingår inte i P2.

Implementationsstatus uppdaterad 28 oktober 2026: [contracts.ts](../src/domain/contracts.ts) och [validation.ts](../src/domain/validation.ts) innehåller fem interna kontrakt och runtime-validering. Senaste `npm.cmd test` passerade med typkontrakt och **63 runtime-tester**; även `npm.cmd run typecheck` passerade. Fyra syntetiska och tre verkliga SCB-fixturer används av [käll-/adaptertesterna](../tests/source-fixtures.test.mjs). SCB-fixturerna omfattar nio TAB628-värden för tre kommuner, en hel WFS-ruta och ett tomt WFS-svar, med källa, hämtningsdatum, referenstid och CC0-underlag; se [fixturernas README](../tests/fixtures/README.md). Inga verkliga kart-api-fixturer har sparats. [municipalityLookup.ts](../src/providers/municipalityLookup.ts) och [geocode.ts](../src/providers/geocode.ts) är implementerade och liveprovade via Node men ännu inte inkopplade i gränssnittet. SCB kontrolleras med delscheman och semantiska tester; färdiga SCB-adaptrar är inte ett extra P2-krav. [DATA_SOURCES](DATA_SOURCES.md) redovisar exakta anrop, utfall och kvarvarande begränsningar. Tester har inte körts om vid denna dokumentsynkronisering.

| Behov och föreslagen arbetsinriktning | Redovisat underlag och motiv | Kända risker och öppna frågor |
| --- | --- | --- |
| Platsökning: kart-api `/v1/geocode` | Lokal browseråtkomst med HTTP 200 och CORS, strukturerat 422-svar, kommunfilter och begränsning med `limit` är redovisade. Ger ett konkret kontraktsunderlag för svensk platsökning. | Resultatlistan är begränsad; kontraktet anger högst 20 träffar och ingen dokumenterad paginering. Tomt filtrerat svar betyder inte att platsen saknas. CRS/axelordning, referenstid, uppdatering och geografiska luckor återstår att belägga. |
| Kommunuppslag: kart-api `/v1/kommun/lookup` | Tidigare browserprov och projektets liveprov med 200/404/422 finns. Rätt koder kontrollerades för Finspång, Uppsala, Malmö och Kiruna. Kommunguiden anger Lantmäteriet som gränskälla. | Uttryckligt CRS för lookup-indata och gränsårgång återstår. Indelningen måste jämföras med vald kommungeometri. Node-provens CORS-headers ersätter inte browserprov. |
| Kommunstatistik: SCB TAB628, PxWeb API v2 | Tidigare uttag med 290 kommuner/870 värden, officiell metadata och ett sparat verkligt prov med tre kommuner finns. Referensdagarna 2025-12-31 respektive 2026-01-01 och CC0 är belagda. | Praktisk cache-/uppdateringsstrategi och exakt felhantering följs upp inför beroende implementation. Koppling till vald gränsårgång återstår. |
| Befolkningsrutor: SCB WFS `stat:befolkning_1km_2025` | Fyra exakta URL:er återtestade 28 oktober: 5+5+5+2 objekt, 17 unika ID:n. Tom-/felprov och schema finns. EPSG:3006 och referenstid 20251231 är bekräftade. Små verkliga CC0-fixturer finns. | Ingen nationell nedladdning behövs för P2. Numerisk anropskvot, hård maxgräns och exakt cachetid hittades inte i granskade källor. ID-stabilitet vid uppdateringar, variabelspecifika saknatillstånd och testad omprojektion återstår inför beroende implementation. |
| Kommungeometri: SCB:s förenklade kommungränser som kandidat | Tidigare kontroll av 290 objekt och kodmatchning finns. Ny `.prj`-kontroll tillsammans med officiella produktuppgifter stöder EPSG:3006. CC0 är bekräftat. | Gränsårgång är okänd; filnamn och arkivtidsstämplar fastställer den inte. Kodmatchning bevisar inte samma indelning. Statisk GeoJSON-leverans och omprojektion är föreslagna, inte genomförda. SCB anger att produkten är avsedd för tematisering, inte analys. |

### Rättigheter, attribution och cache

- **kart-api, dokumenterade villkor:** visning och rimlig cache med korrekt attribution; 200 anrop/dygn/IP utan nyckel och 10 000/månad med nyckel under betan. Beta utan garanterad servicenivå. Egen databas/bulkdistribution tillåts inte. Faktiska svarets attribution ska bevaras. Exakt cachetid och rätt att spara verkliga provsvar i privat respektive offentligt repo är öppna frågor.
- **TAB628 och WFS:** SCB:s officiella villkor anger CC0 1.0 för öppna statistikdata och geodata; små verkliga provsvar är nu sparade med proveniens. `Källa: SCB` bevaras för projektets spårbarhet. PxWeb:s dokumenterade gränser är 150 000 dataceller/uttag och 30 anrop/10 sekunder/IP; dessa överförs inte till WFS. WFS 2.0.0 annonserar CountDefault=1000000, vilket inte är en uppmätt hård maxgräns. Exakt cachetid är inte belagd.
- **Kommungränser:** SCB:s produktsida anger CC0 för den aktuella produkten. Lokal konvertering och statisk leverans har därför licensstöd, men är inte genomförda. Källa, okänd/bekräftad geometriårgång och bearbetning ska redovisas; cache-/uppdateringsstrategi är inte fastställd.

### Åtkomst: beslutad för kart-api, föreslagen för övriga källor

**För kart-api är direkt browseråtkomst utan API-nyckel beslutad den 28 oktober 2026; serveradapter behövs inte i nuläget. För övriga källor är direkt browseråtkomst fortsatt ett förslag och åtkomstlösningen inte slutligt avgjord.** Lokal åtkomst för begränsade prov är inte en garanti för alla anrop, storlekar eller framtida driftförhållanden.

- kart-api ska enligt beslutet den 28 oktober användas direkt utan nyckel inom dokumenterad kvot. Kvotens lämplighet för avsedd användning behöver följas upp. Om hemlig nyckel krävs hör den hemma i en serveradapter, inte i webbläsarkod.
- TAB628 och begränsade, paginerade WFS-uttag föreslås nås direkt. Åtkomstvillkor, tekniska gränser och fel-/fullständighetskontroller måste kompletteras innan lösningen fastställs.
- För kommungränser föreslås lokal förberedelse av SCB:s förenklade gränser till GeoJSON/WGS84 och statisk leverans med appen för visualisering. CC0 ger distributionsstöd; gränsårgång, konvertering och leverans är ännu inte verifierade. Förbearbetning innebär inte i sig en server i drift.

En serveradapter löser inte oklar licens, okänd geometriårgång eller leverantörens kapacitetsgränser. Enligt arkitekturen kan även annan tillåten källa eller ett tillåtet förberett utdrag väljas om direktåtkomst inte räcker.

### Återstående beslut och ansvar

Gabriela ansvarar för fortsatt källverifiering, metadata, datakontrakt, tester och dokumentation. Källvalen behöver slutligt fastställas med belägg för CRS, referenstider, kompatibel gränsindelning, rättigheter, cache och åtkomstgränser. Detta avsnitt avslutar inte P2 och inför inga funktioner från P3–P6.

**Serverfrågan för kart-api är avgjord i samråd med Henrik den 28 oktober: ingen serveradapter behövs i nuläget.** Gabriela tillsammans med Henrik bedömer återstående åtkomstlösningar för SCB och kommungränser före beroende implementation. Lösningen för kart-api omprövas om nya behov eller begränsningar uppstår. Relevanta avstämningar med Henrik är om kart-api:s kvot och betaegenskaper motsvarar avsedd användning, om konstaterade begränsningar i gränser/indelning är acceptabla för syftet och vilka driftkonsekvenser en eventuell serveradapter får. Detta är befintligt krav-/GIS-stöd och gemensam granskning, inte nya formella godkännandekrav.


### P2 – API-åtkomst, 28 oktober 2026

**Status: Beslut fattat i samråd med Henrik.**

- **Beslut:** Använda kart-api direkt från webbläsaren utan API-nyckel.
- **Motivering:** API- och CORS-tester har fungerat.
- **Serveradapter:** Behövs inte i nuläget.
- **Genomfört 28 oktober:** Båda kart-api-adaptrarna finns och har passerat syntetiska tester och liveprov via Node. Kommunkoder, attribution, begränsade/tomma söksvar och HTTP 404/422 kontrollerades; inga fel konstaterades i de verifierade fallen. Inget nytt browsertest eller gränssnittsprov gjordes.
- **Nästa steg för P2:** Komplettera återstående källmetadata och SCB-verifiering samt fastställ åtkomst för SCB och kommungränser enligt [DATA_SOURCES](DATA_SOURCES.md#återstående-p2-dokumentation-och-beslut). Inkoppling i gränssnittet hör till kommande funktionsetapper.
- **Uppföljning:** Ompröva lösningen om nya behov eller begränsningar uppstår.


## Mall för nya arkitekturbeslut

Lägg till ett kort numrerat beslut när en fråga blir avgjord:

- Datum och status.
- Problem och observerade begränsningar.
- Vald lösning och varför.
- Alternativ som faktiskt övervägdes.
- Konsekvenser för användare, data, drift och tester.
- Länk till issue eller pull request.
