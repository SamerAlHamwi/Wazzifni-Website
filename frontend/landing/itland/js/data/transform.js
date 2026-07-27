/**
 * Data transformation utilities.
 *
 * The raw records in projects.js are a straight copy of the portfolio data, so
 * everything the UI needs but the portfolio does not store — Arabic copy, store
 * links collapsed into one list, a usable image path — is derived here instead
 * of being duplicated into the source data. Every field is defensive: a record
 * copied from the portfolio before it has been translated, or one missing an
 * image or a link, still produces a renderable card.
 */

/** Portfolio records use '#' for "no public link yet". */
const isUsableUrl = (url) => typeof url === 'string' && url.trim() !== '' && url.trim() !== '#';

/** Latin/emoji-free slug used for DOM ids and filter values. */
const slugify = (value, fallback) => {
  const slug = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
};

/**
 * Category definitions. `match` runs against the raw tag list, so a project can
 * legitimately appear under more than one filter. Categories that match nothing
 * are dropped by buildFilters() rather than rendering as a dead chip.
 */
const CATEGORIES = [
  {
    id: 'enterprise',
    label: 'أنظمة مؤسسية',
    match: (tags) => tags.some((tag) => /enterprise|security|document/i.test(tag)),
  },
  {
    id: 'education',
    label: 'تعليم',
    match: (tags) => tags.some((tag) => /education|learning|svu/i.test(tag)),
  },
  {
    id: 'health',
    label: 'صحة وإتاحة',
    match: (tags) => tags.some((tag) => /health|accessibility|video call/i.test(tag)),
  },
  {
    id: 'platforms',
    label: 'منصات وخدمات',
    match: (tags) =>
      tags.some((tag) => /recruitment|job search|business|booking|logistics|maps/i.test(tag)),
  },
  {
    id: 'ai',
    label: 'ذكاء اصطناعي',
    match: (tags) => tags.some((tag) => /\bai\b|speech/i.test(tag)),
  },
];

const IMAGE_BASE = 'assets/images/projects/';

/** Neutral inline placeholder, used when a record has no image file. */
const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
       <rect width="96" height="96" rx="22" fill="#0f2b47"/>
       <path d="M32 62V38a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H36a4 4 0 0 1-4-4Z"
             stroke="#4aa8dd" stroke-width="3"/>
       <path d="M42 34v-4m12 4v-4M42 70v-4m12 4v-4" stroke="#4aa8dd" stroke-width="3"
             stroke-linecap="round"/>
     </svg>`,
  );

/**
 * Normalises one raw record into the shape the card renderer expects.
 *
 * @param {import('./projects.js').RawProject} raw
 * @param {number} index position in the source list, used as a stable tiebreak
 * @returns {object|null} null when the record has nothing to show
 */
export function normalizeProject(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null;

  const name = String(raw.name ?? '').trim();
  if (!name) return null;

  const tags = Array.isArray(raw.tags) ? raw.tags.filter(Boolean).map(String) : [];

  // Arabic copy where it exists, the portfolio's English otherwise — never an
  // empty card body.
  const description =
    String(raw.descriptionAr ?? '').trim() ||
    String(raw.description ?? '').trim() ||
    'مشروع من أعمال IT Land Iraq.';

  const links = [
    { kind: 'play', label: 'Google Play', url: raw.playStoreUrl },
    { kind: 'ios', label: 'App Store', url: raw.appStoreUrl },
    { kind: 'git', label: 'المستودع', url: raw.gitUrl },
  ].filter((link) => isUsableUrl(link.url));

  // The primary "View Project" target: the portfolio's publishUrl when it is
  // real, otherwise the first store link so the button is never a dead end.
  const primaryUrl = isUsableUrl(raw.publishUrl) ? raw.publishUrl.trim() : links[0]?.url ?? '';

  return {
    id: slugify(name, `project-${index}`),
    index,
    name,
    description,
    type: String(raw.typeAr ?? '').trim() || String(raw.type ?? '').trim() || 'مشروع',
    tags,
    image: raw.image ? IMAGE_BASE + raw.image : FALLBACK_IMAGE,
    fallbackImage: FALLBACK_IMAGE,
    links,
    primaryUrl,
    /** Filter ids this project belongs to. */
    categories: CATEGORIES.filter((category) => category.match(tags)).map((c) => c.id),
    /** Published projects sort ahead of unreleased ones. */
    published: Boolean(primaryUrl),
  };
}

/**
 * @param {import('./projects.js').RawProject[]} raw
 * @returns {object[]} renderable projects, invalid records dropped
 */
export function normalizeProjects(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeProject).filter(Boolean);
}

/**
 * Filter chips for the projects toolbar — "all" plus every category that has at
 * least one project, each with its count.
 *
 * @param {object[]} projects normalised projects
 */
export function buildFilters(projects) {
  const counts = new Map();
  projects.forEach((project) => {
    project.categories.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  });

  return [
    { id: 'all', label: 'الكل', count: projects.length },
    ...CATEGORIES.filter((category) => counts.get(category.id)).map((category) => ({
      id: category.id,
      label: category.label,
      count: counts.get(category.id),
    })),
  ];
}

export const SORTS = {
  featured: { label: 'الترتيب المميز', compare: (a, b) => a.index - b.index },
  name: { label: 'الاسم (أ-ي)', compare: (a, b) => a.name.localeCompare(b.name, 'ar') },
  published: {
    label: 'المنشورة أولاً',
    compare: (a, b) => Number(b.published) - Number(a.published) || a.index - b.index,
  },
};

/**
 * @param {object[]} projects normalised projects
 * @param {string} filterId category id, or 'all'
 * @param {string} sortId key of SORTS
 */
export function selectProjects(projects, filterId = 'all', sortId = 'featured') {
  const filtered =
    filterId === 'all' ? [...projects] : projects.filter((p) => p.categories.includes(filterId));

  const sort = SORTS[sortId] ?? SORTS.featured;
  return filtered.sort(sort.compare);
}
