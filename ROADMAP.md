# Arbetsplan

Alla produktionsuppgifter ägs av Gabriela. Henrik ger kravstöd och återkoppling. Arbetet ska ge både lärande och en användbar geografisk tittfunktion. Rubrikerna P1–P9 används även för GitHub-issues; aktuell detaljstatus följs där.

**Färdigt:** P1-implementationen är sammanslagen till `main` genom PR #10. **Pågår:** P2 på grenen `feat/2-datakallor-datakontrakt`; tre commits finns på GitHub och ytterligare lokala ändringar är inte committade. **Planerat:** P3–P8. P9 är en senare utredning. Ingen projektversion är publicerad.

Första funktionsmål: P1–P4 ger en kommunöversikt med befolkning. Regioner och sammansatta områden införs därefter i avgränsade steg. Den offentliga källkodskopian `yakimovskagabriela-ctrl/platsorientering` publicerar förhandsversionen med GitHub Actions från sitt `main`, efter godkända tester och bygge. P2-arbetet i kopian är fortsatt pågående. Slutpublicering på gislab.se ingår i P8.

## P1 – Skapa och förstå en körbar projektgrund

Status: **implementerad och sammanslagen till `main` genom PR #10**. De daterade manuella kontrollerna finns i P1-guiden. Gabrielas fortsatta genomgång av hur delarna hänger ihop och test på fysisk mobil är lärande-/kvalitetsuppföljning och ändrar inte Git-historiken.

Ansvarig: Gabriela. Beroenden: inga.

Skapa TypeScript/Vite/Leaflet-grunden och dokumentera lokal installation. Välj och lås aktuella stödda versioner. Skapa bara den struktur som behövs för första delmålet.

Klart när:

- En ny klon kan installeras och startas med dokumenterade kommandon.
- En karta visas och anpassas till skärmstorleken.
- Typkontroll och produktionsbygge passerar.
- Node-version och låsfil finns; Gabriela kan förklara hur HTML, TypeScript, CSS och kartbibliotek hänger ihop.
- CI kör typkontroll och bygge vid pull requests.

## P2 – Verifiera datakällor och skriv datakontrakt

Status 28 oktober 2026: **delvis uppfyllt, inte avslutat**. De fem klartkriterierna nedan motsvarar Issue #2 enligt kravtexten från Gabriela. Fem interna kontrakt, runtime-validering, fyra syntetiska och tre verkliga SCB-fixturer finns. Senaste typkontrakt, 63 runtime-tester och typkontroll passerade. kart-api-adaptrarna har liveprovats; SCB WFS-paginering har återtestats med 17 unika objekt samt tom-/felprov. Källor och rättighetsbedömning finns i [DATA_SOURCES](docs/DATA_SOURCES.md).

Direkt kart-api-åtkomst utan nyckel/server är beslutad i samråd med Henrik. Åtkomst för SCB och kommungränser är fortsatt ett förslag, se [DECISIONS](docs/DECISIONS.md). Kvar för P2-bedömningen är att fastställa dessa käll-/åtkomstval och hantera öppna metadatafrågor, särskilt kart-api:s CRS/referenstid och kommungränsernas årgång. Dokumentationen skiljer dem från senare implementation: P3-gränssnitt och färdiga SCB-adaptrar införs inte för att avsluta P2. Ingen ny testkörning eller ändring av GitHub-status har gjorts vid denna dokumentsynkronisering.

Ansvarig: Gabriela. Beroenden: P1.

Kontrollera kart-api och SCB mot riktiga svar och leverantörernas dokumentation. Utred de datakällor som behövs för kommunval, platsökning, kommunstatistik och befolkningsrutor i Sverige.

Klart när:

- DATA_SOURCES har endpoints, parametrar, täckning, referenstider, CRS, licens, attribution, kvoter och hämtningsdatum för valda källor.
- Browseranrop från lokal miljö har provats; krav på nyckel, CORS, paginering och storleksgränser är utredda.
- Små tillåtna provsvar och interna typer finns. Tomt, felaktigt och begränsat svar hanteras.
- Återpublicering av data har bedömts separat från rätt att visa data.
- Eventuellt serverbehov är avgjort i DECISIONS innan beroende funktioner byggs.

## P3 – Välj kommun och visa rätt område

Ansvarig: Gabriela. Beroenden: P2.

Bygg val av kommun med namn och kod. Behåll inledande nollor i kommunkoder och visa vald gräns med årgång.

Klart när:

- Kommunval fungerar i Uppsala, Malmö och Kiruna utan särskild kod per plats.
- Valet centrerar kartan och uppdaterar gemensamt apptillstånd.
- Ett gammalt nätverkssvar kan inte ersätta ett nyare områdesval.
- Laddning, tomt resultat och fel är tydliga. Valet fungerar med tangentbord.

## P4 – Visa befolkning och täthet för kommuner

Ansvarig: Gabriela. Beroenden: P3.

Koppla kommunstatistik via kod och verifierad indelning. Använd sammanhängande årgångar för befolkning, officiell landareal och täthet.

Klart när:

- Folkmängd, landareal och täthet visas med år, enhet och källa.
- Resultat för testkommunerna stämmer mot källtabellen med dokumenterad avrundning.
- Dubbletter, okända koder, saknade värden och felaktiga nämnare ger begriplig hantering.
- Analysen har meningsfulla tester och kan köras utan nätverk.
- Gabriela visar den första fungerande kommunöversikten för Henrik.

## P5 – Sök plats och hantera fler områdesval

Ansvarig: Gabriela. Beroenden: P3; kan genomföras efter P4.

Inför platsökning. Utvidga områdesvalet stegvis med regioner, områden sammansatta av flera kommuner eller regioner och ett ritverktyg för polygoner. Avgränsa varje områdestyp i en egen liten uppgift och håll dess statistik skild från kommunstatistiken.

Klart när:

- Flera orter med samma namn presenteras så att användaren kan välja rätt.
- Regioner och sammansatta områden har tydliga identifierare, geometriårgångar och källor innan de visas som valbara.
- Polygoner kan ritas, redigeras och tas bort. Ogiltig eller tom geometri avvisas begripligt.
- Gammal kommunstatistik visas inte som statistik för ett nytt ritat område.
- Områdesvalet och geometrin kan testas oberoende av kartans utseende.
- Ritning och kompletterande kontroller har provats på mobil och med dokumenterad tangentbordshantering.

## P6 – Visa och analysera befolkningsrutor

Ansvarig: Gabriela. Beroenden: P2 och P5.

Hämta rutdata för det valda utsnittet och följ ANALYSIS_METHODS. Behåll hela rutornas geometri och geografiska referens.

Klart när:

- Samma hämtning fungerar för flera svenska områden, med kontrollerad paginering och fullständighet.
- Teckenförklaring, statistikår och noll/saknatillstånd är tydliga.
- Helt inkluderade rutor och gränsrutor redovisas separat utan dubbelräkning.
- Varken totalen för överlappande rutor eller areaviktad uppskattning presenteras som exakt befolkning i polygonen.
- Tester täcker en hel ruta, en delvis överlappande ruta, hål i polygon, MultiPolygon, tomt urval och ofullständigt svar.
- Rimliga storleksgränser har uppmätts och dokumenterats för mobil och dator.

## P7 – Testa hela användarflödet och förbättra begripligheten

Ansvarig: Gabriela. Beroenden: P4–P6.

Sammanför funktionerna till en sammanhängande app och låt en kollega på Lablab prova den.

Klart när:

- Platsval → kommunresultat → rutlager → ritat område fungerar i ett webbläsartest.
- Mobil, tangentbord, fokus, läsbarhet och färglegend har kontrollerats.
- Timeout, kvotfel, avbrutna anrop och saknade data ger användbara meddelanden.
- Ingen resultatruta blandar olika områdesval eller årgångar utan förklaring.
- Gabriela har dokumenterat användartest, åtgärder och kvarstående kända fel.

## P8 – Slutpublicera version 1 på gislab.se och lämna över

Ansvarig: Gabriela. Beroenden: P7 och driftsuppgifter från Henrik.

Utgå från erfarenheten från den tidigare GitHub-förhandsversionen. Fyll i DEPLOYMENT med faktisk målmiljö och genomför en reproducerbar slutrelease. Henrik ordnar tillgång till domän/webbhotell; Gabriela ansvarar för genomförandet.

Klart när:

- Slutlig URL, publiceringssätt och eventuell serverdel är dokumenterade.
- Appen fungerar på mål-URL:en med HTTPS, korrekta resurssökvägar, attribution och riktiga dataanrop.
- En angiven commit/tagg kan byggas om och föregående version kan återställas.
- Byggkontroller, analyskontroller och releasekontroll passerar.
- HANDOVER är ifylld med drift, datakällor, uppdatering, felhantering och kända begränsningar.
- Henrik har provat leveransen och Gabriela har demonstrerat och dokumenterat resultatet.

## P9 – Utred en senare havsnivåanalys

Ansvarig: Gabriela. Beroenden: färdig version 1 och prioritering med Henrik.

Utred datatillgång och metod innan ny analys byggs. Leveransen är först ett metodförslag.

Klart när:

- Höjdmodell, upplösning, licens, vertikalt referenssystem och vald havsnivå är dokumenterade.
- Det framgår hur kontakt med havet och lågt belägna inlandssänkor hanteras.
- En enkel höjdtröskel skiljs från en modell för kustöversvämning; ingen punktfråga används som ytmodell.
- Antaganden, osäkerheter, testområde och behov av serverberäkning är beskrivna.
- Henrik och Gabriela har valt om och hur implementationen ska fortsätta.
