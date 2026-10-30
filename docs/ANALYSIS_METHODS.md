# Analysmetoder för version 1

Alla resultat ska ange vilken geografisk yta och tidpunkt de gäller. En ändring av områdesvalet ska rensa eller tydligt markera tidigare resultat tills nya data finns.

## Kommunbefolkning och täthet

Utgå från SCB:s publicerade kommunstatistik. Kommunkod, geometriårgång och statistikår ska kontrolleras före join. Befolkning, officiell landareal och publicerad täthet hämtas helst från samma tabell och årgång.

Definitionen är folkmängd dividerad med landareal i km², med referenstider enligt källtabellen. Kontrollberäkningar behöver ta hänsyn till att de publicerade indata kan vara avrundade. Visa källans täthet när den finns och dokumentera eventuell avvikelse vid egen omräkning.

En kommunpolygons geometriska yta kan inkludera vatten och är inte samma sak som officiell landareal. Noll, negativ eller saknad nämnare ger inget täthetsvärde. Saknad statistik får inte bli noll.

## Befolkningsrutor och eget område

Varje populationsvärde gäller en hel ruta i sin publicerade datavariant och referenstid. Behåll stabilt rut-ID och avduplicera paginerade svar. Urvalet ska ha en dokumenterad hantering av geometrisk tolerans och beröring vid en gräns.

Dela rutorna i tre grupper:

1. Helt inom polygonen: hela rutans yta ligger i området, med definierad gränstolerans.
2. Gränsrutor: positiv överlappande yta finns, men rutan ligger inte helt inom området.
3. Utanför: ingen positiv överlappande yta. Enbart linje- eller punktkontakt räknas inte som invånare i området.

Hål och separata delar i polygonen ska ingå i urvalslogiken. Redovisa antal och summa för helt inkluderade rutor, samt antal och hela rutvärden för gränsrutor separat. Värdena beskriver de valda rutorna, inte en exakt folkmängd i den ritade polygonen. Inga påståenden om exakta övre/nedre gränser görs för röjandeskyddad statistik.

Version 1 fördelar inte rutornas befolkning efter överlappande area. Om en uppskattningsmetod senare införs ska den ha eget namn, antaganden, referensyta och tester. Kommunbefolkning fördelas aldrig automatiskt till mindre ytor.

## Fullständighet och referenstid

Kontrollera att alla sidor i ett svar har hämtats och att leverantörens maxgräns inte har kapat resultatet. Vid ofullständiga data får en delsumma inte presenteras som total för området.

Rutstatistik och kommunstatistik kan ha olika referensår och olika röjandeskydd. Jämförelser märks med båda årgångarna. En differens får inte automatiskt beskrivas som befolkningsförändring eller kodfel.

## Reproducerbar kontroll

Testa analysen med små syntetiska geometrier: en hel ruta, halv ruta, hål, MultiPolygon, enbart gränsberöring och tomt urval. Testa också dubblett-ID, saknat värde, fel CRS, nollarea och avbruten paginering.

Jämför minst tre kommunresultat mot källtabellen. Dokumentera beräkning, tolerans och avrundning. Prov av riktiga data och tester av matematiken fyller olika syften och behövs båda.

## Senare havsnivåetapp

En höjdtröskel visar låg terräng under en angiven nivå. En kustöversvämningsanalys behöver dessutom modellera kontakt med havet och hantera relevanta barriärer och referenssystem. Begrepp, höjdmodell, upplösning och antaganden fastställs i P9 innan en sådan funktion byggs.
