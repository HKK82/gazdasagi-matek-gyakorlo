// Nagyon egyszerű, biztonságos jelölés az AI válaszához: bekezdések, „- ” felsorolás, **vastag**, `kód`.
// Nem HTML-t állít elő, hanem szerkezetet; a megjelenítő csak textContent-et használ (nincs XSS).

/** Egy sor soron belüli részekre bontása: [{ t: 'szoveg' | 'vastag' | 'kod', s }] */
export function sorbanBontas(sor) {
  const reszek = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let utolso = 0;
  for (const m of sor.matchAll(re)) {
    if (m.index > utolso) reszek.push({ t: 'szoveg', s: sor.slice(utolso, m.index) });
    const x = m[0];
    reszek.push(x.startsWith('**') ? { t: 'vastag', s: x.slice(2, -2) } : { t: 'kod', s: x.slice(1, -1) });
    utolso = m.index + x.length;
  }
  if (utolso < sor.length) reszek.push({ t: 'szoveg', s: sor.slice(utolso) });
  return reszek;
}

/** A szöveg blokkokra bontása: [{ t: 'bekezdes', sorok } | { t: 'lista', elemek }] */
export function blokkok(szoveg) {
  const ki = [];
  let lista = null;
  let bek = null;
  const lezar = () => { if (bek) { ki.push({ t: 'bekezdes', sorok: bek }); bek = null; } if (lista) { ki.push({ t: 'lista', elemek: lista }); lista = null; } };
  for (const nyers of String(szoveg).replace(/\r/g, '').split('\n')) {
    const sor = nyers.trim();
    if (!sor) { lezar(); continue; }
    const elem = sor.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (elem) {
      if (bek) { ki.push({ t: 'bekezdes', sorok: bek }); bek = null; }
      (lista ||= []).push(sorbanBontas(elem[1]));
    } else {
      if (lista) { ki.push({ t: 'lista', elemek: lista }); lista = null; }
      (bek ||= []).push(sorbanBontas(sor));
    }
  }
  lezar();
  return ki;
}
