# Samarbete och leverans

Gabriela ansvarar för alla produktionsuppgifter. Henrik bidrar med krav och granskning. Varje uppgift ska både ge ett kontrollerbart projektresultat och hjälpa Gabriela att förstå lösningen. Arbeta med en GitHub-issue i taget och håll ändringarna små nog att förklara vid en demo.

## Git-flöde

Kloning hämtar hela repot. En gren är en separat arbetslinje i samma repo; man klonar inte en enskild projektmapp.

```powershell
git switch main
git pull --ff-only
git switch -c feat/1-projektgrund
# Ändra filer och kör relevanta kontroller.
git status
git add README.md
git commit -m "docs: förtydliga lokal installation"
git push -u origin feat/1-projektgrund
```

Välj filerna i `git add` efter den verkliga ändringen. Grennamn börjar exempelvis med `feat/`, `fix/` eller `docs/` följt av issue-nummer och ämne. Öppna en pull request mot `main`, länka aktuell issue och beskriv beteende och verifiering. Henrik kan ge återkoppling i pull requesten; Gabriela åtgärdar kommentarer och följer ändringen till leverans.

Använd squash merge för färdiga uppgifter. Radera den färdiga grenen efter merge. Repo-inställningen tillåter squash merge och automatisk grenradering. PR-granskning är det avtalade arbetsflödet; obligatorisk granskning och spärr mot direkt push är ännu inte konfigurerade.

Vid divergerande historik: avbryt, kontrollera skillnaderna och välj merge/rebase med förståelse för ändringarna. Använd inte reset eller force push för att få bort någon annans arbete.

## Klartkriterier för en uppgift

- Acceptanskriterierna i issuen är uppfyllda och går att demonstrera.
- Gabriela kan förklara koden, datat och eventuella metodval.
- Relevanta kontroller passerar. Testresultat och manuella kontroller beskrivs i pull requesten.
- Användarsynliga kartlager har källa, tid, enhet och attribution.
- Saknade data och anropsfel hanteras utan att visa påhittade nollor.
- Dokumentation motsvarar det som faktiskt är byggt.
- Inga nycklar, cachefiler eller otillåtet återdistribuerade rådata ingår.

## Dokumentation och löpande rapportering

README beskriver hur projektet faktiskt körs. ROADMAP beskriver omfattning och ordning, medan GitHub-issues är den löpande uppgiftsstatusen. DECISIONS uppdateras när teknik, datakälla, metod eller publiceringsupplägg ändras.

Gabriela antecknar efter varje etapp: vad som fungerar, vad som testats, vad hon lärt sig och nästa steg. Använd gärna issue-kommentarer och en kort demo. Dokumentationen behöver inte dubblera varje kodändring.
