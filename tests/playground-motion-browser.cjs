'use strict';
// Run with Playwright and Chromium installed. PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
// can select a system Chromium. The browser exercises the normal playground tabs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

function controlledFrames() {
  let now = 1000, id = 0;
  const queued = new Map();
  performance.now = () => now;
  window.requestAnimationFrame = fn => { queued.set(++id, fn); return id; };
  window.cancelAnimationFrame = key => queued.delete(key);
  window.advanceMotionFrame = milliseconds => {
    now += milliseconds;
    for (const [key, fn] of [...queued]) if (queued.delete(key)) fn(now);
  };
}

async function check(browser, origin) {
  async function open(key, fake = true) {
    const context = await browser.newContext({viewport: {width: 1280, height: 800}});
    if (fake) await context.addInitScript(controlledFrames);
    const page = await context.newPage();
    await page.goto(origin + '/#' + key);
    return {context, page};
  }
  async function frameOf(page, key) {
    const iframe = await page.locator('#page-' + key + ' iframe').elementHandle();
    const frame = await iframe.contentFrame();
    await frame.locator('canvas').first().waitFor({state: 'attached'});
    return frame;
  }
  for (const hz of [30, 60, 120]) {
    const {context, page} = await open('ringsum'), frame = await frameOf(page, 'ringsum');
    const delta = await frame.evaluate(hz => {
      const start = phase;
      for (let i = 0; i < hz; i++) window.advanceMotionFrame(1000 / hz);
      return phase - start;
    }, hz);
    assert(Math.abs(delta - 2.1) < 1e-9, 'Ring phase at ' + hz + ' Hz');
    await context.close();
  }

  {
    const {context, page} = await open('crystal');
    const changed = await page.evaluate(() => {
      for (let i = 0; i < 155; i++) window.advanceMotionFrame(1000 / 60);
      const copy = document.createElement('canvas');
      copy.width = cryLayer.width; copy.height = cryLayer.height;
      const g = copy.getContext('2d', {willReadFrequently: true});
      function pixels() {
        g.globalCompositeOperation = 'copy'; g.drawImage(cryLayer, 0, 0);
        return g.getImageData(0, 0, copy.width, copy.height).data;
      }
      if (cryFrozenList.length < 2) throw Error('Expected a growing crystal');
      const original = pixels(); cryRepaint(); const repainted = pixels();
      return original.some((value, i) => value !== repainted[i]);
    });
    assert.equal(changed, false, 'Crystal repaint');
    await context.close();
  }

  {
    const {context, page} = await open('bh3'), frame = await frameOf(page, 'bh3');
    const play = page.locator('#page-bh3 .flash-veil button');
    assert(await play.isVisible());
    const angle = await frame.evaluate(() => disk[0].angle);
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        document.querySelector('.tab[data-mode="sand"]').click();
        document.querySelector('.tab[data-mode="bh3"]').click();
      });
      await frame.evaluate(() => window.advanceMotionFrame(1000 / 60));
    }
    assert.equal(await frame.evaluate(() => disk[0].angle), angle, 'Disk held on guarded re-entry');
    await play.focus(); await page.keyboard.press('Enter');
    await frame.evaluate(() => window.advanceMotionFrame(1000 / 60));
    assert.notEqual(await frame.evaluate(() => disk[0].angle), angle, 'Disk resumed after Play');
    await context.close();
  }

  {
    const {context, page} = await open('stretch', false);
    await page.waitForFunction(() => stretchStatus().steps >= 3);
    const frozen = await page.evaluate(() => {
      document.getElementById('stretchPause').click();
      return stretchStatus().steps;
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => stretchStatus().steps), frozen, 'Stretch paused in flight');
    await page.locator('#stretchHot').click();
    await page.waitForFunction(() => stretchStatus().hot && stretchStatus().t === 0 && stretchStatus().steps === 0);
    await page.locator('#stretchPause').click();
    await page.waitForFunction(() => stretchStatus().steps >= 2 && Number.isFinite(stretchStatus().prodHeat));
    await context.close();
  }
}

(async () => {
  const mime = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png'};
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404).end();return;}
    res.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined});
    await check(browser, 'http://127.0.0.1:' + server.address().port);
    console.log('Passed Ring cadence, Crystal repaint, guarded Disk re-entry and Stretch controls.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {console.error(error);process.exitCode=1;});
