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
 * (20 of ~50, spanning 11 categories and BEGINNER/INTERMEDIATE/ADVANCED
 * levels — most categories now have at least two levels covered) so the
 * AI Tutor, practice generation, and Learning Coach have something
 * substantive to ground answers in. Not every catalog course has content
 * yet — this is a useful working set, not a full content library.
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
];
