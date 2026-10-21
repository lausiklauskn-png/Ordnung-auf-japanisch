/* Ordnung auf Japanisch — macht aus dem Katalogtext einen Satz zum Vorlesen.
   „2 EL / 5 L“ → „2 Esslöffel auf 5 Liter“, „⌛ 20 Min.“ → „Einwirkzeit 20 Minuten“.
   Ohne DOM, in Node geprüft (tests/sprechtext.mjs). */
(function (wurzel) {
  const ERSETZEN = [
    [/\*\*/g, ''],
    [/⚠\s*/g, 'Achtung: '],
    [/⌛\s*/g, 'Einwirkzeit '],
    [/⏱\s*/g, 'Arbeitszeit '],
    [/\s*→\s*/g, ': '],
    [/\s+·\s+/g, '. '],
    [/\s+—\s+/g, ', '],
    [/(\d)\s*–\s*(\d)/g, '$1 bis $2'],
    [/(\d)\s*:\s*(\d)/g, '$1 zu $2'],
    [/(\d),(\d)/g, '$1 Komma $2'],
    [/−(\d)/g, 'minus $1'],
    [/(\d)\s*°C/g, '$1 Grad'],
    [/(\d)-°C-/g, '$1-Grad-'],
    [/°C/g, 'Grad'],
    [/(\d)\s*%/g, '$1 Prozent'],
    [/(\d)\s*×\s*(\d)/g, '$1 mal $2'],
    [/(\d)\s*×/g, '$1 mal'],
    [/(\d)\s*m²/g, '$1 Quadratmeter'],
    [/(\d)\s*kWh\b/g, '$1 Kilowattstunden'],
    [/(\d)\s*cm\b/g, '$1 Zentimeter'],
    [/(\d)\s*ml\b/g, '$1 Milliliter'],
    [/(\d)\s*kg\b/g, '$1 Kilo'],
    [/(\d)\s*g\b/g, '$1 Gramm'],
    [/(\d)\s*L\b/g, '$1 Liter'],
    [/(\d)\s*€/g, '$1 Euro'],
    [/\bEL\b/g, 'Esslöffel'],
    [/\bTL\b/g, 'Teelöffel'],
    [/\b(Min|Std|Sek)\.(?=\s*[,);:])/g, '$1'],
    [/\bMin\.(?=\s+[a-zäöüß])/g, 'Minuten'],
    [/\bMin\./g, 'Minuten.'],
    [/\bMin\b/g, 'Minuten'],
    [/\bStd\b/g, 'Stunden'],
    [/\bSek\b/g, 'Sekunden'],
    [/\bStd\.(?=\s+[a-zäöüß])/g, 'Stunden'],
    [/\bStd\./g, 'Stunden.'],
    [/\bSek\.(?=\s+[a-zäöüß])/g, 'Sekunden'],
    [/\bSek\./g, 'Sekunden.'],
    [/\bca\./g, 'circa'],
    [/\bz\. ?B\./g, 'zum Beispiel'],
    [/\bmind\./g, 'mindestens'],
    [/\bevtl\./g, 'eventuell'],
    [/\bggf\./g, 'gegebenenfalls'],
    [/\bU\/min\b/g, 'Umdrehungen'],
    [/\s+\/\s+/g, ' auf '],
    [/\+/g, ' und '],
    [/\s{2,}/g, ' '],
    [/\.\s*\./g, '.'],
    [/:\s*:/g, ':'],
  ];
  function sprechtext(t) {
    let s = String(t || '');
    for (const [re, neu] of ERSETZEN) s = s.replace(re, neu);
    return s.trim();
  }
  // Ansage zu einem Schritt: Titel, Pause, Text
  function ansage(schritt) { return sprechtext(schritt.titel) + '. ' + sprechtext(schritt.text); }
  const api = { sprechtext, ansage };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (wurzel.OJ = wurzel.OJ || {}).Sprechtext = api;
})(typeof window !== 'undefined' ? window : globalThis);
