export type CourseLevelSeed = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatusSeed = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CourseSeed {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categorySlug: string;
  instructorName: string;
  instructorBio: string;
  thumbnailUrl: string;
  promoVideoUrl: string | null;
  price: number;
  originalPrice: number | null;
  currency: string;
  level: CourseLevelSeed;
  language: string;
  durationMinutes: number;
  lessonCount: number;
  certificateAvailable: boolean;
  prerequisites: string[];
  learningOutcomes: string[];
  enrollmentUrl: string;
  status: CourseStatusSeed;
  featured: boolean;
}

type CourseSeedInput = Omit<
  CourseSeed,
  | "thumbnailUrl"
  | "promoVideoUrl"
  | "enrollmentUrl"
  | "currency"
  | "language"
  | "certificateAvailable"
  | "status"
  | "featured"
  | "originalPrice"
> &
  Partial<
    Pick<
      CourseSeed,
      | "thumbnailUrl"
      | "promoVideoUrl"
      | "enrollmentUrl"
      | "currency"
      | "language"
      | "certificateAvailable"
      | "status"
      | "featured"
      | "originalPrice"
    >
  >;

/**
 * Fills in placeholder media, enrollment routing, and other repeated
 * defaults so individual course entries only specify what makes them
 * distinct. All placeholder URLs use a non-resolvable host so it's obvious
 * at a glance that no real media is attached yet.
 */
function defineCourse(input: CourseSeedInput): CourseSeed {
  return {
    thumbnailUrl: `https://placeholder.local/novatok-courses/${input.slug}/thumbnail.jpg`,
    promoVideoUrl: `https://placeholder.local/novatok-courses/${input.slug}/promo.mp4`,
    enrollmentUrl: `/courses/${input.slug}/enroll`,
    currency: "USD",
    language: "en",
    certificateAvailable: true,
    status: "PUBLISHED",
    featured: false,
    originalPrice: null,
    ...input,
  };
}

export const courseSeeds: CourseSeed[] = [
  // AI for Business
  defineCourse({
    title: "AI Fundamentals for Managers",
    slug: "ai-fundamentals-for-managers",
    shortDescription:
      "A no-jargon introduction to what AI tools can and can't do for a business team.",
    fullDescription:
      "Designed for managers and team leads with no technical background, this course explains how modern AI tools actually work, where they save real time, and where they still need human judgment. You'll leave with a practical vocabulary for evaluating AI vendor claims and a framework for identifying which tasks on your team are worth automating first.",
    categorySlug: "ai-for-business",
    instructorName: "Dana Whitfield",
    instructorBio:
      "Dana spent nine years leading operations teams before moving into AI tooling consulting for mid-size companies.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 180,
    lessonCount: 12,
    prerequisites: [],
    learningOutcomes: [
      "Explain how large language models generate responses in plain terms",
      "Identify which recurring tasks on your team are good automation candidates",
      "Evaluate AI vendor claims with a practical checklist",
      "Avoid the most common AI adoption mistakes in a small team",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Prompt Engineering for Business Teams",
    slug: "prompt-engineering-for-business-teams",
    shortDescription:
      "Write clearer prompts to get consistently useful output from AI assistants at work.",
    fullDescription:
      "Move past trial-and-error prompting. This course covers structured prompting techniques, reusable prompt templates for common business documents, and how to iterate on prompts when the first result isn't quite right. Includes exercises using real workplace scenarios like drafting reports, summarizing meetings, and reviewing documents.",
    categorySlug: "ai-for-business",
    instructorName: "Marcus Ibe",
    instructorBio:
      "Marcus trains corporate teams on AI-assisted workflows and previously worked in enterprise technical writing.",
    price: 149,
    level: "INTERMEDIATE",
    durationMinutes: 240,
    lessonCount: 16,
    prerequisites: ["Basic familiarity with any AI chat assistant"],
    learningOutcomes: [
      "Structure prompts for consistent, repeatable output",
      "Build a personal library of reusable prompt templates",
      "Diagnose why a prompt produced a poor result and fix it",
      "Apply prompting techniques to reports, emails, and summaries",
    ],
  }),
  defineCourse({
    title: "Automating Workflows with AI Tools",
    slug: "automating-workflows-with-ai-tools",
    shortDescription:
      "Connect AI tools to everyday business workflows without writing code.",
    fullDescription:
      "Learn to chain no-code automation platforms with AI tools to remove repetitive manual work from processes like lead intake, document review, and internal reporting. The course walks through building three complete automations end to end and discusses where automation reliability breaks down in practice.",
    categorySlug: "ai-for-business",
    instructorName: "Dana Whitfield",
    instructorBio:
      "Dana spent nine years leading operations teams before moving into AI tooling consulting for mid-size companies.",
    price: 249,
    originalPrice: 329,
    level: "INTERMEDIATE",
    durationMinutes: 300,
    lessonCount: 18,
    prerequisites: ["AI Fundamentals for Managers or equivalent experience"],
    learningOutcomes: [
      "Map a manual business process into an automatable workflow",
      "Connect AI steps into no-code automation platforms",
      "Add error handling and human checkpoints to automated workflows",
      "Measure whether an automation is actually saving time",
    ],
  }),
  defineCourse({
    title: "Building an AI Adoption Roadmap for Your Company",
    slug: "building-an-ai-adoption-roadmap",
    shortDescription:
      "A structured planning course for rolling out AI tools across a whole organization.",
    fullDescription:
      "This course is being finalized and covers change management, governance, and pilot-program design for company-wide AI adoption, including how to sequence rollouts across departments with different risk tolerances.",
    categorySlug: "ai-for-business",
    instructorName: "Priya Ramanathan",
    instructorBio:
      "Priya advises operations leaders on technology rollouts and has led adoption programs at two Fortune 500 companies.",
    price: 399,
    level: "ADVANCED",
    durationMinutes: 260,
    lessonCount: 14,
    prerequisites: ["Prompt Engineering for Business Teams", "Manager-level experience"],
    learningOutcomes: [
      "Design a phased AI rollout plan across departments",
      "Set up lightweight AI governance for a mid-size company",
      "Identify and de-risk the most common pilot-program failure points",
    ],
    status: "DRAFT",
  }),

  // Software Development
  defineCourse({
    title: "JavaScript Fundamentals",
    slug: "javascript-fundamentals",
    shortDescription:
      "Learn core JavaScript from scratch: variables, functions, arrays, and the DOM.",
    fullDescription:
      "A ground-up introduction to JavaScript for people who have never programmed before. You'll write real code in every lesson, build small interactive browser projects, and finish with a solid foundation for moving into any modern JavaScript framework.",
    categorySlug: "software-development",
    instructorName: "Wei Chen",
    instructorBio:
      "Wei has taught introductory programming for six years and previously worked as a front-end engineer.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 420,
    lessonCount: 28,
    prerequisites: [],
    learningOutcomes: [
      "Write and debug JavaScript functions and control flow",
      "Manipulate arrays and objects confidently",
      "Update a web page dynamically using the DOM",
      "Read and understand other people's JavaScript code",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Full-Stack Web Development with Next.js",
    slug: "full-stack-web-development-with-nextjs",
    shortDescription:
      "Build and deploy a complete full-stack application using Next.js, TypeScript, and a database.",
    fullDescription:
      "A project-based course covering the App Router, server components, API routes, database integration with an ORM, and deployment. By the end you'll have shipped a working full-stack application and understand the reasoning behind each architectural decision, not just the syntax.",
    categorySlug: "software-development",
    instructorName: "Renata Silva",
    instructorBio:
      "Renata is a full-stack engineer who has shipped production Next.js applications at two startups.",
    price: 599,
    originalPrice: 799,
    level: "INTERMEDIATE",
    durationMinutes: 720,
    lessonCount: 42,
    prerequisites: ["JavaScript Fundamentals or equivalent experience"],
    learningOutcomes: [
      "Structure a Next.js App Router project for a real application",
      "Build type-safe API routes and connect them to a database",
      "Implement server-side rendering and data fetching patterns correctly",
      "Deploy a full-stack application to production",
    ],
  }),
  defineCourse({
    title: "Advanced System Design for Engineers",
    slug: "advanced-system-design-for-engineers",
    shortDescription:
      "Design scalable backend systems and reason clearly about trade-offs in interviews and real work.",
    fullDescription:
      "Covers load balancing, caching strategies, database sharding, queueing, and consistency trade-offs through worked case studies of realistic system design problems. Aimed at engineers preparing for senior-level interviews or designing systems at their current job.",
    categorySlug: "software-development",
    instructorName: "Idris Bello",
    instructorBio:
      "Idris is a senior backend engineer who has designed high-traffic systems at two large technology companies.",
    price: 899,
    level: "ADVANCED",
    durationMinutes: 540,
    lessonCount: 30,
    prerequisites: ["Full-Stack Web Development with Next.js or 2+ years of engineering experience"],
    learningOutcomes: [
      "Reason about scalability trade-offs in a structured way",
      "Design caching and data partitioning strategies for high-traffic systems",
      "Communicate system design decisions clearly in an interview setting",
    ],
  }),
  defineCourse({
    title: "Legacy jQuery Techniques",
    slug: "legacy-jquery-techniques",
    shortDescription:
      "Maintain and understand older jQuery-based codebases still in production.",
    fullDescription:
      "Kept available for maintaining legacy systems. Covers jQuery DOM manipulation, event handling, and AJAX patterns commonly found in pre-2018 codebases. Not recommended as a starting point for new projects.",
    categorySlug: "software-development",
    instructorName: "Wei Chen",
    instructorBio:
      "Wei has taught introductory programming for six years and previously worked as a front-end engineer.",
    price: 49,
    level: "BEGINNER",
    durationMinutes: 180,
    lessonCount: 14,
    certificateAvailable: false,
    prerequisites: [],
    learningOutcomes: [
      "Read and modify jQuery-based DOM manipulation code",
      "Understand common jQuery AJAX patterns in older codebases",
    ],
    status: "ARCHIVED",
  }),

  // Cybersecurity
  defineCourse({
    title: "Cybersecurity Fundamentals",
    slug: "cybersecurity-fundamentals",
    shortDescription:
      "The core concepts every security career starts with: threats, controls, and terminology.",
    fullDescription:
      "An accessible starting point for anyone considering a cybersecurity career. Covers the CIA triad, common attack types, basic network security concepts, and the landscape of security roles, without assuming any prior IT background.",
    categorySlug: "cybersecurity",
    instructorName: "Grace Odom",
    instructorBio:
      "Grace is a security analyst with a background in IT support and SOC operations.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 240,
    lessonCount: 18,
    prerequisites: [],
    learningOutcomes: [
      "Explain core security concepts like the CIA triad in plain language",
      "Recognize common attack types and basic mitigations",
      "Understand the different career paths within cybersecurity",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Network Security Essentials",
    slug: "network-security-essentials",
    shortDescription:
      "Firewalls, segmentation, VPNs, and monitoring fundamentals for defending a network.",
    fullDescription:
      "Covers the practical building blocks of network defense, including firewall rules, network segmentation strategies, VPN configuration concepts, and intrusion detection basics, using lab-style exercises against simulated environments.",
    categorySlug: "cybersecurity",
    instructorName: "Tomas Reyes",
    instructorBio:
      "Tomas has worked as a network security engineer for a regional healthcare provider for over a decade.",
    price: 349,
    level: "INTERMEDIATE",
    durationMinutes: 360,
    lessonCount: 24,
    prerequisites: ["Cybersecurity Fundamentals or basic networking knowledge"],
    learningOutcomes: [
      "Configure firewall rules for common network scenarios",
      "Design network segmentation for a small-to-mid-size organization",
      "Interpret intrusion detection alerts and triage them correctly",
    ],
  }),
  defineCourse({
    title: "CompTIA Security+ Exam Prep",
    slug: "comptia-security-plus-exam-prep",
    shortDescription:
      "Structured review of every Security+ exam objective with practice questions.",
    fullDescription:
      "A focused exam-preparation course that walks through each Security+ exam domain, highlights commonly missed topics, and includes practice questions modeled on the real exam format. Designed to be completed alongside official exam objectives.",
    categorySlug: "cybersecurity",
    instructorName: "Grace Odom",
    instructorBio:
      "Grace is a security analyst with a background in IT support and SOC operations.",
    price: 299,
    level: "INTERMEDIATE",
    durationMinutes: 480,
    lessonCount: 32,
    prerequisites: ["Cybersecurity Fundamentals recommended"],
    learningOutcomes: [
      "Cover all current Security+ exam domains systematically",
      "Identify personal weak areas using practice question results",
      "Build a study schedule for exam day readiness",
    ],
  }),
  defineCourse({
    title: "Advanced Threat Hunting",
    slug: "advanced-threat-hunting",
    shortDescription:
      "Proactive detection techniques for finding attackers already inside a network.",
    fullDescription:
      "Still in development. Will cover hypothesis-driven threat hunting, log analysis at scale, and detection engineering for analysts moving beyond alert-driven security work.",
    categorySlug: "cybersecurity",
    instructorName: "Tomas Reyes",
    instructorBio:
      "Tomas has worked as a network security engineer for a regional healthcare provider for over a decade.",
    price: 799,
    level: "ADVANCED",
    durationMinutes: 420,
    lessonCount: 26,
    prerequisites: ["Network Security Essentials", "1+ years in a SOC role"],
    learningOutcomes: [
      "Formulate and test threat hunting hypotheses",
      "Analyze large log datasets to identify anomalous behavior",
      "Build detection rules from confirmed hunt findings",
    ],
    status: "DRAFT",
  }),

  // Cloud Computing
  defineCourse({
    title: "Cloud Computing Foundations",
    slug: "cloud-computing-foundations",
    shortDescription:
      "Understand core cloud concepts before committing to a specific provider certification.",
    fullDescription:
      "Covers the shared responsibility model, compute, storage, and networking fundamentals that apply across all major cloud providers. A good starting point before specializing in AWS, Azure, or Google Cloud.",
    categorySlug: "cloud-computing",
    instructorName: "Helena Kruger",
    instructorBio:
      "Helena is a cloud infrastructure consultant who has migrated dozens of companies to the cloud.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 210,
    lessonCount: 16,
    prerequisites: [],
    learningOutcomes: [
      "Explain the shared responsibility model in cloud environments",
      "Compare compute, storage, and networking options across providers",
      "Choose which cloud specialization path fits your goals",
    ],
  }),
  defineCourse({
    title: "AWS Solutions Architect Associate Prep",
    slug: "aws-solutions-architect-associate-prep",
    shortDescription:
      "Exam-focused preparation for the AWS Solutions Architect Associate certification.",
    fullDescription:
      "Covers every domain of the current exam guide with hands-on labs in a real AWS free-tier account, including VPC design, IAM policies, storage tiers, and cost-optimized architecture patterns.",
    categorySlug: "cloud-computing",
    instructorName: "Helena Kruger",
    instructorBio:
      "Helena is a cloud infrastructure consultant who has migrated dozens of companies to the cloud.",
    price: 349,
    originalPrice: 449,
    level: "INTERMEDIATE",
    durationMinutes: 600,
    lessonCount: 38,
    prerequisites: ["Cloud Computing Foundations or equivalent experience"],
    learningOutcomes: [
      "Design VPC networking for common architecture patterns",
      "Apply least-privilege IAM policies correctly",
      "Choose appropriate storage and database services for a given workload",
      "Pass the AWS Solutions Architect Associate exam",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Kubernetes for Production Workloads",
    slug: "kubernetes-for-production-workloads",
    shortDescription:
      "Deploy, scale, and operate Kubernetes clusters running real production traffic.",
    fullDescription:
      "Goes beyond \"hello world\" Kubernetes tutorials into production concerns: resource limits, autoscaling, rolling deployments, observability, and incident response for cluster-level failures.",
    categorySlug: "cloud-computing",
    instructorName: "Owen Fitzgerald",
    instructorBio:
      "Owen leads platform engineering at a logistics company running Kubernetes at scale.",
    price: 599,
    level: "ADVANCED",
    durationMinutes: 480,
    lessonCount: 34,
    prerequisites: ["AWS Solutions Architect Associate Prep or equivalent cloud experience"],
    learningOutcomes: [
      "Configure resource requests, limits, and autoscaling correctly",
      "Design safe rolling deployment strategies",
      "Diagnose and respond to cluster-level incidents",
    ],
  }),
  defineCourse({
    title: "Legacy On-Prem to Cloud Migration Basics",
    slug: "legacy-on-prem-to-cloud-migration-basics",
    shortDescription:
      "An earlier migration-planning course, kept for reference on older lift-and-shift patterns.",
    fullDescription:
      "Covers older lift-and-shift migration patterns from on-premises data centers to early cloud deployments. Superseded by newer architecture-first migration approaches but retained for teams maintaining older migration plans.",
    categorySlug: "cloud-computing",
    instructorName: "Owen Fitzgerald",
    instructorBio:
      "Owen leads platform engineering at a logistics company running Kubernetes at scale.",
    price: 199,
    level: "INTERMEDIATE",
    durationMinutes: 240,
    lessonCount: 16,
    certificateAvailable: false,
    prerequisites: [],
    learningOutcomes: [
      "Understand lift-and-shift migration planning basics",
      "Identify risks specific to older on-prem to cloud migrations",
    ],
    status: "ARCHIVED",
  }),

  // Data Analytics and AI
  defineCourse({
    title: "Data Analytics Fundamentals with Excel",
    slug: "data-analytics-fundamentals-with-excel",
    shortDescription:
      "Start analyzing real data using tools you probably already have installed.",
    fullDescription:
      "Teaches core data analysis thinking using Excel: pivot tables, lookup functions, and basic charting, framed around realistic business questions rather than isolated formula tricks.",
    categorySlug: "data-analytics-and-ai",
    instructorName: "Sofia Martins",
    instructorBio:
      "Sofia worked as a business analyst for eight years before moving into data analytics training.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 200,
    lessonCount: 15,
    prerequisites: [],
    learningOutcomes: [
      "Build pivot tables to summarize real datasets",
      "Use lookup functions to combine data from multiple sources",
      "Create charts that communicate a finding clearly",
    ],
  }),
  defineCourse({
    title: "SQL for Data Analysis",
    slug: "sql-for-data-analysis",
    shortDescription:
      "Query relational databases confidently to answer real analysis questions.",
    fullDescription:
      "Covers SELECT statements, joins, aggregation, window functions, and query performance basics through exercises against realistic multi-table datasets rather than toy examples.",
    categorySlug: "data-analytics-and-ai",
    instructorName: "Sofia Martins",
    instructorBio:
      "Sofia worked as a business analyst for eight years before moving into data analytics training.",
    price: 129,
    level: "BEGINNER",
    durationMinutes: 300,
    lessonCount: 22,
    prerequisites: [],
    learningOutcomes: [
      "Write multi-table join queries correctly",
      "Use aggregation and window functions to answer analytical questions",
      "Recognize and avoid common query performance pitfalls",
    ],
  }),
  defineCourse({
    title: "Python for Data Science",
    slug: "python-for-data-science",
    shortDescription:
      "Analyze and visualize data using Python's core data science libraries.",
    fullDescription:
      "Covers Python fundamentals for data work, then moves into pandas for data manipulation and matplotlib for visualization, using realistic messy datasets that require actual cleanup before analysis.",
    categorySlug: "data-analytics-and-ai",
    instructorName: "Ahmed Farouk",
    instructorBio:
      "Ahmed is a data scientist who has led analytics teams in retail and logistics.",
    price: 349,
    originalPrice: 429,
    level: "INTERMEDIATE",
    durationMinutes: 540,
    lessonCount: 36,
    prerequisites: ["SQL for Data Analysis or basic programming experience"],
    learningOutcomes: [
      "Clean and reshape messy datasets using pandas",
      "Produce clear visualizations for exploratory analysis",
      "Structure a repeatable data analysis project in Python",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Machine Learning Foundations",
    slug: "machine-learning-foundations",
    shortDescription:
      "The math and intuition behind common machine learning models, explained clearly.",
    fullDescription:
      "In development. Will cover supervised learning fundamentals, model evaluation, and the intuition behind common algorithms, building toward practical model-building skills without requiring an advanced math background.",
    categorySlug: "data-analytics-and-ai",
    instructorName: "Ahmed Farouk",
    instructorBio:
      "Ahmed is a data scientist who has led analytics teams in retail and logistics.",
    price: 599,
    level: "ADVANCED",
    durationMinutes: 480,
    lessonCount: 30,
    prerequisites: ["Python for Data Science"],
    learningOutcomes: [
      "Explain how common supervised learning algorithms work",
      "Evaluate model performance using appropriate metrics",
      "Avoid common pitfalls like data leakage and overfitting",
    ],
    status: "DRAFT",
  }),

  // Digital Marketing
  defineCourse({
    title: "Digital Marketing Fundamentals",
    slug: "digital-marketing-fundamentals",
    shortDescription:
      "A practical overview of how SEO, paid ads, email, and social fit together.",
    fullDescription:
      "Introduces the major digital marketing channels and how they support each other in a real marketing plan, so you can decide where to specialize next instead of guessing.",
    categorySlug: "digital-marketing",
    instructorName: "Chloe Bennett",
    instructorBio:
      "Chloe has run marketing for two direct-to-consumer brands and now teaches marketing fundamentals.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 210,
    lessonCount: 16,
    prerequisites: [],
    learningOutcomes: [
      "Explain how the major digital marketing channels complement each other",
      "Build a simple channel-mix plan for a small business",
      "Read basic marketing analytics without being misled by vanity metrics",
    ],
    featured: true,
  }),
  defineCourse({
    title: "SEO That Actually Works",
    slug: "seo-that-actually-works",
    shortDescription:
      "Practical, current search optimization techniques for real websites.",
    fullDescription:
      "Covers keyword research, on-page optimization, technical SEO basics, and link-building approaches that hold up to current search engine guidelines, with an emphasis on techniques that don't risk penalties.",
    categorySlug: "digital-marketing",
    instructorName: "Chloe Bennett",
    instructorBio:
      "Chloe has run marketing for two direct-to-consumer brands and now teaches marketing fundamentals.",
    price: 199,
    level: "INTERMEDIATE",
    durationMinutes: 300,
    lessonCount: 20,
    prerequisites: ["Digital Marketing Fundamentals recommended"],
    learningOutcomes: [
      "Conduct keyword research for a real website or business",
      "Fix the most common technical SEO issues",
      "Build a sustainable content and link-building plan",
    ],
  }),
  defineCourse({
    title: "Paid Social Advertising Mastery",
    slug: "paid-social-advertising-mastery",
    shortDescription:
      "Plan, launch, and optimize paid social campaigns with a real budget mindset.",
    fullDescription:
      "Covers campaign structure, audience targeting, creative testing, and budget optimization across major paid social platforms, with case studies showing what separates profitable campaigns from wasted spend.",
    categorySlug: "digital-marketing",
    instructorName: "Jamal Carter",
    instructorBio:
      "Jamal has managed paid social budgets for e-commerce clients for over seven years.",
    price: 449,
    level: "ADVANCED",
    durationMinutes: 360,
    lessonCount: 24,
    prerequisites: ["SEO That Actually Works or existing marketing experience"],
    learningOutcomes: [
      "Structure paid social campaigns for reliable measurement",
      "Design creative tests that produce clear, actionable results",
      "Optimize budget allocation across campaigns based on performance",
    ],
  }),

  // Sales and Closing
  defineCourse({
    title: "Sales Fundamentals: From Cold Call to Close",
    slug: "sales-fundamentals-cold-call-to-close",
    shortDescription:
      "The core sales process explained step by step, for people new to sales.",
    fullDescription:
      "Walks through the full sales cycle from prospecting through close, with scripts and frameworks adaptable to different industries. Focused on building confidence for people early in a sales career.",
    categorySlug: "sales-and-closing",
    instructorName: "Marcus Deleon",
    instructorBio:
      "Marcus spent a decade as a quota-carrying sales rep before moving into sales training.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 210,
    lessonCount: 16,
    prerequisites: [],
    learningOutcomes: [
      "Run a structured discovery call",
      "Handle common early-stage objections with confidence",
      "Move a qualified prospect toward a clear next step",
    ],
  }),
  defineCourse({
    title: "Consultative Selling for B2B Teams",
    slug: "consultative-selling-for-b2b-teams",
    shortDescription:
      "Sell by diagnosing real problems instead of pitching features.",
    fullDescription:
      "Covers consultative discovery frameworks, stakeholder mapping, and value-based positioning for longer B2B sales cycles, using realistic multi-stakeholder deal scenarios.",
    categorySlug: "sales-and-closing",
    instructorName: "Marcus Deleon",
    instructorBio:
      "Marcus spent a decade as a quota-carrying sales rep before moving into sales training.",
    price: 249,
    level: "INTERMEDIATE",
    durationMinutes: 300,
    lessonCount: 20,
    prerequisites: ["Sales Fundamentals: From Cold Call to Close or equivalent experience"],
    learningOutcomes: [
      "Run a consultative discovery process for complex deals",
      "Map and engage multiple stakeholders in a B2B sale",
      "Position value in terms specific to the buyer's business",
    ],
  }),
  defineCourse({
    title: "Advanced Objection Handling and Negotiation",
    slug: "advanced-objection-handling-and-negotiation",
    shortDescription:
      "Handle tough objections and negotiate deal terms without discounting reflexively.",
    fullDescription:
      "Focuses on late-stage deal dynamics: price objections, competitive displacement, procurement negotiations, and how to hold value under pressure without losing the deal.",
    categorySlug: "sales-and-closing",
    instructorName: "Renee Okafor",
    instructorBio:
      "Renee leads enterprise sales training programs and previously ran a regional sales team.",
    price: 399,
    originalPrice: 499,
    level: "ADVANCED",
    durationMinutes: 270,
    lessonCount: 18,
    prerequisites: ["Consultative Selling for B2B Teams"],
    learningOutcomes: [
      "Respond to price objections without defaulting to a discount",
      "Navigate procurement and legal negotiation stages",
      "Recognize and counter common competitive displacement tactics",
    ],
    featured: true,
  }),

  // Real Estate Investing
  defineCourse({
    title: "Real Estate Investing 101",
    slug: "real-estate-investing-101",
    shortDescription:
      "The foundational concepts behind buying property as an investment.",
    fullDescription:
      "Covers the basic vocabulary and math of real estate investing, common strategies like buy-and-hold and house hacking, and how to think about a market before evaluating any specific property. Educational only, not investment advice.",
    categorySlug: "real-estate-investing",
    instructorName: "Carlos Mendoza",
    instructorBio:
      "Carlos has invested in residential rental property for over a decade and writes about real estate investing.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 180,
    lessonCount: 14,
    prerequisites: [],
    learningOutcomes: [
      "Understand core real estate investing terminology and math",
      "Compare common investing strategies like buy-and-hold and house hacking",
      "Evaluate a market at a basic level before researching properties",
    ],
  }),
  defineCourse({
    title: "Analyzing Rental Property Cash Flow",
    slug: "analyzing-rental-property-cash-flow",
    shortDescription:
      "Run the numbers on a rental property before you make an offer.",
    fullDescription:
      "Teaches a repeatable framework for estimating income, expenses, and cash flow on a rental property, including how to stress-test assumptions so you're not caught off guard by vacancy or maintenance costs.",
    categorySlug: "real-estate-investing",
    instructorName: "Carlos Mendoza",
    instructorBio:
      "Carlos has invested in residential rental property for over a decade and writes about real estate investing.",
    price: 199,
    level: "INTERMEDIATE",
    durationMinutes: 240,
    lessonCount: 18,
    prerequisites: ["Real Estate Investing 101 recommended"],
    learningOutcomes: [
      "Build a cash flow model for a rental property",
      "Stress-test assumptions like vacancy rate and repair costs",
      "Decide whether a specific property meets your investment criteria",
    ],
  }),
  defineCourse({
    title: "Commercial Real Estate Financing Structures",
    slug: "commercial-real-estate-financing-structures",
    shortDescription:
      "Understand how larger commercial real estate deals are actually financed.",
    fullDescription:
      "Covers commercial loan structures, syndication basics, and how investor returns are calculated in a pooled deal, aimed at investors moving beyond single-family residential properties. Educational only, not investment advice.",
    categorySlug: "real-estate-investing",
    instructorName: "Linda Park",
    instructorBio:
      "Linda has structured financing for commercial property deals for over fifteen years.",
    price: 599,
    level: "ADVANCED",
    durationMinutes: 300,
    lessonCount: 20,
    prerequisites: ["Analyzing Rental Property Cash Flow"],
    learningOutcomes: [
      "Compare common commercial financing structures",
      "Understand how returns are split in a syndicated deal",
      "Ask informed questions when evaluating a sponsor's deal terms",
    ],
  }),

  // Stock Investing
  defineCourse({
    title: "Stock Market Basics",
    slug: "stock-market-basics",
    shortDescription:
      "How the stock market actually works, explained from the ground up.",
    fullDescription:
      "Covers how shares, exchanges, and orders work, the difference between investing and trading, and how to open and think about a brokerage account. Educational only, not investment advice.",
    categorySlug: "stock-investing",
    instructorName: "Nathan Cole",
    instructorBio:
      "Nathan is a former equity research analyst who now teaches investing fundamentals.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 180,
    lessonCount: 15,
    prerequisites: [],
    learningOutcomes: [
      "Explain how shares, exchanges, and order types work",
      "Distinguish between investing and trading approaches",
      "Understand the basics of opening and using a brokerage account",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Fundamental Analysis for Long-Term Investors",
    slug: "fundamental-analysis-for-long-term-investors",
    shortDescription:
      "Read financial statements to evaluate a company before investing.",
    fullDescription:
      "Teaches how to read income statements, balance sheets, and cash flow statements, and how to use common valuation ratios to compare companies. Educational only, not investment advice.",
    categorySlug: "stock-investing",
    instructorName: "Nathan Cole",
    instructorBio:
      "Nathan is a former equity research analyst who now teaches investing fundamentals.",
    price: 249,
    level: "INTERMEDIATE",
    durationMinutes: 300,
    lessonCount: 22,
    prerequisites: ["Stock Market Basics or equivalent knowledge"],
    learningOutcomes: [
      "Read the three core financial statements confidently",
      "Apply common valuation ratios to compare companies",
      "Build a basic thesis for a long-term stock investment",
    ],
  }),
  defineCourse({
    title: "Options Strategies for Active Traders",
    slug: "options-strategies-for-active-traders",
    shortDescription:
      "Understand common options strategies and the risks specific to each one.",
    fullDescription:
      "Covers calls, puts, spreads, and common income and hedging strategies, with a strong emphasis on risk management. Educational only, not investment advice — options trading carries substantial risk of loss.",
    categorySlug: "stock-investing",
    instructorName: "Vivian Zhao",
    instructorBio:
      "Vivian has traded options professionally for a proprietary trading firm for over eight years.",
    price: 499,
    level: "ADVANCED",
    durationMinutes: 360,
    lessonCount: 26,
    prerequisites: ["Fundamental Analysis for Long-Term Investors"],
    learningOutcomes: [
      "Explain how common options strategies are constructed",
      "Identify the specific risk profile of each strategy covered",
      "Apply position sizing and risk management to options trades",
    ],
  }),

  // Personal Finance
  defineCourse({
    title: "Budgeting and Debt Payoff Fundamentals",
    slug: "budgeting-and-debt-payoff-fundamentals",
    shortDescription:
      "Build a budget that survives real life and pay down debt with a clear plan.",
    fullDescription:
      "A practical, judgment-free course on building a working budget and choosing a debt payoff strategy that fits your situation, whether that's avalanche, snowball, or a hybrid approach.",
    categorySlug: "personal-finance",
    instructorName: "Angela Torres",
    instructorBio:
      "Angela is a certified financial counselor who has worked with hundreds of individual clients on budgeting.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 150,
    lessonCount: 12,
    prerequisites: [],
    learningOutcomes: [
      "Build a realistic monthly budget that accounts for irregular expenses",
      "Compare debt payoff strategies and choose one that fits your situation",
      "Set up a simple system for tracking progress over time",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Building an Emergency Fund and Saving Systematically",
    slug: "building-an-emergency-fund-and-saving-systematically",
    shortDescription:
      "Create a savings system that keeps working even when motivation doesn't.",
    fullDescription:
      "Covers how to size an emergency fund for your situation, where to keep it, and how to automate savings so consistency doesn't depend on willpower alone.",
    categorySlug: "personal-finance",
    instructorName: "Angela Torres",
    instructorBio:
      "Angela is a certified financial counselor who has worked with hundreds of individual clients on budgeting.",
    price: 49,
    level: "BEGINNER",
    durationMinutes: 120,
    lessonCount: 10,
    prerequisites: [],
    learningOutcomes: [
      "Calculate an emergency fund target that fits your household",
      "Choose an appropriate account type for short-term savings",
      "Automate contributions so saving happens by default",
    ],
  }),
  defineCourse({
    title: "Retirement Planning Fundamentals",
    slug: "retirement-planning-fundamentals",
    shortDescription:
      "Understand retirement account types and build a basic long-term plan.",
    fullDescription:
      "Covers common retirement account types, employer matching, contribution strategy, and how to estimate whether you're on track. Educational only, not personalized financial advice.",
    categorySlug: "personal-finance",
    instructorName: "Derek Simmons",
    instructorBio:
      "Derek is a fee-only financial planner focused on retirement planning for working professionals.",
    price: 149,
    level: "INTERMEDIATE",
    durationMinutes: 210,
    lessonCount: 16,
    prerequisites: ["Budgeting and Debt Payoff Fundamentals recommended"],
    learningOutcomes: [
      "Compare common retirement account types and their tax treatment",
      "Set a contribution strategy that captures any employer match",
      "Build a rough estimate of retirement readiness",
    ],
  }),

  // English for Work
  defineCourse({
    title: "Business English Foundations",
    slug: "business-english-foundations",
    shortDescription:
      "Core workplace English for meetings, email, and everyday office communication.",
    fullDescription:
      "Builds practical workplace English vocabulary and phrasing for common situations like introducing yourself, writing simple emails, and participating in meetings, aimed at intermediate English learners.",
    categorySlug: "english-for-work",
    instructorName: "Laura Bennet",
    instructorBio:
      "Laura has taught business English to professionals for over a decade across multiple countries.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 180,
    lessonCount: 16,
    prerequisites: ["Intermediate general English"],
    learningOutcomes: [
      "Write clear, professional emails for common workplace situations",
      "Introduce yourself and small-talk confidently in a work setting",
      "Follow and participate in basic workplace meetings",
    ],
  }),
  defineCourse({
    title: "Professional Email and Writing Skills",
    slug: "professional-email-and-writing-skills",
    shortDescription:
      "Write emails, reports, and messages that sound clear and professional.",
    fullDescription:
      "Focuses specifically on written workplace communication: tone, structure, and common phrasing patterns for emails, status updates, and short reports, with before-and-after rewriting exercises.",
    categorySlug: "english-for-work",
    instructorName: "Laura Bennet",
    instructorBio:
      "Laura has taught business English to professionals for over a decade across multiple countries.",
    price: 99,
    level: "INTERMEDIATE",
    durationMinutes: 210,
    lessonCount: 18,
    prerequisites: ["Business English Foundations or equivalent level"],
    learningOutcomes: [
      "Structure professional emails so the key point isn't buried",
      "Adjust tone appropriately for different workplace audiences",
      "Write short status reports clearly and concisely",
    ],
  }),
  defineCourse({
    title: "Advanced Presentation and Meeting English",
    slug: "advanced-presentation-and-meeting-english",
    shortDescription:
      "Present confidently and navigate fast-moving meetings in English.",
    fullDescription:
      "Covers presentation structure and delivery, handling live questions, and participating actively in fast-paced meetings, aimed at advanced learners preparing for leadership-track roles.",
    categorySlug: "english-for-work",
    instructorName: "Ivan Petrov",
    instructorBio:
      "Ivan coaches non-native English speakers on executive communication and public speaking.",
    price: 179,
    level: "ADVANCED",
    durationMinutes: 240,
    lessonCount: 20,
    prerequisites: ["Professional Email and Writing Skills or equivalent level"],
    learningOutcomes: [
      "Structure and deliver a clear professional presentation",
      "Handle unexpected questions confidently during a presentation",
      "Participate actively in fast-moving, multi-speaker meetings",
    ],
  }),

  // Healthcare Certifications
  defineCourse({
    title: "Medical Terminology Foundations",
    slug: "medical-terminology-foundations",
    shortDescription:
      "Build the vocabulary foundation required for most entry-level healthcare roles.",
    fullDescription:
      "Covers root words, prefixes, and suffixes used across medical terminology, along with body systems vocabulary, to prepare learners for further healthcare certification coursework.",
    categorySlug: "healthcare-certifications",
    instructorName: "Dr. Patricia Nguyen",
    instructorBio:
      "Patricia is a former clinical educator who now develops healthcare training curricula.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 180,
    lessonCount: 16,
    prerequisites: [],
    learningOutcomes: [
      "Break down unfamiliar medical terms using roots, prefixes, and suffixes",
      "Recognize terminology specific to major body systems",
      "Build a foundation for further healthcare certification study",
    ],
  }),
  defineCourse({
    title: "CPR and Basic Life Support Certification Prep",
    slug: "cpr-and-basic-life-support-certification-prep",
    shortDescription:
      "Study guide and knowledge review to prepare for a BLS certification course.",
    fullDescription:
      "A knowledge-review course covering BLS concepts, protocols, and terminology to prepare learners before attending an in-person, hands-on BLS certification session, which is required for actual certification.",
    categorySlug: "healthcare-certifications",
    instructorName: "Dr. Patricia Nguyen",
    instructorBio:
      "Patricia is a former clinical educator who now develops healthcare training curricula.",
    price: 79,
    level: "BEGINNER",
    durationMinutes: 120,
    lessonCount: 10,
    prerequisites: [],
    learningOutcomes: [
      "Explain current BLS protocols and terminology",
      "Prepare for the knowledge portion of an in-person BLS certification course",
      "Understand when and how BLS procedures are applied",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Certified Nursing Assistant (CNA) Exam Prep",
    slug: "certified-nursing-assistant-cna-exam-prep",
    shortDescription:
      "Structured review of CNA exam content across all major competency areas.",
    fullDescription:
      "Covers the knowledge-based content areas of the CNA competency exam, including patient care basics, safety procedures, and communication skills, with practice questions modeled on the real exam format.",
    categorySlug: "healthcare-certifications",
    instructorName: "Monica Reyes",
    instructorBio:
      "Monica is a licensed CNA instructor with experience in long-term care and hospital settings.",
    price: 249,
    level: "INTERMEDIATE",
    durationMinutes: 300,
    lessonCount: 24,
    prerequisites: ["Medical Terminology Foundations recommended"],
    learningOutcomes: [
      "Cover all major CNA exam competency areas systematically",
      "Practice with exam-style questions across each content area",
      "Understand safety and communication standards expected on the exam",
    ],
  }),

  // Skilled Trades
  defineCourse({
    title: "Electrical Fundamentals for Apprentices",
    slug: "electrical-fundamentals-for-apprentices",
    shortDescription:
      "Core electrical theory and safety concepts for someone starting an apprenticeship.",
    fullDescription:
      "Covers basic circuit theory, common tools, and safety procedures every electrical apprentice needs before stepping onto a job site, building a foundation for formal apprenticeship training.",
    categorySlug: "skilled-trades",
    instructorName: "Ray Dawkins",
    instructorBio:
      "Ray is a licensed master electrician who has trained apprentices for over fifteen years.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 210,
    lessonCount: 18,
    prerequisites: [],
    learningOutcomes: [
      "Explain basic circuit theory in practical terms",
      "Identify and safely use common electrical tools",
      "Follow core job site safety procedures",
    ],
  }),
  defineCourse({
    title: "Residential HVAC Systems",
    slug: "residential-hvac-systems",
    shortDescription:
      "How residential heating and cooling systems work, diagnosed and explained.",
    fullDescription:
      "Covers the components and operation of common residential HVAC systems, basic diagnostic approaches for common problems, and maintenance fundamentals, aimed at people starting an HVAC career.",
    categorySlug: "skilled-trades",
    instructorName: "Ray Dawkins",
    instructorBio:
      "Ray is a licensed master electrician who has trained apprentices for over fifteen years.",
    price: 349,
    level: "INTERMEDIATE",
    durationMinutes: 300,
    lessonCount: 22,
    prerequisites: ["Electrical Fundamentals for Apprentices recommended"],
    learningOutcomes: [
      "Explain how common residential HVAC systems operate",
      "Diagnose common HVAC problems systematically",
      "Perform routine maintenance correctly and safely",
    ],
  }),
  defineCourse({
    title: "Advanced Plumbing Code and Systems Design",
    slug: "advanced-plumbing-code-and-systems-design",
    shortDescription:
      "Design compliant plumbing systems and navigate common code requirements.",
    fullDescription:
      "Covers residential and light commercial plumbing system design, common code requirements, and how to plan installations that pass inspection the first time, aimed at experienced tradespeople moving toward licensure.",
    categorySlug: "skilled-trades",
    instructorName: "Bianca Ford",
    instructorBio:
      "Bianca is a licensed master plumber and code compliance instructor.",
    price: 449,
    level: "ADVANCED",
    durationMinutes: 360,
    lessonCount: 26,
    prerequisites: ["Several years of plumbing trade experience recommended"],
    learningOutcomes: [
      "Design compliant residential and light commercial plumbing layouts",
      "Navigate common plumbing code requirements confidently",
      "Plan installations that reduce the risk of failed inspections",
    ],
  }),

  // Project Management
  defineCourse({
    title: "Project Management Fundamentals",
    slug: "project-management-fundamentals",
    shortDescription:
      "The core concepts and vocabulary behind managing any project successfully.",
    fullDescription:
      "Covers project scoping, planning, stakeholder communication, and tracking progress, using a practical framework that applies whether you're running a formal project or just coordinating team work.",
    categorySlug: "project-management",
    instructorName: "Kevin O'Brien",
    instructorBio:
      "Kevin has managed technology and operations projects for over twelve years across several industries.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 180,
    lessonCount: 14,
    prerequisites: [],
    learningOutcomes: [
      "Scope a project clearly before work begins",
      "Communicate project status to stakeholders effectively",
      "Track progress and catch scope creep early",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Agile and Scrum in Practice",
    slug: "agile-and-scrum-in-practice",
    shortDescription:
      "Run real Scrum ceremonies and agile practices, not just the theory.",
    fullDescription:
      "Covers Scrum roles, ceremonies, and artifacts in depth, along with common pitfalls teams run into when adopting agile practices, using realistic team scenarios rather than abstract examples.",
    categorySlug: "project-management",
    instructorName: "Kevin O'Brien",
    instructorBio:
      "Kevin has managed technology and operations projects for over twelve years across several industries.",
    price: 249,
    level: "INTERMEDIATE",
    durationMinutes: 300,
    lessonCount: 20,
    prerequisites: ["Project Management Fundamentals recommended"],
    learningOutcomes: [
      "Run effective sprint planning, review, and retrospective ceremonies",
      "Write clear, well-scoped user stories",
      "Recognize and address common agile adoption pitfalls",
    ],
  }),
  defineCourse({
    title: "PMP Exam Preparation",
    slug: "pmp-exam-preparation",
    shortDescription:
      "Structured review of the PMP exam content outline with practice questions.",
    fullDescription:
      "Covers the full PMP exam content outline across process groups and knowledge areas, with practice questions and study strategies for the current exam format. Does not replace required PMI eligibility hours.",
    categorySlug: "project-management",
    instructorName: "Fiona Chapman",
    instructorBio:
      "Fiona is a PMP-certified program manager who has led enterprise delivery teams for over a decade.",
    price: 399,
    originalPrice: 499,
    level: "ADVANCED",
    durationMinutes: 480,
    lessonCount: 32,
    prerequisites: ["Agile and Scrum in Practice or equivalent PM experience"],
    learningOutcomes: [
      "Cover all PMP exam content domains systematically",
      "Practice with exam-style scenario questions",
      "Build a realistic study schedule ahead of exam day",
    ],
  }),

  // Exam Preparation
  defineCourse({
    title: "Study Skills and Test-Taking Strategies",
    slug: "study-skills-and-test-taking-strategies",
    shortDescription:
      "General techniques that improve performance on almost any standardized test.",
    fullDescription:
      "Covers spaced repetition, active recall, time management under exam conditions, and strategies for multiple-choice tests specifically, as a foundation before studying content for any specific exam.",
    categorySlug: "exam-preparation",
    instructorName: "Natalie Brooks",
    instructorBio:
      "Natalie is a former test-prep tutor who has coached students through a wide range of standardized exams.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 120,
    lessonCount: 10,
    prerequisites: [],
    learningOutcomes: [
      "Apply spaced repetition and active recall to study more efficiently",
      "Manage time effectively under real exam conditions",
      "Use elimination strategies on multiple-choice questions",
    ],
  }),
  defineCourse({
    title: "GED Exam Preparation",
    slug: "ged-exam-preparation",
    shortDescription:
      "Full-subject review to prepare for all four sections of the GED exam.",
    fullDescription:
      "Covers reasoning through language arts, mathematical reasoning, science, and social studies content areas of the GED exam, with practice questions modeled on the current exam format.",
    categorySlug: "exam-preparation",
    instructorName: "Natalie Brooks",
    instructorBio:
      "Natalie is a former test-prep tutor who has coached students through a wide range of standardized exams.",
    price: 99,
    level: "BEGINNER",
    durationMinutes: 360,
    lessonCount: 28,
    prerequisites: [],
    learningOutcomes: [
      "Review core content across all four GED subject areas",
      "Practice with exam-style questions in each section",
      "Build a study plan tailored to your weakest subject areas",
    ],
  }),
  defineCourse({
    title: "GRE Quantitative and Verbal Prep",
    slug: "gre-quantitative-and-verbal-prep",
    shortDescription:
      "Targeted review and practice for the two core sections of the GRE.",
    fullDescription:
      "Covers GRE quantitative reasoning content and verbal reasoning strategy in depth, including timed practice sets, aimed at students preparing for graduate school applications.",
    categorySlug: "exam-preparation",
    instructorName: "Samuel Ortiz",
    instructorBio:
      "Samuel is a graduate test-prep instructor who has taught GRE prep courses for over ten years.",
    price: 249,
    level: "INTERMEDIATE",
    durationMinutes: 420,
    lessonCount: 30,
    prerequisites: ["Study Skills and Test-Taking Strategies recommended"],
    learningOutcomes: [
      "Solve GRE quantitative reasoning problems efficiently",
      "Apply strategies specific to GRE verbal reasoning question types",
      "Complete timed practice sections under real exam conditions",
    ],
    featured: true,
  }),

  // Creator Economy & Social Media
  defineCourse({
    title: "Social Media Foundations for Creators",
    slug: "social-media-foundations-for-creators",
    shortDescription:
      "Pick a niche, understand your audience, and set up a profile worth following — before you post at scale.",
    fullDescription:
      "The course every creator should take first. You'll choose a niche that can actually compound instead of one that sounds impressive, learn how to research the audience you're trying to reach, and build a clear point of view for what you post and why. By the end you'll have a written positioning statement, a shortlist of content pillars, and an optimized profile on the platform(s) you've chosen to start on.",
    categorySlug: "creator-economy",
    instructorName: "Priya Nakamura",
    instructorBio:
      "Priya spent six years on platform creator-partnerships teams before coaching creators full time on positioning and growth strategy.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 150,
    lessonCount: 6,
    prerequisites: [],
    learningOutcomes: [
      "Choose a niche specific enough to grow in and broad enough to sustain",
      "Describe your target audience in concrete, research-backed terms",
      "Write a one-paragraph creator positioning statement",
      "Define 3-5 content pillars and optimize your profile around them",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Growing Your Audience From Zero",
    slug: "growing-your-audience-from-zero",
    shortDescription:
      "Organic growth, recommendation algorithms, retention, and community — for creators starting with no following.",
    fullDescription:
      "Most growth advice assumes you already have an audience to work with. This course starts at zero: how recommendation systems actually decide what to show new accounts, what retention and engagement really mean for growth, how to build a small but real community, and a repeatable process for diagnosing why a piece of content didn't grow instead of guessing.",
    categorySlug: "creator-economy",
    instructorName: "Priya Nakamura",
    instructorBio:
      "Priya spent six years on platform creator-partnerships teams before coaching creators full time on positioning and growth strategy.",
    price: 79,
    level: "BEGINNER",
    durationMinutes: 210,
    lessonCount: 6,
    prerequisites: ["Social Media Foundations for Creators recommended"],
    learningOutcomes: [
      "Explain in plain terms how a recommendation algorithm decides what to surface",
      "Identify the retention and engagement signals that matter most in the first few seconds",
      "Use hashtags, social SEO, collaborations, and trends without chasing every trend",
      "Diagnose why a specific piece of content underperformed using real metrics",
    ],
  }),
  defineCourse({
    title: "Content Creation for Creators",
    slug: "content-creation-for-creators",
    shortDescription:
      "Ideas, hooks, storytelling, filming on a phone, editing, and a workflow that doesn't burn you out.",
    fullDescription:
      "A practical, format-agnostic production course: how to generate content ideas that don't run dry, write hooks that earn the first three seconds, tell a story in under a minute, and film with good lighting and audio using just a phone. The back half covers editing, thumbnails, captions, repurposing one piece of content across formats, and building a content workflow you can actually sustain every week.",
    categorySlug: "creator-economy",
    instructorName: "Jordan Reyes",
    instructorBio:
      "Jordan is a full-time short-form creator and former video editor who has produced content across every major platform.",
    price: 89,
    level: "BEGINNER",
    durationMinutes: 240,
    lessonCount: 6,
    prerequisites: [],
    learningOutcomes: [
      "Generate a running list of content ideas using a repeatable method",
      "Write hooks that earn attention in the first three seconds",
      "Film clear, well-lit, well-audioed video with just a phone",
      "Edit, caption, and repurpose one piece of content across formats efficiently",
    ],
    featured: true,
  }),
  defineCourse({
    title: "Platform Growth Playbooks: TikTok, Instagram, YouTube, and Beyond",
    slug: "platform-growth-playbooks",
    shortDescription:
      "Platform-specific tactics for TikTok, Instagram, Facebook, YouTube, LinkedIn, X, Threads, and Pinterest — plus how they fit together.",
    fullDescription:
      "Every platform rewards slightly different things, but treating each one as a totally separate job burns creators out. This course covers what actually differs on TikTok, Instagram, Facebook, YouTube and YouTube Shorts, LinkedIn, X/Twitter, Threads, and Pinterest — SEO, retention mechanics, formats, and monetization features specific to each — and then how to build one cross-platform content strategy instead of nine disconnected ones.",
    categorySlug: "creator-economy",
    instructorName: "Jordan Reyes",
    instructorBio:
      "Jordan is a full-time short-form creator and former video editor who has produced content across every major platform.",
    price: 149,
    level: "ADVANCED",
    durationMinutes: 270,
    lessonCount: 6,
    prerequisites: ["Growing Your Audience From Zero", "Content Creation for Creators"],
    learningOutcomes: [
      "Apply platform-specific growth tactics for all 8 major social platforms",
      "Choose which platforms deserve primary vs. repurposed effort for your niche",
      "Use platform-native commerce and monetization features (TikTok Shop, Instagram Shopping, YouTube monetization)",
      "Build one cross-platform content strategy instead of treating each platform in isolation",
    ],
  }),
  defineCourse({
    title: "Creator Sales and Conversion",
    slug: "creator-sales-and-conversion",
    shortDescription:
      "Sell without every post feeling like an ad: storytelling, calls to action, social proof, and funnels.",
    fullDescription:
      "Selling as a creator is different from running paid ads. This course covers product storytelling and demonstration that doesn't feel like an advertisement, calls to action that actually get clicked, using social proof credibly, and the conversion fundamentals — landing pages, simple funnels, lead magnets, and email capture — that turn a follower into a customer without a marketing team.",
    categorySlug: "creator-economy",
    instructorName: "Alex Bennett",
    instructorBio:
      "Alex coaches creators on turning an audience into revenue after a decade managing talent and brand partnerships.",
    price: 99,
    level: "INTERMEDIATE",
    durationMinutes: 180,
    lessonCount: 4,
    prerequisites: ["Social Media Foundations for Creators recommended"],
    learningOutcomes: [
      "Demonstrate and tell a story about a product without sounding like an ad",
      "Write calls to action that get clicked without feeling pushy",
      "Use social proof credibly in content",
      "Build a simple funnel from content to lead capture to sale",
    ],
  }),
  defineCourse({
    title: "Social Commerce and Live Selling",
    slug: "social-commerce-and-live-selling",
    shortDescription:
      "TikTok Shop, affiliate products, shoppable content, UGC, and live selling for creators and sellers.",
    fullDescription:
      "A hands-on guide to selling directly through social platforms: researching products worth promoting, creating shoppable content and UGC-style reviews that convert, running a live selling session with confidence, and reading conversion analytics well enough to know which products and formats to scale. Covers creator/seller collaborations and affiliate product strategy alongside direct selling.",
    categorySlug: "creator-economy",
    instructorName: "Alex Bennett",
    instructorBio:
      "Alex coaches creators on turning an audience into revenue after a decade managing talent and brand partnerships.",
    price: 119,
    level: "INTERMEDIATE",
    durationMinutes: 180,
    lessonCount: 4,
    prerequisites: ["Creator Sales and Conversion recommended"],
    learningOutcomes: [
      "Research and select products worth promoting through shoppable content",
      "Create UGC-style product content and reviews that convert",
      "Run a live selling session with a clear structure",
      "Read conversion analytics to decide which products and formats to scale",
    ],
  }),
  defineCourse({
    title: "Creator Business and Monetization",
    slug: "creator-business-and-monetization",
    shortDescription:
      "Affiliate income, brand deals, digital products, memberships, pricing, media kits, and diversifying income.",
    fullDescription:
      "Turning a following into a sustainable business means more than one income stream. This course walks through affiliate marketing, sponsorships and brand deals, UGC services, digital products, courses, memberships, and coaching/consulting as creator income streams, then covers the business fundamentals underneath all of them: pricing your work, building a media kit, negotiating a deal, and deliberately diversifying income so no single platform or partner controls your livelihood.",
    categorySlug: "creator-economy",
    instructorName: "Alex Bennett",
    instructorBio:
      "Alex coaches creators on turning an audience into revenue after a decade managing talent and brand partnerships.",
    price: 179,
    level: "ADVANCED",
    durationMinutes: 270,
    lessonCount: 6,
    prerequisites: ["Creator Sales and Conversion", "Personal Brand for Creators recommended"],
    learningOutcomes: [
      "Evaluate and pursue affiliate marketing, sponsorships, and brand deals as income streams",
      "Package expertise into digital products, memberships, or coaching offers",
      "Build a media kit and set defensible rates for your audience size",
      "Negotiate a brand deal and plan toward diversified, less-fragile income",
    ],
  }),
  defineCourse({
    title: "Personal Brand for Creators",
    slug: "personal-brand-for-creators",
    shortDescription:
      "Positioning, credibility, visual identity, and reputation that make you recognizable in your niche.",
    fullDescription:
      "Your personal brand is what people remember about you after they scroll past everything else. This course covers positioning and credibility-building, developing a consistent visual identity and creator voice, and protecting the trust and reputation that make brand deals, sales, and referrals easier over time — the difference between being one of many accounts in a niche and being the recognizable name in it.",
    categorySlug: "creator-economy",
    instructorName: "Priya Nakamura",
    instructorBio:
      "Priya spent six years on platform creator-partnerships teams before coaching creators full time on positioning and growth strategy.",
    price: 89,
    level: "BEGINNER",
    durationMinutes: 150,
    lessonCount: 4,
    prerequisites: ["Social Media Foundations for Creators recommended"],
    learningOutcomes: [
      "Articulate a credible, specific positioning within your niche",
      "Develop a consistent visual identity and creator voice",
      "Make decisions that protect long-term trust and reputation, not just short-term reach",
      "Identify what would make you the recognizable name in your niche",
    ],
  }),
  defineCourse({
    title: "Creator Mindset and Sustainable Habits",
    slug: "creator-mindset-and-sustainable-habits",
    shortDescription:
      "Confidence on camera, consistency, creativity, and avoiding burnout for the long haul.",
    fullDescription:
      "The skills that keep creators creating. This course covers building confidence speaking on camera, developing the discipline and consistency that compound over months, protecting creativity and productivity without forcing them, handling public criticism without spiraling, and recognizing and avoiding burnout before it forces a break. Built for creators who already know what to post and need to sustain the habit of actually posting it.",
    categorySlug: "creator-economy",
    instructorName: "Jordan Reyes",
    instructorBio:
      "Jordan is a full-time short-form creator and former video editor who has produced content across every major platform.",
    price: 0,
    level: "BEGINNER",
    durationMinutes: 150,
    lessonCount: 4,
    prerequisites: [],
    learningOutcomes: [
      "Use practical techniques to build confidence speaking on camera",
      "Build a consistent posting habit that survives a busy week",
      "Handle public criticism without it derailing your output",
      "Recognize early burnout signs and adjust before they force a break",
    ],
  }),
  defineCourse({
    title: "AI Tools for Creators",
    slug: "ai-tools-for-creators",
    shortDescription:
      "Use AI for ideation, scripts, captions, images, video, audio, translation, and a real content workflow.",
    fullDescription:
      "A practical tour of where AI tools genuinely save creators time: idea generation and research, drafting scripts and captions, generating images and assisting with video and music, translation and dubbing for cross-language reach, and repurposing one piece of content into many. The course ends by building a real AI-assisted content workflow and calendar rather than treating each tool as a one-off trick.",
    categorySlug: "creator-economy",
    instructorName: "Priya Nakamura",
    instructorBio:
      "Priya spent six years on platform creator-partnerships teams before coaching creators full time on positioning and growth strategy.",
    price: 99,
    level: "INTERMEDIATE",
    durationMinutes: 210,
    lessonCount: 6,
    prerequisites: ["Content Creation for Creators recommended"],
    learningOutcomes: [
      "Use AI tools for idea generation, research, and first-draft scripts and captions",
      "Use AI image, video, and audio tools appropriately in a content pipeline",
      "Use AI translation and dubbing to reach audiences in other languages",
      "Build a repeatable AI-assisted content workflow and calendar",
    ],
  }),
  defineCourse({
    title: "Creator Analytics and Data-Driven Growth",
    slug: "creator-analytics-and-data-driven-growth",
    shortDescription:
      "Read impressions, retention, CTR, and conversion well enough to know what to do next.",
    fullDescription:
      "Analytics only help if you know what to do with them. This course explains what impressions, reach, views, retention, and watch time actually measure, how engagement and click-through rate connect to real outcomes, how to estimate revenue per piece of content, and how to run simple experiments so you can tell a genuine winner from noise — instead of reacting to every number that moves.",
    categorySlug: "creator-economy",
    instructorName: "Alex Bennett",
    instructorBio:
      "Alex coaches creators on turning an audience into revenue after a decade managing talent and brand partnerships.",
    price: 99,
    level: "INTERMEDIATE",
    durationMinutes: 150,
    lessonCount: 4,
    prerequisites: ["Growing Your Audience From Zero recommended"],
    learningOutcomes: [
      "Explain what impressions, reach, retention, and watch time each actually measure",
      "Connect engagement and CTR to real downstream outcomes like conversion",
      "Estimate revenue per piece of content for a creator business",
      "Run a simple experiment to tell a real winner from normal variation",
    ],
  }),
  defineCourse({
    title: "Small Business Social Media Playbook",
    slug: "small-business-social-media-playbook",
    shortDescription:
      "Turn social attention into leads and customers for local, ecommerce, and service businesses.",
    fullDescription:
      "Written for the owner, not a marketing department. This course adapts creator-economy tactics for local businesses, ecommerce, service businesses, restaurants, real estate, beauty, and fitness — and for creators selling their own products or services. You'll leave with a plan for consistently turning social media attention into actual leads and customers, sized to a business that can't hire a full content team.",
    categorySlug: "creator-economy",
    instructorName: "Alex Bennett",
    instructorBio:
      "Alex coaches creators on turning an audience into revenue after a decade managing talent and brand partnerships.",
    price: 89,
    level: "BEGINNER",
    durationMinutes: 150,
    lessonCount: 4,
    prerequisites: [],
    learningOutcomes: [
      "Adapt creator-economy content tactics to a local, ecommerce, or service business",
      "Choose the right platform mix for your specific business type",
      "Build content that generates real leads, not just views",
      "Run social media consistently without a dedicated marketing team",
    ],
    featured: true,
  }),
];
