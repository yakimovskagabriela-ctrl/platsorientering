# Startguide för Gabriela

Du ansvarar för projektets produktion och ska samtidigt få utrymme att förstå och prova varje steg. Henrik hjälper med krav, GIS-frågor och granskning. Börja alltid med att kontrollera aktuell status i README och ROADMAP.

## Aktuellt läge

- P1-grunden är implementerad och sammanslagen till `main` genom PR #10.
- P2 pågår och finns med som arbetsmaterial i denna offentliga kopia. Ursprunglig P2-gren och lokala GISLAB-ändringar bevaras separat.
- [P1-kartan](https://yakimovskagabriela-ctrl.github.io/platsorientering/) är publicerad den 30 oktober 2026.
- Push till detta repos `main` bygger och publicerar automatiskt efter godkända tester. gislab.se är ett senare slutmål.

## Börja ett arbetspass

1. Öppna repot `https://github.com/yakimovskagabriela-ctrl/platsorientering.git` i VS Code.
2. Läs den aktuella uppgiften och relevanta delar av README, AGENTS och ROADMAP.
3. Kör `git status` och `git branch --show-current`. Byt inte gren med osparade ändringar.
4. Arbeta i ett litet steg som går att förklara och kontrollera.
5. Kör relevanta kontroller och anteckna vad du själv provade.

P1-guiden är ett historiskt och pedagogiskt stöd för hur kartgrunden hänger ihop. P2:s aktuella källunderlag finns i DATA_SOURCES.

## Arbeta med AI

Ge AI:n en tydlig uppgift med aktuellt issue-nummer och be den läsa AGENTS.md. Be om förklaringar till kod och metod du inte förstår. Testa resultatet själv och fråga varför vid oväntade utfall.

Exempel på uppdrag:

> Läs AGENTS.md och den aktuella uppgiften. Förklara först nuläget. Genomför ett litet steg, förklara vilka filer som påverkas och visa hur jag själv kontrollerar resultatet.

Om du skriver på makedonska ska AI:n svara på makedonska och svenska enligt AGENTS.md, så att Henrik också kan följa arbetet.

## När du fastnar

Beskriv vad du försökte göra, vad du förväntade dig, vad som faktiskt hände och exakt felmeddelande. Skriv det i aktuell issue. Lägg aldrig in token, lösenord eller andra hemligheter i felrapporter.

## Nästa arbetsdag

Kontrollera `git status` innan du byter gren. Spara färdiga egna ändringar i rätt gren. Uppdatera `main` med `git pull --ff-only` före en ny uppgift. En ny arbetsmapp och en ny gren löser olika behov; skapa inte nya repon för varje etapp.
