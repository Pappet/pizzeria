/* Hintergrund-Verhaltenstest: Pizzeria muss bei document.hidden komplett schweigen. */
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

(async () => {
  const server = spawn('python3', ['-m', 'http.server', '8031'], { cwd: __dirname });
  await new Promise(r => setTimeout(r, 800));
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:8031/', { waitUntil: 'networkidle0' });

  const results = [];
  const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? ' — ' + detail : '')); };

  // Spiel starten (start-Overlay weg), damit Phase/AC real sind
  await page.evaluate(() => { document.getElementById('go').click(); });
  await page.waitForFunction(() => !document.getElementById('start'));
  await page.evaluate(() => { ac(); }); // AudioContext erzeugen

  // 1) sichtbar: say() enqueued normal (synchron lesen, headless-TTS feuert onend/onerror sonst sofort)
  r = await page.evaluate(() => { sayQueue = []; currentUtter = null; speechSynthesis.cancel(); say('Test sichtbar'); const q = sayQueue.length; const sp = isSpeaking(); return { q, sp }; });
  check('visible: say() enqueued', r.q === 1 && r.sp, JSON.stringify(r));

  // 2) hidden simulieren + Event feuern
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  r = await page.evaluate(() => ({
    queue: sayQueue.length, utter: currentUtter, speaking: speechSynthesis.speaking || speechSynthesis.pending,
    ac: AC ? AC.state : 'none'
  }));
  check('hidden: Sprache gestoppt (Queue leer, cancel)', r.queue === 0 && r.utter === null && !r.speaking, JSON.stringify(r));
  check('hidden: AudioContext suspended', r.ac === 'suspended', r.ac);

  // 3) hidden: neue Ansagen/Töne werden verworfen
  await page.evaluate(() => { say('Sollte nicht anstehen'); SFX.pop(); SFX.happy(); });
  r = await page.evaluate(() => ({ queue: sayQueue.length, osc: window.__osc || 0 }));
  check('hidden: say() verwirft neue Ansagen', r.queue === 0, JSON.stringify(r));

  // 4) hidden: tone() erzeugt keinen Oszillator — createOscillator-Zähler umstylen
  await page.evaluate(() => {
    window.__osc = 0;
    const orig = AC.createOscillator.bind(AC);
    AC.createOscillator = (...a) => { window.__osc++; return orig(...a); };
    tone(600, .1); RUBBLE();
  });
  r = await page.evaluate(() => window.__osc);
  check('hidden: tone() erzeugt keinen Oszillator', r === 0, String(r));

  // 5) hidden: idleHint gibt nichts aus
  await page.evaluate(() => { S.phase = 'dough'; idleHint(); });
  r = await page.evaluate(() => ({ queue: sayQueue.length, toast: document.getElementById('toast').classList.contains('show') }));
  check('hidden: idleHint schweigt', r.queue === 0 && !r.toast, JSON.stringify(r));

  // 6) visible: AC läuft wieder, Timer wird neu aufgezogen (Spielfläche da, kein Start-Overlay)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await new Promise(r2 => setTimeout(r2, 400));   // resume() ist asynchron
  r = await page.evaluate(() => ({ ac: AC.state }));
  check('visible: AudioContext resumed', r.ac === 'running', r.ac);

  // 7) visible: tone() erzeugt wieder Oszillatoren (Spiel macht weiter wie vorher)
  await page.evaluate(() => { tone(600, .05); });
  r = await page.evaluate(() => window.__osc);
  check('visible: tone() klingt wieder', r === 1, String(r));

  // 8) Start-Overlay noch da → visible ohne Spielfläche armIdle holt keinen Tipp-Timer
  await page.reload({ waitUntil: 'networkidle0' });
  r = await page.evaluate(() => {
    const hasStart = !!document.getElementById('start');
    document.dispatchEvent(new Event('visibilitychange'));
    // armIdle intern: HINT[S.phase] mit phase 'idle' ist undefined -> kein Timer
    return { hasStart, phase: S.phase, hint: !!HINT[S.phase] };
  });
  check('visible unter Start-Overlay: kein Tipp-Timer', r.hasStart && r.phase === 'idle' && !r.hint, JSON.stringify(r));

  // 9) pagehide: Sprache stoppt auch
  await page.evaluate(() => { say('pagehide test'); window.dispatchEvent(new Event('pagehide')); });
  r = await page.evaluate(() => ({ queue: sayQueue.length, speaking: speechSynthesis.speaking || speechSynthesis.pending }));
  check('pagehide: Sprache gestoppt', r.queue === 0 && !r.speaking, JSON.stringify(r));

  const failed = results.filter(x => !x.ok);
  console.log(`\n${results.length - failed.length}/${results.length} bestanden`);
  await browser.close();
  server.kill();
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
