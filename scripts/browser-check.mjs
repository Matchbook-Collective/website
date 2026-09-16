import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('.qa', { recursive: true });
const context = await chromium.launchPersistentContext(`${process.cwd()}/.qa/chrome-profile`, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', env: { ...process.env, TMPDIR: `${process.cwd()}/.qa/tmp` } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const baseUrl = process.env.QA_URL || 'http://127.0.0.1:4321';
// Astro preview serves directory URLs strictly; emulate Netlify Pretty URLs locally.
await context.route('**/*', async route => {
  const request = route.request();
  const url = new URL(request.url());
  if (request.method() === 'GET' && url.origin === baseUrl &&
      ['/about', '/services', '/method', '/work', '/contact', '/thank-you'].includes(url.pathname)) {
    url.pathname += '/';
    return route.fulfill({ status: 301, headers: { location: url.href } });
  }
  return route.continue();
});
const routes = ['/', '/about', '/services', '/method', '/work', '/contact', '/thank-you'];
const report = [];
for (const width of [1440, 1024, 768, 390, 360]) {
  await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
  for (const route of routes) {
    console.log('Checking', width, route);
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `${route} status`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.evaluate(() => { for (const image of document.images) image.loading = 'eager'; });
    await page.waitForFunction(() => [...document.images].every(image => image.complete), { timeout: 15000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    const state = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, h1: document.querySelectorAll('h1').length, brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src) }));
    assert.equal(state.h1, 1, `${route} heading`);
    assert.ok(state.scrollWidth <= width + 1, `${route} overflows at ${width}: ${state.scrollWidth}`);
    assert.equal(state.brokenImages.length, 0, `${route} broken images`);
    let violations = [];
    if (width === 1440 || width === 390) {
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      violations = scan.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ html: n.html, summary: n.failureSummary })) }));
      const name = route === '/' ? 'home' : route.slice(1);
      await page.screenshot({ path: `.qa/${name}-${width}.png`, fullPage: true });
      await page.screenshot({ path: `.qa/${name}-${width}-top.png` });
    }
    report.push({ route, width, ...state, violations });
  }
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(baseUrl);
await page.locator('.mobile-menu summary').click();
assert.equal(await page.locator('.mobile-menu').getAttribute('open'), '');
await page.keyboard.press('Escape');
assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
await page.locator('.mobile-menu summary').click();
await page.locator('.mobile-menu').getByRole('link', { name: 'The Method', exact: false }).click();
await page.waitForURL(url => url.pathname.replace(/\/$/, '') === '/method');
assert.equal(await page.locator('.expanded.method-markers li').count(), 12);

// Intercept only local POSTs: exercise real browser encoding without sending inquiries.
for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${baseUrl}/contact/?interest=Matchbook%20Social`);
  const send = page.getByRole('button', { name: 'Start a conversation' });
  assert.equal(await page.locator('#interest').inputValue(), 'Matchbook Social');
  await send.click();
  assert.equal(await page.locator('#name').evaluate(el => el.validity.valueMissing), true);
  await page.locator('#name').fill('Local Review');
  await page.locator('#email').fill('review@example.test');
  await page.locator('#challenge').fill('Growth & clarity + a new direction.');
  let expectedWebsite = '';
  let mode = 'http-error';
  let posts = 0;
  await page.route(baseUrl + '/', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    posts++;
    const data = new URLSearchParams(route.request().postData());
    assert.equal(data.get('form-name'), 'contact');
    assert.equal(data.get('email'), 'review@example.test');
    assert.equal(data.get('challenge'), 'Growth & clarity + a new direction.');
    assert.equal(data.get('interest'), 'Matchbook Social');
    assert.equal(data.get('fax'), '');
    assert.equal(data.get('website'), expectedWebsite);
    assert.match(route.request().headers()['content-type'], /application\/x-www-form-urlencoded/);
    if (mode === 'network-error') return route.abort('failed');
    return route.fulfill({ status: mode === 'success' ? 200 : 500, body: '' });
  });
  for (mode of ['http-error', 'network-error']) {
    await send.click();
    await page.waitForFunction(() => document.querySelector('#form-status').textContent.includes('couldn’t confirm'));
    assert.equal(await page.locator('#challenge').inputValue(), 'Growth & clarity + a new direction.');
    assert.equal(await send.isEnabled(), true);
    await page.screenshot({ path: `.qa/contact-error-${width}.png`, fullPage: true });
  }

  const website = page.locator('#website');
  for (const invalid of ['javascript:alert(1)', 'ftp://example.com', 'data:text/plain,test', 'not-a-domain', 'https://example.com:99999']) {
    await website.fill(invalid);
    const before = posts;
    await send.click();
    assert.equal(await website.evaluate(el => el.checkValidity()), false);
    assert.equal(posts, before);
  }
  mode = 'http-error';
  for (const [value, normalized] of [
    ['example.com', 'https://example.com/'],
    ['www.example.com', 'https://www.example.com/'],
    ['https://example.com', 'https://example.com/'],
    ['http://example.com', 'http://example.com/'],
    ['example.com/about?source=contact', 'https://example.com/about?source=contact'],
    ['', ''],
  ]) {
    expectedWebsite = normalized;
    await website.fill(value);
    await send.click();
    await page.waitForFunction(() => document.querySelector('#form-status').textContent.includes('couldn’t confirm'));
    assert.equal(await website.evaluate(el => el.checkValidity()), true);
  }
  await website.fill('example.com');
  expectedWebsite = 'https://example.com/';
  const beforeSpam = posts;
  await page.locator('#fax').fill('spam');
  await send.click();
  assert.equal(posts, beforeSpam);
  await page.locator('#fax').fill('');
  mode = 'success';
  await send.click();
  await page.waitForURL('**/thank-you/');
  assert.match(await page.locator('h1').textContent(), /Message received/);
  assert.equal(posts, 9);
  await page.unroute(baseUrl + '/');
}
// Native HTML fallback still submits when JavaScript is disabled.
const native = await context.browser().newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
const nativePage = await native.newPage();
await nativePage.goto(baseUrl + '/contact/');
await nativePage.locator('#name').fill('Native Review');
await nativePage.locator('#email').fill('review@example.test');
await nativePage.locator('#challenge').fill('Native submission');
await nativePage.route(baseUrl + '/thank-you/', async route => {
  assert.equal(route.request().method(), 'POST');
  assert.equal(new URLSearchParams(route.request().postData()).get('form-name'), 'contact');
  await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Native submission intercepted</h1>' });
});
// Enter exercises native form submission without Playwright's animation-stability click polling.
await nativePage.locator('#email').press('Enter');
await nativePage.waitForURL('**/thank-you/');
await native.close();
const missing = await page.goto(`${baseUrl}/insights`);
assert.equal(missing.status(), 404, 'Empty editorial section must remain unpublished');
await writeFile('.qa/browser-report.json', JSON.stringify({ report, runtimeErrors: errors, interactionChecks: 'Mobile menu, Escape, navigation, 12 method areas, service preselection, required form fields, Netlify encoding, HTTP/network error retention, honeypot, success redirect, native no-JS submission, unpublished Insights' }, null, 2));
console.log(JSON.stringify({ pages: report.length, accessibilityViolations: report.flatMap(r => r.violations).length, runtimeErrors: errors, interactionChecks: 'passed' }));
await context.close();
assert.equal(report.flatMap(r => r.violations).length, 0, 'Accessibility checks');
assert.equal(errors.length, 0, 'Browser runtime errors');
