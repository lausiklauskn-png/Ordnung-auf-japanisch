# Veröffentlichen — für jede Sitzung (Claude oder Codex)

## Heute: die PWA (kein Schlüssel nötig)

1. Zweig frisch von `origin/main`, Änderung, `npm test` grün.
2. Pull Request nach `main`, mergen.
3. GitHub Pages liefert `main` aus: **https://lausiklauskn-png.github.io/Ordnung-auf-japanisch/**
   Danach den Lauf „pages build and deployment“ in Actions ansehen (nicht nur den Merge).
4. Installierte Apps holen die neue Fassung über den Service-Worker; in der App ⟳ „Aktualisieren“ lädt sofort.

## Später: Android-App (und iOS) — der Schlüssel im Tresor

Vorbild: **Privat-Brain-Pro** (`docs/VEROEFFENTLICHEN.md`, `docs/SIGNIERUNG-UND-GITHUB.md`, Workflows
`signing-identity.yml`, `android-release.yml`) und Workflow-PDF-Pro. Android verlangt für jedes Update **denselben
Signierschlüssel** — geht er verloren, lässt sich die installierte App nicht mehr aktualisieren. Darum:

- Der Schlüssel (Keystore, Passwörter, Alias) wird **einmal in GitHub Actions erzeugt** und sofort
  **verschlüsselt** (AES-256-GCM) als `signing/android-release.enc.json` ins Repo gelegt. Dazu der öffentliche
  Zertifikats-Fingerabdruck als Pin.
- Geöffnet wird er **nur in Actions** mit einem einzigen Geheimnis (z. B. `OJ_SIGNING_UNLOCK`) in einem
  GitHub-Environment (`android-release`). Das Geheimnis legt **Klaus einmal** in den Repo-Einstellungen an
  (Settings → Environments). Keine Sitzung kennt oder braucht es.
- Jede Sitzung veröffentlicht dann nur über Tag/Workflow (Version erhöhen → PR → Merge → Tag) und braucht dafür
  nur Push-Recht. **Nie einen zweiten Schlüssel erzeugen**, wenn der erste existiert.
- Icons dafür liegen schon bereit: `icons/android/` (Play Store, Adaptive Icon), `icons/ios/AppIcon-1024.png`.

Stand 2026-10-21: **noch nicht eingerichtet** — es gibt noch keine native Hülle (Capacitor/TWA). Wird sie gebaut,
werden Workflows und Tresor nach dem Vorbild oben angelegt und hier eingetragen.
