// Single source of truth for portfolio content (sourced from the CV).
// Both the 3D world and the classic (plain HTML) view read from here.
// Kept public-safe: no phone number, no third-party contact details,
// and employer systems are described at a high level only.

export type SectionId =
  | "about"
  | "origin"
  | "experience"
  | "skills"
  | "projects"
  | "contact";

export const profile = {
  name: "Hlaing Min Thein",
  role: "Software Engineer",
  headline: "Building reliable products with clean execution.",
  location: "Ho Chi Minh City, Vietnam",
  years: 7,
  summary:
    "Software engineer with 7 years in the JavaScript ecosystem and, more recently, Go. I build and scale web and mobile applications, lead small dev teams, and look after production systems for high-traffic products, handling everything from UI/UX implementation to backend logic and cloud deployments on AWS and Azure.",
  focus: ["Web", "Mobile", "Backend", "Cloud", "AI tooling"],
  email: "hlaing.min.dev@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/hlaing-dev" },
    { label: "LinkedIn", href: "https://linkedin.com/in/hlaing-min-5b4277222" },
  ],
  languages: [
    { name: "Burmese", level: "Native" },
    { name: "English", level: "Professional working proficiency" },
  ],
};

export const testimonial = {
  quote:
    "A good part of his work with us was coordinating with and leading our junior developers… a very dependable and efficient software developer.",
  source: "HR Manager, KUMO Solutions",
};

export const education = {
  degree: "Bachelor of Computer Science",
  school: "Computer University of Mandalay",
  period: "2014 – 2018",
  note: "Where it started: Mandalay, Myanmar. Four years of computer science fundamentals before the first production job.",
};

export type Job = {
  period: string;
  role: string;
  company: string;
  summary: string;
  highlights: string[];
  projects: string[];
  stack: string[];
};

export const experience: Job[] = [
  {
    period: "Aug 2025 – Present",
    role: "Software Engineer",
    company: "Qaast (Yoma Fleet)",
    summary:
      "Core engineer in a small, high-ownership team working on Yoma Fleet's mobility and financing products.",
    highlights: [
      "Ship features end to end across the Yoma Car Share web app, admin panel and APIs, through to deployment on AWS.",
      "Led version upgrades across the whole system: Next.js 12 → 15, Laravel 8 → 12, plus core and third-party libraries.",
      "Backend engineer on Better's Go microservices: user, auth, access control and order/checkout.",
      "Helping break the Car Share monolith into Go microservices for the next major version.",
      "Built an internal AI pipeline on Claude Code that takes tasks to review-ready, verified code with human approval at every step.",
    ],
    projects: ["Yoma Car Share", "Better – Hire Purchase", "AI-Orchestrated SDLC Pipeline"],
    stack: ["Next.js", "Laravel", "Go", "gRPC", "PostgreSQL", "AWS", "Claude Code"],
  },
  {
    period: "2024 – 2025",
    role: "Frontend Team Lead",
    company: "DevelopX",
    summary:
      "Led frontend delivery for two large multimedia products running on the web and inside iOS/Android WebViews.",
    highlights: [
      "Frontend lead from planning to launch, with teams of 3–4 engineers.",
      "Owned frontend architecture: Module Federation, shared components and state boundaries between features.",
      "Built native–web bridges for gestures and full-screen behaviour so WebViews felt native.",
      "Fixed memory leaks, slow loading and bundle size; lazy loading and tree shaking cut CDN costs.",
      "Reviewed code, mentored juniors and worked with department heads, PMs and designers.",
    ],
    projects: ["Beabox H5", "Movie Hunter H5"],
    stack: ["React", "TypeScript", "Redux Toolkit", "Tailwind", "Vite", "Module Federation", "HLS.js"],
  },
  {
    period: "2022 – 2024",
    role: "Senior Full Stack Developer",
    company: "JMS United",
    summary:
      "Led a dev team building call-center, AI collaboration and indoor-positioning products across web and mobile.",
    highlights: [
      "Led the dev team, assigned tasks and coordinated with other teams to deliver on time.",
      "Built AI bots with OpenAI and Gemini, including function calling over real system data and AI meeting minutes.",
      "Shipped Microsoft Teams collaboration and Azure AD sign-in across web and iOS.",
      "Split a call-center backend into services so it stays up under heavy concurrent load.",
      "Designed a BLE-beacon indoor positioning system with real-time sync to a web dashboard.",
    ],
    projects: ["Colabot Platform", "Colabot Mobile (iOS)", "Infinitalk Call Center", "Beacon Indoor Positioning"],
    stack: ["React", "React Native", "Node.js", "GraphQL", "MongoDB", "PostgreSQL", "AWS", "GCP"],
  },
  {
    period: "2019 – 2022",
    role: "Senior Full Stack Developer",
    company: "KUMO Solution",
    summary:
      "Full-stack work on an internal business management system, plus standalone tools.",
    highlights: [
      "Built and extended ASP.NET APIs and Angular UI as features were added.",
      "Stored procedures, query fixes and performance tuning on Microsoft SQL Server.",
      "Built a standalone C# scheduler for automated server-side email reports, solo.",
      "Coordinated and led junior developers; CI/CD through Azure DevOps.",
    ],
    projects: ["Brennan IT PST", "Report Scheduler", "Survey Builder"],
    stack: ["C#", "ASP.NET", "Angular", "SQL Server", "Azure DevOps", "PrimeNG"],
  },
  {
    period: "2018 – 2019",
    role: "Junior Frontend Developer",
    company: "IT Star",
    summary: "Frontend screens for restaurant and accounting software.",
    highlights: [
      "Built order, reservation and inventory screens for a restaurant management system.",
      "Built stock, sales, purchase and report screens for an accounting system.",
      "Worked closely with ASP.NET backend developers to wire features end to end.",
    ],
    projects: ["ERS Restaurant System", "ABS Accounting"],
    stack: ["Angular", "ASP.NET", "KendoUI"],
  },
];

export const skills = [
  { group: "Frontend", items: ["React", "Next.js", "Angular", "TypeScript", "JavaScript", "HTML5", "CSS / SCSS", "Tailwind CSS"] },
  { group: "State & UI", items: ["Redux Toolkit", "React Router", "React Hook Form", "MUI", "Ant Design", "PrimeNG", "KendoUI", "Three.js"] },
  { group: "Backend", items: ["Go", "Node.js", "Express", "Laravel", "ASP.NET", "gRPC", "REST", "GraphQL (AppSync)"] },
  { group: "Data", items: ["PostgreSQL", "MySQL", "MongoDB", "SQL Server", "DynamoDB"] },
  { group: "Cloud & DevOps", items: ["AWS", "Azure", "Google Cloud", "Docker", "GitLab CI", "Azure Pipelines", "Firebase"] },
  { group: "Mobile", items: ["React Native", "iOS / Android WebViews", "BLE beacons"] },
  { group: "Testing", items: ["Contract testing", "Cypress", "Mocha", "Chai"] },
  { group: "AI & Automation", items: ["Claude Code (agents, skills, MCP)", "Agentic dev workflows", "OpenAI API", "Gemini API"] },
];

export type Project = {
  name: string;
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
  stack: string[];
  metric?: string;
  href?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    name: "Yoma Car Share",
    company: "Qaast (Yoma Fleet)",
    role: "Software Engineer",
    period: "2025 – Present",
    summary:
      "On-demand, self-drive car rental used across Myanmar: rent hourly, daily or monthly with no keys, cash or counter.",
    highlights: [
      "Features end to end across the user web app, admin panel and APIs, deployed on AWS.",
      "Hardware-linked features: remote lock/unlock, GPS tracking, fuel claiming, Bluetooth/RFID verification.",
      "Led the Next.js 12 → 15 and Laravel 8 → 12 upgrades and fixed long-standing production issues.",
      "Moving the monolith to Go microservices for the next version.",
    ],
    stack: ["Next.js", "Laravel", "Go", "PostgreSQL", "AWS", "IoT"],
    metric: "Live in production",
    href: "https://carshare.yomafleet.com/",
    featured: true,
  },
  {
    name: "Better – Hire Purchase",
    company: "Qaast (Yoma Fleet)",
    role: "Backend Engineer",
    period: "2025 – Present",
    summary:
      "Financing platform where customers buy from partner merchants and pay in monthly installments, built from scratch as Go microservices.",
    highlights: [
      "Core services: user, auth, access control and order/checkout, among 15+ services.",
      "Integrated local payment providers (Wave Pay, KBZPay) into checkout.",
      "Policy-based, multi-tenant authorization with global and merchant-scoped roles.",
      "Contract tests between services to catch breaking API changes early.",
    ],
    stack: ["Go", "gRPC", "REST", "PostgreSQL", "OPA", "AWS", "Docker"],
    metric: "15+ Go services",
    featured: true,
  },
  {
    name: "AI-Orchestrated SDLC Pipeline",
    company: "Qaast (Yoma Fleet)",
    role: "Designer & builder (solo)",
    period: "2025 – Present",
    summary:
      "Internal tooling on Claude Code that takes a task from a plain description to review-ready, verified code, with a human approving every release step.",
    highlights: [
      "Custom agent skills route each task to the right repo, implement it, open the ticket, branch and commit.",
      "Agents verify their own work against a local database with real API calls and attach the evidence.",
      "Automatic compliance checks against requirements and tech guidelines; every change lands in an audit dashboard.",
      "Self-improving: watcher agents review past sessions and propose skill updates through the same approval gate.",
    ],
    stack: ["Claude Code", "AI agents", "MCP", "SQLite", "Docker", "Go"],
    metric: "Internal AI tooling",
    featured: true,
  },
  {
    name: "Beabox H5",
    company: "DevelopX",
    role: "Frontend Team Lead",
    period: "2024 – 2025",
    summary:
      "High-performance video and social platform on the web and in iOS/Android WebViews.",
    highlights: [
      "Vertical video feeds and social panels: uploads, likes, comments, shares.",
      "Point Mall, Lucky Spin and reward events; wallet with in-app cashout.",
      "Micro-frontends with Webpack Module Federation for small bundles and independent deploys.",
      "A/B testing and behaviour analysis to keep tuning UX and performance.",
    ],
    stack: ["React", "TypeScript", "Vite", "Module Federation", "Radix UI", "Framer Motion"],
    metric: "100,000+ DAU",
    featured: true,
  },
  {
    name: "Movie Hunter H5",
    company: "DevelopX",
    role: "Frontend Team Lead",
    period: "2024 – 2025",
    summary: "Multimedia streaming app for the web and mobile WebViews.",
    highlights: [
      "Core UI: navigation, advanced search and recommendations.",
      "Social panel, bookmarks, reporting and episode management.",
      "Gamification (Point Mall, Lucky Spin) for retention.",
      "Performance work on memory, loading and bundle size; CDN cost reductions.",
    ],
    stack: ["React", "TypeScript", "Redux Toolkit", "Tailwind", "HLS.js", "Artplayer"],
    metric: "50,000+ DAU",
    featured: true,
  },
  {
    name: "Colabot Platform",
    company: "JMS United",
    role: "Team Lead, Full Stack",
    period: "2022 – 2024",
    summary: "AI collaboration product, launched v1 to customers.",
    highlights: [
      "Custom-instruction bots on OpenAI and Gemini for summaries and automation.",
      "AI function calling to query real system data and pull reports.",
      "Image and short-video generation with diffusion models; AI meeting minutes.",
      "Microsoft Teams collaboration and Azure AD sign-in.",
    ],
    stack: ["React", "Node.js", "GraphQL", "AWS AppSync", "ECS / Fargate", "Lambda"],
    metric: "OpenAI · Gemini",
    featured: true,
  },
  {
    name: "Colabot Mobile (iOS)",
    company: "JMS United",
    role: "Lead developer",
    period: "2022 – 2024",
    summary: "Rebuilt the key Colabot features for iOS with parity and solid performance.",
    highlights: [
      "Built the app's core structure and the AI and Microsoft integrations.",
      "Bot creation, Teams inside the app, AI meeting minutes, Azure AD sign-in.",
    ],
    stack: ["React Native", "OpenAI", "Gemini", "Teams SDK", "AppSync"],
  },
  {
    name: "Infinitalk Call Center",
    company: "JMS United",
    role: "Team Lead, Full Stack",
    period: "2022 – 2024",
    summary: "Call-center system for calls, recordings, routing and CRM, with agent and admin dashboards.",
    highlights: [
      "Split the backend into services so it stays reliable under heavy concurrent use.",
      "Deployed and maintained on GCP and Firebase.",
    ],
    stack: ["Node.js", "Express", "React", "MongoDB", "PostgreSQL", "GCP"],
  },
  {
    name: "Beacon Indoor Positioning",
    company: "JMS United",
    role: "Lead developer",
    period: "2022 – 2024",
    summary: "Indoor positioning for offices using BLE beacons, Android + web.",
    highlights: [
      "RSSI triangulation to estimate location in real time.",
      "Background beacon scanning on Android, real-time sync to an admin panel for buildings, floors and devices.",
    ],
    stack: ["React Native", "AppSync", "Lambda", "Amplify"],
  },
  {
    name: "Brennan IT PST",
    company: "KUMO Solution",
    role: "Senior Full Stack Developer",
    period: "2019 – 2022",
    summary: "Business management system: ASP.NET APIs, Angular UI and third-party integrations.",
    highlights: [
      "SQL Server stored procedures, query fixes and performance tuning.",
      "Solo-built a C# scheduler for automated server-side email reports.",
    ],
    stack: ["C#", "ASP.NET", "Angular", "SQL Server", "Azure DevOps"],
  },
  {
    name: "Survey Builder",
    company: "KUMO Solution",
    role: "Full Stack (end to end)",
    period: "2019 – 2022",
    summary: "Survey app where users build their own surveys with dynamic question types.",
    highlights: ["Dynamic text, dropdown, checkbox and radio questions; clean response storage."],
    stack: ["Node.js", "React", "MongoDB"],
  },
  {
    name: "ERS & ABS Systems",
    company: "IT Star",
    role: "Junior Frontend Developer",
    period: "2018 – 2019",
    summary: "Restaurant management and accounting software.",
    highlights: ["Orders, reservations, inventory, stock, sales, purchases and reports screens."],
    stack: ["Angular", "ASP.NET", "KendoUI"],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export const stats = [
  { big: `${profile.years}+`, small: "Years shipping products" },
  { big: `${projects.length}`, small: "Products & systems built" },
  { big: "100k+", small: "Daily users on one product" },
];

export const sections: { id: SectionId; label: string; place: string }[] = [
  { id: "about", label: "About", place: "Sky Hall" },
  { id: "origin", label: "Origin", place: "Golden Stupa" },
  { id: "experience", label: "Experience", place: "Stairway" },
  { id: "skills", label: "Skills", place: "Observatory" },
  { id: "projects", label: "Projects", place: "Gallery" },
  { id: "contact", label: "Contact", place: "Balloon Dock" },
];
