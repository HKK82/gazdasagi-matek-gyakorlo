// Az AI-asszisztens (Gemini) kliensének tesztjei hálózat nélkül: a fetch cserélhető.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GeminiTanar, GeminiHiba, MODELLEK, rendszerUtasitas, kulcsProba } from '../js/lib/gemini.js';
import { beallitKulcsTarolo, kulcsOlvas, kulcsMent, kulcsTorol, kulcsMegjegyezve, kulcsAlakja } from '../js/lib/ai-kulcs.js';
import { blokkok, sorbanBontas } from '../js/lib/markdown-lite.js';

const KULCS = 'AIzaSyA-1234567890abcdefghijklmnopqrstu';
const ctx = {
  temaCim: 'Százalékszámítás', tipusNev: 'T5 – Csökkenés – régi érték', kulcskeplet: 'P0 · q = P1',
  feladat: 'Egy laptop ára 5 %-os árengedmény után 4370 €. Mennyi volt az eredeti ára?',
  mezok: ['Eredeti ár (P₀)'], valaszok: 'Eredeti ár (P₀) = 4588,5', visszajelzes: 'tipikus hiba',
  probalkozasok: 1, segitsegiSzint: 2, megoldasLatta: false, helyesValasz: 'Eredeti ár (P₀): 4600 €',
};

function valasz(status, torzs) {
  return { ok: status >= 200 && status < 300, status, json: async () => torzs };
}
const jo = (szoveg) => valasz(200, { candidates: [{ content: { parts: [{ text: szoveg }] } }] });

function hamisFetch(valaszok) {
  const hivasok = [];
  const fv = async (url, opciok) => {
    hivasok.push({ url, opciok, body: JSON.parse(opciok.body) });
    const v = valaszok[Math.min(hivasok.length - 1, valaszok.length - 1)];
    if (v instanceof Error) throw v;
    return v;
  };
  fv.hivasok = hivasok;
  return fv;
}

test('a kérés a Google végpontjára megy, a kulcs a fejlécben (nem az URL-ben), a törzsben sincs', async () => {
  const fv = hamisFetch([jo('Szia')]);
  const t = new GeminiTanar({ kulcs: () => KULCS, fetchFv: fv, varakozasMs: 0 });
  const r = await t.kerdez(ctx, 'Nem értem.');
  assert.equal(r.szoveg, 'Szia');
  assert.equal(r.modell, MODELLEK[0]);
  const h = fv.hivasok[0];
  assert.match(h.url, /^https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-.+:generateContent$/);
  assert.ok(!h.url.includes(KULCS), 'a kulcs nincs az URL-ben');
  assert.equal(h.opciok.headers['x-goog-api-key'], KULCS);
  assert.ok(!h.opciok.body.includes(KULCS), 'a kulcs nincs a törzsben');
  assert.equal(h.body.contents.at(-1).parts[0].text, 'Nem értem.');
});

test('a rendszerutasítás tartalmazza a feladatot, a hallgató válaszát és a hangnemi szabályokat', () => {
  const s = rendszerUtasitas(ctx);
  for (const x of [ctx.feladat, '4588,5', 'T5 – Csökkenés', 'SEGÍTSÉGI SZINT: 2/5', 'MEGNÉZTE A MEGOLDÁST: NEM', '4600 €']) assert.ok(s.includes(x), x);
  assert.match(s, /gazdasági matematika/);
  assert.match(s, /100-zal/);
  assert.match(s, /józan ész/i);
  assert.match(s, /ellenpróba/i);
  assert.match(s, /rávezető KÉRDÉST/);
  assert.match(s, /Ne kérj és ne kezelj személyes adatot, API-kulcsot/);
  assert.ok(!/undefined|NaN|\[object/.test(s));
  // üres kontextusnál sincs „undefined”
  assert.ok(!/undefined|NaN/.test(rendszerUtasitas({})));
});

test('a végeredmény nem szivárog ki a hallgatónak szánt üzenetbe, csak a rendszerutasításban van', async () => {
  const fv = hamisFetch([jo('ok')]);
  const t = new GeminiTanar({ kulcs: () => KULCS, fetchFv: fv, varakozasMs: 0 });
  await t.kerdez(ctx, 'Adj tippet');
  const body = fv.hivasok[0].body;
  assert.ok(body.system_instruction.parts[0].text.includes('4600'));
  assert.ok(!JSON.stringify(body.contents).includes('4600'));
});

test('nincs kulcs: érthető hibaüzenet, hívás nélkül', async () => {
  const fv = hamisFetch([jo('x')]);
  const t = new GeminiTanar({ kulcs: () => '  ', fetchFv: fv, varakozasMs: 0 });
  await assert.rejects(() => t.kerdez(ctx, 'q'), (h) => h instanceof GeminiHiba && h.fajta === 'kulcs-hianyzik' && /API-kulcs/.test(h.message));
  assert.equal(fv.hivasok.length, 0);
});

test('várakozás két kérdés között (kvótavédelem), a sikertelen hívás nem tart fel', async () => {
  let ora = 1000;
  const fv = hamisFetch([jo('a'), jo('b')]);
  const t = new GeminiTanar({ kulcs: () => KULCS, fetchFv: fv, varakozasMs: 4000, ido: () => ora });
  await t.kerdez(ctx, '1');
  await assert.rejects(() => t.kerdez(ctx, '2'), (h) => h.fajta === 'varakozas' && /Várjon még 4 másodpercet/.test(h.message));
  ora += 4000;
  assert.equal((await t.kerdez(ctx, '3')).szoveg, 'b');
  // hálózati hiba után azonnal újrapróbálható
  const t2 = new GeminiTanar({ kulcs: () => KULCS, fetchFv: hamisFetch([new TypeError('fetch failed'), jo('c')]), varakozasMs: 4000, ido: () => ora });
  await assert.rejects(() => t2.kerdez(ctx, 'x'), (h) => h.fajta === 'halozat');
  assert.equal((await t2.kerdez(ctx, 'x')).szoveg, 'c');
});

test('kvóta (429) vagy elérhetetlen modell esetén a következő modellel próbálkozik', async () => {
  const fv = hamisFetch([valasz(429, { error: { message: 'quota' } }), valasz(404, {}), jo('harmadik')]);
  const t = new GeminiTanar({ kulcs: () => KULCS, fetchFv: fv, varakozasMs: 0 });
  const r = await t.kerdez(ctx, 'q');
  assert.equal(r.szoveg, 'harmadik');
  assert.equal(r.modell, MODELLEK[2]);
  assert.deepEqual(fv.hivasok.map((h) => h.url.match(/models\/(.+):/)[1]), MODELLEK);
});

test('ha minden modellen elfogyott a keret: magyar, megnyugtató üzenet', async () => {
  const fv = hamisFetch([valasz(429, {})]);
  const t = new GeminiTanar({ kulcs: () => KULCS, fetchFv: fv, varakozasMs: 0 });
  await assert.rejects(() => t.kerdez(ctx, 'q'), (h) => h.fajta === 'kvota' && /Elfogyott az ingyenes keret/.test(h.message) && /korlátlanul/.test(h.message));
});

test('érvénytelen kulcs (400/401/403): azonnali, érthető hiba, nincs további modellpróba', async () => {
  for (const v of [valasz(400, { error: { message: 'API key not valid. Please pass a valid API key.' } }), valasz(403, {}), valasz(401, {})]) {
    const fv = hamisFetch([v]);
    const t = new GeminiTanar({ kulcs: () => KULCS, fetchFv: fv, varakozasMs: 0 });
    await assert.rejects(() => t.kerdez(ctx, 'q'), (h) => h.fajta === 'kulcs-ervenytelen' && /kulcs/.test(h.message));
    assert.equal(fv.hivasok.length, 1);
  }
});

test('biztonsági tiltás és üres válasz kezelése', async () => {
  let t = new GeminiTanar({ kulcs: () => KULCS, fetchFv: hamisFetch([valasz(200, { promptFeedback: { blockReason: 'SAFETY' } })]), varakozasMs: 0 });
  await assert.rejects(() => t.kerdez(ctx, 'q'), (h) => h.fajta === 'tiltott');
  t = new GeminiTanar({ kulcs: () => KULCS, fetchFv: hamisFetch([valasz(200, { candidates: [{ content: { parts: [] } }] })]), varakozasMs: 0 });
  await assert.rejects(() => t.kerdez(ctx, 'q'), (h) => h.fajta === 'ures');
});

test('a beszélgetés előzménye továbbmegy (legfeljebb 6 korábbi üzenet), a törlés nulláz', async () => {
  const fv = hamisFetch([jo('1'), jo('2'), jo('3'), jo('4'), jo('5')]);
  const t = new GeminiTanar({ kulcs: () => KULCS, fetchFv: fv, varakozasMs: 0 });
  for (let i = 1; i <= 5; i++) await t.kerdez(ctx, `kérdés ${i}`);
  assert.equal(fv.hivasok[0].body.contents.length, 1);
  assert.equal(fv.hivasok[1].body.contents.length, 3);
  assert.equal(fv.hivasok[4].body.contents.length, 7); // 6 előzmény + az új
  t.torolElozmeny();
  assert.equal(t.elozmeny.length, 0);
});

test('thinkingConfig csak a gemini-3.x modelleknek megy (a régebbi modellek 400-at adnának)', async () => {
  const fv = hamisFetch([valasz(404, {}), valasz(404, {}), jo('ok')]);
  const t = new GeminiTanar({ kulcs: () => KULCS, fetchFv: fv, varakozasMs: 0 });
  await t.kerdez(ctx, 'q');
  assert.ok(fv.hivasok[0].body.generationConfig.thinkingConfig);
  assert.equal(fv.hivasok[2].body.generationConfig.thinkingConfig, undefined);
});

test('kulcsProba: működő kulcs', async () => {
  const r = await kulcsProba(KULCS, hamisFetch([jo('működik')]));
  assert.equal(r.szoveg, 'működik');
});

// ---- kulcstárolás ----
function tar() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }; }

test('kulcstárolás: alapból csak munkamenetben, kérésre tartósan; törlés mindkettőből', () => {
  const munkamenet = tar(), tartos = tar();
  beallitKulcsTarolo({ munkamenet, tartos });
  assert.equal(kulcsOlvas(), '');
  kulcsMent(` ${KULCS} `, false);
  assert.equal(kulcsOlvas(), KULCS);
  assert.equal(tartos.m.size, 0);
  assert.equal(kulcsMegjegyezve(), false);
  kulcsMent(KULCS, true);
  assert.equal(munkamenet.m.size, 0);
  assert.equal(tartos.m.size, 1);
  assert.equal(kulcsMegjegyezve(), true);
  kulcsTorol();
  assert.equal(kulcsOlvas(), '');
  assert.equal(munkamenet.m.size + tartos.m.size, 0);
  beallitKulcsTarolo(null);
});

test('kulcstárolás: tiltott / hibás tárolóval sem dől el', () => {
  const rossz = { getItem() { throw new Error('tiltva'); }, setItem() { throw new Error('tiltva'); }, removeItem() { throw new Error('tiltva'); } };
  beallitKulcsTarolo({ munkamenet: rossz, tartos: rossz });
  assert.doesNotThrow(() => { kulcsMent(KULCS, false); kulcsMent(KULCS, true); kulcsTorol(); });
  assert.equal(kulcsOlvas(), '');
  beallitKulcsTarolo({ munkamenet: null, tartos: null });
  assert.equal(kulcsOlvas(), '');
  beallitKulcsTarolo(null);
});

test('kulcs alakellenőrzés: csak a nyilvánvaló másolási hibákat szűri, a formátumot nem erőlteti', () => {
  assert.equal(kulcsAlakja('').ok, false);
  assert.match(kulcsAlakja('AIza abc').uzenet, /szóköz/);
  assert.match(kulcsAlakja('rövid').uzenet, /teljes/);
  assert.equal(kulcsAlakja('árvíztűrő-tükörfúrógép-123456').ok, false);
  assert.equal(kulcsAlakja(KULCS).ok, true);
  assert.equal(kulcsAlakja(`  ${KULCS}  `).ok, true);
  // más (újabb) kulcsformátumokat sem utasít el
  assert.equal(kulcsAlakja('AQ.Ab8RN6Kexamplekey_1234567890-abcdefghijk').ok, true);
  assert.equal(kulcsAlakja('sk-nem-google-de-hosszu-kulcs-1234567890').ok, true);
});

// ---- az AI válaszának biztonságos jelölése ----
test('markdown-lite: bekezdés, lista, vastag, kód – HTML nem keletkezik, a jelölés szövegként marad', () => {
  const b = blokkok('Első **fontos** sor\nmásik `x`\n\n- a\n- b\n\n<script>alert(1)</script>');
  assert.equal(b.length, 3);
  assert.deepEqual(b[0].sorok[0].map((r) => r.t), ['szoveg', 'vastag', 'szoveg']);
  assert.equal(b[1].t, 'lista');
  assert.equal(b[1].elemek.length, 2);
  // a script szövegként marad (a megjelenítő textContent-et használ)
  assert.equal(b[2].sorok[0][0].t, 'szoveg');
  assert.equal(b[2].sorok[0][0].s, '<script>alert(1)</script>');
  assert.deepEqual(sorbanBontas('nincs jelölés'), [{ t: 'szoveg', s: 'nincs jelölés' }]);
  assert.deepEqual(blokkok(''), []);
});

test('az AI-panel és az útmutató nem tölt be külső szkriptet, és nem küld kulcsot az URL-ben', async () => {
  const { readFile } = await import('node:fs/promises');
  for (const f of ['js/lib/gemini.js', 'js/oldal/ai-panel.js', 'js/oldal/ai-beallitas.js', 'ai.html']) {
    const s = await readFile(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.ok(!/<script[^>]+src="https?:/.test(s), `${f}: nincs külső szkript`);
    assert.ok(!/[?&]key=/.test(s), `${f}: nincs kulcs az URL-ben`);
    assert.ok(!/innerHTML\s*=/.test(s), `${f}: nincs innerHTML-írás az AI-szöveghez`);
  }
  const html = await readFile(new URL('../ai.html', import.meta.url), 'utf8');
  assert.match(html, /aistudio\.google\.com\/apikey/);
  assert.match(html, /noopener noreferrer/);
  assert.match(html, /type="password"/);
});
