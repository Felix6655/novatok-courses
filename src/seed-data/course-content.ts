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
 * (12 of ~50, spanning 11 categories and BEGINNER/INTERMEDIATE/ADVANCED
 * levels) so the AI Tutor has something substantive to ground answers in.
 * Not every catalog course has content yet — this is a useful working
 * set, not a full content library.
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
];
