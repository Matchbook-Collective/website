import { readFile, readdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve('dist');
async function walk(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((item) =>
        item.isDirectory()
          ? walk(resolve(dir, item.name))
          : resolve(dir, item.name),
      ),
    )
  ).flat();
}
const files = await walk(root);
const pages = files.filter((file) => file.endsWith('.html'));
const forbidden = [
  /Founding Client Price/i,
  /Initial sales target/i,
  /Internal editorial placeholder/i,
  /Growth audit scorecard/i,
  /TODO/,
  /Lorem Ipsum/i,
  /\$[\d,]+/,
];
let links = 0;
for (const path of pages) {
  const html = await readFile(path, 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${path}: one h1`);
  assert.match(html, /name="description"/);
  assert.match(html, /property="og:image"/);
  for (const pattern of forbidden)
    assert.ok(!pattern.test(html), `${path}: private or placeholder content`);
  for (const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    const [pathname, fragment] = href.split('#');
    const clean = pathname.split('?')[0];
    let target = clean ? resolve(root, `.${decodeURI(clean)}`) : path;
    if (clean && !/\.[a-z0-9]+$/i.test(clean))
      target = resolve(target, 'index.html');
    await access(target);
    if (fragment) {
      const targetHtml = await readFile(target, 'utf8');
      assert.ok(
        targetHtml.includes(`id="${fragment}"`),
        `Missing fragment: ${href} from ${path}`,
      );
    }
    links++;
  }
}
assert.ok(
  !files.some((file) => file.includes('/insights/')),
  'No empty or draft Insights output',
);
assert.ok(
  !files.some((file) => /\.(docx|md|ts)$/.test(file)),
  'No source documents in output',
);
console.log(
  `Verified ${pages.length} HTML pages and ${links} local asset/link references. No unapproved proof, internal pricing, draft articles, broken links, or missing anchor targets.`,
);

// Verify published metadata against the actual generated canonical origin.
const homepage = await readFile(resolve(root, 'index.html'), 'utf8');
const canonicalOrigin = homepage.match(/rel="canonical" href="([^"<>]+)"/)?.[1];
const robots = await readFile(resolve(root, 'robots.txt'), 'utf8');
if (canonicalOrigin) {
  const origin = new URL(canonicalOrigin).origin;
  const sitemapIndex = await readFile(resolve(root, 'sitemap-index.xml'), 'utf8');
  const sitemap = await readFile(resolve(root, 'sitemap-0.xml'), 'utf8');
  assert.ok(sitemapIndex.includes(`${origin}/sitemap-0.xml`));
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap-index.xml`));
  assert.ok(robots.includes('Allow: /'));
  assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length - 2);
  assert.ok(!sitemap.includes('/404'));
  for (const path of pages) {
    const html = await readFile(path, 'utf8');
    if ((path.endsWith('/404.html') || path.endsWith('/thank-you/index.html'))) {
      assert.match(html, /content="noindex, nofollow"/);
      assert.ok(!html.includes('rel="canonical"'));
      continue;
    }
    const route = path.slice(root.length).replace(/index\.html$/, '');
    const url = `${origin}${route}`;
    assert.ok(html.includes(`rel="canonical" href="${url}"`), `${path}: canonical`);
    assert.ok(html.includes(`property="og:url" content="${url}"`));
    assert.ok(html.includes(`property="og:image" content="${origin}/_astro/`));
    assert.ok(sitemap.includes(`<loc>${url}</loc>`));
    assert.match(html, /content="index, follow"/);
  }
} else {
  assert.equal(robots, 'User-agent: *\nDisallow: /\n');
  assert.ok(!files.some(file => /sitemap.*\.xml$/.test(file)));
  for (const path of pages) assert.match(await readFile(path, 'utf8'), /content="noindex, nofollow"/);
}
assert.ok(!files.some(file => /(?:^|\/)(?:\.env[^/]*|node_modules|docs|scripts|\.git|\.qa)(?:\/|$)|\.(?:map|docx|md|ts|toml)$/.test(file.slice(root.length))), 'No private, source, configuration, or development files in publish directory');
console.log(`Verified ${canonicalOrigin ? 'production indexing, canonical URLs, Open Graph URLs, sitemap, and 404 exclusion' : 'local noindex and crawler blocking'}.`);

const contact = await readFile(resolve(root, 'contact/index.html'), 'utf8');
const formTag = contact.match(/<form[^>]+id="contact-form"[^>]*>/)?.[0] || '';
for (const attr of ['name="contact"', 'method="POST"', 'action="/thank-you/"', 'data-netlify="true"', 'data-netlify-honeypot="fax"'])
  assert.ok(formTag.includes(attr), attr);
assert.match(contact, /<input[^>]+type="hidden"[^>]+name="form-name"[^>]+value="contact"/);
for (const field of ['name', 'email', 'challenge'])
  assert.match(contact, new RegExp('<(?:input|textarea)[^>]+name="' + field + '"[^>]+required'));
assert.match(contact, /<input[^>]+name="fax"/);
assert.ok(!contact.includes('Review your note') && !contact.includes('note-preview'));
await access(resolve(root, 'thank-you/index.html'));
console.log('Verified static Netlify contact form, required fields, honeypot, and thank-you page.');
