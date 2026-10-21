/* Ordnung auf Japanisch — die japanischen Wörter der App, mit Lautschrift für deutsche Ohren.
   ja: Schrift · kana: Lesung in Hiragana (das spricht die japanische Stimme) · romaji: übliche Umschrift ·
   laut: so spricht man es auf Deutsch (Silben mit Bindestrich, betonungsfrei; „ß“ = scharfes s,
   „sch“, „tsch“, „dsch“ wie im Deutschen, Doppelvokal = lang, „(u)“ = fast verschluckt) · de: Bedeutung.
   Ohne japanische Stimme auf dem Gerät liest die deutsche Stimme die Lautschrift.
   Ohne DOM, in Node geprüft (tests/inhalt.mjs). */
(function (wurzel) {
  const WOERTER = [
    // Titel und Grundbegriffe
    { k: 'seiri', ja: '整理', kana: 'せいり', romaji: 'seiri', laut: 'ßee-ri', de: 'Ordnung schaffen, aussortieren' },
    { k: 'seiton', ja: '整頓', kana: 'せいとん', romaji: 'seiton', laut: 'ßee-ton', de: 'jedem Ding seinen Platz geben' },
    { k: 'katazuke', ja: '片付け', kana: 'かたづけ', romaji: 'katazuke', laut: 'ka-ta-dsu-ke', de: 'aufräumen' },
    { k: 'shukan', ja: '習慣', kana: 'しゅうかん', romaji: 'shūkan', laut: 'schuu-kan', de: 'Gewohnheit' },
    { k: 'sumi', ja: '済', kana: 'すみ', romaji: 'sumi', laut: 'ßu-mi', de: 'erledigt (der rote Stempel)' },
    { k: 'kyukei', ja: '休憩', kana: 'きゅうけい', romaji: 'kyūkei', laut: 'kjuu-kee', de: 'Pause' },
    // Sätze der Sitzung
    { k: 'hajime', ja: '始めましょう', kana: 'はじめましょう', romaji: 'hajimemashō', laut: 'ha-dschi-me-ma-schoo', de: 'Fangen wir an' },
    { k: 'moichido', ja: 'もう一度', kana: 'もういちど', romaji: 'mō ichido', laut: 'moo i-tschi-do', de: 'noch einmal' },
    { k: 'tsugi', ja: '次', kana: 'つぎ', romaji: 'tsugi', laut: 'tsu-gi', de: 'das Nächste, weiter' },
    { k: 'dekimashita', ja: 'できました', kana: 'できました', romaji: 'dekimashita', laut: 'de-ki-masch-ta', de: 'Geschafft, fertig' },
    { k: 'otsukare', ja: 'お疲れ様でした', kana: 'おつかれさまでした', romaji: 'otsukaresama deshita', laut: 'o-tsu-ka-re-ßa-ma desch-ta', de: 'Gut gemacht, danke für die Mühe' },
    // die Räume
    { k: 'dogu', ja: '道具', kana: 'どうぐ', romaji: 'dōgu', laut: 'doo-gu', de: 'Werkzeug (Putzschrank)', station: 0 },
    { k: 'genkan', ja: '玄関', kana: 'げんかん', romaji: 'genkan', laut: 'gen-kan', de: 'Eingang', station: 1 },
    { k: 'daidokoro', ja: '台所', kana: 'だいどころ', romaji: 'daidokoro', laut: 'dai-do-ko-ro', de: 'Küche', station: 2 },
    { k: 'furo', ja: '風呂', kana: 'ふろ', romaji: 'furo', laut: 'fu-ro', de: 'Bad', station: 3 },
    { k: 'sentaku', ja: '洗濯', kana: 'せんたく', romaji: 'sentaku', laut: 'ßen-ta-ku', de: 'Wäsche', station: 4 },
    { k: 'shinshitsu', ja: '寝室', kana: 'しんしつ', romaji: 'shinshitsu', laut: 'schin-schi-tsu', de: 'Schlafzimmer', station: 5 },
    { k: 'ima', ja: '居間', kana: 'いま', romaji: 'ima', laut: 'i-ma', de: 'Wohnzimmer', station: 6 },
    { k: 'yuka', ja: '床', kana: 'ゆか', romaji: 'yuka', laut: 'ju-ka', de: 'Boden', station: 7 },
    { k: 'soko', ja: '倉庫', kana: 'そうこ', romaji: 'sōko', laut: 'ßoo-ko', de: 'Lager, Keller', station: 8 },
    { k: 'niwa', ja: '庭', kana: 'にわ', romaji: 'niwa', laut: 'ni-wa', de: 'Garten, draußen', station: 9 },
    // die Leiste
    { k: 'koyomi', ja: '暦', kana: 'こよみ', romaji: 'koyomi', laut: 'ko-jo-mi', de: 'Kalender' },
    { k: 'shimi', ja: '染み', kana: 'しみ', romaji: 'shimi', laut: 'schi-mi', de: 'Fleck' },
    { k: 'kisoku', ja: '規則', kana: 'きそく', romaji: 'kisoku', laut: 'ki-ßo-ku', de: 'Regel' },
    { k: 'rireki', ja: '履歴', kana: 'りれき', romaji: 'rireki', laut: 'ri-re-ki', de: 'Verlauf' },
  ];
  const wort = k => WOERTER.find(w => w.k === k);
  const fuerStation = nr => WOERTER.find(w => w.station === nr);
  // für die deutsche Stimme: Lautschrift ohne Bindestriche und Klammern, damit sie flüssig spricht
  const lautFuerStimme = w => w.laut.replace(/\(u\)/g, '').replace(/-/g, '');
  const api = { WOERTER, wort, fuerStation, lautFuerStimme };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else (wurzel.OJ = wurzel.OJ || {}).Japanisch = api;
})(typeof window !== 'undefined' ? window : globalThis);
