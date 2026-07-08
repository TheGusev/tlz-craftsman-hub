/**
 * GEO-frequency audit for city×service pages and blog posts.
 * Run: bunx tsx scripts/audit-geo.ts
 * Writes: scripts/audit-geo.report.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cities } from "../src/data/cities";
import { services } from "../src/data/services";
import { getServiceInCity } from "../src/data/serviceInCity";
import { blogPosts } from "../src/data/blog";
import { buildCityServiceContent } from "../src/lib/cityServiceContent";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- tokenisation ---
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

const RU_ENDINGS = ["ями", "ами", "ого", "ому", "ыми", "ыми", "ыми", "ая", "ой", "ую", "ое", "ые", "ий", "ов", "ом", "ах", "ам", "ей", "ям", "ям", "ах", "у", "ы", "е", "ю", "и", "а", "я", "ь"];
function stem(t: string): string {
  for (const end of RU_ENDINGS) {
    if (t.length - end.length >= 4 && t.endsWith(end)) return t.slice(0, t.length - end.length);
  }
  return t;
}

function countMatches(tokens: string[], needles: string[]): number {
  const set = new Set(needles.map((n) => stem(n.toLowerCase().replace(/ё/g, "е"))));
  let n = 0;
  for (const t of tokens) if (set.has(stem(t))) n++;
  return n;
}

function topBigrams(tokens: string[], top = 10): { bg: string; n: number }[] {
  const STOP = new Set(["и", "в", "во", "на", "по", "с", "со", "от", "до", "для", "не", "но", "к", "о", "об", "у", "за", "из", "или", "а", "то", "как", "что", "это", "при", "если", "же", "ли", "бы"]);
  const map = new Map<string, number>();
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i], b = tokens[i + 1];
    if (STOP.has(a) && STOP.has(b)) continue;
    const bg = `${a} ${b}`;
    map.set(bg, (map.get(bg) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([bg, n]) => ({ bg, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, top);
}

// naive Russian stem: strip a few common endings for city names
function cityForms(name: string): string[] {
  const base = name.toLowerCase().replace(/ё/g, "е");
  const stems = new Set<string>();
  const words = base.split(/\s+/);
  const endings = ["ая", "ой", "ую", "ое", "ые", "ий", "ая", "ов", "ом", "ах", "ам", "а", "у", "ы", "е", "ой", "ей", "ю", "и", "ь"];
  for (const w of words) {
    if (w.length < 3) continue;
    stems.add(w);
    for (const end of endings) {
      if (w.endsWith(end) && w.length - end.length >= 4) {
        stems.add(w.slice(0, w.length - end.length));
      }
    }
  }
  return [...stems];
}

// heuristic word-forms for a service (built from its shortName tokens)
function serviceForms(shortName: string): string[] {
  const tokens = tokenize(shortName);
  const forms: string[] = [];
  for (const t of tokens) {
    if (t.length < 4) continue;
    forms.push(t);
    // stem (drop last vowel-ending)
    const stem = t.replace(/(ой|ая|ое|ые|ей|ем|ов|ом|ах|ам|ы|и|а|у|е|о|я|ю)$/u, "");
    if (stem.length >= 4 && stem !== t) forms.push(stem);
  }
  return Array.from(new Set(forms));
}

// build final page text as rendered (approximation)
function buildPageText(citySlug: string, serviceSlug: string): string {
  const city = cities.find((c) => c.slug === citySlug)!;
  const service = services.find((s) => s.slug === serviceSlug)!;
  const sc = getServiceInCity(citySlug, serviceSlug);
  const sections = buildCityServiceContent(city, service);

  const parts: string[] = [];
  parts.push(city.name, city.nameLocative);
  if (sc?.introAnswer) parts.push(sc.introAnswer);
  if (sc?.localOffer) parts.push(sc.localOffer);
  if (sc?.whenCalled) parts.push(...sc.whenCalled);
  for (const sec of sections) {
    parts.push(sec.heading);
    parts.push(...sec.paragraphs);
    if (sec.bullets) for (const b of sec.bullets) parts.push(b.title, b.body);
  }
  parts.push(...service.steps.map((s) => `${s.title}. ${s.description}`));
  if (sc?.priceContext) parts.push(sc.priceContext);
  parts.push(...service.priceFactors);
  parts.push(...(sc?.popularDistricts ?? city.districts));
  if (sc?.caseScenario?.title) parts.push(sc.caseScenario.title, sc.caseScenario.description);
  const faq = sc?.faq ?? service.faq.slice(0, 3);
  for (const f of faq) parts.push(f.q, f.a);
  for (const f of service.faq.slice(0, 2)) parts.push(f.q, f.a);

  return parts.filter(Boolean).join(" ");
}

// --- thresholds ---
const CITY_MAX = 0.025;   // 2.5%
const SERVICE_MAX = 0.030; // 3%
const BIGRAM_MAX = 0.010;  // 1%
const HEAD_WINDOW = 100;   // first 100 tokens must contain toponym

type Finding = { url: string; kind: string; detail: string };

const findings: Finding[] = [];
const rows: string[] = [];

rows.push("# GEO-frequency audit\n");
rows.push(`Generated: ${new Date().toISOString()}\n`);
rows.push(`Thresholds: city ≤ ${CITY_MAX * 100}%, service ≤ ${SERVICE_MAX * 100}%, top-bigram ≤ ${BIGRAM_MAX * 100}%.\n`);

// city×service
rows.push("\n## city×service\n");
rows.push("| URL | words | city % | service % | top bigram | flags |");
rows.push("|---|---|---|---|---|---|");

for (const city of cities) {
  for (const service of services) {
    const url = `/cities/${city.slug}/${service.slug}`;
    const text = buildPageText(city.slug, service.slug);
    const tokens = tokenize(text);
    const cForms = cityForms(city.name);
    const sForms = serviceForms(service.shortName);
    const cN = countMatches(tokens, cForms);
    const sN = countMatches(tokens, sForms);
    const cPct = cN / tokens.length;
    const sPct = sN / tokens.length;
    const bg = topBigrams(tokens, 1)[0];
    const bgPct = bg ? bg.n / tokens.length : 0;
    const head = tokens.slice(0, HEAD_WINDOW);
    const hasHead = countMatches(head, cForms) > 0;

    const flags: string[] = [];
    if (cPct > CITY_MAX) flags.push("CITY_STUFF");
    if (sPct > SERVICE_MAX) flags.push("SERVICE_STUFF");
    if (bg && bgPct > BIGRAM_MAX) flags.push(`BIGRAM_STUFF:${bg.bg}`);
    if (!hasHead) flags.push("GEO_HEAD_MISSING");

    if (flags.length) {
      findings.push({ url, kind: flags.join(","), detail: `city=${(cPct * 100).toFixed(2)}% service=${(sPct * 100).toFixed(2)}% bg="${bg?.bg}"×${bg?.n}` });
    }

    rows.push(`| ${url} | ${tokens.length} | ${(cPct * 100).toFixed(2)} | ${(sPct * 100).toFixed(2)} | ${bg ? `${bg.bg} (${bg.n})` : "—"} | ${flags.join(" ") || "ok"} |`);
  }
}

// blog
rows.push("\n## blog\n");
rows.push("| URL | words | region % | top city % | top bigram | flags |");
rows.push("|---|---|---|---|---|---|");

const REGION_FORMS = ["юфо", "крым", "крыма", "крыму", "крымский", "крымская", "крымские", "краснодарский", "краснодарского", "краснодарском", "ростовская", "ростовской", "черноморского", "южный"];
const CITY_MENTIONS = cities.flatMap((c) => cityForms(c.name));

for (const post of blogPosts) {
  const url = `/blog/${post.slug}`;
  const parts: string[] = [post.title, post.excerpt];
  for (const sec of post.body) {
    if (sec.heading) parts.push(sec.heading);
    parts.push(...sec.paragraphs);
  }
  const tokens = tokenize(parts.join(" "));
  const rN = countMatches(tokens, REGION_FORMS);
  const cN = countMatches(tokens, CITY_MENTIONS);
  const rPct = rN / tokens.length;
  const cPct = cN / tokens.length;
  const bg = topBigrams(tokens, 1)[0];
  const bgPct = bg ? bg.n / tokens.length : 0;

  const flags: string[] = [];
  if (rN === 0) flags.push("REGION_MISSING");
  if (cN === 0) flags.push("CITY_MISSING");
  if (rPct > 0.03) flags.push("REGION_STUFF");
  if (cPct > 0.05) flags.push("CITY_STUFF");
  if (bg && bgPct > BIGRAM_MAX) flags.push(`BIGRAM_STUFF:${bg.bg}`);

  if (flags.length) findings.push({ url, kind: flags.join(","), detail: `region=${(rPct * 100).toFixed(2)}% city=${(cPct * 100).toFixed(2)}% bg="${bg?.bg}"×${bg?.n}` });
  rows.push(`| ${url} | ${tokens.length} | ${(rPct * 100).toFixed(2)} | ${(cPct * 100).toFixed(2)} | ${bg ? `${bg.bg} (${bg.n})` : "—"} | ${flags.join(" ") || "ok"} |`);
}

// summary
rows.push("\n## Summary\n");
rows.push(`Total findings: ${findings.length}\n`);
const byKind = new Map<string, number>();
for (const f of findings) {
  for (const k of f.kind.split(",")) byKind.set(k, (byKind.get(k) ?? 0) + 1);
}
for (const [k, n] of [...byKind.entries()].sort((a, b) => b[1] - a[1])) rows.push(`- ${k}: ${n}`);

rows.push("\n### First 40 findings\n");
for (const f of findings.slice(0, 40)) rows.push(`- \`${f.url}\` — ${f.kind} — ${f.detail}`);

const out = path.join(__dirname, "audit-geo.report.md");
fs.writeFileSync(out, rows.join("\n"), "utf8");
console.log(`Wrote ${out}`);
console.log(`Findings: ${findings.length}`);
for (const [k, n] of byKind) console.log(`  ${k}: ${n}`);
