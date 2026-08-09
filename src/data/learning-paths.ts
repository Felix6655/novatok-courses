/**
 * Learning paths are curated orderings of existing, real Course rows —
 * deliberately NOT a new Prisma model. A path adds no new content or
 * student-facing entities of its own; it's a named sequence over courses
 * that already exist, resolved against the real catalog at request time
 * (see src/server/learning-paths.ts). This keeps the Prisma schema
 * minimal (per CLAUDE.md) and avoids a migration for something that's
 * pure curation, not new data. If per-student path progress becomes a
 * real feature later, that's a natural StudentEnrollment-adjacent
 * addition at that point — not speculative schema now.
 *
 * `courseSlugs` must reference real, PUBLISHED course slugs from
 * src/seed-data/courses.ts — this is enforced by
 * src/data/learning-paths.test.ts, not by a database constraint.
 */
export interface LearningPathSeed {
  slug: string;
  title: string;
  description: string;
  targetAudience: string;
  estimatedWeeks: number;
  /** Ordered — earliest course first. */
  courseSlugs: string[];
}

export const learningPathSeeds: LearningPathSeed[] = [
  {
    slug: "new-creator",
    title: "New Creator",
    description:
      "Start from a real position instead of guessing: pick a niche, understand your audience, and learn to make content — before worrying about growth tactics.",
    targetAudience: "Total beginners who haven't posted consistently yet.",
    estimatedWeeks: 6,
    courseSlugs: [
      "social-media-foundations-for-creators",
      "content-creation-for-creators",
      "growing-your-audience-from-zero",
      "personal-brand-for-creators",
    ],
  },
  {
    slug: "grow-my-audience",
    title: "Grow My Audience",
    description:
      "For creators who are already posting but growth has stalled: algorithms, retention, platform-specific tactics, and reading analytics to know what to fix.",
    targetAudience: "Creators with some following who want to grow faster.",
    estimatedWeeks: 6,
    courseSlugs: [
      "growing-your-audience-from-zero",
      "platform-growth-playbooks",
      "creator-analytics-and-data-driven-growth",
    ],
  },
  {
    slug: "short-form-video-creator",
    title: "Short-Form Video Creator",
    description:
      "Focused on TikTok, Reels, and YouTube Shorts specifically: production, hooks, platform tactics, and the analytics that tell you what's working.",
    targetAudience: "Creators focused primarily on short-form video.",
    estimatedWeeks: 5,
    courseSlugs: [
      "content-creation-for-creators",
      "platform-growth-playbooks",
      "creator-analytics-and-data-driven-growth",
    ],
  },
  {
    slug: "personal-brand",
    title: "Personal Brand",
    description:
      "For creators, consultants, and professionals who want to become the recognizable name in their niche, not just another account.",
    targetAudience: "Anyone building a recognizable individual brand online.",
    estimatedWeeks: 5,
    courseSlugs: [
      "social-media-foundations-for-creators",
      "personal-brand-for-creators",
      "creator-mindset-and-sustainable-habits",
    ],
  },
  {
    slug: "social-commerce-seller",
    title: "Social Commerce Seller",
    description:
      "Selling products directly through social platforms: shoppable content, live selling, and reading commerce analytics to scale what converts.",
    targetAudience: "Creators and sellers using TikTok Shop, Instagram Shopping, or similar.",
    estimatedWeeks: 6,
    courseSlugs: [
      "creator-sales-and-conversion",
      "social-commerce-and-live-selling",
      "creator-analytics-and-data-driven-growth",
    ],
  },
  {
    slug: "affiliate-creator",
    title: "Affiliate Creator",
    description:
      "Build a real income stream promoting other people's products: product research, honest review content, and diversifying beyond one program.",
    targetAudience: "Creators focused on affiliate marketing as a primary income stream.",
    estimatedWeeks: 5,
    courseSlugs: [
      "creator-business-and-monetization",
      "social-commerce-and-live-selling",
      "creator-sales-and-conversion",
    ],
  },
  {
    slug: "ugc-creator",
    title: "UGC Creator",
    description:
      "Turn content-creation skill into a service business: authentic-style content for brands, packaging your skills, and building a personal brand around it.",
    targetAudience: "Creators who want to sell content-creation services to brands.",
    estimatedWeeks: 5,
    courseSlugs: [
      "content-creation-for-creators",
      "creator-business-and-monetization",
      "personal-brand-for-creators",
    ],
  },
  {
    slug: "small-business-owner",
    title: "Small Business Owner",
    description:
      "Practical social media for owners who don't have a marketing team: what to post, which platform to prioritize, and how to turn attention into customers.",
    targetAudience: "Local, service, and small ecommerce business owners.",
    estimatedWeeks: 5,
    courseSlugs: [
      "small-business-social-media-playbook",
      "content-creation-for-creators",
      "creator-sales-and-conversion",
    ],
  },
  {
    slug: "full-time-creator",
    title: "Become a Full-Time Creator",
    description:
      "The business side of creating: diversified income, pricing, media kits, sustainable habits, and the analytics discipline that supports doing this as a full-time living.",
    targetAudience: "Established creators moving from side project to primary income.",
    estimatedWeeks: 7,
    courseSlugs: [
      "creator-business-and-monetization",
      "personal-brand-for-creators",
      "creator-mindset-and-sustainable-habits",
      "creator-analytics-and-data-driven-growth",
    ],
  },
  {
    slug: "ai-powered-creator",
    title: "AI-Powered Creator",
    description:
      "Use AI tools for ideation, scripts, captions, images, and repurposing without losing your own voice — and build a real workflow around them.",
    targetAudience: "Creators who want to produce more without burning out.",
    estimatedWeeks: 5,
    courseSlugs: [
      "ai-tools-for-creators",
      "content-creation-for-creators",
      "growing-your-audience-from-zero",
    ],
  },
  {
    slug: "creator-business-monetization",
    title: "Creator Business & Monetization",
    description:
      "A focused path through every major creator income stream: affiliate, sponsorships, digital products, and direct social commerce.",
    targetAudience: "Creators ready to diversify how they earn from an existing audience.",
    estimatedWeeks: 6,
    courseSlugs: [
      "creator-business-and-monetization",
      "creator-sales-and-conversion",
      "social-commerce-and-live-selling",
    ],
  },
];
