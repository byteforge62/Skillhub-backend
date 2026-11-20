/**
 * Seeds a complete SkillHub demo workspace so the redesigned UI can be
 * reviewed with real data: one instructor account with courses, lessons,
 * progress, upcoming events, communities and posts.
 *
 * Usage: npm run seed:demo
 * Safe to re-run — everything it creates is tagged and replaced.
 */
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/UserModel");
const UserSettings = require("../models/UserSettingsModel");
const Category = require("../models/CategoriesModel");
const Course = require("../models/CoursesModel");
const CourseSection = require("../models/CourseSectionModel");
const Lesson = require("../models/LessonModel");
const Enrollment = require("../models/EnrollmentModel");
const LessonNote = require("../models/LessonNoteModel");
const Event = require("../models/EventsModel");
const Community = require("../models/CommunityModel");
const Post = require("../models/PostModel");
const Achievement = require("../models/AchievementModel");

const DEMO = {
  fullname: "Avery Sinclair",
  email: "demo@skillhub.dev",
  password: "Skillhub@2026",
};

const MARK = "skillhub-demo";

const people = [
  {
    fullname: "Avery Sinclair",
    email: DEMO.email,
    role: "instructor",
    points: 480,
    bio: "Frontend engineer moving into developer education. I write about state, accessibility and the parts of the browser people skip.",
    github: "averysinclair",
    linkedin: "avery-sinclair",
    twitter: "@averysinclair",
  },
  {
    fullname: "Rohan Mehta",
    email: "rohan@skillhub.dev",
    role: "instructor",
    points: 640,
    bio: "React and design systems. Fifteen years of shipping interfaces that survive their first redesign.",
  },
  {
    fullname: "Sara Okafor",
    email: "sara@skillhub.dev",
    role: "instructor",
    points: 720,
    bio: "Backend engineer. APIs, SQL and the unglamorous work of making systems predictable.",
  },
  {
    fullname: "Kenji Watanabe",
    email: "kenji@skillhub.dev",
    role: "user",
    points: 190,
  },
  {
    fullname: "Lena Fischer",
    email: "lena@skillhub.dev",
    role: "user",
    points: 310,
  },
  {
    fullname: "Priya Raman",
    email: "priya@skillhub.dev",
    role: "user",
    points: 150,
  },
  {
    fullname: "Diego Torres",
    email: "diego@skillhub.dev",
    role: "user",
    points: 95,
  },
];

const categories = [
  {
    name: "Frontend Engineering",
    icon: "Code2",
    description: "Interfaces, state, accessibility and the browser.",
  },
  {
    name: "Backend & APIs",
    icon: "Server",
    description: "Services, contracts, auth and everything behind the request.",
  },
  {
    name: "Data & SQL",
    icon: "Database",
    description: "Modelling, queries and the shape of stored data.",
  },
];

const courseBlueprints = [
  {
    title: "React State, Without the Guesswork",
    imageUrl:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&h=760&q=70",
    category: "Frontend Engineering",
    instructor: "rohan@skillhub.dev",
    level: "Intermediate",
    duration: 240,
    cohortLabel: "Live cohort",
    createdDaysAgo: 62,
    learners: ["kenji@skillhub.dev", "lena@skillhub.dev", "priya@skillhub.dev", "diego@skillhub.dev"],
    description:
      "A practical tour of where React state should live: local component state, lifted state, context boundaries and server state. You will refactor a messy screen into something you can reason about.",
    overview:
      "Most React bugs are placement bugs. This track works through a single screen and moves state until the data flow is obvious, then adds caching and derived values on top.",
    tags: ["react", "state", "hooks", "architecture"],
    sections: [
      {
        title: "Where state belongs",
        description: "Start by naming the owner of every value.",
        lessons: [
          {
            title: "Local state, honestly",
            minutes: 14,
            content:
              "A value belongs in local state only when one component reads and writes it. Everything else is either derived or owned elsewhere.",
            code: {
              language: "jsx",
              code: 'const [open, setOpen] = useState(false);\nconst label = open ? "Hide details" : "Show details";',
            },
          },
          {
            title: "Deriving instead of duplicating",
            minutes: 12,
            content:
              "If a value can be computed from props or other state, computing it during render removes an entire class of sync bugs.",
          },
          {
            title: "Lifting state on purpose",
            minutes: 16,
            content:
              "Move state up only when two siblings need the same value, and stop at the closest common parent. Lifting further turns one small change into a tree-wide render.",
          },
        ],
      },
      {
        title: "Context and server state",
        description: "Separate what the client owns from what the server owns.",
        lessons: [
          {
            title: "Context as a boundary, not a bucket",
            minutes: 15,
            content:
              "Context is a transport, not storage. Keep the provider narrow so a theme change does not re-render the whole product.",
          },
          {
            title: "Server state is a cache",
            minutes: 18,
            content:
              "Anything fetched over the network is a cache with a lifetime. Treat it as such and stale-data bugs stop being mysterious.",
            code: {
              language: "jsx",
              code: 'useQuery({ queryKey: ["courses", page], queryFn: () => getCourses({ page }) });',
            },
          },
          {
            title: "Refactoring the messy screen",
            minutes: 20,
            content:
              "We finish by rewriting the example screen: three pieces of local state, two derived values, one server query and no effects.",
          },
        ],
      },
    ],
    enrollment: { completed: 4, status: "active", accessedHoursAgo: 2, saved: true },
  },
  {
    title: "Designing REST APIs That Age Well",
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=760&q=70",
    category: "Backend & APIs",
    instructor: "sara@skillhub.dev",
    level: "Intermediate",
    duration: 210,
    createdDaysAgo: 48,
    learners: ["kenji@skillhub.dev", "diego@skillhub.dev"],
    description:
      "Contracts, pagination, error shapes and versioning. Build an API that a client can rely on for years, and learn how to extend it without breaking the people already using it.",
    overview:
      "A field guide to additive change: how to evolve responses, add optional fields, and keep old clients working while new UI ships.",
    tags: ["api", "rest", "express", "contracts"],
    sections: [
      {
        title: "Contracts first",
        description: "Decide the shape before you write the handler.",
        lessons: [
          {
            title: "Resources, not endpoints",
            minutes: 13,
            content:
              "Name things after the noun the client thinks in. Verbs belong in the HTTP method, not the path.",
            code: {
              language: "text",
              code: "GET    /courses\nGET    /courses/:id\nPATCH  /courses/:id",
            },
          },
          {
            title: "A pagination shape you can keep",
            minutes: 14,
            content:
              "Return the page, the limit, the total and the page count together. Clients then stop guessing and you stop changing the shape.",
          },
          {
            title: "Errors as data",
            minutes: 12,
            content:
              "One error envelope with a message and a stable code beats a different response per handler. Validation failures should name the field.",
          },
        ],
      },
      {
        title: "Changing without breaking",
        description: "Everything you add is permanent; plan for it.",
        lessons: [
          {
            title: "Additive by default",
            minutes: 15,
            content:
              "New optional fields are safe. Renamed or removed fields are a new contract, and require either a version or a migration window.",
          },
          {
            title: "Populating for the client",
            minutes: 17,
            content:
              "A client should not need four extra requests to render one row. Populate the fields the view needs and keep counts computed server-side.",
          },
          {
            title: "Deprecation with a deadline",
            minutes: 16,
            content:
              "Announce, measure usage, then remove. A deprecation without instrumentation is just a hope.",
          },
        ],
      },
    ],
    enrollment: { completed: 1, status: "active", accessedHoursAgo: 30 },
  },
  {
    title: "JWT, Sessions and the Auth You Can Defend",
    imageUrl:
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&h=760&q=70",
    category: "Backend & APIs",
    instructor: DEMO.email,
    level: "Advanced",
    duration: 195,
    createdDaysAgo: 9,
    learners: ["lena@skillhub.dev", "kenji@skillhub.dev", "priya@skillhub.dev"],
    description:
      "How access tokens, refresh tokens and sessions actually work together. Learn to read a token, choose what goes inside it, and design a refresh flow that can be revoked.",
    overview:
      "We build the flow end to end: signing, expiry, rotation, revocation and the failure modes that leak accounts.",
    tags: ["auth", "jwt", "security", "sessions"],
    sections: [
      {
        title: "What a token is",
        description: "Claims, signature, expiry — and what none of that proves.",
        lessons: [
          {
            title: "Reading a JWT",
            minutes: 12,
            content:
              "A JWT is base64url JSON plus a signature. It is readable by anyone holding it, so it carries identifiers, never secrets.",
            code: {
              language: "text",
              code: '{ "id": "65f...", "role": "instructor", "tokenVersion": 0 }',
            },
          },
          {
            title: "Short lives, long sessions",
            minutes: 15,
            content:
              "Access tokens stay short so a stolen one expires. Refresh tokens live in the database where they can be revoked.",
          },
          {
            title: "tokenVersion and revocation",
            minutes: 14,
            content:
              "Incrementing a counter on the user invalidates every issued token at once. It is the cheapest kill switch you will ever build.",
          },
        ],
      },
      {
        title: "Building the flow",
        description: "Sign, verify, rotate, revoke.",
        lessons: [
          {
            title: "Signing and verifying",
            minutes: 16,
            content:
              "Sign with a server-only secret, verify on every protected route, and reject anything that fails rather than falling back to anonymous access.",
            code: {
              language: "js",
              code: "const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);",
            },
          },
          {
            title: "Refresh rotation",
            minutes: 18,
            content:
              "Each refresh stores a hashed token in a session document. Rotating on use means a replay is detectable.",
          },
          {
            title: "The mistakes that leak accounts",
            minutes: 20,
            content:
              "Trusting a client-supplied user id, deriving an origin from the Host header, and logging a token are the three that show up in every incident report.",
          },
        ],
      },
    ],
  },
  {
    title: "SQL for Application Developers",
    imageUrl:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&h=760&q=70",
    category: "Data & SQL",
    instructor: "sara@skillhub.dev",
    level: "Beginner",
    duration: 180,
    createdDaysAgo: 96,
    learners: ["kenji@skillhub.dev", "priya@skillhub.dev", "diego@skillhub.dev"],
    description:
      "From your first SELECT to joins you can defend in review. Model a small application, index it sensibly and read a query plan without panicking.",
    overview:
      "A short, grounded track for developers who write queries inside application code and want to stop guessing why they are slow.",
    tags: ["sql", "postgres", "indexes", "data"],
    sections: [
      {
        title: "The shape of a table",
        description: "Types, keys and the cost of a nullable column.",
        lessons: [
          {
            title: "Rows, keys and identity",
            minutes: 12,
            content:
              "A primary key identifies a row; a unique index enforces a rule. Most data bugs are a missing constraint, not a missing check in code.",
          },
          {
            title: "Choosing types",
            minutes: 13,
            content:
              "Store timestamps as timestamps, money as integers or decimals, and never as formatted strings. Formatting belongs in the view.",
          },
          {
            title: "Constraints as documentation",
            minutes: 12,
            content:
              "Foreign keys and NOT NULL clauses describe what the application assumes. Enforce them in the database so a bad script cannot break the invariant.",
          },
        ],
      },
      {
        title: "Queries that stay fast",
        description: "Indexes, joins and reading the plan.",
        lessons: [
          {
            title: "Joins without fear",
            minutes: 15,
            content:
              "A join is a lookup with a rule. Start from the table you filter on, then attach the rest.",
            code: {
              language: "sql",
              code: "SELECT c.title, COUNT(e._id) AS learners\nFROM courses c\nLEFT JOIN enrollments e ON e.course_id = c._id\nGROUP BY c.title;",
            },
          },
          {
            title: "Indexes that get used",
            minutes: 16,
            content:
              "An index helps when the query filters or sorts on its leading column. Wrap a column in a function and the index stops applying.",
          },
          {
            title: "Reading EXPLAIN",
            minutes: 18,
            content:
              "Look for sequential scans on large tables and for row estimates that disagree with reality. Both point at the same fix: statistics or an index.",
          },
        ],
      },
    ],
    enrollment: { completed: 6, status: "completed", accessedHoursAgo: 96 },
  },
  {
    title: "TypeScript for People Who Ship",
    imageUrl:
      "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=1200&h=760&q=70",
    category: "Frontend Engineering",
    instructor: "rohan@skillhub.dev",
    level: "Intermediate",
    duration: 165,
    createdDaysAgo: 5,
    learners: [],
    description:
      "Types that pay for themselves. Model API responses, narrow unknowns, and use the compiler to delete runtime checks you no longer need.",
    overview:
      "Less annotation, more inference. We type a real feature from the network boundary inward and keep the strictness where it earns its keep.",
    tags: ["typescript", "types", "react"],
    sections: [
      {
        title: "Types at the boundary",
        description: "Everything entering the app is unknown until proven.",
        lessons: [
          {
            title: "Unknown is not any",
            minutes: 12,
            content:
              "unknown forces a check before use; any removes the compiler from the conversation. Parse at the edge and the interior stays honest.",
          },
          {
            title: "Modelling API responses",
            minutes: 14,
            content:
              "Write the response type once, next to the fetch function, and let components derive from it instead of redeclaring fields.",
          },
          {
            title: "Discriminated unions",
            minutes: 15,
            content:
              "A status field with literal types turns impossible states into compile errors — the cheapest state machine you will write.",
            code: {
              language: "ts",
              code: 'type Result =\n  | { status: "loading" }\n  | { status: "ready"; data: Course }\n  | { status: "error"; message: string };',
            },
          },
        ],
      },
      {
        title: "Strictness that pays",
        description: "Config choices and where to spend them.",
        lessons: [
          {
            title: "Strict, gradually",
            minutes: 13,
            content:
              "Turn on strict mode, then fix one directory at a time. A codebase that compiles is worth more than one that is theoretically safe.",
          },
          {
            title: "Generics people can read",
            minutes: 16,
            content:
              "If a generic needs a comment to explain, it is usually two functions. Constrain it to what the body actually uses.",
          },
          {
            title: "Deleting runtime checks",
            minutes: 14,
            content:
              "Once a type is proven at the boundary, guards inside the component become noise. Removing them is the payoff for the annotation.",
          },
        ],
      },
    ],
  },
  {
    title: "Accessibility for Product Teams",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&h=760&q=70",
    category: "Frontend Engineering",
    instructor: "sara@skillhub.dev",
    level: "Beginner",
    duration: 130,
    createdDaysAgo: 20,
    learners: ["diego@skillhub.dev"],
    description:
      "Contrast, focus order, labels and keyboard paths — the accessibility decisions that belong in a product team's everyday workflow rather than a last-minute audit.",
    overview:
      "A short, practical track for designers and engineers who ship together and want accessibility to be part of the definition of done.",
    tags: ["accessibility", "a11y", "design"],
    sections: [
      {
        title: "Foundations that carry weight",
        description: "Contrast, semantics and the reading order you inherit.",
        lessons: [
          {
            title: "Contrast beyond the checker",
            minutes: 14,
            content:
              "Passing contrast is the floor, not the goal. Size, weight and the surrounding surface decide whether text is actually readable.",
          },
          {
            title: "Semantics before ARIA",
            minutes: 16,
            content:
              "A button that behaves like a button beats a div with five attributes. Reach for ARIA only when no element does the job.",
            code: {
              language: "html",
              code: '<button type="button" aria-expanded={open}>Details</button>',
            },
          },
        ],
      },
      {
        title: "Testing with the keyboard",
        description: "Ten minutes of tabbing finds what screenshots hide.",
        lessons: [
          {
            title: "Tab once through the page",
            minutes: 13,
            content:
              "Tab from the address bar to the last control. Every stop should be visible, ordered and reversible with Shift+Tab.",
          },
          {
            title: "Focus that does not trap",
            minutes: 15,
            content:
              "Dialogs own focus until they close, and hand it back to the trigger afterwards. Everything else should never steal it.",
          },
        ],
      },
    ],
  },
];

const events = [
  {
    title: "Designing interfaces you can navigate without a mouse",
    description:
      "A working session on focus order, landmarks and the small decisions that make a keyboard-only pass possible. Bring a screen you are building.",
    days: 4,
    hour: 18,
    duration: 90,
    capacity: 40,
    location: "Online · live room",
    host: "sara@skillhub.dev",
    attendees: ["demo@skillhub.dev", "kenji@skillhub.dev", "lena@skillhub.dev", "priya@skillhub.dev"],
  },
  {
    title: "Live code review: React hooks in production",
    description:
      "Rohan reviews three submitted components line by line: effect dependencies, stale closures and one context provider that should not exist.",
    days: 8,
    hour: 17,
    duration: 75,
    capacity: 30,
    location: "Online · live room",
    host: "rohan@skillhub.dev",
    attendees: ["demo@skillhub.dev", "diego@skillhub.dev", "kenji@skillhub.dev"],
  },
  {
    title: "Auth deep dive: tokens, refresh and revocation",
    description:
      "Avery walks through the refresh flow from the JWT track, including what happens when a token is replayed and how tokenVersion stops it.",
    days: 12,
    hour: 19,
    duration: 60,
    capacity: 25,
    location: "Online · live room",
    host: DEMO.email,
    attendees: ["lena@skillhub.dev", "priya@skillhub.dev"],
  },
  {
    title: "SQL clinic: bring your slowest query",
    description:
      "Send a query and its EXPLAIN output ahead of time. We read plans together and fix the three most common mistakes on the call.",
    days: 19,
    hour: 18,
    duration: 60,
    capacity: 20,
    location: "Online · live room",
    host: "sara@skillhub.dev",
    attendees: ["demo@skillhub.dev", "diego@skillhub.dev"],
  },
  {
    title: "Portfolio teardown night",
    description:
      "Four portfolios, twenty minutes each. We look at what a reviewer sees in the first thirty seconds and what they never scroll to.",
    days: 26,
    hour: 20,
    duration: 80,
    capacity: 50,
    location: "Online · live room",
    host: "kenji@skillhub.dev",
    attendees: ["demo@skillhub.dev", "lena@skillhub.dev"],
  },
  {
    title: "Workspace tour: courses, tracks and progress",
    description:
      "The recorded intro session for new members. How tracks, lessons and progress fit together, with a short walk through the tools.",
    days: -9,
    hour: 18,
    duration: 45,
    capacity: 100,
    location: "Online · recording",
    host: DEMO.email,
    attendees: ["kenji@skillhub.dev", "lena@skillhub.dev", "priya@skillhub.dev", "diego@skillhub.dev"],
  },
];

const communities = [
  {
    name: "Frontend Craft",
    description:
      "Interface details, accessibility and the browser behaviour nobody documents. Weekly critique threads welcome.",
    createdBy: DEMO.email,
    members: [
      ["demo@skillhub.dev", "admin"],
      ["rohan@skillhub.dev", "member"],
      ["kenji@skillhub.dev", "member"],
      ["lena@skillhub.dev", "member"],
      ["priya@skillhub.dev", "member"],
    ],
    posts: [
      {
        author: "rohan@skillhub.dev",
        content:
          "Small thing that changed how I review components: ask where the state would live if this screen were twice as big. Half the prop drilling disappears in the answer.",
        likes: ["demo@skillhub.dev", "kenji@skillhub.dev", "lena@skillhub.dev"],
        comments: [
          { author: "demo@skillhub.dev", content: "Stealing this for our review checklist." },
          { author: "kenji@skillhub.dev", content: "Works for CSS too — ask where the layout boundary belongs." },
        ],
      },
      {
        author: "lena@skillhub.dev",
        content:
          "Finally fixed a focus trap that only happened in Safari. The dialog was rendering inside a transformed parent, so the fixed positioning was relative to the card.",
        likes: ["demo@skillhub.dev", "rohan@skillhub.dev"],
        comments: [
          { author: "rohan@skillhub.dev", content: "Portal it, or move the transform to the inner element." },
        ],
      },
      {
        author: DEMO.email,
        content:
          "Wrote up the state-placement refactor from the React track: three pieces of local state, two derived values, zero effects. The diff is mostly deletions.",
        likes: ["rohan@skillhub.dev", "priya@skillhub.dev", "diego@skillhub.dev"],
        comments: [],
      },
      {
        author: "priya@skillhub.dev",
        content:
          "Is there a rule of thumb for when a skeleton beats a spinner? Our dashboards flicker between both depending on the endpoint.",
        likes: ["demo@skillhub.dev"],
        comments: [
          {
            author: "demo@skillhub.dev",
            content: "Skeleton when you know the shape, spinner when you do not. Never both in the same view.",
          },
          {
            author: "rohan@skillhub.dev",
            content: "And hold the skeleton for at least ~300ms so it does not flash on fast responses.",
          },
        ],
      },
    ],
  },
  {
    name: "API Practitioners",
    description:
      "Contracts, versioning, pagination and the unglamorous parts of running an API other people depend on.",
    createdBy: "sara@skillhub.dev",
    members: [
      ["sara@skillhub.dev", "admin"],
      ["demo@skillhub.dev", "member"],
      ["rohan@skillhub.dev", "member"],
      ["diego@skillhub.dev", "member"],
    ],
    posts: [
      {
        author: "sara@skillhub.dev",
        content:
          "Reminder that adding an optional field is free, and renaming one is a project. Budget accordingly when the schema review happens.",
        likes: ["demo@skillhub.dev", "rohan@skillhub.dev", "diego@skillhub.dev"],
        comments: [
          { author: "diego@skillhub.dev", content: "Learned this the hard way with a `userId` → `user_id` rename." },
        ],
      },
      {
        author: "diego@skillhub.dev",
        content:
          "Our pagination returned `total` only on the first page, so infinite scroll could not know when to stop. Now the meta block ships on every page.",
        likes: ["sara@skillhub.dev"],
        comments: [
          { author: "sara@skillhub.dev", content: "Same meta shape every time is the whole trick." },
        ],
      },
      {
        author: DEMO.email,
        content:
          "Added a public featured endpoint for the landing page instead of loosening auth on the main list. Two routes, one service function, no contract change.",
        likes: ["sara@skillhub.dev", "rohan@skillhub.dev"],
        comments: [],
      },
    ],
  },
  {
    name: "Career Switch Diaries",
    description:
      "Honest notes from people moving into technical work: applications, rejections, study schedules and what actually helped.",
    createdBy: "lena@skillhub.dev",
    members: [
      ["lena@skillhub.dev", "admin"],
      ["demo@skillhub.dev", "member"],
      ["priya@skillhub.dev", "member"],
      ["kenji@skillhub.dev", "member"],
    ],
    posts: [
      {
        author: "priya@skillhub.dev",
        content:
          "Six weeks in: two hours before work beats four hours on Sunday. The consistency is doing more than the volume ever did.",
        likes: ["lena@skillhub.dev", "demo@skillhub.dev", "kenji@skillhub.dev"],
        comments: [
          { author: "lena@skillhub.dev", content: "This is the whole post. Protect the small block." },
        ],
      },
      {
        author: "lena@skillhub.dev",
        content:
          "Rejection number eleven came with actual feedback for once: the portfolio showed finished screens but no reasoning. Rebuilding it around decisions instead.",
        likes: ["demo@skillhub.dev", "priya@skillhub.dev"],
        comments: [
          { author: "demo@skillhub.dev", content: "Reasoning is the part reviewers cannot get anywhere else." },
        ],
      },
      {
        author: "kenji@skillhub.dev",
        content:
          "Finished the SQL track this week. Reading EXPLAIN used to look like noise; now it is the first thing I check before touching an index.",
        likes: ["lena@skillhub.dev", "priya@skillhub.dev", "demo@skillhub.dev"],
        comments: [],
      },
    ],
  },
];

const achievements = [
  { name: "First lesson complete", icon: "🎯", pointsRequired: 10 },
  { name: "Seven-day streak", icon: "🔥", pointsRequired: 100 },
  { name: "Community voice", icon: "💬", pointsRequired: 150 },
  { name: "Track finisher", icon: "🏁", pointsRequired: 400 },
];

const daysFromNow = (days, hour = 18, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

const buildBlocks = (lesson) => {
  const blocks = [
    { type: "text", order: 1, data: { content: lesson.content } },
  ];

  if (lesson.code) {
    blocks.push({
      type: "code",
      order: 2,
      data: { language: lesson.code.language, code: lesson.code.code },
    });
  }

  blocks.push({
    type: "text",
    order: blocks.length + 1,
    data: {
      content:
        "Mark the lesson complete when you can explain the idea to someone else without opening the code. Then move on — the next lesson builds on this one.",
    },
  });

  return blocks;
};

async function main() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not set. Add it to Skillhub-backend/.env first.");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const passwordHash = await bcrypt.hash(DEMO.password, 10);
  const usersByEmail = new Map();

  for (const person of people) {
    const user = await User.findOneAndUpdate(
      { email: person.email },
      {
        $set: {
          fullname: person.fullname,
          email: person.email,
          password: passwordHash,
          role: person.role || "user",
          isEmailVerified: true,
          isActive: true,
          avatar: "",
          bio: person.bio || "",
          github: person.github || "",
          linkedin: person.linkedin || "",
          twitter: person.twitter || "",
          points: person.points || 0,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    usersByEmail.set(person.email, user);
    await UserSettings.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { userId: user._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const demo = usersByEmail.get(DEMO.email);
  console.log(`Users ready (${usersByEmail.size})`);

  const categoryByName = new Map();
  for (const category of categories) {
    const doc = await Category.findOneAndUpdate(
      { name: category.name },
      { $set: { icon: category.icon, description: category.description } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    categoryByName.set(category.name, doc);
  }

  // Clear only what this script created, so re-running stays predictable.
  const staleCourses = await Course.find({ tags: MARK }).distinct("_id");
  if (staleCourses.length > 0) {
    const staleSections = await CourseSection.find({
      course: { $in: staleCourses },
    }).distinct("_id");
    await Lesson.deleteMany({ section: { $in: staleSections } });
    await CourseSection.deleteMany({ course: { $in: staleCourses } });
    await Enrollment.deleteMany({ courseId: { $in: staleCourses } });
    await Course.deleteMany({ _id: { $in: staleCourses } });
  }

  const courseByTitle = new Map();
  const lessonsByCourse = new Map();

  for (const blueprint of courseBlueprints) {
    const instructor = usersByEmail.get(blueprint.instructor);
    const category = categoryByName.get(blueprint.category);

    const course = await Course.create({
      title: blueprint.title,
      description: blueprint.description,
      overview: blueprint.overview,
      createdBy: instructor._id,
      category: category._id,
      duration: blueprint.duration,
      level: blueprint.level,
      language: "English",
      price: 0,
      imageUrl: blueprint.imageUrl || null,
      publishedAt: hoursAgo(24 * (blueprint.createdDaysAgo || 30)),
      tags: [MARK, ...blueprint.tags],
      status: "published",
      cohortLabel: blueprint.cohortLabel || null,
    });

    if (blueprint.createdDaysAgo) {
      await Course.updateOne(
        { _id: course._id },
        { $set: { createdAt: hoursAgo(24 * blueprint.createdDaysAgo) } },
        { timestamps: false },
      );
    }

    const lessons = [];

    for (const [sectionIndex, section] of blueprint.sections.entries()) {
      const sectionDoc = await CourseSection.create({
        course: course._id,
        title: section.title,
        description: section.description || "",
        order: sectionIndex + 1,
      });

      for (const [lessonIndex, lesson] of section.lessons.entries()) {
        const lessonDoc = await Lesson.create({
          section: sectionDoc._id,
          title: lesson.title,
          description: lesson.content.slice(0, 140),
          blocks: buildBlocks(lesson),
          duration: lesson.minutes,
          order: lessonIndex + 1,
          status: "published",
          isPreview: sectionIndex === 0 && lessonIndex === 0,
        });

        lessons.push(lessonDoc);
      }
    }

    courseByTitle.set(course.title, course);
    lessonsByCourse.set(course.title, lessons);
  }

  console.log(`Courses ready (${courseByTitle.size})`);

  // A personal draft so the creator studio has something to edit immediately.
  const draftCourse = await Course.create({
    title: "Writing Documentation People Actually Read",
    description:
      "A short, practical draft about turning internal notes into documentation a teammate can follow without asking you.",
    overview:
      "Draft in progress: the reader, the shape of a page, and the small edits that make docs trustworthy.",
    createdBy: demo._id,
    category: categoryByName.get("Backend & APIs")._id,
    duration: 90,
    level: "Beginner",
    language: "English",
    price: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&h=760&q=70",
    tags: [MARK, "documentation", "writing"],
    status: "draft",
    cohortLabel: null,
  });

  const draftSection = await CourseSection.create({
    course: draftCourse._id,
    title: "Start with the reader",
    description: "Who opens this page, and what do they need in the first minute?",
    order: 1,
  });

  await Lesson.create({
    section: draftSection._id,
    title: "Name the reader",
    description: "Write for one person doing one task.",
    blocks: buildBlocks({
      content:
        "Before the first sentence, name the reader and the task. \"For engineers deploying the API for the first time\" is a better contract than \"introduction\".",
    }),
    duration: 9,
    order: 1,
    status: "draft",
  });

  await Lesson.create({
    section: draftSection._id,
    title: "One page, one job",
    description: "Split pages when the reader changes.",
    blocks: buildBlocks({
      content:
        "If two different readers need two different tasks, that is two pages. Length is not the problem; mixed intent is.",
    }),
    duration: 12,
    order: 2,
    status: "published",
  });

  if (draftCourse.createdAt) {
    await Course.updateOne(
      { _id: draftCourse._id },
      { $set: { createdAt: hoursAgo(24 * 3) } },
      { timestamps: false },
    );
  }


  let enrollmentCount = 0;
  for (const blueprint of courseBlueprints) {
    if (!blueprint.enrollment) continue;

    const course = courseByTitle.get(blueprint.title);
    const lessons = lessonsByCourse.get(blueprint.title);
    const completedCount = Math.min(blueprint.enrollment.completed, lessons.length);
    const completedLessons = lessons.slice(0, completedCount).map((lesson) => lesson._id);
    const lastAccessedLesson =
      completedCount > 0 ? lessons[completedCount - 1]._id : null;

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: demo._id, courseId: course._id },
      {
        $set: {
          status: blueprint.enrollment.status,
          completedLessons,
          progress: Math.round((completedCount / lessons.length) * 100),
          lastAccessedLesson,
          lastAccessedAt:
            blueprint.enrollment.accessedHoursAgo !== null
              ? hoursAgo(blueprint.enrollment.accessedHoursAgo)
              : null,
          saved: Boolean(blueprint.enrollment.saved),
          enrolledAt: hoursAgo(24 * 12),
          completedAt:
            blueprint.enrollment.status === "completed" ? hoursAgo(96) : null,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    // Keep the spotlight ordering stable: recently touched tracks first.
    await Enrollment.updateOne(
      { _id: enrollment._id },
      {
        $set: {
          updatedAt: hoursAgo(
            blueprint.enrollment.accessedHoursAgo ?? 24 * 6,
          ),
        },
      },
      { timestamps: false },
    );

    enrollmentCount += 1;
  }

  console.log(`Enrollments ready (${enrollmentCount})`);

  // Peer learners make catalogue counts ("POPULAR") reflect real enrollments.
  let learnerEnrollments = 0;
  for (const blueprint of courseBlueprints) {
    const course = courseByTitle.get(blueprint.title);

    for (const email of blueprint.learners || []) {
      const learner = usersByEmail.get(email);
      if (!learner) continue;

      await Enrollment.findOneAndUpdate(
        { userId: learner._id, courseId: course._id },
        {
          $setOnInsert: {
            status: "active",
            progress: 0,
            completedLessons: [],
            enrolledAt: hoursAgo(24 * 8),
          },
        },
        { upsert: true, setDefaultsOnInsert: true },
      );

      learnerEnrollments += 1;
    }
  }

  console.log(`Peer enrollments ready (${learnerEnrollments})`);

  const noteCourse = courseByTitle.get("React State, Without the Guesswork");
  const noteLessons = lessonsByCourse.get("React State, Without the Guesswork");
  const noteEnrollment = await Enrollment.findOne({
    userId: demo._id,
    courseId: noteCourse._id,
  });
  const noteLesson = noteLessons[4];

  await LessonNote.findOneAndUpdate(
    { enrollmentId: noteEnrollment._id, lessonId: noteLesson._id },
    {
      $set: {
        userId: demo._id,
        content:
          "Context is a transport, not storage. The provider should only wrap the part of the tree that actually reads it — question to revisit: how does this interact with the query cache?",
      },
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  console.log("Lesson note ready (1)");

  await Event.deleteMany({ banner: { $regex: MARK } });

  for (const [index, event] of events.entries()) {
    await Event.create({
      title: event.title,
      description: event.description,
      date: daysFromNow(event.days, event.hour),
      duration: event.duration,
      capacity: event.capacity,
      location: event.location,
      banner: `https://picsum.photos/seed/${MARK}-event-${index + 1}/1200/600`,
      status: "published",
      hostId: usersByEmail.get(event.host)._id,
      registeredUsers: event.attendees.map(
        (email) => usersByEmail.get(email)._id,
      ),
    });
  }

  console.log(`Events ready (${events.length})`);

  for (const blueprint of communities) {
    const existing = await Community.findOne({ name: blueprint.name });
    if (existing) {
      await Post.deleteMany({ communityId: existing._id });
      await Community.deleteOne({ _id: existing._id });
    }

    const community = await Community.create({
      name: blueprint.name,
      description: blueprint.description,
      coverImage: "",
      createdBy: usersByEmail.get(blueprint.createdBy)._id,
      members: blueprint.members.map(([email, role]) => ({
        userId: usersByEmail.get(email)._id,
        role,
      })),
    });

    for (const post of blueprint.posts) {
      await Post.create({
        userId: usersByEmail.get(post.author)._id,
        communityId: community._id,
        content: post.content,
        likes: post.likes.map((email) => usersByEmail.get(email)._id),
        comments: (post.comments || []).map((comment) => ({
          userId: usersByEmail.get(comment.author)._id,
          content: comment.content,
        })),
      });
    }
  }

  console.log(
    `Communities ready (${communities.length}) with ${communities.reduce(
      (total, community) => total + community.posts.length,
      0,
    )} posts`,
  );

  const achievementDocs = [];
  for (const achievement of achievements) {
    const doc = await Achievement.findOneAndUpdate(
      { name: achievement.name },
      { $set: { icon: achievement.icon, pointsRequired: achievement.pointsRequired } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    achievementDocs.push(doc._id);
  }

  demo.achievements = achievementDocs.slice(0, 3);
  await demo.save();

  console.log(
    [
      "",
      "Demo workspace ready.",
      `  Email:    ${DEMO.email}`,
      `  Password: ${DEMO.password}`,
      `  Courses:  ${courseByTitle.size} published, 1 completed track`,
      `  Events:   ${events.filter((event) => event.days > 0).length} upcoming`,
      `  Rooms:    ${communities.length} communities`,
      "",
    ].join("\n"),
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
