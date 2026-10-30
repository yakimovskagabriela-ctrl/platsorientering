# Instruktioner för AI-agenter

Gäller hela detta repo. Läs README.md, PROJECT_BRIEF.md, ARCHITECTURE.md och den aktuella uppgiften innan du ändrar något. Närliggande dokumentation ska uppdateras om beteende eller beslut ändras.

## Människor och ansvar

- Projektet har två lika viktiga mål: Gabriela lär sig bygga kartor och program med AI i Codex, och kollegor på LABLAB får ett geografiskt tittfönster för platser i Sverige.
- Gabriela studerar GIS på Ocellus och gör LIA på GISLAB. Hon driver projektet och deltar själv i utveckling, test och publicering för att förstå och kunna förvalta resultatet.
- Henrik Aldén är beställare, GIS-expert och handledare på GISLAB. Han hjälper till med krav, GIS-metod och granskning.
- AI är stöd i Gabrielas arbete. Förklara kort vad som ändras, varför och hur hon själv kontrollerar resultatet. Ge utrymme för egna försök och anpassa takten när hon vill öva.

## Produkt och aktuellt läge

- Målet är att välja och utforska en kommun, en region eller ett område sammansatt av flera kommuner eller regioner. Börja med en kommun; övriga områdesval införs i separata steg.
- Befolkning är första tematiska kartlagret och ska hämtas via ett verifierat kart-API. Exakt tjänst och endpoint för befolkningslagret är ett öppet beslut. SCB TAB628 och SCB:s WFS-rutor är undersökta kandidater; `api.kart-api.se` är verifierat för platsökning och kommunuppslag.
- Prioritera områdesval, kartnavigering, teckenförklaring och information om källa, år, geografisk upplösning och begränsningar. Fler API-lager kan tillkomma senare.
- Skilj alltid fungerande funktioner, pågående arbete, planer och öppna beslut. Aktuell status hör hemma i README; källunderlag i docs/DATA_SOURCES.md och beslut i docs/DECISIONS.md.

## Språk

- När Henrik skriver på svenska: svara på svenska.
- När Gabriela skriver på makedonska: svara på både makedonska och svenska, i tydligt åtskilda delar. Den svenska delen ska innehålla samma väsentliga information, beslut, resultat och frågor.
- Detta gäller även löpande uppdateringar och frågor.
- Projektdokumentation och gränssnitt skrivs på svenska. Kodidentifierare kan vara på engelska.

## Arbetssätt

1. Bedöm om uppgiften behöver förtydligas. Synliggör viktiga antaganden. Fråga bara när oklarheten påverkar resultatet; en tydlig uppgift ska genomföras direkt.
2. Arbeta i små, testbara steg mot en avgränsad GitHub-issue i en egen gren. Blanda inte olika etapper i samma pull request. Kontrollera lokala ändringar före grenbyte och bevara pågående arbete.
3. Håll koden och strukturen lättbegripliga, med få beroenden. Bygg en fungerande grund innan fler funktioner läggs till. Inför bibliotek och tjänster bara för konkreta behov.
4. Kontrollera aktuella API-kontrakt i primärkällorna. Hitta inte på endpoints, kolumnnamn, licenser eller täckning. Dokumentera observerade svar och hämtningsdatum.
5. Kör kontroller som är relevanta för ändringen. Matematik, urval, gränsfall och datakontrakt behöver meningsfulla tester. Små textändringar behöver inte nya enhetstester.
6. Redovisa vad som ändrades, hur det kontrollerades och vad som återstår. Påstå inte att något fungerar, är testat eller är publicerat utan belägg.

## GIS och data

- Version 1 gäller Sverige. Platsnamn, kommunnummer och koordinater ska vara data, inte hårdkodad applikationslogik.
- Använd GeoJSON med WGS 84, longitud före latitud, vid webbgränsen. Beräkna inte ytor i kvadratgrader. Validera referenssystem före omprojektion; ett nytt CRS får inte bara etiketteras på okända koordinater.
- Kommunkoder är fyrsiffriga strängar, även med inledande nollor. Kontrollera årgångar och dubbletter före join.
- Saknat värde, sekretessmarkerat värde och noll är olika tillstånd. Summor från röjandeskyddad statistik kan avvika från publicerade totaler.
- Följ docs/ANALYSIS_METHODS.md. Kommunbefolkning får inte fördelas till ritade områden eller DeSO utifrån andel polygonarea.
- Hela befolkningsrutor som korsar en områdesgräns får inte beskrivas som exakt befolkning inom området.
- Källa, referenstid, enhet, metod och attribution ska följa med varje analysresultat.
- Återpublicera inte kart-api-data som en egen nedladdningsdatabas. Läs och följ respektive leverantörs villkor innan rådata distribueras.

## Drift och säker hantering

- Lägg aldrig token, API-nyckel, lösenord eller privata anslutningsuppgifter i Git, webbläsarkod, loggar eller exempel.
- Vite-variabler som skickas till klienten är publika. Hemliga nycklar hör hemma i en servermiljö.
- Dokumentera hämtningar och bearbetningar. Håll stora rådata, cache och byggresultat utanför Git.
- Källkoden i detta repo är offentlig enligt Gabrielas beslut den 30 oktober 2026. GitHub Pages ska automatiskt publicera endast `dist/` efter godkända tester och bygge vid push till `main` i `yakimovskagabriela-ctrl/platsorientering`. Använd repots automatiska `GITHUB_TOKEN`; ingen överföring från GISLAB-repot eller separat personal access token behövs. Den verkliga Pages-URL:en ska verifieras efter publiceringen. Publicering på gislab.se blir aktuell i slutskedet.
- README ska beskriva lokal körning och publicering. Anpassa docs/DEPLOYMENT.md till publiceringsuppdraget innan det genomförs. Kontrollera bygge, resurssökvägar och publicerad URL; ange inte en föreslagen adress som en fungerande webbplats. Inför inga extra generella godkännandesteg.
- Bevara andra personers lokala ändringar. Radera inte historik och använd inte force push på gemensamma grenar.
