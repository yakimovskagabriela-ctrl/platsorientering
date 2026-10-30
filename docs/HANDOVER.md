# Drift och överlämning

Detta är en mall som Gabriela fyller i under projektet och färdigställer i P8. Tomma fält betyder att uppgiften ännu inte är fastställd, inte att funktionen är verifierad.

## Leverans

- Slutmiljö på gislab.se: inte publicerad.
- GitHub-förhandsversion: [P1-kartan](https://yakimovskagabriela-ctrl.github.io/platsorientering/).
- Första publicerade commit: `ed4ffc0922c930b888f4a62a7c6854ccf8435aa1` i Gabrielas offentliga repo. Pågående P2 finns som källkod men är inte integrerat i gränssnittet.
- Datum och utförare: 30 oktober 2026, Codex på Gabrielas uttryckliga uppdrag.
- Verifierat: 63 tester, typkontroll och bygge passerade lokalt. GitHub CI och Pages-deployment lyckades; HTML, CSS och JavaScript svarade HTTP 200. Ny manuell browserkontroll av den publicerade sidan återstår.
- Produktionsansvarig under projektet: Gabriela.
- Beställare och kontakt efter överlämning: Henrik; förvaltningsupplägg fastställs före avslut.

## Installation och bygge

Node-version anges i `.nvmrc` (24.x). Kör `npm ci`, `npm test` och `npm run build -- --base=/platsorientering/`. Lokal utveckling: `npm run dev`. Klona `yakimovskagabriela-ctrl/platsorientering`; se README.

## Data och metod

Lista faktiskt använda källor, referenstider, indelningar och uppdateringsförfarande. Länka till DATA_SOURCES och ANALYSIS_METHODS och dokumentera hur nya årgångar valideras före publicering.

## Publicering och återställning

Fyll i både GitHub-förhandsversion och slutmiljö på gislab.se: artefakt, målplats, överföringsmetod, kontroll efter release och provad återställning. Beskriv var hemligheter hanteras utan att ange deras värden.

## Vanliga fel

Dokumentera hur man identifierar och hanterar API-avbrott, kvotfel, ändrade fält, bristande täckning och resursfel under underkatalog. Ange vad användaren ser och vad förvaltaren behöver kontrollera.

## Kända begränsningar och återstående arbete

Länka öppna issues. Beskriv statistikårgångar, gränsrutor, prestandagränser och eventuella ej stödda områden tydligt. Havsnivåanalys är inte del av ursprunglig version 1.

## Överlämningskontroll

- En kollega kan klona, installera, köra kontroller och bygga enligt dokumentationen.
- Produktionsflödet har demonstrerats på mobil och dator.
- Källor, attribution och metoder motsvarar implementationen.
- Nästa förvaltare har rätt åtkomst utan delade personliga lösenord.
- Återställning är provad eller en konkret kvarstående brist dokumenterad.
