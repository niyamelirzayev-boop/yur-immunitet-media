const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const dir = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: Number(process.argv[3]||1350) }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(dir, 'slides.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const ids = await p.$$eval('section.s', s => s.map(x => x.id));
  for (const id of ids) {
    await (await p.$('#' + id)).screenshot({ path: path.join(dir, `slide-${id.slice(1).padStart(2, '0')}.png`) });
  }
  await b.close();
  console.log(ids.length + ' slides');
})();
