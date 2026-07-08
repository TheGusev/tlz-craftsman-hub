import { services, type Service, getService } from "@/data/services";
import { blogPosts, type BlogPost, getBlogPost } from "@/data/blog";

// Stable id for a blog section by its index (works for cyrillic headings).
export function blogSectionId(index: number): string {
  return `s-${index}`;
}

// ---------- Related services per current service ----------

const RELATED_SERVICES: Record<string, string[]> = {
  "posle-pozhara": ["udalenie-zapaha-gari", "udalenie-pleseni", "dezinfekciya-pomeshcheniy", "ozonirovanie-pomescheniy", "posle-potopa"],
  "posle-potopa": ["udalenie-pleseni", "dezinfekciya-pomeshcheniy", "udalenie-zapaha-gari", "sanitarnaya-obrabotka-pomeshcheniy", "posle-pozhara"],
  "udalenie-zapaha-gari": ["posle-pozhara", "ozonirovanie-pomescheniy", "dezinfekciya-pomeshcheniy", "sanitarnaya-obrabotka-pomeshcheniy"],
  "dezinfekciya-posle-smerti": ["udalenie-trupnogo-zapaha", "dezinfekciya-pomeshcheniy", "ozonirovanie-pomescheniy", "sanitarnaya-obrabotka-pomeshcheniy"],
  "udalenie-trupnogo-zapaha": ["dezinfekciya-posle-smerti", "ozonirovanie-pomescheniy", "dezinfekciya-pomeshcheniy", "sanitarnaya-obrabotka-pomeshcheniy"],
  "fumigaciya": ["dezinsekciya", "deratizaciya", "sanitarnaya-obrabotka-pomeshcheniy", "dezinfekciya-pomeshcheniy"],
  "udalenie-pleseni": ["posle-potopa", "dezinfekciya-pomeshcheniy", "ozonirovanie-pomescheniy", "sanitarnaya-obrabotka-pomeshcheniy"],
  "sanitarnaya-obrabotka-pomeshcheniy": ["dezinfekciya-pomeshcheniy", "dezinsekciya", "deratizaciya", "ozonirovanie-pomescheniy", "udalenie-pleseni"],
  "ochistka-uchastkov": ["obrabotka-uchastkov-ot-kleschey", "obrabotka-ot-grizunov-na-uchastke", "deratizaciya", "dezinsekciya"],
  "dezinfekciya-pomeshcheniy": ["sanitarnaya-obrabotka-pomeshcheniy", "dezinsekciya", "deratizaciya", "ozonirovanie-pomescheniy", "udalenie-pleseni"],
  "dezinsekciya": ["deratizaciya", "unichtozhenie-tarakanov", "unichtozhenie-klopov", "unichtozhenie-blokh", "dezinfekciya-pomeshcheniy"],
  "deratizaciya": ["dezinsekciya", "obrabotka-ot-grizunov-na-uchastke", "dezinfekciya-pomeshcheniy", "sanitarnaya-obrabotka-pomeshcheniy"],
  "unichtozhenie-tarakanov": ["dezinsekciya", "unichtozhenie-klopov", "unichtozhenie-muravev", "deratizaciya"],
  "unichtozhenie-klopov": ["dezinsekciya", "unichtozhenie-tarakanov", "unichtozhenie-blokh", "dezinfekciya-pomeshcheniy"],
  "unichtozhenie-blokh": ["dezinsekciya", "unichtozhenie-klopov", "unichtozhenie-muravev", "deratizaciya"],
  "unichtozhenie-muravev": ["dezinsekciya", "unichtozhenie-tarakanov", "obrabotka-uchastkov-ot-kleschey", "deratizaciya"],
  "ozonirovanie-pomescheniy": ["udalenie-zapaha-gari", "dezinfekciya-pomeshcheniy", "sanitarnaya-obrabotka-pomeshcheniy", "udalenie-trupnogo-zapaha"],
  "obrabotka-uchastkov-ot-kleschey": ["ochistka-uchastkov", "obrabotka-ot-grizunov-na-uchastke", "dezinsekciya"],
  "obrabotka-ot-grizunov-na-uchastke": ["ochistka-uchastkov", "obrabotka-uchastkov-ot-kleschey", "deratizaciya"],
};

export function getRelatedServices(currentSlug: string, limit = 5): Service[] {
  const slugs = RELATED_SERVICES[currentSlug] ?? [];
  const result: Service[] = [];
  for (const s of slugs) {
    const svc = getService(s);
    if (svc) result.push(svc);
    if (result.length >= limit) break;
  }
  if (result.length < 4) {
    // Fallback: same cluster
    const cur = getService(currentSlug);
    if (cur) {
      for (const s of services) {
        if (s.slug === currentSlug) continue;
        if (result.find((r) => r.slug === s.slug)) continue;
        if (s.cluster === cur.cluster) result.push(s);
        if (result.length >= limit) break;
      }
    }
  }
  return result;
}

// ---------- Service → blog anchors ----------

type BlogAnchor = { postSlug: string; sectionIndex: number };

const SERVICE_TO_BLOG: Record<string, BlogAnchor[]> = {
  "posle-pozhara": [
    { postSlug: "chto-delat-posle-pozhara-v-kvartire", sectionIndex: 1 },
    { postSlug: "chto-delat-posle-pozhara-v-kvartire", sectionIndex: 8 },
    { postSlug: "chto-delat-posle-pozhara-v-kvartire", sectionIndex: 6 },
  ],
  "posle-potopa": [
    { postSlug: "chem-opasna-plesen-posle-zatopleniya", sectionIndex: 1 },
    { postSlug: "chem-opasna-plesen-posle-zatopleniya", sectionIndex: 7 },
    { postSlug: "chem-opasna-plesen-posle-zatopleniya", sectionIndex: 8 },
  ],
  "udalenie-zapaha-gari": [
    { postSlug: "chto-delat-posle-pozhara-v-kvartire", sectionIndex: 5 },
    { postSlug: "chto-delat-posle-pozhara-v-kvartire", sectionIndex: 6 },
    { postSlug: "kak-ubrat-zapah-posle-smerti", sectionIndex: 3 },
  ],
  "dezinfekciya-posle-smerti": [
    { postSlug: "kak-ubrat-zapah-posle-smerti", sectionIndex: 4 },
    { postSlug: "kak-ubrat-zapah-posle-smerti", sectionIndex: 6 },
    { postSlug: "kak-ubrat-zapah-posle-smerti", sectionIndex: 1 },
  ],
  "udalenie-trupnogo-zapaha": [
    { postSlug: "kak-ubrat-zapah-posle-smerti", sectionIndex: 3 },
    { postSlug: "kak-ubrat-zapah-posle-smerti", sectionIndex: 4 },
    { postSlug: "kak-ubrat-zapah-posle-smerti", sectionIndex: 6 },
  ],
  "fumigaciya": [
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 2 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 6 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 4 },
  ],
  "udalenie-pleseni": [
    { postSlug: "chem-opasna-plesen-posle-zatopleniya", sectionIndex: 1 },
    { postSlug: "chem-opasna-plesen-posle-zatopleniya", sectionIndex: 3 },
    { postSlug: "chem-opasna-plesen-posle-zatopleniya", sectionIndex: 4 },
  ],
  "sanitarnaya-obrabotka-pomeshcheniy": [
    { postSlug: "chem-opasna-plesen-posle-zatopleniya", sectionIndex: 2 },
    { postSlug: "chto-delat-posle-pozhara-v-kvartire", sectionIndex: 6 },
    { postSlug: "kak-ubrat-zapah-posle-smerti", sectionIndex: 6 },
  ],
  "ochistka-uchastkov": [
    { postSlug: "chem-opasna-plesen-posle-zatopleniya", sectionIndex: 2 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 6 },
  ],
  "dezinfekciya-pomeshcheniy": [
    { postSlug: "chem-opasna-plesen-posle-zatopleniya", sectionIndex: 4 },
    { postSlug: "kak-ubrat-zapah-posle-smerti", sectionIndex: 4 },
    { postSlug: "chto-delat-posle-pozhara-v-kvartire", sectionIndex: 5 },
  ],
  "dezinsekciya": [
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 1 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 2 },
  ],
  "deratizaciya": [
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 2 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 6 },
  ],
  "unichtozhenie-tarakanov": [
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 1 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 2 },
  ],
  "unichtozhenie-klopov": [
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 1 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 2 },
  ],
  "unichtozhenie-blokh": [
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 1 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 2 },
  ],
  "unichtozhenie-muravev": [
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 1 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 2 },
  ],
  "ozonirovanie-pomescheniy": [
    { postSlug: "kak-ubrat-zapah-posle-smerti", sectionIndex: 3 },
    { postSlug: "chto-delat-posle-pozhara-v-kvartire", sectionIndex: 5 },
  ],
  "obrabotka-uchastkov-ot-kleschey": [
    { postSlug: "chem-opasna-plesen-posle-zatopleniya", sectionIndex: 2 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 6 },
  ],
  "obrabotka-ot-grizunov-na-uchastke": [
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 6 },
    { postSlug: "kogda-nuzhna-fumigaciya", sectionIndex: 2 },
  ],
};

export type RelatedBlogLink = {
  post: BlogPost;
  sectionIndex: number;
  heading: string;
  href: string;
};

export function getRelatedBlogLinks(currentServiceSlug: string, limit = 3): RelatedBlogLink[] {
  const anchors = SERVICE_TO_BLOG[currentServiceSlug] ?? [];
  const result: RelatedBlogLink[] = [];
  const seen = new Set<string>();
  for (const a of anchors) {
    const post = getBlogPost(a.postSlug);
    if (!post) continue;
    const section = post.body[a.sectionIndex];
    if (!section?.heading) continue;
    const key = `${post.slug}#${blogSectionId(a.sectionIndex)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      post,
      sectionIndex: a.sectionIndex,
      heading: section.heading,
      href: `/blog/${post.slug}#${blogSectionId(a.sectionIndex)}`,
    });
    if (result.length >= limit) break;
  }
  // Fallback: first available heading of first post
  if (result.length === 0 && blogPosts.length > 0) {
    for (const post of blogPosts) {
      const idx = post.body.findIndex((s) => Boolean(s.heading));
      if (idx >= 0) {
        result.push({
          post,
          sectionIndex: idx,
          heading: post.body[idx].heading!,
          href: `/blog/${post.slug}#${blogSectionId(idx)}`,
        });
        if (result.length >= 2) break;
      }
    }
  }
  return result;
}
