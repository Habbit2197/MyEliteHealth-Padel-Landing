// Recoge la web actual (ambermuscle.com) para compararla con la nueva.
// Uso (en tu Mac):  node scripts/scrape-ambermuscle.mjs
// Crea la carpeta ./scrape con un .md por página y una lista de imágenes.
import { writeFile, mkdir } from 'node:fs/promises';
const START = 'https://ambermuscle.com/';
const seen = new Set(); const queue = [START]; const out = [];
await mkdir('scrape', { recursive: true });
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '')
  .replace(/<(h[1-6])[^>]*>/gi, '\n\n## ').replace(/<(p|li|br|div)[^>]*>/gi, '\n')
  .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();
while (queue.length && seen.size < 30) {
  const url = queue.shift(); if (seen.has(url)) continue; seen.add(url);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'MyEliteHealth-web-audit' } });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('html')) continue;
    const html = await res.text();
    const title = (html.match(/<title>([^<]*)/i) || [])[1] || url;
    const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map(m => new URL(m[1], url).href);
    const name = (new URL(url).pathname.replace(/\W+/g, '_') || 'index').replace(/^_|_$/g, '') || 'index';
    await writeFile(`scrape/${name}.md`, `# ${title}\n\nURL: ${url}\n\n${strip(html)}\n\n## Imágenes\n${imgs.map(i => '- ' + i).join('\n')}\n`);
    out.push({ url, title, images: imgs.length });
    for (const m of html.matchAll(/href="([^"#]+)"/gi)) {
      try { const u = new URL(m[1], url); if (u.host === new URL(START).host && !seen.has(u.href)) queue.push(u.href.split('#')[0]); } catch {}
    }
  } catch (e) { console.log('✗', url, e.message); }
}
await writeFile('scrape/_resumen.json', JSON.stringify(out, null, 2));
console.log(`✅ ${out.length} páginas guardadas en ./scrape`);
