export interface LessonSeed {
  slug: string;
  title: string;
  summary: string;
  content: string;
  displayOrder: number;
}

export interface ModuleSeed {
  title: string;
  description: string;
  displayOrder: number;
  lessons: LessonSeed[];
}

export interface CourseContentSeed {
  courseSlug: string;
  modules: ModuleSeed[];
}

/**
 * Real learning content for a representative subset of published courses
 * (32 of ~62, spanning 12 categories and BEGINNER/INTERMEDIATE/ADVANCED
 * levels — most categories now have at least two levels covered) so the
 * AI Tutor, practice generation, and Learning Coach have something
 * substantive to ground answers in. Not every catalog course has content
 * yet — this is a useful working set, not a full content library.
 *
 * All 12 Creator Economy & Social Media courses have full content (60
 * lessons), since Creator Coach's grounding depends on real lesson content
 * existing, not just catalog metadata — see docs/creator-academy.md.
 */
export const courseContentSeeds: CourseContentSeed[] = [
  {
    courseSlug: "javascript-fundamentals",
    modules: [
      {
        title: "JavaScript Basics",
        description: "The core building blocks every JavaScript program is made of.",
        displayOrder: 1,
        lessons: [
          {
            slug: "variables-and-data-types",
            title: "Variables and Data Types",
            summary: "How to declare variables and the basic types JavaScript works with.",
            content:
              "A variable is a named container for a value. In modern JavaScript you declare " +
              "variables with `let` or `const`, not `var`. Use `const` by default — it signals " +
              "the binding won't be reassigned — and switch to `let` only when you know the " +
              "value needs to change later.\n\n" +
              "JavaScript has a handful of primitive types: `string` for text, `number` for both " +
              "integers and decimals, `boolean` for true/false, `undefined` for a variable that " +
              "has been declared but not assigned, and `null` for an intentionally empty value. " +
              "Everything else — arrays, functions, and plain objects — is of type `object`.\n\n" +
              "JavaScript is dynamically typed: a variable isn't locked to one type for its " +
              "lifetime, and the type is determined by whatever value it currently holds. You can " +
              "check a value's type at runtime with the `typeof` operator, e.g. `typeof \"hi\"` " +
              "returns `\"string\"`.",
            displayOrder: 1,
          },
          {
            slug: "functions-and-control-flow",
            title: "Functions and Control Flow",
            summary: "Writing reusable functions and directing program flow with conditionals and loops.",
            content:
              "A function is a reusable block of code. You can declare one with `function name() " +
              "{ ... }`, or write it as an arrow function: `const add = (a, b) => a + b;`. Arrow " +
              "functions are common for short, self-contained operations.\n\n" +
              "Control flow determines which code runs and how many times. `if`/`else` branches " +
              "based on a condition. Loops repeat code: a `for` loop is best when you know how " +
              "many iterations you need (e.g. iterating over an array by index), while a `while` " +
              "loop repeats as long as a condition stays true.\n\n" +
              "A function can return a value with the `return` keyword, which immediately exits " +
              "the function. Functions that don't explicitly return a value return `undefined`.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Working with Data",
        description: "Storing and manipulating collections of values.",
        displayOrder: 2,
        lessons: [
          {
            slug: "arrays-and-objects",
            title: "Arrays and Objects",
            summary: "The two core ways JavaScript groups related data together.",
            content:
              "An array is an ordered list of values, written with square brackets: " +
              "`const colors = [\"red\", \"green\", \"blue\"];`. You access an item by its numeric " +
              "index starting at 0, so `colors[0]` is `\"red\"`. Arrays have built-in methods like " +
              "`.map()`, `.filter()`, and `.forEach()` for transforming or iterating over their " +
              "contents without writing a manual loop.\n\n" +
              "An object stores data as key-value pairs, written with curly braces: " +
              "`const user = { name: \"Ada\", age: 30 };`. You access a value with dot notation " +
              "(`user.name`) or bracket notation (`user[\"name\"]`) — bracket notation is required " +
              "when the key is stored in a variable or isn't a valid identifier.\n\n" +
              "Arrays and objects are often combined: an array of objects (e.g. a list of users) " +
              "is one of the most common data shapes you'll work with in real applications.",
            displayOrder: 1,
          },
          {
            slug: "the-document-object-model",
            title: "The Document Object Model (DOM)",
            summary: "How JavaScript reads and updates what's on a web page.",
            content:
              "The DOM is the browser's in-memory representation of an HTML page as a tree of " +
              "objects. JavaScript can read and change that tree, which is how a page updates " +
              "without a full reload.\n\n" +
              "`document.querySelector(\"selector\")` finds the first element matching a CSS-style " +
              "selector; `document.querySelectorAll(\"selector\")` finds all of them. Once you have " +
              "a reference to an element, you can change its text (`element.textContent = \"...\"`), " +
              "its HTML (`element.innerHTML = \"...\"`), or listen for interaction with " +
              "`element.addEventListener(\"click\", handlerFunction)`.\n\n" +
              "Direct DOM manipulation like this is the foundation that frameworks such as React " +
              "build on top of — they automate this update process, but the underlying browser " +
              "API is the same one you're learning here.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "cybersecurity-fundamentals",
    modules: [
      {
        title: "Core Security Concepts",
        description: "The vocabulary and mental model behind every security decision.",
        displayOrder: 1,
        lessons: [
          {
            slug: "the-cia-triad",
            title: "The CIA Triad",
            summary: "Confidentiality, Integrity, and Availability — the three goals security controls protect.",
            content:
              "The CIA triad is the foundational model for thinking about security goals: " +
              "Confidentiality, Integrity, and Availability.\n\n" +
              "Confidentiality means only authorized people can see the data — enforced through " +
              "access controls and encryption. Integrity means the data hasn't been altered " +
              "improperly, whether by an attacker or an accident — enforced through checksums, " +
              "signatures, and audit logs. Availability means authorized users can actually get to " +
              "the system and data when they need it — threatened by things like denial-of-service " +
              "attacks or hardware failure.\n\n" +
              "Almost every security control you'll learn about maps back to protecting one or " +
              "more of these three properties. When evaluating a new control, it's useful to ask: " +
              "which of the three is this actually protecting, and at what cost to the others?",
            displayOrder: 1,
          },
          {
            slug: "common-attack-types",
            title: "Common Attack Types",
            summary: "Phishing, malware, and social engineering — the attacks you'll encounter most often.",
            content:
              "Most real-world attacks fall into a small number of recognizable categories. " +
              "Phishing uses fake emails or messages to trick someone into giving up credentials " +
              "or clicking a malicious link — it remains one of the most common ways attackers " +
              "get initial access, because it targets people rather than technical flaws.\n\n" +
              "Malware is software designed to harm or exploit a system: viruses that spread by " +
              "attaching to other programs, ransomware that encrypts a victim's files and demands " +
              "payment, and spyware that quietly collects information.\n\n" +
              "Social engineering is the broader category phishing belongs to: manipulating people " +
              "into breaking normal security procedure, whether through urgency, authority, or " +
              "impersonation. Because these attacks target human behavior, technical controls alone " +
              "can't fully prevent them — awareness and process matter just as much.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Building a Security Mindset",
        description: "How defenders actually control who can do what.",
        displayOrder: 2,
        lessons: [
          {
            slug: "authentication-and-access-control",
            title: "Authentication and Access Control",
            summary: "The difference between proving who you are and being allowed to do something.",
            content:
              "Authentication and authorization are related but distinct. Authentication answers " +
              "\"who are you?\" — typically a password, a hardware key, or a biometric check. " +
              "Authorization answers \"what are you allowed to do?\" — which files you can read, " +
              "which actions you can take, once your identity is established.\n\n" +
              "Multi-factor authentication (MFA) strengthens authentication by requiring two or " +
              "more independent proofs: something you know (a password), something you have (a " +
              "phone or hardware key), or something you are (a fingerprint). It significantly " +
              "reduces the impact of a stolen password, since the attacker would also need the " +
              "second factor.\n\n" +
              "The principle of least privilege applies to authorization: give an account only the " +
              "access it actually needs to do its job, not more. This limits how much damage a " +
              "compromised account can do.",
            displayOrder: 1,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "python-for-data-science",
    modules: [
      {
        title: "Python Fundamentals for Data Work",
        description: "The Python basics you'll use in every data script.",
        displayOrder: 1,
        lessons: [
          {
            slug: "python-variables-and-control-flow",
            title: "Variables, Types, and Control Flow in Python",
            summary: "Declaring variables, Python's core types, and writing conditionals and loops.",
            content:
              "In Python you create a variable simply by assigning it: `age = 30`. There's no " +
              "keyword like `let` or `const` — the type is inferred from the value, and Python is " +
              "dynamically typed, so the same name could later hold a different type of value " +
              "(though in practice you should avoid that for readability).\n\n" +
              "Core built-in types include `int` and `float` for numbers, `str` for text, and " +
              "`bool` for True/False. Python uses indentation, not curly braces, to define code " +
              "blocks — this makes `if`/`elif`/`else` and loop bodies visually structured by " +
              "necessity, not just style.\n\n" +
              "A `for` loop in Python typically iterates directly over a collection, e.g. " +
              "`for item in my_list:`, rather than manually indexing — this is idiomatic Python " +
              "and considered more readable than an index-based loop where possible.",
            displayOrder: 1,
          },
          {
            slug: "lists-and-dictionaries",
            title: "Working with Lists and Dictionaries",
            summary: "Python's two most common data structures for grouping values.",
            content:
              "A list is an ordered, mutable collection: `scores = [85, 92, 78]`. You can add to " +
              "it with `.append(value)`, access an item with `scores[0]`, and get its length with " +
              "`len(scores)`. List comprehensions — e.g. `[x * 2 for x in scores]` — are a concise, " +
              "idiomatic way to transform a list into a new one.\n\n" +
              "A dictionary stores key-value pairs: `student = {\"name\": \"Ada\", \"score\": 92}`. " +
              "You look up a value by its key with `student[\"name\"]`, and check whether a key " +
              "exists with `\"name\" in student`. Dictionaries are the natural fit for representing " +
              "a single record with named fields — much like a row from a table.\n\n" +
              "Real datasets are usually represented as a list of dictionaries (one dict per " +
              "record) before they're loaded into a more specialized structure like a pandas " +
              "DataFrame.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Data Analysis with pandas",
        description: "Loading, exploring, and cleaning real datasets.",
        displayOrder: 2,
        lessons: [
          {
            slug: "loading-and-exploring-data-with-pandas",
            title: "Loading and Exploring Data with pandas",
            summary: "Reading a dataset into a DataFrame and getting a first look at it.",
            content:
              "pandas represents tabular data as a `DataFrame` — think of it as a spreadsheet you " +
              "can manipulate in code. You load a CSV file with `df = pd.read_csv(\"file.csv\")`. " +
              "From there, `df.head()` shows the first few rows, `df.info()` shows column types " +
              "and how many non-null values each column has, and `df.describe()` gives summary " +
              "statistics for numeric columns (mean, min, max, and so on).\n\n" +
              "You select a single column with `df[\"column_name\"]`, which returns a `Series` — " +
              "pandas' one-dimensional equivalent of a DataFrame. You filter rows with a boolean " +
              "condition, e.g. `df[df[\"score\"] > 80]` returns only rows where the score column " +
              "exceeds 80.\n\n" +
              "Getting comfortable with `head()`, `info()`, and `describe()` as your first three " +
              "commands on any new dataset will save you from a lot of downstream mistakes.",
            displayOrder: 1,
          },
          {
            slug: "cleaning-messy-data",
            title: "Cleaning Messy Data",
            summary: "Handling missing values and inconsistent data before analysis.",
            content:
              "Real datasets are rarely clean. `df.isnull().sum()` shows how many missing values " +
              "each column has. You can drop rows with missing values using `df.dropna()`, or fill " +
              "them with a sensible value using `df.fillna(value)` — which approach is correct " +
              "depends on why the data is missing and how much of it there is.\n\n" +
              "Duplicate rows can be found with `df.duplicated()` and removed with " +
              "`df.drop_duplicates()`. Inconsistent text values (e.g. \"NY\", \"ny\", \"New York\" " +
              "all meaning the same thing) usually need explicit standardization, often with " +
              "`.str.lower()` or a mapping dictionary, before you can group or count them " +
              "correctly.\n\n" +
              "A good habit is to check `df.shape` (row and column counts) before and after each " +
              "cleaning step, so you notice immediately if you dropped far more data than " +
              "intended.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "digital-marketing-fundamentals",
    modules: [
      {
        title: "How Digital Channels Fit Together",
        description: "Seeing the marketing landscape as one system instead of separate tactics.",
        displayOrder: 1,
        lessons: [
          {
            slug: "seo-paid-and-organic-overview",
            title: "SEO, Paid, and Organic: An Overview",
            summary: "The three broad channels most digital marketing activity falls into.",
            content:
              "SEO (search engine optimization) is the practice of improving a page so it ranks " +
              "higher in unpaid search results — it's slow to build but keeps working without " +
              "ongoing spend once established. Paid channels (search ads, social ads) buy " +
              "visibility directly and produce results immediately, but stop the moment you stop " +
              "paying. Organic social and content are free to publish but depend on an audience " +
              "already following you or content compelling enough to be shared.\n\n" +
              "These channels aren't competitors so much as different tools for different " +
              "timelines: paid for immediate, measurable demand; SEO for durable, compounding " +
              "traffic; organic content for relationship-building and brand trust.\n\n" +
              "A common early-stage mistake is picking one channel exclusively instead of matching " +
              "the channel to the actual goal — e.g. using only slow-building SEO when the real " +
              "need is next week's revenue, which paid search or social would address faster.",
            displayOrder: 1,
          },
          {
            slug: "understanding-your-target-audience",
            title: "Understanding Your Target Audience",
            summary: "Why every channel decision starts with knowing who you're actually talking to.",
            content:
              "Before choosing a channel or writing copy, you need a specific picture of who " +
              "you're trying to reach: their problem, where they already spend attention, and " +
              "what would make them trust a new brand. A vague audience (\"everyone who might buy " +
              "this\") makes every downstream decision harder, because good messaging and channel " +
              "choice both depend on being specific.\n\n" +
              "A useful exercise is describing one real, specific person you're trying to reach — " +
              "their situation, their hesitation, and the exact words they might search or say " +
              "about their problem. That vocabulary often becomes the backbone of your ad copy and " +
              "SEO keyword targeting.\n\n" +
              "Audience understanding isn't a one-time exercise — it should be revisited as you " +
              "collect real data on who's actually engaging, which is often different from who you " +
              "initially assumed.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Measuring What Matters",
        description: "Reading results without being misled by numbers that look good but mean little.",
        displayOrder: 2,
        lessons: [
          {
            slug: "reading-marketing-analytics",
            title: "Reading Marketing Analytics Without Being Misled",
            summary: "Why vanity metrics like impressions can hide whether marketing is actually working.",
            content:
              "Impressions and follower counts are easy to measure and easy to feel good about, " +
              "but they're \"vanity metrics\" — they don't tell you whether the marketing is " +
              "actually producing outcomes that matter to the business, like leads or sales. A " +
              "campaign with huge reach and no conversions isn't succeeding just because the reach " +
              "number is large.\n\n" +
              "A more useful lens is the funnel: how many people saw it, how many clicked, how " +
              "many took the next meaningful action (signing up, buying), and what each of those " +
              "steps cost. Tracking drop-off between steps tells you exactly where a campaign is " +
              "losing people, which a single top-line number never will.\n\n" +
              "When comparing two campaigns, always ask what specifically is being compared — " +
              "cost per click, cost per conversion, and total conversions can each tell a " +
              "different story about the same two campaigns.",
            displayOrder: 1,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "project-management-fundamentals",
    modules: [
      {
        title: "Scoping and Planning a Project",
        description: "Setting a project up correctly before work begins.",
        displayOrder: 1,
        lessons: [
          {
            slug: "defining-project-scope",
            title: "Defining Project Scope",
            summary: "Writing down what's in and out of a project before work starts, and why it matters.",
            content:
              "Scope is a clear, written description of what a project will and will not deliver. " +
              "Without it, a project drifts as new requests get added informally — a pattern known " +
              "as scope creep, where the project keeps growing without a corresponding adjustment " +
              "to timeline or resources.\n\n" +
              "A good scope statement includes the specific deliverables, the boundaries (what's " +
              "explicitly excluded), and the assumptions the plan depends on. Writing down " +
              "exclusions is just as important as writing down what's included — it gives you " +
              "something concrete to point to when a new request comes in mid-project.\n\n" +
              "Scope should be agreed with stakeholders before planning goes further, since " +
              "timeline and resource estimates that follow are only meaningful if they're built on " +
              "an agreed scope.",
            displayOrder: 1,
          },
          {
            slug: "building-a-realistic-timeline",
            title: "Building a Realistic Timeline",
            summary: "Sequencing work and avoiding the most common estimation mistakes.",
            content:
              "A timeline starts by breaking scope into concrete tasks, then sequencing them based " +
              "on dependencies — some tasks can only start once another finishes. Tasks with no " +
              "slack time between them and the project deadline form the \"critical path\": any " +
              "delay on a critical-path task delays the whole project.\n\n" +
              "A common estimation mistake is using best-case time for every task, which ignores " +
              "the near-certainty that at least some tasks will run long. Building in explicit " +
              "buffer — rather than hoping every estimate is exactly right — produces a more " +
              "honest and more often accurate deadline.\n\n" +
              "Timelines should be treated as living documents: as real progress data comes in, " +
              "re-forecasting the remaining work against actual velocity is more reliable than " +
              "defending the original estimate.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Keeping a Project on Track",
        description: "Communicating progress so problems surface early.",
        displayOrder: 2,
        lessons: [
          {
            slug: "communicating-status-to-stakeholders",
            title: "Communicating Status to Stakeholders",
            summary: "Giving status updates that surface real risk instead of just looking good.",
            content:
              "A useful status update answers three things clearly: what's done, what's at risk, " +
              "and what decision (if any) is needed from the reader. A status update that only " +
              "reports good news trains stakeholders to distrust later bad news, and delays the " +
              "moment a real problem gets the attention it needs.\n\n" +
              "Simple status categories — on track, at risk, blocked — communicate faster than " +
              "long narrative updates, especially to stakeholders who only need the headline. " +
              "Reserve detail for the specific risks or blockers, where it actually helps someone " +
              "make a decision.\n\n" +
              "Raising a risk early, even before it's certain to become a problem, gives " +
              "stakeholders time to help solve it — surfacing it only after it's already caused a " +
              "delay removes that option entirely.",
            displayOrder: 1,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "ai-fundamentals-for-managers",
    modules: [
      {
        title: "Understanding AI Basics",
        description: "What these tools actually do, in plain language.",
        displayOrder: 1,
        lessons: [
          {
            slug: "what-llms-actually-do",
            title: "What Large Language Models Actually Do",
            summary: "A plain-language explanation of how tools like ChatGPT generate responses.",
            content:
              "A large language model predicts the next most likely word given everything written " +
              "so far, based on patterns learned from huge amounts of text. It doesn't \"know\" " +
              "facts the way a database does — it generates plausible-sounding text, which is why " +
              "it can sound confident while still being wrong.\n\n" +
              "This matters practically: these tools are strong at rephrasing, summarizing, " +
              "drafting, and pattern-matching against text you provide, and weaker at precise " +
              "facts, current events, or arithmetic unless you give them the information directly. " +
              "The best results come from providing context, not from asking the model to \"know\" " +
              "something on its own.\n\n" +
              "Understanding this distinction — pattern generation versus fact retrieval — is the " +
              "single most useful mental model for deciding what to trust an AI tool with.",
            displayOrder: 1,
          },
          {
            slug: "where-ai-tools-save-time",
            title: "Where AI Tools Save Real Time",
            summary: "The categories of work where AI assistance reliably helps a team.",
            content:
              "AI tools save the most time on tasks that are repetitive, have a clear input and " +
              "output, and don't require perfect precision on the first try: drafting a first " +
              "version of an email, summarizing a long document, rephrasing something for a " +
              "different audience, or generating variations of an idea to react to.\n\n" +
              "They save less time — or actively cost time — on tasks requiring specialized, " +
              "hard-to-verify knowledge, where checking the AI's work takes as long as doing the " +
              "task yourself. A good early test: pick a task you already know how to do well, try " +
              "it with AI assistance, and honestly compare the total time including your review and " +
              "corrections.\n\n" +
              "Teams that get the most value tend to start with narrow, low-risk, easily-checked " +
              "tasks and expand from there, rather than trying to automate something high-stakes " +
              "on day one.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Evaluating AI for Your Team",
        description: "Judging tools and avoiding common rollout mistakes.",
        displayOrder: 2,
        lessons: [
          {
            slug: "evaluating-ai-vendor-claims",
            title: "A Practical Checklist for AI Vendor Claims",
            summary: "Questions to ask before trusting a vendor's AI feature claims.",
            content:
              "When a vendor claims a feature is \"AI-powered,\" useful questions include: what " +
              "specific task does it perform, what happens when it's wrong, can a human easily " +
              "review and override its output, and what data does it need access to. Vague claims " +
              "like \"powered by advanced AI\" without a concrete task description are a signal to " +
              "ask more questions, not fewer.\n\n" +
              "Ask for a trial on your own real data rather than a vendor demo on their curated " +
              "example — AI features often perform very differently on messy real-world input than " +
              "on a polished demo.\n\n" +
              "Also ask about data handling: where does your data go, is it used to train models " +
              "further, and can you delete it. These questions matter more for AI features than for " +
              "typical software features, since AI tools often process sensitive content directly.",
            displayOrder: 1,
          },
          {
            slug: "common-ai-adoption-mistakes",
            title: "Common AI Adoption Mistakes",
            summary: "The patterns that most often derail a team's first AI rollout.",
            content:
              "A common mistake is starting with a high-stakes, high-visibility task, so a single " +
              "bad output damages trust in the whole initiative before the team has learned how to " +
              "use the tool well. Starting small and low-risk builds both skill and confidence " +
              "before tackling anything important.\n\n" +
              "Another common mistake is skipping training on how to write good prompts and give " +
              "good context, then blaming the tool when results are mediocre — most quality " +
              "problems come from vague instructions, not model limitations.\n\n" +
              "A third is having no review step at all, treating AI output as finished work rather " +
              "than a first draft. The teams that get consistent value keep a human reviewing " +
              "output before it goes anywhere important, at least until they've built real evidence " +
              "the output is reliable for that specific task.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "cloud-computing-foundations",
    modules: [
      {
        title: "Cloud Fundamentals",
        description: "The concepts that apply across every major cloud provider.",
        displayOrder: 1,
        lessons: [
          {
            slug: "shared-responsibility-model",
            title: "The Shared Responsibility Model",
            summary: "Where the cloud provider's security responsibility ends and yours begins.",
            content:
              "Cloud providers secure the underlying infrastructure — physical data centers, host " +
              "hardware, and the virtualization layer. You're responsible for how you configure and " +
              "use the services on top of that: access permissions, network rules, data encryption " +
              "choices, and what you put in publicly accessible storage.\n\n" +
              "This split is called the shared responsibility model, and the exact line moves " +
              "depending on the service type: with raw virtual machines you manage much more " +
              "(operating system patches, firewall rules); with fully managed services the provider " +
              "handles more, and your responsibility narrows mostly to configuration and access " +
              "control.\n\n" +
              "Most cloud security incidents are misconfiguration on the customer's side of this " +
              "line — like an accidentally public storage bucket — not a failure of the provider's " +
              "infrastructure. Understanding where your responsibility starts is the first real " +
              "cloud security skill.",
            displayOrder: 1,
          },
          {
            slug: "compute-storage-and-networking-basics",
            title: "Compute, Storage, and Networking Basics",
            summary: "The three core building blocks every cloud platform offers.",
            content:
              "Compute is processing power — virtual machines, containers, or serverless functions " +
              "that run your code. Storage holds data at rest, ranging from object storage for " +
              "files to managed databases for structured data. Networking connects everything: " +
              "virtual networks, load balancers, and rules controlling what can talk to what.\n\n" +
              "Every cloud architecture is some combination of these three, and most design " +
              "decisions come down to trade-offs within each: how much control versus how much " +
              "management overhead for compute, how durable and how fast for storage, how open " +
              "versus how locked-down for networking.\n\n" +
              "A useful early exercise is mapping a familiar application onto these three " +
              "categories — identifying what's compute, what's storage, and what's networking — " +
              "before worrying about any specific provider's product names for each.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Choosing a Cloud Path",
        description: "Deciding where to specialize next.",
        displayOrder: 2,
        lessons: [
          {
            slug: "comparing-major-cloud-providers",
            title: "Comparing the Major Cloud Providers",
            summary: "How AWS, Azure, and Google Cloud differ in practice, not just in marketing.",
            content:
              "The three major providers cover largely the same core categories — compute, " +
              "storage, networking, managed databases — with different product names and some " +
              "different strengths: AWS has the broadest overall service catalog and market share, " +
              "Azure integrates tightly with Microsoft enterprise tools, and Google Cloud is often " +
              "favored for data analytics and machine learning workloads.\n\n" +
              "For someone starting out, the concepts transfer almost completely between providers " +
              "— a virtual machine works the same way conceptually whether it's called an EC2 " +
              "instance, an Azure VM, or a Compute Engine instance. The provider you learn first " +
              "matters less than actually learning the underlying concepts well.\n\n" +
              "A practical way to choose which to specialize in first: look at job postings in your " +
              "target market, or default to whichever provider your current or target employer " +
              "already uses.",
            displayOrder: 1,
          },
          {
            slug: "when-to-specialize-in-cloud",
            title: "When to Specialize vs. Stay Cloud-Agnostic",
            summary: "Deciding whether to go deep on one provider or stay broadly conceptual.",
            content:
              "Specializing in one provider's certification track (like AWS Solutions Architect) " +
              "gets you job-ready faster for roles that name that provider explicitly, since you " +
              "learn the specific service names, quotas, and console workflows employers expect.\n\n" +
              "Staying more provider-agnostic makes sense if you're building foundational " +
              "architecture skills, working in a role that touches multiple clouds, or aren't yet " +
              "sure which provider your target jobs will use.\n\n" +
              "A reasonable default: learn one provider deeply enough to be productive and " +
              "credentialed, while keeping the underlying concepts (the ones covered in this " +
              "course) generalized in your head so a second provider is a translation exercise, " +
              "not a relearn from scratch.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "sales-fundamentals-cold-call-to-close",
    modules: [
      {
        title: "The Sales Process",
        description: "The core skills every sales conversation depends on.",
        displayOrder: 1,
        lessons: [
          {
            slug: "running-a-discovery-call",
            title: "Running a Structured Discovery Call",
            summary: "Asking questions that uncover a real problem instead of pitching too early.",
            content:
              "A discovery call's job is to understand the prospect's actual situation before " +
              "proposing anything — what problem they're trying to solve, what they've already " +
              "tried, what a good outcome would look like, and what's stopping them from solving it " +
              "already. Pitching before this understanding exists usually produces a generic pitch " +
              "that doesn't land.\n\n" +
              "Open-ended questions (\"What's driving you to look into this now?\") surface more " +
              "useful information than yes/no questions, and following up on vague answers (\"Can " +
              "you say more about that?\") often uncovers the real motivation behind a stated " +
              "problem.\n\n" +
              "A good discovery call ends with a clear, mutually understood next step — not just a " +
              "pleasant conversation. If you can't articulate what happens next, the call wasn't " +
              "fully successful yet.",
            displayOrder: 1,
          },
          {
            slug: "handling-early-objections",
            title: "Handling Early Objections",
            summary: "Responding to common pushback without getting defensive.",
            content:
              "Early objections (\"we're not looking right now,\" \"send me some information\") are " +
              "often not the real reason someone is hesitant — they're a low-effort way to end an " +
              "uncomfortable conversation. Acknowledging the objection genuinely, then asking a " +
              "clarifying question, often uncovers the actual concern underneath.\n\n" +
              "A useful pattern is: acknowledge (\"That makes sense\"), ask (\"Can I ask what's " +
              "driving that timing?\"), then respond to what you actually learn rather than to the " +
              "surface-level objection. Arguing directly against the stated objection usually just " +
              "makes the prospect defend it harder.\n\n" +
              "Staying calm and curious rather than defensive is itself persuasive — prospects " +
              "notice when a rep reacts to pushback with genuine interest instead of a rehearsed " +
              "rebuttal.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Moving Toward a Close",
        description: "Turning a good conversation into forward progress.",
        displayOrder: 2,
        lessons: [
          {
            slug: "qualifying-a-prospect",
            title: "Qualifying a Prospect",
            summary: "Figuring out early whether a prospect is actually a good fit.",
            content:
              "Qualifying means checking, early, whether a prospect has a real problem you solve, " +
              "the authority or influence to make a decision, and a realistic timeline and budget. " +
              "Skipping this and pursuing every lead equally wastes time on deals that were never " +
              "going to close.\n\n" +
              "A simple qualifying framework covers need (do they have the problem), authority (who " +
              "else needs to be involved), and timeline (is this urgent or someday). Missing " +
              "information in any of these areas is a signal to ask more questions, not to assume " +
              "the best case.\n\n" +
              "Qualifying isn't about being dismissive of prospects — it's about being honest with " +
              "both sides early, so you spend real effort on deals that can actually close and give " +
              "an honest \"not yet\" to the ones that can't.",
            displayOrder: 1,
          },
          {
            slug: "moving-a-prospect-to-next-step",
            title: "Moving a Prospect to a Next Step",
            summary: "Ending every sales conversation with a clear, specific commitment.",
            content:
              "Every sales conversation should end with a specific next step — a scheduled follow-up " +
              "call, a demo with named attendees, or a proposal review date — rather than a vague " +
              "\"I'll follow up\" that either side can quietly let slide.\n\n" +
              "Proposing the next step directly (\"Let's get 30 minutes on the calendar next " +
              "Tuesday to walk through pricing\") works better than asking an open-ended \"what " +
              "would you like to do next?\", which puts the burden of structuring the process on " +
              "the prospect.\n\n" +
              "If a prospect resists committing to any next step at all, that's useful information " +
              "in itself — it often means the earlier qualifying or discovery work missed something, " +
              "and it's worth revisiting rather than pushing harder for a commitment that isn't " +
              "there yet.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "stock-market-basics",
    modules: [
      {
        title: "How Markets Work",
        description: "The mechanics behind buying and selling shares.",
        displayOrder: 1,
        lessons: [
          {
            slug: "shares-exchanges-and-order-types",
            title: "Shares, Exchanges, and Order Types",
            summary: "What a share represents and how buy/sell orders actually get filled.",
            content:
              "A share represents partial ownership of a company. Shares trade on exchanges, which " +
              "match buyers and sellers at agreed prices. A market order buys or sells immediately " +
              "at the current best available price; a limit order only executes at a price you " +
              "specify or better, which trades speed of execution for price control.\n\n" +
              "The bid is the highest price a buyer is currently offering, and the ask is the lowest " +
              "price a seller is currently accepting — the gap between them is the spread, which is " +
              "usually small for heavily-traded stocks and wider for thinly-traded ones.\n\n" +
              "Understanding order types matters practically: a market order in a fast-moving or " +
              "illiquid stock can execute at a worse price than expected, which is exactly the " +
              "scenario a limit order protects against, at the cost of the order possibly not " +
              "filling at all.",
            displayOrder: 1,
          },
          {
            slug: "investing-vs-trading",
            title: "Investing vs. Trading",
            summary: "Two different approaches to markets with very different time horizons and risks.",
            content:
              "Investing generally means buying with a multi-year horizon, based on a view of a " +
              "company's or fund's long-term value, and accepting short-term price swings along the " +
              "way. Trading means buying and selling over much shorter horizons — days, hours, or " +
              "less — trying to profit from price movement itself.\n\n" +
              "Trading generally requires more time, more attention, and carries higher risk of " +
              "loss for most individuals, since it competes against professional traders with far " +
              "more information and faster execution. Long-term investing is more forgiving of " +
              "imperfect timing, since it relies less on predicting short-term price movement.\n\n" +
              "Neither approach is inherently right or wrong, but conflating the two — trading with " +
              "money you can't afford to actively manage, or expecting trading-style returns from a " +
              "long-term investing account — is a common source of poor outcomes. Educational only, " +
              "not investment advice.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Getting Started",
        description: "The practical first steps to opening an account.",
        displayOrder: 2,
        lessons: [
          {
            slug: "opening-a-brokerage-account",
            title: "Opening and Using a Brokerage Account",
            summary: "What a brokerage account actually is and how to think about choosing one.",
            content:
              "A brokerage account is the account you use to buy and sell investments; the broker " +
              "routes your orders to exchanges and holds your shares in custody on your behalf. " +
              "Most modern brokers offer commission-free trading on stocks and ETFs, so fees are " +
              "less of a differentiator than they once were.\n\n" +
              "Useful things to compare when choosing a broker include account types offered " +
              "(taxable, retirement), available research and tools, and customer support quality — " +
              "not just marketing claims about being \"the best app.\"\n\n" +
              "Before funding an account with money you plan to invest, it's worth having a basic " +
              "plan for what you're buying and why, rather than opening an account first and " +
              "deciding what to do with it later — the account itself doesn't make investing " +
              "decisions for you. Educational only, not investment advice.",
            displayOrder: 1,
          },
          {
            slug: "reading-a-stock-quote",
            title: "Reading a Basic Stock Quote",
            summary: "Making sense of the price, change, and volume numbers on a stock quote.",
            content:
              "A basic stock quote shows the current price, the change from the previous close (in " +
              "dollars and percent), and trading volume — how many shares have changed hands. A " +
              "large price move on unusually high volume generally signals more significant news or " +
              "sentiment shift than the same move on light volume.\n\n" +
              "The 52-week high and low show the price range over the past year, giving quick " +
              "context for whether the current price is near a historical extreme. Market " +
              "capitalization (share price times shares outstanding) gives a sense of the company's " +
              "overall size.\n\n" +
              "None of these numbers alone tells you whether a stock is a good investment — they're " +
              "descriptive, not evaluative — but being able to read them fluently is a prerequisite " +
              "for the fundamental analysis skills covered in more advanced investing courses. " +
              "Educational only, not investment advice.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "budgeting-and-debt-payoff-fundamentals",
    modules: [
      {
        title: "Building a Budget",
        description: "Creating a budget that actually survives contact with real life.",
        displayOrder: 1,
        lessons: [
          {
            slug: "creating-a-realistic-budget",
            title: "Creating a Budget That Survives Real Life",
            summary: "Why most budgets fail and how to build one that actually holds up.",
            content:
              "Most budgets fail not because people lack discipline, but because the budget didn't " +
              "account for real spending patterns — irregular expenses, occasional splurges, or " +
              "underestimated categories like groceries. A budget built on wishful thinking gets " +
              "abandoned within a month.\n\n" +
              "A more durable approach starts by tracking actual spending for a month before " +
              "building any budget at all, so the categories and amounts reflect reality rather " +
              "than assumptions. From there, a simple structure — needs, wants, savings/debt payoff " +
              "— is easier to maintain than a budget with dozens of narrow categories.\n\n" +
              "Building in a small buffer for the unexpected (a \"miscellaneous\" category with real " +
              "money behind it) prevents a single unplanned expense from blowing up the whole " +
              "budget and triggering the urge to abandon it entirely.",
            displayOrder: 1,
          },
          {
            slug: "tracking-irregular-expenses",
            title: "Tracking Irregular Expenses",
            summary: "Planning for costs that don't happen every month but are still predictable.",
            content:
              "Irregular expenses — car repairs, annual insurance premiums, holiday spending, " +
              "birthdays — are often what breaks an otherwise reasonable monthly budget, because " +
              "they're excluded from month-to-month tracking but still very real and largely " +
              "predictable over a year.\n\n" +
              "A practical fix is estimating the annual total for these categories, dividing by 12, " +
              "and setting that amount aside every month in a separate savings bucket — so when the " +
              "irregular expense actually arrives, the money is already there instead of derailing " +
              "that month's budget.\n\n" +
              "Reviewing the past 12 months of spending (bank and card statements) is the most " +
              "reliable way to find these categories, since people are often surprised by how much " +
              "they actually spend on things that don't happen monthly.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Paying Down Debt",
        description: "Choosing and sticking with a payoff strategy.",
        displayOrder: 2,
        lessons: [
          {
            slug: "avalanche-vs-snowball",
            title: "Avalanche vs. Snowball Payoff Strategies",
            summary: "Two common debt payoff orders and the trade-off between them.",
            content:
              "The avalanche method pays extra toward the highest-interest debt first while making " +
              "minimum payments on the rest — mathematically it minimizes total interest paid. The " +
              "snowball method pays extra toward the smallest balance first, regardless of interest " +
              "rate, prioritizing quick wins to build momentum.\n\n" +
              "Avalanche is objectively cheaper in total interest; snowball is often easier to stick " +
              "with because early wins build motivation to continue, which matters if the biggest " +
              "risk to a payoff plan is abandoning it partway through.\n\n" +
              "The \"best\" method is the one you'll actually follow through on — someone who stays " +
              "motivated by visible progress may pay off debt faster overall with snowball despite " +
              "its higher total interest, simply because they don't quit.",
            displayOrder: 1,
          },
          {
            slug: "building-payoff-momentum",
            title: "Building Momentum with Small Wins",
            summary: "Why visible progress matters as much as the math of a payoff plan.",
            content:
              "A payoff plan that only shows results after a year can feel discouraging even if " +
              "it's mathematically sound, which is part of why people abandon otherwise reasonable " +
              "plans. Breaking a large payoff goal into smaller visible milestones — like paying off " +
              "one specific card — creates a sense of progress that a single large total doesn't.\n\n" +
              "Automating extra payments (rather than deciding manually each month) removes the " +
              "recurring decision point where motivation can fail, and it turns the plan into a " +
              "default rather than something requiring ongoing willpower.\n\n" +
              "Reviewing progress on a fixed schedule — monthly, not daily — gives enough of a " +
              "feedback loop to notice progress without becoming discouraged by short-term noise " +
              "like a single expensive month.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "business-english-foundations",
    modules: [
      {
        title: "Everyday Workplace English",
        description: "The core phrases and habits for daily workplace communication.",
        displayOrder: 1,
        lessons: [
          {
            slug: "introducing-yourself-professionally",
            title: "Introducing Yourself Professionally",
            summary: "Simple, natural ways to introduce yourself and make small talk at work.",
            content:
              "A professional self-introduction usually covers your name, your role, and one " +
              "relevant detail — \"Hi, I'm Noor, I work on the design team\" — without over-explaining. " +
              "Keeping it brief invites the other person to ask follow-up questions rather than " +
              "listening to a long monologue.\n\n" +
              "Common small talk topics in most English-speaking workplaces include the weekend, " +
              "the weather, or a shared work event — safe, low-stakes topics that build rapport " +
              "without requiring deep cultural knowledge. Asking a simple follow-up question " +
              "(\"How was your weekend?\") back is usually appreciated.\n\n" +
              "It's completely normal to ask someone to repeat something or speak more slowly — " +
              "phrases like \"Sorry, could you say that again?\" are professional and used " +
              "constantly by native speakers too, not just language learners.",
            displayOrder: 1,
          },
          {
            slug: "writing-simple-clear-emails",
            title: "Writing Simple, Clear Emails",
            summary: "A basic structure for workplace emails that reads as professional.",
            content:
              "A clear workplace email usually follows a simple structure: a greeting, the main " +
              "point stated early (not buried at the end), any necessary detail, and a clear " +
              "closing that states what you need from the reader, if anything.\n\n" +
              "Short sentences and simple vocabulary read as more professional in a work context " +
              "than complex ones — clarity is valued over impressive-sounding language. Phrases " +
              "like \"I wanted to follow up on...\" or \"Could you please confirm...\" are safe, " +
              "commonly used openings for common email purposes.\n\n" +
              "Reading the email once before sending, specifically checking whether the main " +
              "request is clear within the first two sentences, catches most clarity problems " +
              "before they cause confusion for the reader.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Participating in Meetings",
        description: "Following and joining in on workplace meetings confidently.",
        displayOrder: 2,
        lessons: [
          {
            slug: "common-meeting-phrases",
            title: "Common Meeting Phrases and Etiquette",
            summary: "Useful set phrases for joining, following, and contributing in meetings.",
            content:
              "Meetings have a predictable set of useful phrases: \"Could I add something here?\" to " +
              "join in, \"Sorry, could you repeat that?\" to ask for clarification, and \"I think we " +
              "should focus on...\" to redirect discussion. Learning these as fixed phrases, rather " +
              "than constructing new sentences each time, makes participating much less stressful.\n\n" +
              "It's normal and expected to take a moment before responding to a question in a " +
              "meeting — a brief pause reads as thoughtful, not as a language gap. Taking notes " +
              "during a meeting is also completely normal and gives you a moment to process what " +
              "was said.\n\n" +
              "If you miss part of what was said, asking a specific clarifying question (\"Did you " +
              "mean the deadline is next Friday?\") works better than a vague \"can you explain " +
              "again,\" since it shows you followed most of the conversation.",
            displayOrder: 1,
          },
          {
            slug: "asking-clarifying-questions",
            title: "Asking Clarifying Questions Politely",
            summary: "Phrases for getting clarity without seeming like you weren't paying attention.",
            content:
              "Asking for clarification is a normal, expected part of workplace communication — " +
              "phrases like \"Just to make sure I understood, are you saying...?\" or \"Could you " +
              "clarify what you mean by...?\" signal genuine engagement rather than confusion.\n\n" +
              "Restating what you heard in your own words before asking your question (\"So if I'm " +
              "following, the plan is X — is that right?\") both confirms your understanding and " +
              "gives the other person an easy way to correct any misunderstanding early.\n\n" +
              "It's better to ask a clarifying question in the moment than to nod along and guess " +
              "later — most colleagues would rather answer a quick question than have work redone " +
              "because of a misunderstanding that went unaddressed.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "advanced-system-design-for-engineers",
    modules: [
      {
        title: "Scalability Fundamentals",
        description: "The core trade-offs behind designing systems that handle real load.",
        displayOrder: 1,
        lessons: [
          {
            slug: "load-balancing-strategies",
            title: "Load Balancing Strategies",
            summary: "How traffic gets distributed across multiple servers, and the trade-offs involved.",
            content:
              "A load balancer distributes incoming requests across multiple backend servers so no " +
              "single server is overwhelmed. Round-robin distributes requests evenly in sequence; " +
              "least-connections routes to whichever server currently has the fewest active " +
              "requests, which handles uneven request durations better.\n\n" +
              "Health checks let a load balancer stop routing traffic to a server that's failing, " +
              "which is essential for graceful degradation — without them, a single failed server " +
              "keeps receiving traffic and failing requests until someone notices manually.\n\n" +
              "Session affinity (\"sticky sessions\"), where a user's requests always go to the same " +
              "server, solves certain stateful application problems but reduces the load balancer's " +
              "flexibility and can create uneven load if some users are far more active than " +
              "others — a classic system design trade-off between simplicity and even distribution.",
            displayOrder: 1,
          },
          {
            slug: "caching-strategies-and-tradeoffs",
            title: "Caching Strategies and Trade-offs",
            summary: "Where to cache, what can go wrong, and how to reason about staleness.",
            content:
              "Caching stores a copy of expensive-to-compute or slow-to-fetch data somewhere faster " +
              "to access, trading some staleness risk for significant latency and load reduction. " +
              "Caches can live at multiple layers: in the browser, at a CDN edge, in an " +
              "application-level cache, or in front of a database.\n\n" +
              "The hardest part of caching isn't storing data — it's invalidation: knowing when " +
              "cached data is stale and needs to be refreshed. Time-based expiration (a fixed TTL) " +
              "is simple but can serve stale data or evict fresh data too early; event-based " +
              "invalidation (explicitly clearing a cache entry when the underlying data changes) is " +
              "more precise but adds complexity.\n\n" +
              "A useful design question for any cache is: what's the actual cost of serving slightly " +
              "stale data here, and is that cost lower than the cost of the extra load without a " +
              "cache? Not every piece of data needs — or should have — a cache in front of it.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Data at Scale",
        description: "Designing for data that no longer fits comfortably on one machine.",
        displayOrder: 2,
        lessons: [
          {
            slug: "database-sharding-basics",
            title: "Database Sharding Basics",
            summary: "Splitting a database across multiple machines and the problems that creates.",
            content:
              "Sharding splits a dataset across multiple database instances, each holding a subset " +
              "of the data, so no single machine needs to store or serve the entire dataset. A " +
              "common approach is hash-based sharding — a shard key (like user ID) is hashed to " +
              "determine which shard a row lives on.\n\n" +
              "Sharding solves a real scale problem but introduces new ones: queries that need data " +
              "from multiple shards become significantly more complex, and resharding (changing the " +
              "number of shards later) is a genuinely hard operational problem, since it means " +
              "moving large amounts of data while the system stays live.\n\n" +
              "Because of this cost, sharding is usually a later-stage decision, adopted once " +
              "simpler scaling approaches (better indexing, read replicas, caching) are exhausted — " +
              "not a default starting architecture, since it trades significant complexity for " +
              "scale that many systems never actually need.",
            displayOrder: 1,
          },
          {
            slug: "consistency-tradeoffs",
            title: "Consistency Trade-offs in Distributed Systems",
            summary: "Why distributed systems often can't guarantee both strong consistency and availability.",
            content:
              "In a distributed system, when a network partition occurs (some nodes can't reach " +
              "others), you generally have to choose between staying available (continuing to serve " +
              "requests, possibly with stale or conflicting data) or staying strongly consistent " +
              "(refusing requests until the partition is resolved). This trade-off is often " +
              "summarized as part of the CAP theorem.\n\n" +
              "Strong consistency means every read reflects the most recent write, which is simpler " +
              "to reason about but can mean rejecting requests during a partition. Eventual " +
              "consistency allows temporarily stale reads in exchange for staying available, which " +
              "is often an acceptable trade-off for data where a few seconds of staleness doesn't " +
              "matter (like a \"likes\" counter) but not for data where it does (like an account " +
              "balance).\n\n" +
              "Choosing the right consistency model isn't about picking the \"best\" one in the " +
              "abstract — it's about matching the guarantee to what a specific piece of data " +
              "actually requires.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "full-stack-web-development-with-nextjs",
    modules: [
      {
        title: "Server and Client Together",
        description: "How Next.js blends server and client rendering in one app.",
        displayOrder: 1,
        lessons: [
          {
            slug: "server-components-vs-client-components",
            title: "Server Components vs. Client Components",
            summary: "What runs on the server, what runs in the browser, and why it matters.",
            content:
              "In the Next.js App Router, every component is a Server Component by default: it " +
              "renders on the server, can read directly from a database or file system, and sends " +
              "no JavaScript for itself to the browser. Adding `\"use client\"` at the top of a file " +
              "opts that component (and everything it imports) into rendering in the browser " +
              "instead, which is required for anything interactive — state, effects, event " +
              "handlers.\n\n" +
              "The practical rule of thumb: keep data fetching and static structure in Server " +
              "Components, and push interactivity down into small, focused Client Components at the " +
              "leaves of the tree. A page doesn't need to be a Client Component just because one " +
              "button on it needs an `onClick`.\n\n" +
              "This split is also a performance decision — Server Components ship zero JavaScript to " +
              "the client for the parts of the UI that don't need to be interactive, which directly " +
              "reduces the amount of code the browser has to download and run.",
            displayOrder: 1,
          },
          {
            slug: "data-fetching-with-route-handlers",
            title: "Data Fetching with Route Handlers",
            summary: "Building a small API inside a Next.js app with Route Handlers.",
            content:
              "A Route Handler is a file named `route.ts` inside `app/`, exporting functions named " +
              "after HTTP methods (`GET`, `POST`, etc.). It behaves like a small API endpoint that " +
              "lives inside the same project as your pages, rather than a separate backend " +
              "service.\n\n" +
              "Server Components can fetch data directly (e.g. from a database), but Route Handlers " +
              "are still necessary whenever the browser itself needs to call your backend — for " +
              "example, a client-side form submission via `fetch(\"/api/...\")`, since a Client " +
              "Component can't query a database directly.\n\n" +
              "A common pattern is: the initial page load uses a Server Component to fetch data " +
              "directly for fast first render, while any follow-up interaction (submitting a form, " +
              "refreshing a list) goes through a Route Handler called from the client.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Building Real Features",
        description: "Putting the pieces together into a working full-stack feature.",
        displayOrder: 2,
        lessons: [
          {
            slug: "forms-and-mutations",
            title: "Forms and Mutations",
            summary: "Submitting data from the browser and updating what the user sees afterward.",
            content:
              "A typical mutation flow is: a Client Component form collects input, calls `fetch()` " +
              "against a Route Handler on submit, and then updates the UI once the request " +
              "succeeds — either by refreshing the current route's data or updating local state " +
              "directly.\n\n" +
              "`router.refresh()` (from `next/navigation`) re-runs the Server Components on the " +
              "current page against fresh data without a full page reload and without losing client " +
              "state like scroll position or open modals — a common pattern after a successful " +
              "mutation.\n\n" +
              "Always validate submitted data on the server, inside the Route Handler, even if the " +
              "form already validates it in the browser — client-side validation is a UX " +
              "convenience, not a security boundary, since a request can always be sent directly to " +
              "the endpoint without going through your form.",
            displayOrder: 1,
          },
          {
            slug: "loading-and-error-states",
            title: "Loading and Error States",
            summary: "Giving users useful feedback while data loads or something goes wrong.",
            content:
              "A `loading.tsx` file in a route segment automatically wraps that segment in a React " +
              "Suspense boundary, showing its contents while the segment's data-fetching Server " +
              "Components resolve. This is convenient, but it applies to every nested route under " +
              "that segment too — a `loading.tsx` at a parent route can unexpectedly change the " +
              "streaming behavior of child routes beneath it, which is worth checking carefully.\n\n" +
              "An `error.tsx` file catches errors thrown while rendering that segment and its " +
              "children, showing a fallback UI instead of crashing the whole page. It must be a " +
              "Client Component, since error boundaries rely on React features only available in " +
              "the browser.\n\n" +
              "`notFound()` (from `next/navigation`), called from a Server Component, tells Next.js " +
              "to render the nearest `not-found.tsx` and return a real HTTP 404 — the correct way to " +
              "signal \"this specific thing doesn't exist\" rather than just showing empty content.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "prompt-engineering-for-business-teams",
    modules: [
      {
        title: "Writing Prompts That Work",
        description: "The core techniques that make an AI response more useful and consistent.",
        displayOrder: 1,
        lessons: [
          {
            slug: "specificity-and-context",
            title: "Specificity and Context",
            summary: "Why vague prompts get vague answers, and how to fix that.",
            content:
              "A vague prompt like \"write a marketing email\" forces the model to guess at " +
              "audience, tone, length, and goal — and it will guess, confidently, producing " +
              "something generic. Giving the model the context a human writer would actually need " +
              "(who's the audience, what's the goal, what's the tone, how long) produces " +
              "dramatically more usable output on the first try.\n\n" +
              "A useful habit: before writing a prompt, ask \"what would I need to tell a new " +
              "freelancer to get a good result from them?\" — the same context that helps a person " +
              "helps the model, because it narrows down which of many plausible outputs is actually " +
              "wanted.\n\n" +
              "Providing an example of the desired output (\"few-shot\" prompting) is often more " +
              "effective than describing the desired output in the abstract, especially for tasks " +
              "with a specific format or tone that's easier to show than to explain.",
            displayOrder: 1,
          },
          {
            slug: "structuring-multi-step-requests",
            title: "Structuring Multi-Step Requests",
            summary: "Breaking a complex task into steps the model can follow reliably.",
            content:
              "For a task with several distinct steps (research a topic, then outline it, then " +
              "draft it), asking for all of it in one prompt often produces a shallower result than " +
              "asking for one step, reviewing it, then asking for the next. Breaking work into " +
              "stages gives you a chance to correct course before an error compounds through the " +
              "rest of the output.\n\n" +
              "Numbered instructions (\"1. Do X. 2. Then do Y. 3. Finally do Z.\") tend to produce " +
              "more reliable multi-part output than the same instructions written as one flowing " +
              "paragraph, because the structure itself signals that each part needs to be addressed " +
              "separately.\n\n" +
              "For genuinely long or complex outputs, treating the model as a collaborator across " +
              "several turns — draft, feedback, revise — generally beats trying to perfect a single " +
              "giant prompt.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Using AI Responsibly at Work",
        description: "Getting reliable, checkable output for real business tasks.",
        displayOrder: 2,
        lessons: [
          {
            slug: "verifying-factual-output",
            title: "Verifying Factual Output",
            summary: "Why AI-generated facts and numbers need a human check before they're used.",
            content:
              "Language models generate plausible-sounding text, not verified facts — they can " +
              "state incorrect numbers, misattribute quotes, or invent sources with complete " +
              "fluency and confidence. Anything a model states as fact (a statistic, a citation, a " +
              "specific claim about a competitor or regulation) needs independent verification " +
              "before it's used in real business communication.\n\n" +
              "A practical rule: use AI freely for drafting structure, tone, and phrasing, but treat " +
              "any specific factual claim in the output as a placeholder to verify, not a finished " +
              "fact. This is especially important for anything customer-facing, legal, or " +
              "financial.\n\n" +
              "Asking the model to cite where a claim came from doesn't solve this — a model can " +
              "generate a plausible-looking but fabricated citation just as easily as a plausible " +
              "but fabricated fact.",
            displayOrder: 1,
          },
          {
            slug: "handling-sensitive-business-data",
            title: "Handling Sensitive Business Data",
            summary: "What to think about before pasting company information into an AI tool.",
            content:
              "Before pasting customer data, financial figures, or unreleased business plans into " +
              "an AI tool, check what that tool's data-handling policy actually says — some " +
              "providers use submitted input to further train their models by default, which can " +
              "mean sensitive information leaves your control in a way that's hard to undo.\n\n" +
              "A safe default for teams without a clear policy yet: treat any AI tool the same way " +
              "you'd treat an external contractor with no NDA — don't share anything you wouldn't " +
              "be comfortable having outside the company, unless the tool's terms and your " +
              "organization's policy explicitly say otherwise.\n\n" +
              "Redacting or replacing real names, account numbers, and specific figures with " +
              "placeholders before prompting is a simple, effective habit that preserves the " +
              "usefulness of most drafting and analysis tasks without exposing real data.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "network-security-essentials",
    modules: [
      {
        title: "How Networks Actually Work",
        description: "The plumbing that every network attack and defense operates on.",
        displayOrder: 1,
        lessons: [
          {
            slug: "the-tcp-ip-model",
            title: "The TCP/IP Model",
            summary: "The layered model that describes how data actually moves across a network.",
            content:
              "The TCP/IP model describes networking in layers: the link layer (physical " +
              "transmission, e.g. Ethernet/Wi-Fi), the internet layer (IP addressing and routing " +
              "between networks), the transport layer (TCP or UDP, delivering data between specific " +
              "programs), and the application layer (HTTP, DNS, and other protocols applications " +
              "actually speak).\n\n" +
              "TCP establishes a connection (the \"three-way handshake\") and guarantees delivery and " +
              "ordering, which is why it's used for things like web traffic where losing or " +
              "reordering data would break the page. UDP sends data without that overhead or those " +
              "guarantees, trading reliability for speed — used for things like video calls where a " +
              "dropped packet is less costly than the delay of retransmitting it.\n\n" +
              "Understanding which layer a given attack or defense operates at is foundational: a " +
              "firewall rule filtering by port number is operating at the transport layer, while a " +
              "web application firewall inspecting HTTP requests is operating at the application " +
              "layer — very different tools for very different problems.",
            displayOrder: 1,
          },
          {
            slug: "firewalls-and-network-segmentation",
            title: "Firewalls and Network Segmentation",
            summary: "Controlling what traffic is allowed to reach what, and why that limits damage.",
            content:
              "A firewall enforces rules about what network traffic is allowed through, typically " +
              "based on source/destination address, port, and protocol. The safest default posture " +
              "is \"default deny\": block everything, then explicitly allow only the specific traffic " +
              "a system actually needs — rather than allowing everything and trying to block known " +
              "bad traffic.\n\n" +
              "Network segmentation divides a network into smaller zones (e.g. separating employee " +
              "workstations from production servers) so that a compromise in one zone doesn't " +
              "automatically grant access to every other zone. This directly limits the practical " +
              "impact of a single compromised machine.\n\n" +
              "The two ideas work together: firewalls enforce the boundaries that segmentation " +
              "creates. A flat network with no segmentation makes a single successful phishing " +
              "attack against one low-privilege machine a much bigger problem than it needs to " +
              "be.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Common Network Attacks",
        description: "Recognizing the network-level attacks that security operations deal with daily.",
        displayOrder: 2,
        lessons: [
          {
            slug: "man-in-the-middle-attacks",
            title: "Man-in-the-Middle Attacks",
            summary: "How an attacker intercepts traffic between two parties who think they're talking directly.",
            content:
              "A man-in-the-middle (MITM) attack happens when an attacker positions themselves " +
              "between two communicating parties — intercepting, and potentially altering, traffic " +
              "that both sides believe is going directly to each other. On an unsecured public " +
              "Wi-Fi network, this can be as simple as the attacker being on the same network and " +
              "using tools to intercept unencrypted traffic.\n\n" +
              "HTTPS (TLS) is the primary defense: it encrypts traffic between browser and server " +
              "and cryptographically verifies the server's identity via certificates, making a " +
              "successful MITM attack require either a compromised certificate authority or " +
              "tricking the user into ignoring a certificate warning — both far harder than passive " +
              "interception on an unencrypted connection.\n\n" +
              "This is why browsers now visibly warn on plain HTTP sites and why certificate " +
              "warnings should never be routinely dismissed — that warning exists specifically to " +
              "surface exactly this kind of interception attempt.",
            displayOrder: 1,
          },
          {
            slug: "denial-of-service-basics",
            title: "Denial-of-Service Basics",
            summary: "How attackers overwhelm a system's capacity rather than breaking into it.",
            content:
              "A denial-of-service (DoS) attack doesn't try to breach a system — it tries to " +
              "overwhelm its capacity to respond to legitimate requests, whether that's network " +
              "bandwidth, server CPU, or application-level resources like database connections. A " +
              "distributed denial-of-service (DDoS) attack does this from many sources at once, " +
              "making it much harder to block by simply denying one IP address.\n\n" +
              "Common defenses include rate limiting (capping how many requests a single client can " +
              "make in a time window), traffic scrubbing services that filter malicious traffic " +
              "before it reaches your infrastructure, and simply over-provisioning capacity to " +
              "absorb smaller spikes.\n\n" +
              "It's worth noting that DoS-style techniques are only appropriate in explicitly " +
              "authorized security testing — using them against systems you don't own or lack " +
              "written permission to test is illegal in most jurisdictions, distinct from most other " +
              "security research which can be done more safely in isolated lab environments.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "sql-for-data-analysis",
    modules: [
      {
        title: "Getting Data Out",
        description: "The core SQL you need to answer a question with data.",
        displayOrder: 1,
        lessons: [
          {
            slug: "select-where-and-order-by",
            title: "SELECT, WHERE, and ORDER BY",
            summary: "The three clauses that answer most simple data questions.",
            content:
              "`SELECT column1, column2 FROM table` retrieves specific columns from a table; " +
              "`SELECT *` retrieves all columns, which is convenient for exploring but wasteful in " +
              "real queries against wide tables. `WHERE` filters which rows are returned, based on " +
              "a condition — `WHERE status = 'active'` returns only active rows.\n\n" +
              "`ORDER BY column DESC` sorts the result set, descending by default is `ASC` " +
              "(ascending) — useful for questions like \"who are the 10 most recent signups?\" " +
              "combined with `LIMIT 10`.\n\n" +
              "Conditions in `WHERE` can be combined with `AND`/`OR`, and parentheses matter: " +
              "`WHERE status = 'active' AND (plan = 'pro' OR plan = 'business')` means something " +
              "different from the same clause without parentheses, because `AND` binds tighter than " +
              "`OR` by default.",
            displayOrder: 1,
          },
          {
            slug: "joining-tables",
            title: "Joining Tables",
            summary: "Combining rows from two related tables into one result.",
            content:
              "Real data is usually spread across multiple related tables (e.g. `orders` and " +
              "`customers`), and a `JOIN` combines rows from both based on a matching column: " +
              "`SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id`.\n\n" +
              "An `INNER JOIN` (the default for `JOIN`) only returns rows that have a match in both " +
              "tables. A `LEFT JOIN` returns every row from the left table regardless of whether it " +
              "has a match, filling in `NULL` for the right table's columns when there isn't one — " +
              "essential for questions like \"which customers have never placed an order?\"\n\n" +
              "A common mistake is joining on the wrong column and silently getting a technically " +
              "valid but meaningless result (e.g. duplicated rows from a one-to-many relationship) " +
              "— always sanity-check row counts before and after a join against what you'd expect.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Summarizing Data",
        description: "Turning rows into the aggregated answers stakeholders actually ask for.",
        displayOrder: 2,
        lessons: [
          {
            slug: "group-by-and-aggregate-functions",
            title: "GROUP BY and Aggregate Functions",
            summary: "Turning many rows into one summary row per group.",
            content:
              "Aggregate functions like `COUNT()`, `SUM()`, `AVG()`, `MIN()`, and `MAX()` collapse " +
              "many rows into a single value. `GROUP BY` changes that from \"one value for the whole " +
              "table\" to \"one value per group\" — `SELECT category, COUNT(*) FROM products GROUP BY " +
              "category` returns a count for each category.\n\n" +
              "Every column in the `SELECT` list of a grouped query must either be in the `GROUP BY` " +
              "clause or wrapped in an aggregate function — this is the most common error beginners " +
              "hit, and the error message is usually explicit about which column is the problem.\n\n" +
              "`HAVING` filters groups after aggregation (e.g. `HAVING COUNT(*) > 10`), while " +
              "`WHERE` filters rows before aggregation — using `WHERE` when you meant `HAVING` is a " +
              "common source of confusing, silently wrong results.",
            displayOrder: 1,
          },
          {
            slug: "writing-queries-stakeholders-can-trust",
            title: "Writing Queries Stakeholders Can Trust",
            summary: "Habits that catch quiet errors before a wrong number reaches a decision-maker.",
            content:
              "A query can run without error and still return a wrong answer — a bad join " +
              "multiplying rows, a `WHERE` clause silently excluding rows with `NULL`, or a date " +
              "range that's off by one are all common, quiet mistakes. Before sharing a result, " +
              "sanity-check it: does the row count roughly match expectations, does a manual spot " +
              "check of a few rows look right?\n\n" +
              "`NULL` behaves differently than most people expect: `WHERE column != 'value'` will " +
              "silently exclude rows where `column` is `NULL`, because `NULL != 'value'` evaluates " +
              "to unknown, not true. Checking for `NULL` explicitly requires `IS NULL` or `IS NOT " +
              "NULL`, not `=` or `!=`.\n\n" +
              "Writing a query that's easy for someone else to read — clear aliases, consistent " +
              "formatting, a comment explaining a non-obvious filter — pays for itself the first " +
              "time someone questions a number and you need to explain exactly how it was " +
              "calculated.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "seo-that-actually-works",
    modules: [
      {
        title: "How Search Engines Decide Rankings",
        description: "The fundamentals behind why some pages rank and others don't.",
        displayOrder: 1,
        lessons: [
          {
            slug: "search-intent-and-keyword-research",
            title: "Search Intent and Keyword Research",
            summary: "Matching content to what a searcher actually wants, not just the words they typed.",
            content:
              "Search intent is the underlying goal behind a query, and it's usually one of four " +
              "types: informational (\"how does X work\"), navigational (looking for a specific " +
              "site), commercial investigation (comparing options before buying), or transactional " +
              "(ready to buy now). Ranking well requires content that matches the dominant intent " +
              "for a given query — a product page rarely outranks a how-to guide for an " +
              "informational query, no matter how well-optimized the product page is.\n\n" +
              "Keyword research isn't just finding high-volume terms — it's understanding what real " +
              "searchers actually type, including long-tail variations (\"best running shoes for " +
              "flat feet\" vs. just \"running shoes\") that have lower volume individually but are " +
              "often easier to rank for and convert better because the intent is more specific.\n\n" +
              "Looking at what's currently ranking for a target query is one of the most reliable " +
              "signals of intent: if the top results are all comparison listicles, Google's own " +
              "ranking system is telling you that's the format searchers for that query want.",
            displayOrder: 1,
          },
          {
            slug: "on-page-optimization-fundamentals",
            title: "On-Page Optimization Fundamentals",
            summary: "The concrete, page-level elements that help search engines understand content.",
            content:
              "The title tag and meta description don't directly boost rankings much on their own, " +
              "but they heavily influence click-through rate from the results page — a compelling, " +
              "accurate title matters even at the same ranking position. Header tags (`<h1>`, " +
              "`<h2>`...) should reflect the actual structure of the content, both for search " +
              "engines and for readers scanning the page.\n\n" +
              "Internal linking — linking from one page on your site to another relevant page — " +
              "helps search engines discover and understand the relationship between pages, and " +
              "helps distribute ranking authority from well-linked pages to newer ones.\n\n" +
              "Content depth matters more than keyword repetition: modern search engines are good " +
              "at recognizing when a page thoroughly answers a query versus when it's superficially " +
              "stuffed with a keyword — the latter is both a poor user experience and, at this " +
              "point, an outdated and often penalized tactic.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Earning Authority and Measuring Results",
        description: "What happens off your own page, and how to know if any of it is working.",
        displayOrder: 2,
        lessons: [
          {
            slug: "backlinks-and-domain-authority",
            title: "Backlinks and Domain Authority",
            summary: "Why links from other sites still matter, and which ones actually help.",
            content:
              "A backlink is a link from another website to yours, and search engines treat it as a " +
              "signal of trust — roughly, other sites vouching for your content. Not all backlinks " +
              "are equal: a link from a well-established, relevant site carries far more weight than " +
              "a link from a low-quality or unrelated site, and links from clearly spammy sources " +
              "can actively hurt rather than help.\n\n" +
              "Earning backlinks organically usually comes from creating genuinely useful, " +
              "citable content (original research, comprehensive guides, useful tools) that other " +
              "sites want to reference — rather than from directly asking for links, which scales " +
              "poorly and often produces low-quality links.\n\n" +
              "Buying links or participating in obvious link-exchange schemes violates most search " +
              "engines' guidelines and risks a manual penalty that can be far more damaging than the " +
              "ranking benefit those links would have provided.",
            displayOrder: 1,
          },
          {
            slug: "measuring-seo-performance",
            title: "Measuring SEO Performance",
            summary: "The metrics that actually indicate whether SEO work is paying off.",
            content:
              "Ranking position for a single keyword is a weak standalone metric — rankings " +
              "fluctuate constantly and a page can rank #1 for a low-value query while ranking #8 " +
              "for a query that drives far more actual business. Organic traffic and, more " +
              "importantly, organic conversions are the metrics that connect SEO work to real " +
              "outcomes.\n\n" +
              "Search Console-style tools show which queries actually bring traffic to a page, " +
              "which is often surprising — a page frequently ranks well for queries the content " +
              "wasn't explicitly written for, revealing opportunities to expand that content " +
              "further.\n\n" +
              "SEO changes typically take weeks to months to show a measurable ranking impact, since " +
              "search engines need time to re-crawl and re-evaluate a page — this makes SEO a poor " +
              "fit for anyone expecting an immediate before/after comparison, and a much better fit " +
              "for sustained, incremental measurement.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "retirement-planning-fundamentals",
    modules: [
      {
        title: "Retirement Accounts",
        description: "The account types retirement savings actually live in, and why the choice matters.",
        displayOrder: 1,
        lessons: [
          {
            slug: "traditional-vs-roth-accounts",
            title: "Traditional vs. Roth Accounts",
            summary: "The core trade-off between paying taxes now or paying taxes later.",
            content:
              "A traditional retirement account (like a Traditional 401(k) or IRA) is funded with " +
              "pre-tax money — contributions reduce your taxable income now, but withdrawals in " +
              "retirement are taxed as ordinary income. A Roth account is funded with after-tax " +
              "money — no tax deduction now, but qualified withdrawals in retirement are completely " +
              "tax-free, including all the growth.\n\n" +
              "The core question in choosing between them is whether you expect your tax rate to be " +
              "higher now or in retirement: if you expect to be in a lower tax bracket in " +
              "retirement, traditional's upfront deduction is generally more valuable; if you " +
              "expect a similar or higher bracket in retirement, Roth's tax-free withdrawals " +
              "generally win.\n\n" +
              "Since nobody can predict future tax law or their own future income with certainty, " +
              "many financial planners suggest holding a mix of both account types, which gives " +
              "flexibility to manage taxable income in retirement rather than being locked into one " +
              "outcome.",
            displayOrder: 1,
          },
          {
            slug: "employer-matching-and-vesting",
            title: "Employer Matching and Vesting",
            summary: "Free money with strings attached — and why leaving it unclaimed is a real cost.",
            content:
              "An employer 401(k) match — commonly something like \"50% of contributions up to 6% of " +
              "salary\" — is effectively free money added to a retirement account, but only if the " +
              "employee contributes enough to trigger the full match. Not contributing enough to get " +
              "the full match is one of the most commonly cited mistakes in retirement planning, " +
              "since it's a guaranteed return no investment can reliably match.\n\n" +
              "Vesting is the schedule by which an employee gains full ownership of employer " +
              "contributions — a \"3-year cliff\" means the employer's contributions aren't owned by " +
              "the employee at all until 3 years of service, at which point they become 100% owned; " +
              "a \"graded\" schedule vests a percentage each year instead. An employee's own " +
              "contributions are always immediately 100% vested — only the employer's match is ever " +
              "subject to a vesting schedule.\n\n" +
              "Leaving a job before employer contributions are fully vested means forfeiting the " +
              "unvested portion, which is a real, concrete cost worth checking before deciding when " +
              "to leave a role.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Planning for the Long Run",
        description: "Turning savings into a plan for how much you'll actually need.",
        displayOrder: 2,
        lessons: [
          {
            slug: "estimating-how-much-youll-need",
            title: "Estimating How Much You'll Need",
            summary: "Rough rules of thumb for translating current spending into a retirement target.",
            content:
              "A commonly used starting rule of thumb is that retirement savings should replace " +
              "roughly 70-80% of pre-retirement income, since some expenses (commuting, " +
              "work-related costs, retirement contributions themselves) typically go away, while " +
              "others (healthcare) often increase. This is a rough planning heuristic, not a " +
              "precise formula — actual needs vary enormously based on lifestyle and health.\n\n" +
              "The \"4% rule\" is a related heuristic: historically, withdrawing about 4% of a " +
              "portfolio's value in the first year of retirement, then adjusting that dollar amount " +
              "for inflation each year after, had a high (though not guaranteed) probability of not " +
              "running out of money over a 30-year retirement. It's a useful starting point for " +
              "estimating a target portfolio size, not a guarantee.\n\n" +
              "Because these are long-range estimates built on historical averages and assumptions " +
              "about future returns, inflation, and lifespan, revisiting the plan periodically — not " +
              "setting it once and never checking again — is what actually keeps it realistic.",
            displayOrder: 1,
          },
          {
            slug: "asset-allocation-as-you-age",
            title: "Asset Allocation as You Age",
            summary: "Why a retirement portfolio's mix of investments typically shifts over time.",
            content:
              "Asset allocation is the mix of investment types (commonly stocks vs. bonds) in a " +
              "portfolio. Stocks have historically offered higher long-term average returns with " +
              "more short-term volatility; bonds have historically offered lower returns with more " +
              "stability. A young saver with decades until retirement generally has time to ride " +
              "out stock market volatility in exchange for higher expected long-term growth.\n\n" +
              "As retirement gets closer, the standard guidance is to gradually shift the mix toward " +
              "more stable assets, since there's less time to recover from a market downturn right " +
              "before or during retirement, when withdrawals are beginning. Target-date funds " +
              "automate this shift on a schedule tied to an expected retirement year.\n\n" +
              "This isn't a rule to follow blindly regardless of individual circumstances — someone " +
              "with other stable income in retirement (like a pension) may reasonably keep a higher " +
              "stock allocation longer than someone relying entirely on portfolio withdrawals.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "agile-and-scrum-in-practice",
    modules: [
      {
        title: "Scrum Roles and Events",
        description: "The people and recurring meetings that make Scrum run.",
        displayOrder: 1,
        lessons: [
          {
            slug: "scrum-roles-explained",
            title: "Scrum Roles Explained",
            summary: "What the Product Owner, Scrum Master, and Development Team each actually own.",
            content:
              "Scrum defines three roles. The Product Owner owns the product backlog and decides " +
              "what gets built and in what priority order, representing stakeholder and customer " +
              "value. The Scrum Master isn't a manager of the team — they're responsible for the " +
              "process itself, removing blockers and coaching the team on Scrum practices. The " +
              "Development Team is self-organizing and collectively responsible for how the work " +
              "actually gets done.\n\n" +
              "A common dysfunction is a Product Owner who dictates implementation details (which " +
              "belongs to the Development Team) or a Scrum Master who acts as a traditional project " +
              "manager assigning tasks (which undermines the team's self-organization) — both " +
              "collapse the separation of concerns Scrum is built on.\n\n" +
              "These roles are about accountability, not hierarchy: the Product Owner doesn't " +
              "outrank the Development Team, they own a different part of the decision space " +
              "entirely.",
            displayOrder: 1,
          },
          {
            slug: "sprint-planning-and-retrospectives",
            title: "Sprint Planning and Retrospectives",
            summary: "The two events that bookend a sprint and keep the process improving.",
            content:
              "Sprint Planning happens at the start of a sprint: the team selects backlog items to " +
              "commit to for the sprint and breaks them down into a concrete plan. The output is a " +
              "Sprint Goal — a shared understanding of what the sprint is meant to achieve — not " +
              "just a list of tickets.\n\n" +
              "The Sprint Retrospective happens at the end: the team reflects on how the sprint " +
              "actually went (not what was built, but how the team worked) and identifies concrete " +
              "process improvements to try in the next sprint. Skipping retrospectives, or running " +
              "them without ever acting on what comes out of them, is one of the most common ways " +
              "teams end up doing \"Scrum in name only.\"\n\n" +
              "Between these two events sits the Daily Scrum — a short, focused sync for the " +
              "Development Team to coordinate, not a status report to a manager.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Making Agile Work in Practice",
        description: "Applying Agile principles beyond the ceremonies themselves.",
        displayOrder: 2,
        lessons: [
          {
            slug: "writing-good-user-stories",
            title: "Writing Good User Stories",
            summary: "Turning a feature idea into something a team can actually estimate and build.",
            content:
              "A user story is typically written as \"As a [type of user], I want [goal], so that " +
              "[benefit]\" — the format forces clarity about who the work is for and why it " +
              "matters, not just what to build. A story without a clear \"so that\" is often a sign " +
              "the underlying need hasn't actually been thought through.\n\n" +
              "Good stories are commonly evaluated against the INVEST criteria: Independent " +
              "(can be built without depending on other unfinished stories), Negotiable (details can " +
              "be discussed, not a rigid spec), Valuable, Estimable, Small (fits in one sprint), and " +
              "Testable (there's a clear way to know it's done).\n\n" +
              "Acceptance criteria — the specific, testable conditions that define \"done\" for a " +
              "story — should be agreed on before work starts, not decided retroactively after the " +
              "team believes it's finished; deciding them afterward is a common source of scope " +
              "disputes.",
            displayOrder: 1,
          },
          {
            slug: "measuring-team-velocity",
            title: "Measuring Team Velocity",
            summary: "What velocity actually measures, and the ways teams misuse it.",
            content:
              "Velocity is the amount of work (usually measured in story points) a team completes " +
              "per sprint, averaged over recent sprints. Its intended use is forecasting — helping a " +
              "team estimate how much work they can realistically commit to in future sprints, " +
              "based on their own recent history.\n\n" +
              "Velocity is relative to one specific team's own estimation habits, not an absolute " +
              "measure of productivity or a number that can be meaningfully compared across " +
              "different teams — two teams with identical output can have very different velocity " +
              "numbers simply because they size stories differently.\n\n" +
              "Using velocity as a performance target (\"increase velocity by 20% this quarter\") " +
              "reliably backfires: teams respond to that incentive by inflating story point " +
              "estimates rather than actually delivering more, which quietly destroys velocity's " +
              "usefulness as a forecasting tool.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "fundamental-analysis-for-long-term-investors",
    modules: [
      {
        title: "Reading Financial Statements",
        description: "The core numbers fundamental analysis is built on.",
        displayOrder: 1,
        lessons: [
          {
            slug: "the-income-statement-and-balance-sheet",
            title: "The Income Statement and Balance Sheet",
            summary: "What a company earned and what it owns and owes.",
            content:
              "The income statement shows a company's revenue, expenses, and resulting profit over " +
              "a period of time (a quarter or a year) — it answers \"did this company make money, " +
              "and from what?\" Revenue minus cost of goods sold gives gross profit; subtracting " +
              "operating expenses gives operating income; subtracting taxes and interest gives net " +
              "income, the often-quoted \"bottom line.\"\n\n" +
              "The balance sheet is a snapshot at a single point in time of what a company owns " +
              "(assets), owes (liabilities), and the difference between them (shareholders' " +
              "equity) — assets always equal liabilities plus equity, by definition. It answers " +
              "\"what does this company actually have, and how much of it is financed by debt versus " +
              "ownership?\"\n\n" +
              "Reading both together matters: a company can show strong income statement profits " +
              "while carrying balance sheet risk (heavy debt, little cash) that the income statement " +
              "alone wouldn't reveal.",
            displayOrder: 1,
          },
          {
            slug: "cash-flow-and-why-it-matters",
            title: "Cash Flow and Why It Matters",
            summary: "Why reported profit and actual cash in the bank aren't the same thing.",
            content:
              "The cash flow statement tracks actual cash moving in and out of a business, split " +
              "into operating (cash from core business activities), investing (cash spent on or " +
              "received from long-term assets), and financing (cash from debt, equity, or dividends) " +
              "activities. It exists because accounting profit (net income) and actual cash movement " +
              "can diverge significantly.\n\n" +
              "A company can report positive net income while having negative operating cash flow — " +
              "for example, if a large portion of revenue is booked but not yet collected from " +
              "customers. This divergence is one of the more useful things fundamental analysis " +
              "looks for, since a company can be profitable on paper while running low on actual " +
              "cash.\n\n" +
              "Free cash flow (operating cash flow minus capital expenditures) is a commonly used " +
              "measure of how much cash a company generates after maintaining and growing its asset " +
              "base — cash that's actually available for dividends, buybacks, or debt reduction.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Valuing a Company",
        description: "Turning financial statements into a view on whether a stock is fairly priced.",
        displayOrder: 2,
        lessons: [
          {
            slug: "valuation-ratios",
            title: "Valuation Ratios",
            summary: "Simple ratios for comparing how expensive a stock is relative to its fundamentals.",
            content:
              "The price-to-earnings (P/E) ratio — stock price divided by earnings per share — is " +
              "the most commonly cited valuation ratio, roughly answering \"how many years of " +
              "current earnings would it take to pay back the stock price?\" A high P/E can mean a " +
              "stock is overvalued, or it can mean the market expects strong future growth; the " +
              "ratio alone doesn't distinguish between those two explanations.\n\n" +
              "Other common ratios include price-to-book (comparing price to the company's net " +
              "asset value) and price-to-sales (useful for companies with little or no current " +
              "profit, where P/E isn't meaningful). Each ratio has different blind spots — no single " +
              "ratio is a complete picture on its own.\n\n" +
              "Valuation ratios are most meaningful compared against something: the same company's " +
              "own historical range, or similar companies in the same industry — a P/E of 25 might " +
              "be expensive in one industry and cheap in another with structurally higher growth " +
              "expectations.",
            displayOrder: 1,
          },
          {
            slug: "qualitative-factors-in-analysis",
            title: "Qualitative Factors in Analysis",
            summary: "What the numbers alone don't tell you about a business.",
            content:
              "Fundamental analysis isn't only about the numbers — a company's competitive " +
              "advantage (sometimes called an economic \"moat\"), such as brand strength, network " +
              "effects, high switching costs, or proprietary technology, heavily influences whether " +
              "current profitability is likely to persist or erode as competitors respond.\n\n" +
              "Management quality and capital allocation track record matter too: two companies " +
              "with identical current financials can have very different long-term outcomes " +
              "depending on whether management historically reinvests cash well, overpays for " +
              "acquisitions, or returns cash to shareholders sensibly.\n\n" +
              "Industry dynamics — is the overall market growing or shrinking, is it fragmented or " +
              "dominated by a few players, is it being disrupted by new technology — provide context " +
              "that a snapshot of one company's financial statements can't capture on its own, which " +
              "is why long-term fundamental analysis usually looks well beyond a single quarter's " +
              "numbers.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },

  // Creator Economy & Social Media
  {
    courseSlug: "social-media-foundations-for-creators",
    modules: [
      {
        title: "Finding Your Niche and Audience",
        description: "Choosing a niche you can sustain and understanding who you're actually talking to.",
        displayOrder: 1,
        lessons: [
          {
            slug: "choosing-a-niche-that-compounds",
            title: "Choosing a Niche That Compounds",
            summary: "How to pick a niche specific enough to grow in and broad enough to sustain.",
            content:
              "A niche that's too broad (\"lifestyle\") gives the algorithm nothing specific to match you " +
              "against, and a niche that's too narrow runs out of things to say within a few months. The " +
              "sweet spot is a topic specific enough that a clear group of people would recognize " +
              "themselves in it, but broad enough that you could post about it every week for a year " +
              "without repeating yourself.\n\n" +
              "A useful test: can you list 20 different content ideas in this niche in five minutes? If " +
              "you're stuck after three, the niche is probably too narrow. Can a stranger describe who " +
              "your content is for in one sentence after watching two posts? If not, it's probably too " +
              "broad.\n\n" +
              "Niches also compound when they connect to something you can eventually sell — a skill, a " +
              "product, or a service — even if monetization isn't the first goal. Picking a niche with no " +
              "plausible future business model makes the growth-to-income path much harder later.",
            displayOrder: 1,
          },
          {
            slug: "understanding-your-audience",
            title: "Understanding Your Audience",
            summary: "Researching who you're actually trying to reach instead of guessing.",
            content:
              "Before you post, write down who specifically you're making content for: their rough age " +
              "range, what problem or interest brings them to your niche, and what they're already " +
              "watching. \"Everyone\" is not an audience — content made for everyone tends to resonate " +
              "with no one in particular.\n\n" +
              "The fastest real research is studying accounts your future audience already follows: read " +
              "the comments, not just the captions. Comments show you the actual language people use, " +
              "what confuses them, and what they wish existed. That language becomes your hooks and " +
              "captions later.\n\n" +
              "Revisit this profile every few months. As your content performs, your real audience will " +
              "reveal itself through analytics, and it may differ from who you originally imagined — " +
              "that's normal, and it's more useful to serve the audience you actually have than the one " +
              "you pictured on day one.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Creator Identity and Positioning",
        description: "Deciding what you stand for and where you'll show up.",
        displayOrder: 2,
        lessons: [
          {
            slug: "positioning-and-creator-identity",
            title: "Positioning and Creator Identity",
            summary: "Writing a one-paragraph positioning statement that guides every content decision.",
            content:
              "Positioning answers one question: why should someone follow you specifically, instead of " +
              "the dozens of other accounts in your niche? A positioning statement is a short, honest " +
              "answer: \"I help [specific audience] do [specific outcome] through [your specific angle or " +
              "format].\"\n\n" +
              "Your angle can come from expertise, personality, format, or a genuine point of view others " +
              "in the niche don't share. It doesn't need to be original in the abstract — most niches have " +
              "been covered before — it needs to be specifically yours, delivered in a way only you would " +
              "deliver it.\n\n" +
              "Write your positioning statement down and test every piece of content against it: does this " +
              "post reinforce why someone should follow me, or does it dilute it? Occasional off-topic " +
              "posts are fine; a feed with no throughline confuses both viewers and the algorithm.",
            displayOrder: 1,
          },
          {
            slug: "choosing-the-right-platforms",
            title: "Choosing the Right Platforms",
            summary: "Picking where to start based on your format and audience, not just popularity.",
            content:
              "Don't start on every platform at once. Pick one primary platform based on where your " +
              "specific audience already spends time and which content format suits you: short-form video " +
              "(TikTok, Reels, YouTube Shorts) if you're comfortable on camera and can produce quickly, " +
              "long-form video (YouTube) if you can go deeper on a topic, visual/carousel content " +
              "(Instagram, Pinterest) if your niche is highly visual, or text/authority content (LinkedIn, " +
              "X) if your niche is professional or opinion-driven.\n\n" +
              "Master one platform's format and posting rhythm before repurposing to others — spreading " +
              "thin across five platforms from day one usually produces mediocre content everywhere " +
              "instead of good content somewhere.\n\n" +
              "Once your primary platform has real traction, repurposing to a second platform costs far " +
              "less effort than creating original content did the first time, because the ideas and " +
              "hooks that already worked don't need to be reinvented.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Building Your Foundation",
        description: "Content pillars and a profile that converts a viewer into a follower.",
        displayOrder: 3,
        lessons: [
          {
            slug: "content-pillars",
            title: "Content Pillars",
            summary: "Defining 3-5 recurring content themes so you always know what to post.",
            content:
              "Content pillars are the 3-5 recurring themes your content rotates through, so you never " +
              "start from a blank page. For example, a home-cooking creator's pillars might be: quick " +
              "weeknight recipes, kitchen tool reviews, cooking myths debunked, and reader-submitted " +
              "recipe rescues.\n\n" +
              "Good pillars share three qualities: each one alone could sustain months of ideas, each one " +
              "clearly reinforces your positioning, and together they give your audience variety without " +
              "losing the throughline. If a pillar runs dry after a few posts, it's really a single idea, " +
              "not a pillar.\n\n" +
              "Revisit your pillars quarterly using performance data — which pillar consistently gets the " +
              "most watch time or saves? Lean into what's working rather than treating all pillars as " +
              "permanently equal.",
            displayOrder: 1,
          },
          {
            slug: "profile-optimization",
            title: "Profile Optimization",
            summary: "Turning a profile visit into a follow with a clear bio, pinned content, and consistent visuals.",
            content:
              "A viewer decides whether to follow you in the few seconds they spend on your profile after " +
              "watching one piece of content. Your bio should answer, in one glance: who you help and what " +
              "they'll get by following. Avoid vague inspirational phrases that could apply to any " +
              "account.\n\n" +
              "Pin or feature your best 1-3 pieces of content — the ones that best represent your " +
              "positioning and pillars — so a new visitor immediately understands what to expect, instead " +
              "of scrolling through your earliest, roughest posts.\n\n" +
              "Keep your profile photo, name, and visual style consistent across platforms so people who " +
              "find you on one recognize you on another. Small inconsistencies (different name, unrelated " +
              "photo) quietly cost you cross-platform recognition you'd otherwise get for free.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "growing-your-audience-from-zero",
    modules: [
      {
        title: "Organic Growth Fundamentals",
        description: "Starting from zero and understanding how recommendation systems actually work.",
        displayOrder: 1,
        lessons: [
          {
            slug: "growing-from-zero",
            title: "Growing From Zero",
            summary: "What actually matters in the first weeks with no existing audience.",
            content:
              "With zero followers, your existing audience isn't what gets you seen — the recommendation " +
              "system is. Every major platform will test a new post in front of a small sample of people " +
              "who don't already follow you, then expand distribution based on how that sample responds. " +
              "This means a brand-new account can genuinely outperform an established one on a single " +
              "post if the content itself performs well.\n\n" +
              "In the first weeks, prioritize posting consistently over posting perfectly. You need enough " +
              "data points to learn what resonates, and the algorithm needs enough signal about your " +
              "content to know who to show it to. Five mediocre-but-shipped posts teach you more than one " +
              "post agonized over for two weeks.\n\n" +
              "Expect most early posts to underperform — that's normal, not a sign to quit. Watch for any " +
              "single post that clearly outperforms your average; that's the signal worth studying and " +
              "repeating, not the average itself.",
            displayOrder: 1,
          },
          {
            slug: "how-recommendation-algorithms-actually-work",
            title: "How Recommendation Algorithms Actually Work",
            summary: "The behavior signals platforms use to decide what to show more people.",
            content:
              "Despite platform-to-platform differences, recommendation systems generally optimize for the " +
              "same underlying goal: keep people on the app by showing them content they'll actually " +
              "engage with. They do this by testing content with small audience samples and measuring " +
              "behavior signals — watch time and completion rate, re-watches, shares, comments, saves, " +
              "and whether someone visits your profile afterward.\n\n" +
              "Completion rate and watch time tend to carry the most weight because they most directly " +
              "measure genuine interest rather than a quick reflexive tap. A post that holds attention to " +
              "the end, even with fewer likes, often outperforms a post with more likes but a low " +
              "completion rate.\n\n" +
              "None of this is a secret formula to game — it's closer to a straightforward incentive: make " +
              "something people genuinely want to finish watching and act on, and distribution tends to " +
              "follow. Chasing gimmicks that spike one signal while tanking another (e.g. clickbait that " +
              "kills completion rate) usually backfires within a few posts.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Keeping and Engaging Viewers",
        description: "Retention, watch time, and turning viewers into an actual community.",
        displayOrder: 2,
        lessons: [
          {
            slug: "retention-and-watch-time",
            title: "Retention and Watch Time",
            summary: "Where viewers drop off and how to structure content so they don't.",
            content:
              "Retention graphs (available in most platforms' analytics) show exactly where viewers stop " +
              "watching. A steep early drop usually means the hook didn't earn attention; a steady decline " +
              "throughout usually means the middle is slower than the opening promised; a late spike in " +
              "drop-off near the end can mean the payoff didn't match expectations.\n\n" +
              "A simple structure that holds attention: open with the payoff or a specific claim in the " +
              "first two seconds, deliver information at a pace that doesn't waste a second early on, and " +
              "resolve the opening promise by the end. Cutting dead air and restating things you already " +
              "said usually improves retention more than any single editing trick.\n\n" +
              "Review your retention graph on every post, not just your best ones. Patterns across several " +
              "underperforming posts (e.g. consistently losing people at the 5-second mark) are more " +
              "useful diagnostic signal than any single post's result.",
            displayOrder: 1,
          },
          {
            slug: "engagement-and-community-building",
            title: "Engagement and Community Building",
            summary: "Turning passive viewers into an actual community that shows up repeatedly.",
            content:
              "Engagement (comments, replies, shares, saves) matters for two separate reasons: it feeds " +
              "the algorithm's distribution signal, and it builds an actual relationship with the people " +
              "watching. Both matter, but only one of them survives an algorithm change — a real " +
              "community keeps showing up even during a slow growth month.\n\n" +
              "Reply to comments, especially early ones on a new post — comment replies often generate " +
              "more engagement than the original comment, and they signal to both the algorithm and other " +
              "viewers that there's a real person here. Ask a specific question in your caption or content " +
              "occasionally rather than a generic \"comment below.\"\n\n" +
              "Community shows up over months, not days: recurring viewers who comment repeatedly, request " +
              "topics, or reference past posts. Treat those people as your actual core audience — they're " +
              "disproportionately likely to become customers, collaborators, or advocates later.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Compounding Growth",
        description: "Social SEO, trends, collaborations, and fixing content that isn't growing.",
        displayOrder: 3,
        lessons: [
          {
            slug: "social-seo-and-hashtags",
            title: "Social SEO and Hashtags",
            summary: "Making your content discoverable through search, not just the recommendation feed.",
            content:
              "Increasingly, people search social platforms directly the way they'd search a web search " +
              "engine — for reviews, how-tos, and recommendations. Social SEO means using the specific " +
              "words your audience would actually search for in your on-screen text, captions, and spoken " +
              "audio, not just clever wording.\n\n" +
              "Hashtags matter far less than they did years ago on most platforms, but a small number of " +
              "specific, relevant hashtags (rather than broad, oversaturated ones) can still help " +
              "categorize your content correctly. A mix of one broad and two or three specific, niche " +
              "hashtags generally outperforms ten generic ones.\n\n" +
              "Your video's spoken words and on-screen captions are increasingly read and indexed by " +
              "platforms, not just your written caption. Say the specific thing people would search for " +
              "out loud, early in the content, rather than only implying it.",
            displayOrder: 1,
          },
          {
            slug: "trends-collabs-and-diagnosing-stalled-growth",
            title: "Trends, Collaborations, and Diagnosing Stalled Growth",
            summary: "Using trends and collaborations well, and a checklist for content that isn't growing.",
            content:
              "Trends work best when adapted to your niche and positioning, not used as-is — a trending " +
              "sound or format applied with your specific point of view performs better and better builds " +
              "your identity than a generic copy of what everyone else is posting. Skip trends that don't " +
              "connect naturally to your content pillars.\n\n" +
              "Collaborations expose you to another creator's audience, but only work well when the " +
              "audiences genuinely overlap in interest and are roughly similar in size — a huge mismatch " +
              "in following usually benefits only the smaller account, so bigger creators tend to say yes " +
              "less often to lopsided asks.\n\n" +
              "When growth stalls, work through a checklist in order: is the hook earning attention in the " +
              "first two seconds (check retention graph)? Is the content matching what your recent " +
              "best-performing posts had in common? Has your posting consistency actually stayed steady, " +
              "or quietly slipped? Most stalls trace back to one of these three, not a mysterious " +
              "algorithm change.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "content-creation-for-creators",
    modules: [
      {
        title: "Ideas and Hooks",
        description: "Never running out of ideas, and earning the first three seconds.",
        displayOrder: 1,
        lessons: [
          {
            slug: "generating-content-ideas-that-dont-run-out",
            title: "Generating Content Ideas That Don't Run Out",
            summary: "A repeatable method for content ideas instead of waiting for inspiration.",
            content:
              "Relying on inspiration runs out fast. A repeatable idea system works better: keep a running " +
              "note of every question your audience asks in comments and DMs, every mistake or " +
              "misconception you notice in your niche, and every strong opinion you have that others in " +
              "your niche don't say out loud. Each entry is a content idea waiting to be made.\n\n" +
              "A simple template multiplies ideas fast: take one content pillar and run it through several " +
              "formats — a myth-busting version, a beginner-mistakes version, a before/after version, a " +
              "\"things I wish I knew\" version. One pillar can realistically produce dozens of distinct " +
              "pieces of content this way.\n\n" +
              "Batch idea generation separately from filming: spend one sitting per week just writing down " +
              "ideas with no pressure to use them immediately, so filming days start with a ready list " +
              "instead of a blank page.",
            displayOrder: 1,
          },
          {
            slug: "hooks-that-stop-the-scroll",
            title: "Hooks That Stop the Scroll",
            summary: "Writing the first line or shot that earns someone's attention.",
            content:
              "A hook's only job is to earn the next three seconds — it doesn't need to explain everything, " +
              "just make stopping feel worth it. Strong hook patterns include a specific, surprising claim " +
              "(\"I stopped doing X and my results doubled\"), a direct callout of your exact audience " +
              "(\"if you're a new [audience], watch this before you...\"), or starting mid-action instead " +
              "of with a slow setup.\n\n" +
              "Avoid vague hooks that could open any video in your niche (\"let's talk about...\"). " +
              "Specificity is what makes someone feel this particular video is for them, right now, more " +
              "than any other video they could scroll to instead.\n\n" +
              "Write 3-5 different hook options for the same piece of content before filming, and pick the " +
              "one that's most specific and most surprising. The gap between a mediocre hook and a strong " +
              "one is often the single biggest difference between two videos with identical content " +
              "afterward.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Production Basics",
        description: "Storytelling, scripting, and filming well with just a phone.",
        displayOrder: 2,
        lessons: [
          {
            slug: "storytelling-and-scripting",
            title: "Storytelling and Scripting",
            summary: "Structuring a short piece of content so it holds together and pays off.",
            content:
              "Even a 30-second video benefits from basic story structure: a hook that sets up a question " +
              "or promise, a short middle that delivers value or builds tension, and a resolution that " +
              "pays off the opening. Content without this structure tends to feel like a list of facts " +
              "rather than something worth watching to the end.\n\n" +
              "You don't need a word-for-word script for most short-form content — a bullet-point outline " +
              "of the 3-5 beats you need to hit keeps delivery natural while preventing rambling or " +
              "forgetting the point. Save full scripts for content where exact wording matters, like a " +
              "tightly timed comparison or a claim that needs precise phrasing.\n\n" +
              "Cut anything that doesn't serve the hook's promise. A common mistake is including " +
              "interesting-but-tangential information that dilutes the core point — tangents are better " +
              "saved for a separate piece of content than crammed into one that's trying to do too much.",
            displayOrder: 1,
          },
          {
            slug: "filming-lighting-and-audio-on-a-phone",
            title: "Filming, Lighting, and Audio on a Phone",
            summary: "Getting clear video and audio without buying expensive equipment.",
            content:
              "A modern phone camera is good enough for professional-looking content; lighting and audio " +
              "make the biggest visible difference, not camera quality. Face a window or a simple " +
              "affordable ring light rather than having a light source behind you, which silhouettes your " +
              "face and is the single most common beginner mistake.\n\n" +
              "Audio quality affects retention more than most creators expect — viewers tolerate mediocre " +
              "video far more than they tolerate audio they have to strain to understand. A basic clip-on " +
              "or lapel microphone costing under $30 is usually the single best equipment upgrade a new " +
              "creator can make.\n\n" +
              "Keep the camera at eye level rather than shooting up or down, use a simple tripod or stand " +
              "instead of a shaky handheld shot for talking-head content, and film in a quiet space with " +
              "minimal background noise or echo — a closet full of clothes, for example, absorbs echo " +
              "surprisingly well.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Finishing and Scaling Content",
        description: "Editing, captions, repurposing, and a workflow you can actually sustain.",
        displayOrder: 3,
        lessons: [
          {
            slug: "editing-thumbnails-and-captions",
            title: "Editing, Thumbnails, and Captions",
            summary: "Finishing a piece of content so it performs, not just looks polished.",
            content:
              "Edit for pace before you edit for polish: cut dead air, filler words, and any pause longer " +
              "than needed, since pacing affects retention more than visual effects or transitions do. Add " +
              "captions to every video — a large share of viewers watch with sound off, and captions also " +
              "help with social SEO discoverability.\n\n" +
              "For long-form content, a thumbnail's job is to earn a click by being specific and legible at " +
              "a small size — a clear, close-up expression with a few bold words usually outperforms a " +
              "busy, text-heavy design. Test a few options if the platform allows it rather than guessing.\n\n" +
              "Written captions should extend the hook, not just describe the video — a caption that asks " +
              "a question or adds a detail not shown on screen gives people an extra reason to comment or " +
              "read further, both of which help distribution.",
            displayOrder: 1,
          },
          {
            slug: "repurposing-and-an-efficient-content-workflow",
            title: "Repurposing and an Efficient Content Workflow",
            summary: "Turning one piece of content into several, and a weekly system that doesn't burn you out.",
            content:
              "One well-made piece of content can become several: a long-form video can be cut into 3-5 " +
              "short clips, a short video's key point can become a carousel or a text post, and a strong " +
              "hook that worked once can be reused with new supporting content later. Repurposing is not " +
              "cheating — it's using effort you already spent instead of starting from zero every time.\n\n" +
              "A sustainable weekly workflow separates the stages: one session for idea generation, one " +
              "batch-filming session covering several pieces of content at once, and separate time for " +
              "editing and posting. Batching filming in particular reduces the setup/teardown overhead that " +
              "eats time when filming one video per day.\n\n" +
              "Track roughly how long each stage takes you and look for the actual bottleneck — many " +
              "creators assume filming is the slow part when editing or idea generation is really where " +
              "their time disappears. Fixing the real bottleneck does more for sustainability than trying " +
              "to speed up every stage equally.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "platform-growth-playbooks",
    modules: [
      {
        title: "Short-Form Video Platforms",
        description: "TikTok, Instagram Reels, and YouTube Shorts — what's shared and what differs.",
        displayOrder: 1,
        lessons: [
          {
            slug: "tiktok-growth-seo-and-shop",
            title: "TikTok Growth, SEO, and Shop",
            summary: "TikTok-specific growth mechanics, search behavior, LIVE, and TikTok Shop.",
            content:
              "TikTok's recommendation system leans heavily on completion rate and re-watches, and it's " +
              "willing to show a new account's video to a large audience fast if early signals are strong " +
              "— growth can be far less linear here than on platforms with more gradual distribution.\n\n" +
              "TikTok is also increasingly used as a search engine for reviews, tutorials, and " +
              "recommendations, so treating your captions and spoken words as searchable text (TikTok SEO) " +
              "meaningfully affects long-term discoverability, not just the algorithm feed.\n\n" +
              "TikTok LIVE and TikTok Shop are platform-native ways to interact and sell directly without " +
              "sending viewers elsewhere — LIVE rewards consistency and real-time engagement, while Shop " +
              "and creator affiliate programs let you earn from products without holding inventory " +
              "yourself, covered in depth in the Social Commerce course.",
            displayOrder: 1,
          },
          {
            slug: "instagram-reels-stories-and-youtube-shorts",
            title: "Instagram Reels, Stories, and YouTube Shorts",
            summary: "How Reels, Stories, and Shorts differ from TikTok and from each other.",
            content:
              "Instagram Reels rewards similar completion-rate signals to TikTok but tends to favor " +
              "content that also performs well when shared to Stories or sent in DMs — shareability is a " +
              "stronger factor here than on TikTok. Instagram Stories, meanwhile, is a separate " +
              "lower-pressure surface best used for behind-the-scenes content, polls, and direct " +
              "audience interaction rather than polished content.\n\n" +
              "YouTube Shorts benefits from YouTube's broader ecosystem: a strong Short can drive " +
              "subscribers who then watch your long-form content, something TikTok and Reels don't offer " +
              "in the same way. Shorts also tend to have a longer discovery tail than TikTok videos, " +
              "surfacing gradually over weeks rather than mostly in the first 48 hours.\n\n" +
              "Because the three platforms reward slightly different signals, a video's exact hook and " +
              "pacing sometimes needs light adjustment when repurposing between them rather than a direct " +
              "one-to-one repost, though starting from the same core content is still far more efficient " +
              "than creating each from scratch.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Community and Visual Platforms",
        description: "Facebook, YouTube long-form, and Pinterest for community and evergreen discovery.",
        displayOrder: 2,
        lessons: [
          {
            slug: "facebook-pages-groups-and-reels",
            title: "Facebook Pages, Groups, and Reels",
            summary: "Facebook's community tools and where creator monetization fits.",
            content:
              "Facebook's audience skews older and more local than most short-form-first platforms, which " +
              "makes it a strong fit for community-building and local business content specifically. " +
              "Facebook Groups, in particular, offer community depth that few other platforms match — a " +
              "well-run Group can become a durable owned audience less exposed to any single algorithm " +
              "change.\n\n" +
              "Facebook Pages support Reels using much of the same short-form playbook as Instagram and " +
              "TikTok, so repurposing short-form content here is usually straightforward rather than " +
              "requiring a separate strategy.\n\n" +
              "Facebook Marketplace and business-page tools are worth understanding even for a primarily " +
              "content-focused creator, since many small businesses and local service providers reach " +
              "customers here specifically — a subject covered further in the Small Business Social Media " +
              "course.",
            displayOrder: 1,
          },
          {
            slug: "pinterest-and-visual-search",
            title: "Pinterest and Visual Search",
            summary: "Why Pinterest behaves like a search engine, not a social feed.",
            content:
              "Pinterest is fundamentally a visual search and discovery tool, not a social feed — people " +
              "come to Pinterest planning something (a recipe, an outfit, a home project) rather than " +
              "browsing for entertainment. This changes the whole strategy: content needs a clear, " +
              "keyword-rich title and description, since Pinterest's search behaves much like a web " +
              "search engine.\n\n" +
              "Pins have unusually long shelf lives compared to a short-form video's few days of " +
              "relevance — a well-made Pin can keep driving traffic for months or years, making Pinterest " +
              "one of the best platforms for evergreen content and steady referral traffic to a website, " +
              "shop, or blog.\n\n" +
              "Because Pinterest users are often close to a purchase decision already, it's also a strong " +
              "platform for affiliate links and product content when done within the platform's " +
              "guidelines — vertical images with clear, legible text overlays consistently outperform " +
              "generic photos.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Authority and Text Platforms",
        description: "LinkedIn, X/Twitter, and Threads for professional and conversational authority.",
        displayOrder: 3,
        lessons: [
          {
            slug: "linkedin-personal-branding-and-b2b-content",
            title: "LinkedIn Personal Branding and B2B Content",
            summary: "Building professional authority and generating leads on LinkedIn.",
            content:
              "LinkedIn rewards a different kind of content than entertainment-first platforms: " +
              "professional insight, thought leadership, and specific expertise perform better than " +
              "polished production value. A well-argued personal opinion or a concrete case study " +
              "typically outperforms generic career advice everyone has already heard.\n\n" +
              "For B2B-facing creators, LinkedIn's real strength is lead generation through credibility: " +
              "consistent, specific posting builds enough trust that inbound conversations happen " +
              "naturally, often converting better than cold outreach because the prospect already knows " +
              "your thinking before you speak with them.\n\n" +
              "Comment sections on LinkedIn carry unusual weight — thoughtful commenting on other " +
              "creators' and prospects' posts is itself a visibility strategy, not just a courtesy, and " +
              "often drives as much profile traffic as your own posts do when you're starting out.",
            displayOrder: 1,
          },
          {
            slug: "x-twitter-and-threads-for-audience-and-authority",
            title: "X/Twitter and Threads for Audience and Authority",
            summary: "Building authority through writing, threads, and networking.",
            content:
              "X/Twitter rewards clear, specific writing and a consistent point of view over polish — " +
              "threads that build an argument step by step, or a single sharp observation, tend to " +
              "outperform generic updates. Networking directly with other accounts in your niche through " +
              "replies is a meaningfully bigger growth lever here than on most other platforms.\n\n" +
              "Threads (the app) shares Instagram's identity but favors more conversational, in-the-moment " +
              "text content over polished posts — it rewards showing up consistently in a lower-pressure " +
              "way rather than treating every post as a finished piece of content.\n\n" +
              "Both platforms benefit from cross-pollinating with Instagram: audiences you build on Threads " +
              "often overlap heavily with an existing Instagram following, making it one of the lower-cost " +
              "platforms to test if you already have traction on Instagram specifically.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "creator-sales-and-conversion",
    modules: [
      {
        title: "Selling Without Feeling Like an Ad",
        description: "Product storytelling, demonstration, calls to action, and social proof.",
        displayOrder: 1,
        lessons: [
          {
            slug: "product-storytelling-and-demonstration",
            title: "Product Storytelling and Demonstration",
            summary: "Showing a product in use instead of just describing its features.",
            content:
              "The content that sells best usually doesn't look like a traditional ad — it looks like the " +
              "rest of your content, with the product woven into a real moment or problem. Showing a " +
              "product solving a specific, relatable problem earns more trust than listing its features, " +
              "because the viewer can picture themselves using it.\n\n" +
              "A simple structure works well: state the problem you or someone you know had, show the " +
              "product actually being used to solve it, and share the honest result — including a minor " +
              "limitation if there is one. A single honest caveat often increases trust and conversion " +
              "more than a flawless pitch does.\n\n" +
              "Demonstrations that show your own genuine reaction (surprise, relief, satisfaction) tend to " +
              "outperform ones that only show the product's function, because the viewer is responding to " +
              "your authentic reaction as much as to the product itself.",
            displayOrder: 1,
          },
          {
            slug: "calls-to-action-and-social-proof",
            title: "Calls to Action and Social Proof",
            summary: "Asking for the next step clearly, and using proof credibly.",
            content:
              "A call to action should be specific and low-friction: \"link in bio to grab one\" works " +
              "better than a vague \"check it out.\" State exactly what happens next and make that step as " +
              "easy as possible — every additional step between interest and action loses a share of " +
              "people.\n\n" +
              "Social proof (reviews, results, other customers) works best when it's specific and " +
              "verifiable rather than vague — \"this helped me sleep better within a week\" is more " +
              "credible than \"everyone loves this.\" Real customer messages or comments, screenshotted " +
              "with permission, often outperform polished testimonials because they read as unprompted.\n\n" +
              "Avoid overusing urgency or scarcity language that isn't true — claiming a sale ends " +
              "\"tonight only\" repeatedly erodes trust once your audience notices it isn't real, which " +
              "costs more long-term credibility than the short-term conversion bump is worth.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Turning Followers Into Customers",
        description: "Landing pages, funnels, lead magnets, and email capture.",
        displayOrder: 2,
        lessons: [
          {
            slug: "landing-pages-and-funnels",
            title: "Landing Pages and Funnels",
            summary: "A simple path from content to purchase without over-engineering it.",
            content:
              "A funnel is just the path someone takes from seeing your content to becoming a customer. " +
              "For most creators starting out, a simple funnel — content, then a single clear landing " +
              "page, then checkout or booking — outperforms an elaborate multi-step funnel that's harder " +
              "to build and maintain.\n\n" +
              "A landing page should match the promise made in the content that sent someone there: " +
              "mismatched messaging (a playful video linking to a dry, generic page) causes people to " +
              "bounce even when they were genuinely interested a moment earlier. Keep the page focused on " +
              "one offer and one action, not a menu of options.\n\n" +
              "Track where people actually drop off in your funnel, not just your final conversion rate — " +
              "a low click-through from content, versus a low conversion once on the page, point to " +
              "completely different fixes.",
            displayOrder: 1,
          },
          {
            slug: "lead-magnets-and-email-capture",
            title: "Lead Magnets and Email Capture",
            summary: "Building an owned audience you don't lose to an algorithm change.",
            content:
              "A lead magnet is something valuable you give away in exchange for an email address — a " +
              "checklist, template, or short guide directly related to your niche. It solves the biggest " +
              "risk of relying only on social platforms: your follower count belongs to the platform, but " +
              "an email list belongs to you.\n\n" +
              "The best lead magnets solve one specific, immediate problem well rather than trying to " +
              "cover everything — a narrow, genuinely useful resource converts better than a broad one " +
              "that feels like a watered-down course.\n\n" +
              "Once someone joins your list, occasional genuinely useful emails (not just promotions) keep " +
              "the relationship warm. An email list that only ever sells something tends to see rising " +
              "unsubscribe rates and falling open rates over time.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "social-commerce-and-live-selling",
    modules: [
      {
        title: "Shoppable Content",
        description: "TikTok Shop, affiliate products, product research, and UGC/reviews.",
        displayOrder: 1,
        lessons: [
          {
            slug: "tiktok-shop-and-affiliate-products",
            title: "TikTok Shop and Affiliate Products",
            summary: "Selling directly through platform-native commerce and affiliate programs.",
            content:
              "TikTok Shop and similar platform-native commerce features let viewers purchase without " +
              "leaving the app, which meaningfully reduces the friction that a traditional link-out funnel " +
              "carries. This convenience is a large part of why platform-native shopping tends to convert " +
              "better than sending traffic to an external store.\n\n" +
              "As a creator affiliate, you earn a commission promoting products you don't manufacture or " +
              "hold inventory for, which is a lower-risk way to start selling than launching your own " +
              "product. The tradeoff is lower margin per sale and less control over product quality and " +
              "fulfillment, both of which reflect on you if something goes wrong.\n\n" +
              "Look for affiliate or seller collaborations with clear commission structures and a product " +
              "you'd genuinely recommend without the commission — promoting something you don't believe in " +
              "shows in the content's quality and tends to convert poorly regardless of the commission " +
              "rate.",
            displayOrder: 1,
          },
          {
            slug: "product-research-and-ugc-reviews",
            title: "Product Research and UGC/Reviews",
            summary: "Choosing products worth promoting and creating review content that converts.",
            content:
              "Before promoting a product, check its actual review history, return rate if available, and " +
              "whether it fits your audience's real needs and budget — promoting a mismatched or " +
              "low-quality product damages the trust you've built, which is worth more than any single " +
              "commission.\n\n" +
              "UGC-style content (user-generated-content style, even when made by a creator rather than a " +
              "genuine customer) tends to outperform polished ad-style content because it reads as an " +
              "honest, unscripted opinion. A review that includes a genuine downside alongside the upside " +
              "reads as more credible than an unqualified endorsement.\n\n" +
              "Test a product yourself before reviewing it publicly whenever possible. First-hand, specific " +
              "detail (\"the strap loosened after two weeks of running\") is far more convincing and far " +
              "more resistant to viewer skepticism than a generic positive description.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Live Selling and Scaling",
        description: "Running a live selling session and reading analytics to scale winners.",
        displayOrder: 2,
        lessons: [
          {
            slug: "running-a-live-selling-session",
            title: "Running a Live Selling Session",
            summary: "A structure for live selling that keeps viewers watching and buying.",
            content:
              "A live selling session benefits from a loose but real structure: an opening hook explaining " +
              "what's coming, rotating through a handful of products with a genuine demonstration of each, " +
              "and periodic direct calls to action rather than one pitch at the very end. Viewers join and " +
              "leave throughout, so key information needs to repeat, not just appear once.\n\n" +
              "Respond to live comments and questions by name when possible — real-time interaction is " +
              "what differentiates live selling from a pre-recorded video, and it's a major reason live " +
              "sessions often convert better than static content for the same products.\n\n" +
              "Keep energy and pacing up throughout rather than saving all enthusiasm for a single big " +
              "product — a session that drags in the middle loses viewers before they ever see your " +
              "strongest offer.",
            displayOrder: 1,
          },
          {
            slug: "conversion-analytics-and-scaling-winners",
            title: "Conversion Analytics and Scaling Winners",
            summary: "Reading commerce analytics to know which content and products to double down on.",
            content:
              "Track conversion rate (purchases divided by clicks or views), not just total sales, so you " +
              "can tell whether a bigger result came from more attention or genuinely better selling. A " +
              "smaller video with a higher conversion rate often has a more replicable, more valuable " +
              "lesson in it than a viral video with mediocre conversion.\n\n" +
              "When a specific product or content format converts noticeably above your average, treat " +
              "that as a signal to make more content in that same format or category before moving on to " +
              "the next idea — scaling a proven winner is usually more efficient than constantly testing " +
              "new, unproven ideas.\n\n" +
              "Revisit underperforming products honestly: sometimes the content was the problem, and " +
              "sometimes the product itself simply isn't a fit for your audience. Continuing to promote a " +
              "product that consistently underperforms, out of sunk-cost effort, rarely turns around on " +
              "its own.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "creator-business-and-monetization",
    modules: [
      {
        title: "Income Streams",
        description: "Affiliate marketing, sponsorships, and brand deals as creator income.",
        displayOrder: 1,
        lessons: [
          {
            slug: "affiliate-marketing",
            title: "Affiliate Marketing",
            summary: "Earning commission promoting products without holding inventory.",
            content:
              "Affiliate marketing pays a commission when someone purchases through your unique link or " +
              "code, without you needing to manufacture, stock, or ship anything. It's usually the lowest " +
              "barrier-to-entry income stream for a new creator, since most programs only require an " +
              "audience of any size to get started.\n\n" +
              "Commission rates and cookie windows (how long after a click a purchase still counts) vary " +
              "widely between programs — a lower commission rate with strong audience trust and fit " +
              "often earns more overall than a higher rate promoted to a mismatched audience.\n\n" +
              "Disclose affiliate relationships clearly, both because it's typically required and because " +
              "transparency tends to preserve trust better than hiding it — audiences generally accept " +
              "affiliate content well when it's honest and relevant to their interests.",
            displayOrder: 1,
          },
          {
            slug: "sponsorships-and-brand-deals",
            title: "Sponsorships and Brand Deals",
            summary: "Getting paid directly by brands for dedicated content.",
            content:
              "A sponsorship is a direct payment from a brand for content featuring their product or " +
              "message, independent of whether it drives a sale. Rates are typically based on audience " +
              "size, engagement rate, niche relevance, and past sponsored-content performance rather than " +
              "follower count alone.\n\n" +
              "Brands increasingly value creators whose audience closely matches their target customer " +
              "over creators with simply the largest following — a smaller, highly engaged, niche-relevant " +
              "audience can command comparable or better rates than a larger, more generic one.\n\n" +
              "Maintain creative control where possible: sponsored content that still sounds like you, " +
              "rather than reading a brand's script verbatim, both performs better for the brand and " +
              "protects your credibility with your audience — a reputation worth protecting for future " +
              "deals.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Products and Services",
        description: "UGC services, digital products, courses, memberships, and coaching.",
        displayOrder: 2,
        lessons: [
          {
            slug: "ugc-services-and-digital-products",
            title: "UGC Services and Digital Products",
            summary: "Selling content-creation skills directly, and packaging expertise into a product.",
            content:
              "UGC (user-generated-content) services mean creating authentic-style content for brands to " +
              "use in their own ads or feeds, without necessarily posting it on your own account. This is " +
              "a service business built on your production skills rather than your audience size, which " +
              "makes it accessible even to creators with a small following but strong content skills.\n\n" +
              "A digital product packages knowledge you already have — a template, guide, preset pack, or " +
              "similar — into something sold repeatedly with no per-unit production cost after the initial " +
              "work. This makes digital products attractive for income that doesn't scale linearly with " +
              "your time.\n\n" +
              "Start with a narrow, specific digital product solving one real problem your audience already " +
              "asks you about, rather than a broad product trying to cover everything you know — narrow " +
              "products are both faster to create and easier to sell with confidence.",
            displayOrder: 1,
          },
          {
            slug: "courses-memberships-and-coaching",
            title: "Courses, Memberships, and Coaching",
            summary: "Higher-touch offers that trade more of your time for higher per-customer revenue.",
            content:
              "A course teaches a specific transformation over a structured period, typically priced " +
              "higher than a simple digital product because of the depth and structure involved. It's " +
              "usually worth building only once you've validated real demand — through smaller digital " +
              "products or direct audience requests — rather than as a first offer.\n\n" +
              "A membership provides ongoing value (community, resources, updates) for a recurring fee, " +
              "trading a lower individual price for repeatable, more predictable revenue over time — but " +
              "it also requires ongoing effort to keep members engaged and retained.\n\n" +
              "Coaching or consulting trades your direct time for the highest per-hour revenue of these " +
              "options, but it doesn't scale beyond your available hours the way a digital product or " +
              "course can. Many creators use coaching as an early, flexible income stream, then shift " +
              "toward products as demand grows past what their time alone can serve.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Running It Like a Business",
        description: "Pricing, media kits, negotiating, and diversifying income.",
        displayOrder: 3,
        lessons: [
          {
            slug: "pricing-and-media-kits",
            title: "Pricing and Media Kits",
            summary: "Setting defensible rates and presenting your audience professionally.",
            content:
              "Pricing for sponsorships and services is typically driven by engagement rate and audience " +
              "fit more than raw follower count — a smaller, highly engaged audience in a valuable niche " +
              "can reasonably charge more than a larger, less-engaged general audience.\n\n" +
              "A media kit is a short, professional document summarizing your audience size, engagement " +
              "rate, niche, past brand work, and rates. Having one ready — even a simple one-page version " +
              "— makes you look prepared and speeds up deals, since brands often ask for the same " +
              "information repeatedly.\n\n" +
              "Revisit your rates periodically as your audience and results grow, rather than leaving them " +
              "static for years. Undercharging is a common early-creator mistake that's hard to correct " +
              "later once a brand is used to a lower rate from you specifically.",
            displayOrder: 1,
          },
          {
            slug: "negotiating-deals-and-diversifying-income",
            title: "Negotiating Deals and Diversifying Income",
            summary: "Advocating for fair terms and avoiding dependence on one income source.",
            content:
              "Negotiating a brand deal usually means clarifying deliverables (exact number and type of " +
              "posts), usage rights (can the brand reuse your content in their own ads, and for how long), " +
              "and payment terms before agreeing to anything. It's reasonable to counter an initial offer " +
              "— brands often expect some negotiation and build room for it into a first offer.\n\n" +
              "Relying on a single income stream, whether one platform's ad revenue, one brand relationship, " +
              "or one affiliate program, leaves a creator exposed to a single algorithm change, policy " +
              "update, or lost contract. Deliberately building at least two or three income streams reduces " +
              "that fragility significantly.\n\n" +
              "Review your income mix periodically and notice concentration risk — if one source suddenly " +
              "represents the large majority of your income, that's worth addressing before it becomes a " +
              "problem, not after a platform or partner change forces the issue.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "personal-brand-for-creators",
    modules: [
      {
        title: "Positioning and Credibility",
        description: "What makes a creator credible and memorable, on purpose.",
        displayOrder: 1,
        lessons: [
          {
            slug: "positioning-credibility-and-authority",
            title: "Positioning, Credibility, and Authority",
            summary: "Building a reputation for genuinely knowing your subject.",
            content:
              "Credibility is built through consistent, specific demonstration of knowledge over time — " +
              "not a single impressive claim. Showing your work, explaining your reasoning, and " +
              "occasionally being specific about a mistake you made and corrected all build more lasting " +
              "authority than only presenting polished wins.\n\n" +
              "Authority compounds when you consistently occupy the same specific territory rather than " +
              "jumping between unrelated topics — an audience needs to see you speak on the same subject " +
              "repeatedly before they fully trust you as the person to go to for it.\n\n" +
              "Avoid claiming expertise you don't have. Being transparent about what you do and don't know " +
              "— and bringing in others for the parts outside your expertise — builds more durable trust " +
              "than presenting yourself as an authority on everything in your broader space.",
            displayOrder: 1,
          },
          {
            slug: "visual-identity-and-creator-voice",
            title: "Visual Identity and Creator Voice",
            summary: "The consistent look and tone that makes you recognizable at a glance.",
            content:
              "A simple, consistent visual identity — a color palette, font choice, and general editing " +
              "style — helps your content get recognized even before someone reads the caption, especially " +
              "as it's reshared or clipped by others. This doesn't require professional design, just " +
              "consistency over time.\n\n" +
              "Your creator voice is the consistent tone and personality that comes through regardless of " +
              "topic — direct, warm, funny, blunt, whatever genuinely fits you. Voice is what makes similar " +
              "content ideas feel distinctly \"yours\" compared to other creators covering the same " +
              "subject.\n\n" +
              "Avoid copying another creator's voice or aesthetic too closely. It's fine to be inspired by " +
              "what works, but an audience can usually sense when a voice isn't genuine, and it makes you " +
              "harder to tell apart from the person you're emulating.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Trust and Recognition",
        description: "Protecting your reputation and becoming the name people think of first.",
        displayOrder: 2,
        lessons: [
          {
            slug: "reputation-and-trust",
            title: "Reputation and Trust",
            summary: "Protecting the trust that makes everything else easier over time.",
            content:
              "Trust is the asset underneath every other creator-economy outcome — sales, brand deals, " +
              "collaborations, and referrals all move faster and easier with an audience that trusts you. " +
              "It's also slow to build and fast to lose, which makes protecting it worth more than any " +
              "single short-term gain.\n\n" +
              "Handle mistakes directly and quickly rather than ignoring them — a prompt, honest " +
              "acknowledgment of an error (a bad recommendation, an inaccurate claim) tends to preserve " +
              "trust better than silence, which audiences often read as either not noticing or not caring.\n\n" +
              "Be consistent between what you say and what you do publicly. Promoting something you " +
              "privately wouldn't use, or contradicting your own stated values for a payout, is one of the " +
              "fastest ways to damage a personal brand that took years to build.",
            displayOrder: 1,
          },
          {
            slug: "becoming-recognizable-in-your-niche",
            title: "Becoming Recognizable in Your Niche",
            summary: "Moving from one of many accounts to the name people mention first.",
            content:
              "Being recognizable in a niche usually comes from being the clear, consistent answer to a " +
              "specific question — \"who's good for X\" — rather than from being broadly popular. " +
              "Narrowing what you're known for, even if it feels limiting, is often what makes you " +
              "memorable in the first place.\n\n" +
              "Showing up consistently in the same places your niche already gathers — commenting " +
              "thoughtfully on related accounts, participating in niche conversations, occasionally " +
              "collaborating — builds recognition faster than posting alone in isolation and hoping to be " +
              "discovered.\n\n" +
              "Recognition compounds slowly and then noticeably: expect a long period where growth in " +
              "reputation feels invisible, followed by a point where people start referencing you " +
              "unprompted in conversations and comments. That shift is a strong signal your personal " +
              "brand has taken hold.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "creator-mindset-and-sustainable-habits",
    modules: [
      {
        title: "Showing Up",
        description: "Confidence on camera and the discipline to post consistently.",
        displayOrder: 1,
        lessons: [
          {
            slug: "confidence-and-speaking-on-camera",
            title: "Confidence and Speaking on Camera",
            summary: "Practical techniques for feeling less awkward on camera over time.",
            content:
              "Feeling awkward on camera at first is close to universal, not a sign you're not cut out for " +
              "this. Confidence on camera is a skill built through repetition, not a trait some people have " +
              "and others don't — the twentieth video reliably feels easier than the first, regardless of " +
              "how the first one went.\n\n" +
              "A few concrete techniques help: talk to a specific imagined person (a friend, a past version " +
              "of yourself) rather than an abstract audience, film several short takes instead of trying " +
              "to get one perfect take, and watch your own content back specifically to normalize hearing " +
              "and seeing yourself, which many people find uncomfortable at first regardless of how the " +
              "content performs.\n\n" +
              "Your first videos are very unlikely to represent your ceiling. Most creators look back on " +
              "early content with some embarrassment — that's a sign of growth, not evidence you started " +
              "poorly in some unusual way.",
            displayOrder: 1,
          },
          {
            slug: "discipline-and-consistency",
            title: "Discipline and Consistency",
            summary: "Building a posting habit that survives a busy or unmotivated week.",
            content:
              "Consistency beats intensity for almost every creator outcome — steady, moderate output over " +
              "months compounds more reliably than sporadic bursts of high effort followed by long gaps. " +
              "Platforms and audiences both respond better to a predictable rhythm than to occasional " +
              "spikes.\n\n" +
              "Design your posting schedule around your actual capacity, not an aspirational one. A " +
              "realistic schedule of two posts a week that you sustain for a year outperforms a five-post " +
              "weekly schedule you abandon after three weeks of burnout.\n\n" +
              "Separate motivation from discipline: motivation is unreliable and won't show up every day, " +
              "but a simple system — a set posting day, a pre-written content backlog, a batch-filming " +
              "routine — keeps output steady even on days motivation doesn't show up.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Staying In It",
        description: "Protecting creativity, handling criticism, and avoiding burnout.",
        displayOrder: 2,
        lessons: [
          {
            slug: "creativity-and-productivity",
            title: "Creativity and Productivity",
            summary: "Protecting creative energy while still shipping content reliably.",
            content:
              "Creativity and productivity can work against each other if you let every piece of content " +
              "demand a fully original idea — reusing proven formats with fresh specifics is not a " +
              "creative failure, it's how most sustainable creators actually operate.\n\n" +
              "Give yourself dedicated time for open-ended idea exploration, separate from the pressure of " +
              "an immediate deadline. Ideas generated under deadline pressure alone tend to be more " +
              "derivative than ones given room to develop without immediate output pressure.\n\n" +
              "Protect a small amount of consumption time — watching, reading, or experiencing things " +
              "unrelated to your immediate content needs. Constantly producing without any input eventually " +
              "runs the well dry, even for naturally creative people.",
            displayOrder: 1,
          },
          {
            slug: "handling-criticism-and-avoiding-burnout",
            title: "Handling Criticism and Avoiding Burnout",
            summary: "Processing public feedback and recognizing burnout before it forces a break.",
            content:
              "Public criticism, including some that's unfair or in bad faith, is close to unavoidable once " +
              "content reaches any real audience size. A useful filter: does this specific feedback come " +
              "from someone in your actual target audience, and does it point to something genuinely " +
              "fixable? If not, it's more noise than signal, however loud it feels in the moment.\n\n" +
              "Avoid responding to harsh feedback in the heat of the moment — a short pause before replying " +
              "(or choosing not to reply at all) usually produces a better outcome than an immediate " +
              "defensive response, which can extend a conflict that would otherwise fade on its own.\n\n" +
              "Watch for early burnout signs specifically: dreading filming days you used to enjoy, " +
              "resenting your own audience, or producing content purely from obligation with no interest " +
              "left. Addressing this early — a short planned break, a lighter posting schedule for a few " +
              "weeks — tends to be far less costly than pushing through until a forced, longer stop.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "ai-tools-for-creators",
    modules: [
      {
        title: "AI for Ideas and Content",
        description: "Using AI for ideation, research, scripts, captions, images, video, and audio.",
        displayOrder: 1,
        lessons: [
          {
            slug: "ideation-research-and-scripts",
            title: "Ideation, Research, and Scripts",
            summary: "Using AI assistants to speed up the front end of content creation.",
            content:
              "AI chat assistants are well suited to generating a large volume of content-idea variations " +
              "quickly from a topic or content pillar, which you then filter for what's genuinely relevant " +
              "to your audience — treat AI output as a starting list to edit, not a finished plan to post " +
              "as-is.\n\n" +
              "For research, AI tools can summarize background on a topic quickly, but claims should still " +
              "be verified against a real source before you state them publicly — AI tools can produce " +
              "confident-sounding but inaccurate information, and a factual error in your content costs " +
              "you credibility regardless of where the error came from.\n\n" +
              "For scripts, AI-generated first drafts save time on structure and pacing, but a script " +
              "rewritten in your own voice and specific examples performs meaningfully better than one " +
              "posted close to verbatim — audiences can often sense generic, unedited AI phrasing.",
            displayOrder: 1,
          },
          {
            slug: "captions-images-and-video-with-ai",
            title: "Captions, Images, and Video With AI",
            summary: "Where AI genuinely helps with visual and written content, and where it falls short.",
            content:
              "AI caption tools work well for a fast first draft, especially for platforms that reward " +
              "keyword-rich, searchable captions — but the same edit-don't-post-as-is principle applies, " +
              "since generic AI captions rarely match your specific voice without a pass of editing.\n\n" +
              "AI image generation is useful for thumbnails, graphics, and supporting visuals, particularly " +
              "when you don't have design skills or a budget for one, but disclose AI-generated imagery " +
              "where relevant and be cautious using it for anything that could mislead viewers about a " +
              "real product or result.\n\n" +
              "AI video tools remain more limited for realistic talking-head content, but they're " +
              "genuinely useful for supporting b-roll, simple animations, and editing assistance like " +
              "auto-captioning or removing filler words — treat them as tools within your editing " +
              "workflow rather than a replacement for filming yourself.",
            displayOrder: 2,
          },
          {
            slug: "music-audio-translation-and-dubbing",
            title: "Music, Audio, Translation, and Dubbing",
            summary: "Using AI for royalty-free audio and reaching audiences in other languages.",
            content:
              "AI music and sound-effect tools can generate royalty-free background audio, which avoids " +
              "copyright strikes that come from using popular commercial music without a license — useful " +
              "for platforms or formats where a specific trending sound isn't required.\n\n" +
              "AI translation tools make it realistic for a solo creator to localize captions and " +
              "descriptions into other languages, opening up audience reach that would otherwise require " +
              "hiring a translator for every piece of content.\n\n" +
              "AI dubbing tools can generate a version of your video with your voice speaking another " +
              "language, which is a meaningfully bigger reach opportunity than subtitles alone, though " +
              "quality varies and it's worth spot-checking output with a native speaker before publishing " +
              "broadly, especially for anything culturally sensitive.",
            displayOrder: 3,
          },
        ],
      },
      {
        title: "AI for Workflow",
        description: "Repurposing, analytics, calendars, and building a real AI workflow.",
        displayOrder: 2,
        lessons: [
          {
            slug: "repurposing-content-with-ai",
            title: "Repurposing Content With AI",
            summary: "Using AI to turn one piece of content into several formats faster.",
            content:
              "AI tools can help transcribe a video, identify the strongest clips or quotes, and draft " +
              "adapted captions for a different platform — turning a single long-form piece of content into " +
              "several short-form pieces with far less manual effort than doing it entirely by hand.\n\n" +
              "This works best when you still review and adjust the output for each platform's specific " +
              "norms — a caption or hook style that works on one platform doesn't always translate directly " +
              "to another, even when the underlying content is identical.\n\n" +
              "Repurposing at scale with AI assistance is one of the highest-leverage uses of these tools " +
              "for a solo creator, since it multiplies the output from content you already put real effort " +
              "into filming, rather than replacing that original effort.",
            displayOrder: 1,
          },
          {
            slug: "analytics-calendars-and-product-marketing",
            title: "Analytics, Calendars, and Product Marketing",
            summary: "Using AI to summarize performance data and plan ahead.",
            content:
              "AI tools can help summarize and spot patterns in analytics exports faster than manually " +
              "reviewing every number, which is useful for identifying trends across many posts — but " +
              "verify any conclusion against the underlying numbers before acting on it, since " +
              "summarization can miss context that matters.\n\n" +
              "For content calendars, AI assistants can help draft a month of planned topics from your " +
              "content pillars, which is faster than planning from scratch, though the plan still benefits " +
              "from your own judgment about timing, trends, and what's currently resonating.\n\n" +
              "For product marketing, AI tools can draft product descriptions, ad copy variations, or email " +
              "sequences quickly — useful as a first draft for testing multiple angles, with your own " +
              "editing and brand voice applied before anything goes out publicly.",
            displayOrder: 2,
          },
          {
            slug: "building-an-ai-workflow",
            title: "Building an AI Workflow",
            summary: "Combining individual AI tools into one repeatable content process.",
            content:
              "Individual AI tools save the most time when they're chained into a repeatable workflow " +
              "rather than used ad hoc: idea generation, then a script draft, then a repurposing pass, " +
              "then a captions pass, each with a defined step and a defined amount of your own editing.\n\n" +
              "Document your workflow once it's working — which tool for which step, and what you " +
              "personally always edit rather than accept as-is — so it's repeatable on a bad week without " +
              "reinventing the process each time.\n\n" +
              "Revisit your AI workflow periodically as tools change quickly. A step that was manual six " +
              "months ago may now have a good AI-assisted option, and a tool you relied on may have been " +
              "replaced by something better — treat the workflow as something to maintain, not something " +
              "you set up once and never revisit.",
            displayOrder: 3,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "creator-analytics-and-data-driven-growth",
    modules: [
      {
        title: "Understanding Your Numbers",
        description: "What impressions, reach, views, retention, and engagement actually measure.",
        displayOrder: 1,
        lessons: [
          {
            slug: "impressions-reach-and-views",
            title: "Impressions, Reach, and Views",
            summary: "The difference between how often content was shown and how many people saw it.",
            content:
              "Impressions count every time your content was displayed, including multiple times to the " +
              "same person, while reach counts unique people who saw it at least once. A large gap between " +
              "impressions and reach usually means the same smaller group is seeing your content " +
              "repeatedly, rather than genuinely new distribution.\n\n" +
              "\"Views\" is defined differently across platforms — some count a view after a fraction of a " +
              "second, others require several seconds of watch time — so comparing raw view counts across " +
              "platforms directly is usually misleading without accounting for each platform's specific " +
              "definition.\n\n" +
              "None of these three numbers alone tells you whether content is actually working. They're " +
              "most useful as a baseline to compare against retention and engagement, which get closer to " +
              "measuring genuine interest rather than exposure.",
            displayOrder: 1,
          },
          {
            slug: "retention-watch-time-and-engagement",
            title: "Retention, Watch Time, and Engagement",
            summary: "The metrics that most directly reflect genuine viewer interest.",
            content:
              "Retention (what percentage of viewers stayed to a given point) and watch time (total minutes " +
              "watched, or average duration per view) more directly reflect genuine interest than raw view " +
              "counts, because they require active attention rather than a passive scroll-past.\n\n" +
              "Engagement (likes, comments, shares, saves) matters both as a distribution signal to the " +
              "algorithm and as a rough indicator of emotional response — but different engagement types " +
              "mean different things: a save usually signals \"useful, I want this later,\" while a share " +
              "usually signals \"this represents me\" strongly enough to send to someone else.\n\n" +
              "Look at these metrics together rather than any single one in isolation. High views with low " +
              "retention suggests a strong hook but a weak middle or payoff; low views with strong retention " +
              "suggests distribution, not content quality, is the current bottleneck.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "Acting on Data",
        description: "CTR, conversion, revenue per content, and telling real winners from noise.",
        displayOrder: 2,
        lessons: [
          {
            slug: "ctr-conversion-and-revenue-per-content",
            title: "CTR, Conversion, and Revenue per Content",
            summary: "Connecting engagement metrics to actual business outcomes.",
            content:
              "Click-through rate (CTR) measures how often people who saw a link or call to action actually " +
              "clicked it, while conversion rate measures how many of those clicks became a genuine outcome " +
              "— a sale, sign-up, or booking. A content piece can have strong CTR and weak conversion, which " +
              "usually points to a mismatch between what the content promised and what the landing page or " +
              "offer delivered.\n\n" +
              "Estimating revenue per piece of content — total revenue attributable to a post divided by " +
              "its reach or views — helps compare content types on a more meaningful basis than views alone, " +
              "since a smaller, highly-converting post can outperform a bigger but less relevant one " +
              "financially.\n\n" +
              "Track these numbers over enough content to see a pattern, not just from one post. A single " +
              "high-converting post might be a fluke; a pattern across ten similar posts is a real, " +
              "actionable signal worth building a strategy around.",
            displayOrder: 1,
          },
          {
            slug: "experimentation-and-understanding-winners-and-losers",
            title: "Experimentation and Understanding Winners and Losers",
            summary: "Running simple tests to tell a real winner from normal variation.",
            content:
              "Performance naturally varies between posts even with identical quality and strategy, so a " +
              "single strong or weak result isn't automatically meaningful. Change one variable at a time " +
              "(the hook, the format, the posting time) across several similar posts to get a signal you " +
              "can actually trust, rather than reacting to any single data point.\n\n" +
              "When you find a genuine winner — a format, hook style, or topic that consistently " +
              "outperforms your average across several posts — study specifically what made it different " +
              "from your typical content, and deliberately repeat that element rather than assuming the " +
              "success was random.\n\n" +
              "Equally, review consistent losers honestly: a format that reliably underperforms across " +
              "several attempts is a pattern worth dropping, even if you personally enjoy making that kind " +
              "of content. Data-driven growth means occasionally retiring things that don't work, not just " +
              "adding new things that do.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
  {
    courseSlug: "small-business-social-media-playbook",
    modules: [
      {
        title: "Social Media by Business Type",
        description: "Adapting creator-economy tactics to local, service, and ecommerce businesses.",
        displayOrder: 1,
        lessons: [
          {
            slug: "local-and-service-businesses",
            title: "Local and Service Businesses",
            summary: "Social media tactics for restaurants, real estate, beauty, fitness, and other local services.",
            content:
              "Local and service businesses — restaurants, real estate, beauty, fitness, and similar — " +
              "benefit most from social content that shows real work and real results in your specific " +
              "area: a finished haircut, a listed property walkthrough, a client's actual transformation, " +
              "rather than generic stock-style content that could belong to any similar business anywhere.\n\n" +
              "Location tagging, local hashtags, and content that references your specific neighborhood or " +
              "city help you show up for people actually nearby, which matters far more for a local " +
              "business than broad national reach that can't convert into an in-person customer.\n\n" +
              "Behind-the-scenes content — the process, the space, the people doing the work — tends to " +
              "build trust faster for local service businesses than polished marketing content, because it " +
              "shows the real experience a customer can expect when they show up.",
            displayOrder: 1,
          },
          {
            slug: "ecommerce-and-product-based-businesses",
            title: "Ecommerce and Product-Based Businesses",
            summary: "Social tactics for businesses selling physical or digital products directly.",
            content:
              "Ecommerce and product-based businesses can borrow directly from creator-economy content " +
              "tactics — product demonstrations, UGC-style reviews, and platform-native shopping features " +
              "— often more effectively than traditional product photography and ad copy alone.\n\n" +
              "Customers increasingly expect to see a product in genuine use before purchasing, especially " +
              "for anything with a learning curve or a fit/sizing question. Content that anticipates and " +
              "answers common pre-purchase questions directly reduces both hesitation and return-driven " +
              "customer support requests.\n\n" +
              "For creators selling their own products or services rather than running a traditional " +
              "storefront, the same principles from the Creator Business and Social Commerce courses apply " +
              "directly — the audience-to-customer path doesn't fundamentally change just because the " +
              "seller is a business rather than an individual creator.",
            displayOrder: 2,
          },
        ],
      },
      {
        title: "From Attention to Customers",
        description: "Turning consistent social media presence into real leads.",
        displayOrder: 2,
        lessons: [
          {
            slug: "restaurants-real-estate-beauty-and-fitness",
            title: "Restaurants, Real Estate, Beauty, and Fitness",
            summary: "Specific content angles that work well for these common small-business categories.",
            content:
              "Restaurants tend to perform well with short, appetite-driven content — the dish being made " +
              "or plated — alongside occasional behind-the-scenes kitchen or staff content that builds " +
              "personality beyond just the food itself.\n\n" +
              "Real estate benefits from property walkthroughs with a clear hook (price, standout feature, " +
              "or neighborhood) in the first few seconds, plus local-market education content that " +
              "positions the agent as a knowledgeable resource, not just a listing poster.\n\n" +
              "Beauty and fitness businesses both perform well with transformation and process content — " +
              "showing technique, real client results with permission, and answering the specific questions " +
              "prospective clients already have before they book, which reduces the hesitation that " +
              "prevents a first booking.",
            displayOrder: 1,
          },
          {
            slug: "turning-social-attention-into-leads-and-customers",
            title: "Turning Social Attention Into Leads and Customers",
            summary: "Building a simple, repeatable system from posting to booked customer.",
            content:
              "Attention alone doesn't pay the bills — a small business needs a clear next step for an " +
              "interested viewer: a booking link, a phone number, a simple contact form, or a DM prompt. " +
              "Make that next step obvious in every piece of content, not just occasionally.\n\n" +
              "Respond quickly to comments and messages from genuinely interested prospects — for local and " +
              "service businesses especially, response speed is often a real competitive advantage, since " +
              "many prospective customers will simply message the next business that replies faster.\n\n" +
              "Track roughly how many leads or bookings come from social media specifically, even with a " +
              "simple manual method like asking new customers how they found you. Without this, it's " +
              "difficult to know whether the time spent on content is actually translating into the " +
              "business outcome that justifies it.",
            displayOrder: 2,
          },
        ],
      },
    ],
  },
];
