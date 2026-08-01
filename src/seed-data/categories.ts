export interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  active: boolean;
}

export const categorySeeds: CategorySeed[] = [
  {
    name: "AI for Business",
    slug: "ai-for-business",
    description:
      "Practical AI adoption for non-technical teams: prompting, workflow automation, and evaluating AI tools for real business problems.",
    icon: "brain-circuit",
    displayOrder: 1,
    active: true,
  },
  {
    name: "Software Development",
    slug: "software-development",
    description:
      "Hands-on programming courses covering web, backend, and mobile development with modern languages and frameworks.",
    icon: "code-2",
    displayOrder: 2,
    active: true,
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description:
      "Defensive security, network fundamentals, and certification prep for people building a career in security operations.",
    icon: "shield-check",
    displayOrder: 3,
    active: true,
  },
  {
    name: "Cloud Computing",
    slug: "cloud-computing",
    description:
      "Cloud infrastructure, deployment, and architecture courses covering the major public cloud platforms.",
    icon: "cloud",
    displayOrder: 4,
    active: true,
  },
  {
    name: "Data Analytics and AI",
    slug: "data-analytics-and-ai",
    description:
      "Data analysis, visualization, and machine learning fundamentals for turning raw data into decisions.",
    icon: "bar-chart-3",
    displayOrder: 5,
    active: true,
  },
  {
    name: "Digital Marketing",
    slug: "digital-marketing",
    description:
      "SEO, paid ads, content, and social strategy courses for growing an audience or a business online.",
    icon: "megaphone",
    displayOrder: 6,
    active: true,
  },
  {
    name: "Sales and Closing",
    slug: "sales-and-closing",
    description:
      "Consultative selling, objection handling, and closing techniques for individual contributors and teams.",
    icon: "handshake",
    displayOrder: 7,
    active: true,
  },
  {
    name: "Real Estate Investing",
    slug: "real-estate-investing",
    description:
      "Property analysis, financing structures, and landlording fundamentals for residential and commercial investors.",
    icon: "building-2",
    displayOrder: 8,
    active: true,
  },
  {
    name: "Stock Investing",
    slug: "stock-investing",
    description:
      "Equity markets, portfolio construction, and analysis frameworks for long-term and active investors.",
    icon: "trending-up",
    displayOrder: 9,
    active: true,
  },
  {
    name: "Personal Finance",
    slug: "personal-finance",
    description:
      "Budgeting, debt payoff, saving, and retirement planning fundamentals for everyday financial decisions.",
    icon: "wallet",
    displayOrder: 10,
    active: true,
  },
  {
    name: "English for Work",
    slug: "english-for-work",
    description:
      "Business English, professional writing, and workplace communication for non-native speakers.",
    icon: "languages",
    displayOrder: 11,
    active: true,
  },
  {
    name: "Healthcare Certifications",
    slug: "healthcare-certifications",
    description:
      "Certification prep and skills training for entry-level and allied healthcare roles.",
    icon: "stethoscope",
    displayOrder: 12,
    active: true,
  },
  {
    name: "Skilled Trades",
    slug: "skilled-trades",
    description:
      "Foundational and advanced training for electrical, HVAC, plumbing, and other hands-on trade careers.",
    icon: "wrench",
    displayOrder: 13,
    active: true,
  },
  {
    name: "Project Management",
    slug: "project-management",
    description:
      "Agile, Scrum, and traditional project management practices for coordinating teams and delivering work.",
    icon: "clipboard-list",
    displayOrder: 14,
    active: true,
  },
  {
    name: "Exam Preparation",
    slug: "exam-preparation",
    description:
      "Structured study courses for standardized tests and professional certification exams.",
    icon: "graduation-cap",
    displayOrder: 15,
    active: true,
  },
];
