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
 * Real learning content for a deliberately small subset of published
 * courses, spanning different categories and levels, so the AI Tutor has
 * something substantive to ground answers in. Not every catalog course
 * has content yet — Sprint 3 is a foundation, not a full content library.
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
];
