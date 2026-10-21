// Baut icons/icon-192.png, icon-512.png, icon-512-maskable.png.
// Liegt icons/quelle.png da (Klaus' Bild aus ChatGPT), wird DAS verkleinert; sonst ein Platzhalter (整理 auf Washi, roter Stempel).
// Braucht Chromium (Playwright). Aufruf: node tools/icon-bauen.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
const W = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const quelle = path.join(W, 'icons/quelle.png');
const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(fs.existsSync);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();
const bild = fs.existsSync(quelle) ? 'data:image/png;base64,' + fs.readFileSync(quelle).toString('base64') : null;
for (const [name, groesse, rand] of [['icon-512.png', 512, 0], ['icon-192.png', 192, 0], ['icon-512-maskable.png', 512, .14]]) {
  await page.setViewportSize({ width: groesse, height: groesse });
  const innen = Math.round(groesse * (1 - 2 * rand));
  const inhalt = bild
    ? `<img src="${bild}" style="width:${innen}px;height:${innen}px;object-fit:cover;border-radius:${rand ? 0 : groesse * .18}px">`
    : `<div style="width:${innen}px;height:${innen}px;display:grid;place-items:center;position:relative">
         <div style="font:900 ${innen * .36}px 'IPAMincho','Noto Serif CJK JP','IPAGothic',serif;letter-spacing:-.02em;color:#1d1916;text-shadow:0 ${innen * .012}px 0 #8c1c16, 0 ${innen * .03}px ${innen * .03}px rgba(60,30,10,.35)">整理</div>
         <div style="position:absolute;right:${innen * .1}px;bottom:${innen * .1}px;width:${innen * .16}px;height:${innen * .16}px;border:${innen * .012}px solid #b3261e;border-radius:${innen * .03}px;color:#b3261e;display:grid;place-items:center;font:900 ${innen * .1}px 'IPAMincho','IPAGothic',serif;transform:rotate(-8deg)">済</div>
       </div>`;
  await page.setContent(`<html><body style="margin:0;width:${groesse}px;height:${groesse}px;display:grid;place-items:center;
    background:${rand || !bild ? 'radial-gradient(circle at 35% 30%,#fbf6ec,#e9dcc6)' : 'transparent'}">${inhalt}</body></html>`);
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(W, 'icons', name), omitBackground: !rand && !!bild });
  console.log('icons/' + name + (bild ? ' (aus quelle.png)' : ' (Platzhalter)'));
}
await browser.close();
