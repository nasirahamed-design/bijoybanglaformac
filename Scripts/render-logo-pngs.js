// Renders Branding/*.svg to PNG, plus the installer backgrounds.
// Run from the project root after Scripts/make-logo.py:  node Scripts/render-logo-pngs.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

(async () => {
  const b = await chromium.launch();
  async function shot(svg, w, h, out, opts = {}) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: opts.scale || 1 });
    const style = opts.place
      ? `position:absolute;left:${opts.place[0]}px;top:${opts.place[1]}px;width:${opts.place[2]}px`
      : 'width:100%;height:100%';
    await p.setContent(`<html><body style="margin:0;background:transparent">
      <div style="${style}">${svg.replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}</div></body></html>`);
    await p.screenshot({ path: path.join(root, out), omitBackground: true });
    await p.close();
    console.log('wrote', out);
  }
  await shot(read('Branding/logo.svg'), 1600, 992, 'Branding/logo.png');
  await shot(read('Branding/logo-dark.svg'), 1600, 992, 'Branding/logo-dark.png');
  await shot(read('Branding/laptop.svg'), 1024, 487, 'Branding/laptop.png');
  fs.copyFileSync(path.join(root, 'Branding/logo.png'), path.join(root, 'docs/logo.png'));
  // Installer: 380 x 300 px canvas (shown at 190 x 150 pt), drawn at 2x; dpi is set to 288 afterwards
  await shot(read('Branding/logo.svg'), 380, 300, 'Installer/resources/background.png', { scale: 2, place: [44.5, 73.5, 299] });
  await shot(read('Branding/logo-dark.svg'), 380, 300, 'Installer/resources/background-dark.png', { scale: 2, place: [44.5, 73.5, 299] });
  await b.close();
})();
