import { cities } from "../src/data/cities";
import { services } from "../src/data/services";
import { getServiceInCity } from "../src/data/serviceInCity";
import { buildCityServiceContent } from "../src/lib/cityServiceContent";

const city = cities.find((c) => c.slug === "krasnodar")!;
const service = services.find((s) => s.slug === "posle-pozhara")!;
const sc = getServiceInCity("krasnodar", "posle-pozhara");
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

const text = parts.join(" ").toLowerCase();
const matches = text.match(/в краснодаре/g) ?? [];
console.log("count:", matches.length);
// find each occurrence source
for (let i = 0; i < parts.length; i++) {
  const p = String(parts[i]).toLowerCase();
  const n = (p.match(/в краснодаре/g) ?? []).length;
  if (n > 0) console.log(`[${i}] x${n}: ${p.slice(0, 140)}`);
}
