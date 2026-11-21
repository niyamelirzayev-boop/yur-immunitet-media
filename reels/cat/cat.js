// Кот Статья — векторный персонаж-конструктор. cat(opts) -> SVG-строка (viewBox 0 0 400 520)
// opts: eyes: 'lazy'|'open'|'wide'|'closed'|'squint'|'wink', brows: 'flat'|'up'|'raise'|'angry'|'sad',
//       mouth: 'smirk'|'flat'|'o'|'grin'|'frown'|'yawn', ears: 'up'|'back', tail: 0..1 (взмах),
//       paw: 'down'|'point'|'up', glasses: true, blush: false, sweat: false
(function (g) {
  const INK = '#0F1B2D', FUR = '#9AA3B2', FUR2 = '#7D8697', BELLY = '#F3EFE6', PINK = '#F4A592', RED = '#E8452C', ACID = '#FFE14D';
  const S = `stroke="${INK}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"`;
  function eye(cx, cy, type, side) {
    const lid = (y) => `<path d="M${cx - 34} ${cy - 40} L${cx + 34} ${cy - 40} L${cx + 34} ${y} Q${cx} ${y + 6} ${cx - 34} ${y} Z" fill="${FUR}"/>`;
    const white = `<ellipse cx="${cx}" cy="${cy}" rx="30" ry="32" fill="#fff" ${S}/>`;
    const pupil = (dx = 4, dy = 6, r = 13) => `<circle cx="${cx + dx * side}" cy="${cy + dy}" r="${r}" fill="${INK}"/><circle cx="${cx + dx * side + 5}" cy="${cy + dy - 5}" r="4" fill="#fff"/>`;
    const lidLine = (y) => `<path d="M${cx - 31} ${y} Q${cx} ${y + 6} ${cx + 31} ${y}" fill="none" ${S}/>`;
    switch (type) {
      case 'closed': return `<path d="M${cx - 28} ${cy + 4} Q${cx} ${cy + 22} ${cx + 28} ${cy + 4}" fill="none" ${S}/>`;
      case 'happy': return `<path d="M${cx - 28} ${cy + 10} Q${cx} ${cy - 18} ${cx + 28} ${cy + 10}" fill="none" ${S}/>`;
      case 'wide': return `<ellipse cx="${cx}" cy="${cy}" rx="34" ry="38" fill="#fff" ${S}/><circle cx="${cx}" cy="${cy}" r="9" fill="${INK}"/>`;
      case 'open': return white + pupil(2, 4, 15);
      case 'squint': return white + pupil(3, 8, 12) + lid(cy + 2) + lidLine(cy + 2) + `<path d="M${cx - 30} ${cy + 22} Q${cx} ${cy + 14} ${cx + 30} ${cy + 22}" fill="none" ${S}/>`;
      case 'lazy': default: return white + pupil(4, 12, 13) + lid(cy - 2) + lidLine(cy - 2);
    }
  }
  function brow(cx, cy, type, side) {
    const p = {
      flat: [[-26, -50], [26, -50]], up: [[-26, -62], [26, -62]],
      raise: side < 0 ? [[-26, -48], [26, -50]] : [[-26, -66], [26, -76]],
      angry: [[-28, -62 + 0], [24, -46]].map(([x, y]) => [x * -side, y]),
      sad: [[-28, -48], [24, -62]].map(([x, y]) => [x * -side, y]),
    }[type] || [[-26, -50], [26, -50]];
    return `<path d="M${cx + p[0][0]} ${cy + p[0][1]} L${cx + p[1][0]} ${cy + p[1][1]}" ${S} stroke-width="11" fill="none"/>`;
  }
  function mouth(type) {
    const y = 268;
    switch (type) {
      case 'o': return `<ellipse cx="200" cy="${y + 14}" rx="16" ry="20" fill="${INK}"/>`;
      case 'yawn': return `<path d="M168 ${y} Q200 ${y + 70} 232 ${y} Z" fill="${INK}" ${S}/><path d="M184 ${y + 30} Q200 ${y + 48} 216 ${y + 30}" fill="${RED}"/>`;
      case 'grin': return `<path d="M166 ${y} Q200 ${y + 44} 234 ${y} Z" fill="#fff" ${S}/><path d="M200 ${y} L200 ${y + 20}" ${S}/>`;
      case 'frown': return `<path d="M176 ${y + 22} Q188 ${y + 6} 200 ${y + 12} Q212 ${y + 6} 224 ${y + 22}" fill="none" ${S}/>`;
      case 'flat': return `<path d="M178 ${y + 10} L222 ${y + 10}" ${S}/>`;
      case 'smirk': default: return `<path d="M200 ${y - 6} L200 ${y + 4} M200 ${y + 4} Q186 ${y + 18} 172 ${y + 6} M200 ${y + 4} Q218 ${y + 16} 236 ${y - 4}" fill="none" ${S}/>`;
    }
  }
  g.cat = function (o = {}) {
    o = Object.assign({ eyes: 'lazy', brows: 'flat', mouth: 'smirk', ears: 'up', tail: 0.5, paw: 'down', glasses: true, blush: false, sweat: false, tie: true }, o);
    const tailA = -30 + 60 * o.tail;
    const earL = o.ears === 'back' ? 'M86 150 L40 112 L120 104 Z' : 'M92 140 L84 38 L168 96 Z';
    const earR = o.ears === 'back' ? 'M314 150 L360 112 L280 104 Z' : 'M308 140 L316 38 L232 96 Z';
    const earLi = o.ears === 'back' ? 'M92 136 L66 116 L110 112 Z' : 'M104 126 L100 66 L148 100 Z';
    const earRi = o.ears === 'back' ? 'M308 136 L334 116 L290 112 Z' : 'M296 126 L300 66 L252 100 Z';
    const pawR = o.paw === 'point'
      ? `<path d="M286 360 C330 340 360 300 372 262" fill="none" stroke="${INK}" stroke-width="44" stroke-linecap="round"/><path d="M286 360 C330 340 360 300 372 262" fill="none" stroke="${FUR}" stroke-width="28" stroke-linecap="round"/><circle cx="374" cy="256" r="22" fill="${FUR}" ${S}/>`
      : o.paw === 'up'
        ? `<path d="M290 372 C330 360 350 330 352 290" fill="none" stroke="${INK}" stroke-width="44" stroke-linecap="round"/><path d="M290 372 C330 360 350 330 352 290" fill="none" stroke="${FUR}" stroke-width="28" stroke-linecap="round"/><ellipse cx="352" cy="276" rx="28" ry="24" fill="${FUR}" ${S}/><path d="M340 262 l0 10 M352 258 l0 12 M364 262 l0 10" ${S} stroke-width="5"/>`
        : `<ellipse cx="262" cy="476" rx="40" ry="26" fill="${FUR}" ${S}/><path d="M252 470 l0 14 M270 470 l0 14" ${S} stroke-width="5"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="${o.w || 400}" height="${(o.w || 400) * 1.3}">
  <ellipse cx="200" cy="506" rx="150" ry="12" fill="rgba(15,27,45,.15)"/>
  <!-- хвост -->
  <g transform="rotate(${tailA} 300 460)"><path d="M300 470 C380 470 400 400 360 360 C340 340 350 310 372 300" fill="none" stroke="${INK}" stroke-width="46" stroke-linecap="round"/>
  <path d="M300 470 C380 470 400 400 360 360 C340 340 350 310 372 300" fill="none" stroke="${FUR}" stroke-width="30" stroke-linecap="round"/></g>
  <!-- тело -->
  <path d="M200 250 C312 250 348 330 350 405 C352 475 300 502 200 502 C100 502 48 475 50 405 C52 330 88 250 200 250 Z" fill="${FUR}" ${S}/>
  <path d="M200 300 C270 300 292 360 292 412 C292 462 258 488 200 488 C142 488 108 462 108 412 C108 360 130 300 200 300 Z" fill="${BELLY}"/>
  <!-- лапы -->
  <ellipse cx="138" cy="476" rx="40" ry="26" fill="${FUR}" ${S}/><path d="M128 470 l0 14 M146 470 l0 14" ${S} stroke-width="5"/>
  ${pawR}
  <!-- галстук -->
  ${o.tie ? `<path d="M170 292 L200 306 L230 292 L222 318 L200 312 L178 318 Z" fill="${RED}" ${S} stroke-width="6"/><path d="M190 312 L210 312 L216 380 L200 398 L184 380 Z" fill="${RED}" ${S} stroke-width="6"/>` : ''}
  <!-- уши -->
  <path d="${earL}" fill="${FUR}" ${S}/><path d="${earLi}" fill="${PINK}"/>
  <path d="${earR}" fill="${FUR}" ${S}/><path d="${earRi}" fill="${PINK}"/>
  <!-- голова со щеками -->
  <path d="M200 84 C290 84 336 130 340 200 C362 214 360 240 336 246 C350 262 330 282 306 280 C280 304 240 314 200 314 C160 314 120 304 94 280 C70 282 50 262 64 246 C40 240 38 214 60 200 C64 130 110 84 200 84 Z" fill="${FUR}" ${S}/>
  <path d="M200 92 l0 30 M178 96 l4 24 M222 96 l-4 24" stroke="${FUR2}" stroke-width="10" stroke-linecap="round"/>
  <path d="M146 250 C150 226 176 222 200 236 C224 222 250 226 254 250 C254 282 230 298 200 298 C170 298 146 282 146 250 Z" fill="${BELLY}"/>
  ${o.blush ? `<ellipse cx="112" cy="250" rx="22" ry="12" fill="${PINK}" opacity=".8"/><ellipse cx="288" cy="250" rx="22" ry="12" fill="${PINK}" opacity=".8"/>` : ''}
  <!-- глаза, брови -->
  ${eye(146, 196, o.eyes === 'wink' ? 'lazy' : o.eyes, -1)}${eye(254, 196, o.eyes === 'wink' ? 'closed' : o.eyes, 1)}
  ${o.brows !== 'none' ? brow(146, 196, o.brows, -1) + brow(254, 196, o.brows, 1) : ''}
  ${o.glasses ? `<g fill="none" stroke="${INK}" stroke-width="6"><circle cx="146" cy="218" r="36"/><circle cx="254" cy="218" r="36"/><path d="M182 216 Q200 206 218 216"/><path d="M110 212 L74 200 M290 212 L326 200"/></g>` : ''}
  <!-- нос, рот, усы -->
  <path d="M188 246 L212 246 L200 260 Z" fill="${PINK}" ${S} stroke-width="5"/>
  ${mouth(o.mouth)}
  <g stroke="${INK}" stroke-width="4" stroke-linecap="round"><path d="M140 262 L74 252 M140 272 L72 276 M260 262 L326 252 M260 272 L328 276"/></g>
  ${o.sweat ? `<path d="M318 140 q18 26 0 40 q-18 -14 0 -40z" fill="#7fc8ff" ${S} stroke-width="4"/>` : ''}
</svg>`;
  };
})(typeof window !== 'undefined' ? window : globalThis);
