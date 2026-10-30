# Publicering

## GitHub Pages från Gabrielas repo

Källkod och pågående P2-arbete är offentliga i `yakimovskagabriela-ctrl/platsorientering` enligt Gabrielas beslut den 30 oktober 2026. GitHub Pages publicerar bara appens byggresultat, inte dokumentationen eller testfixturerna som webbplats.

I repots **Settings → Pages → Build and deployment → Source** ska **GitHub Actions** vara valt. Workflowet `.github/workflows/publish-github-pages.yml` körs vid push till detta repos `main`:

1. Installera låsta beroenden med `npm ci`.
2. Kör typkontrakt och runtime-tester med `npm test`.
3. Typkontrollera och bygg med `npm run build -- --base=/platsorientering/`.
4. Ladda upp endast `dist/` med `actions/upload-pages-artifact`.
5. Publicera med `actions/deploy-pages` när byggjobbet lyckats.

Workflowet använder repots automatiska `GITHUB_TOKEN`: byggjobbet har `contents: read`, deployment-jobbet har `pages: write` och `id-token: write`. Ingen separat personal access token behövs. Det tidigare `PAGES_DEPLOY_TOKEN` i GISLAB-repot används inte och har lämnats orört.

Verifierad adress: [kartan](https://yakimovskagabriela-ctrl.github.io/platsorientering/). Första [deploymenten](https://github.com/yakimovskagabriela-ctrl/platsorientering/actions/runs/41041504869) av commit `ed4ffc0` lyckades den 30 oktober 2026. HTML, CSS och JavaScript svarade HTTP 200. Ny manuell kontroll av kartan, zoom, panorering, `Visa Sverige` och OpenStreetMap-attribution på den publicerade sidan återstår. Körningar syns under repots **Actions**.

Gabriela styr uppdateringarna genom vad hon pushar eller mergar till detta repos `main`. Feature-grenar publiceras inte. GISLAB-repots grenar och lokala ändringar publiceras inte automatiskt till detta repo.

## Senare publicering på gislab.se

Henrik beslutar exakt domän/sökväg, webbhotell och destinationskatalog, överföring via SFTP/CI eller annat, testmiljö och tillgång. `/platsorientering/` är ännu bara ett förslag där. Verifiera HTTPS, resursvägar, API-anrop och eventuellt serverbehov i målmiljön. Bygg från en granskad commit eller tagg och dokumentera datum, commit och verklig URL.

## Säker hantering och återställning

Publicera aldrig `.git`, `.env`, hemligheter, beroendekataloger eller rådatacache. Kart-api-data får inte göras till en egen nedladdningsdatabas; källornas villkor gäller även i det offentliga repot. Inga verkliga kart-api-svar finns i testfixturerna. Små SCB-utdrag har dokumenterad CC0-proveniens i `tests/fixtures/README.md`.

Vid fel: gör en vanlig revert av den felaktiga ändringen på `main` och låt samma tester och deployment köras. Använd inte force push. Kontrollera URL och huvudfunktioner efter återställningen och dokumentera commit och orsak. Fyll HANDOVER med verifierad URL och releaseuppgifter.
