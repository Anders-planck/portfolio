// CV Data extracted from official LaTeX CV (https://github.com/Anders-planck/cv)

export interface Skill {
  name: string;
  level: number; // 0-100
  category: string;
}

export interface Language {
  name: string;
  level: string;
  proficiency: number; // 0-100
}

export interface Project {
  title: string;
  period: string;
  description: string;
  technologies: string[];
  achievements: string[];
  metrics?: string[];
  isOngoing: boolean;
}

export interface WorkExperience {
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
  projects: Project[];
  isOngoing: boolean;
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  location: string;
  description: string;
  isOngoing: boolean;
}

export interface PersonalProject {
  title: string;
  year: string;
  description: string;
  technologies: string[];
  achievements: string[];
}

// Technical Skills
export const skills: Skill[] = [
  // Backend
  { name: "PHP", level: 90, category: "Backend" },
  { name: "Laravel", level: 85, category: "Backend" },
  { name: "Symfony", level: 90, category: "Backend" },
  { name: "Node.js", level: 80, category: "Backend" },
  { name: "Adonis.js", level: 75, category: "Backend" },

  // Frontend
  { name: "TypeScript", level: 90, category: "Frontend" },
  { name: "JavaScript", level: 95, category: "Frontend" },
  { name: "React", level: 90, category: "Frontend" },
  { name: "React Native", level: 85, category: "Frontend" },
  { name: "Next.js", level: 80, category: "Frontend" },
  { name: "CSS3/HTML5", level: 90, category: "Frontend" },

  // Database
  { name: "MySQL", level: 85, category: "Database" },
  { name: "PostgreSQL", level: 80, category: "Database" },
  { name: "NoSQL", level: 75, category: "Database" },

  // DevOps & Cloud
  { name: "Docker", level: 80, category: "DevOps" },
  { name: "AWS", level: 75, category: "DevOps" },
  { name: "CI/CD", level: 80, category: "DevOps" },
  { name: "Linux", level: 85, category: "DevOps" },

  // API & Architecture
  { name: "REST API", level: 95, category: "API" },
  { name: "API Platform", level: 85, category: "API" },
  { name: "Microservices", level: 80, category: "API" },
];

// Languages
export const languages: Language[] = [
  { name: "French", level: "Native", proficiency: 100 },
  { name: "Italian", level: "B2", proficiency: 75 },
  { name: "English", level: "B1", proficiency: 65 },
];

// Work Experience
export const workExperience: WorkExperience[] = [
  {
    company: "A-Cube S.R.L.",
    role: "Full Stack Developer",
    period: "January 2023 - Present",
    location: "Ferrara, Italy",
    description: "Full-stack development specializing in PHP, TypeScript, and modern web technologies. Leading enterprise solutions, SDK development, and infrastructure modernization across 9+ major projects.",
    isOngoing: true,
    projects: [
      {
        title: "A-Cube e-Receipts SDK (NPM Package)",
        period: "July 2025 - Present",
        isOngoing: true,
        description: "TypeScript-based SDK for electronic receipt management integration with enterprise systems.",
        technologies: ["TypeScript", "NPM", "mTLS", "API Integration"],
        achievements: [
          "High-performance modular architecture for online/offline environments",
          "Intelligent caching system for optimized data retrieval",
          "Queue system for offline operations with automatic synchronization",
          "mTLS authentication implementation for secure communications",
        ],
      },
      {
        title: "Expo Mutual TLS Module",
        period: "July 2025 - Present",
        isOngoing: true,
        description: "Open-source React Native/Expo module for mutual TLS authentication across iOS and Android platforms.",
        technologies: ["React Native", "Expo", "Swift", "Kotlin", "TypeScript"],
        achievements: [
          "Native implementations for iOS (Swift) and Android (Kotlin)",
          "Biometric authentication support integration",
          "Comprehensive event management system",
          "Open-source contribution to React Native ecosystem",
        ],
      },
      {
        title: "Web/Mobile Applications (Pem-Pel Dashboard)",
        period: "June 2025 - Present",
        isOngoing: true,
        description: "Cross-platform mobile application with reactive UI and performance optimization.",
        technologies: ["React Native", "TypeScript", "React Context", "React Query"],
        achievements: [
          "Reactive UI with advanced performance optimization techniques",
          "State management via React Context and React Query",
          "Cross-platform compatibility for iOS and Android",
        ],
      },
      {
        title: "Invoice/PA Dashboard & A-Cube Products",
        period: "January 2025 - Present",
        isOngoing: true,
        description: "Frontend development and UI/UX design for invoice management and public administration dashboard.",
        technologies: ["React 18", "TypeScript", "Redux Toolkit", "Material-UI"],
        achievements: [
          "Code-splitting implementation for performance optimization",
          "Multi-language support with comprehensive localization",
          "PDF generation and management with PDF.js integration",
        ],
        metrics: ["40% bundle size reduction", "65% performance improvement", "4.8/5 user rating"],
      },
      {
        title: "A-Cube E-Invoicing - Stripe App Extension",
        period: "January 2024 - Present",
        isOngoing: true,
        description: "Enterprise-grade Stripe app extension for electronic invoicing with advanced state management.",
        technologies: ["React", "TypeScript", "Stripe API", "Context API"],
        achievements: [
          "6-level context architecture without Redux for optimized performance",
          "8 primary views with advanced form validation",
          "173 memoization instances for performance optimization",
        ],
      },
      {
        title: "Stripe Dashboard Integrations",
        period: "January 2024 - December 2024",
        isOngoing: false,
        description: "Advanced document management dashboard with RESTful API backend and responsive frontend.",
        technologies: ["React", "TypeScript", "Stripe API", "Jest"],
        achievements: [
          "RESTful API backend development",
          "Responsive React/TypeScript frontend implementation",
          "Automated testing with comprehensive test coverage",
        ],
      },
      {
        title: "Open Banking UI",
        period: "January 2024 - September 2024",
        isOngoing: false,
        description: "React SPA for SEPA payment systems with multi-language support and document management.",
        technologies: ["React 18", "Vite", "React Intl", "PDF.js"],
        achievements: [
          "SEPA and SEPA Instant payment systems integration",
          "Multi-language support with React Intl",
          "PDF.js integration for document handling",
        ],
      },
      {
        title: "Preservation API",
        period: "May 2023 - December 2024",
        isOngoing: false,
        description: "Digital archival service compliant with Italian regulations for long-term document preservation.",
        technologies: ["Symfony 6.2+", "API Platform 3", "PostgreSQL", "JWT", "AWS S3", "AWS Lambda"],
        achievements: [
          "Italian regulatory compliance for digital archival",
          "AWS S3/Lambda integration for scalable storage",
          "JWT authentication and authorization",
          "PHPStan level 8 code quality standards",
        ],
        metrics: ["200+ Behat scenarios", "PHPStan level 8"],
      },
      {
        title: "Corporate Email Notification System (Notifier)",
        period: "May 2023 - September 2023",
        isOngoing: false,
        description: "AWS serverless email notification system with event tracking and analytics.",
        technologies: ["Python 3.12", "AWS Lambda", "AWS SES", "DynamoDB", "HTML", "Tailwind CSS"],
        achievements: [
          "AWS serverless architecture implementation",
          "HTML/Tailwind CSS responsive email templates",
          "SES event tracking with DynamoDB storage",
        ],
        metrics: [">80% test coverage"],
      },
    ],
  },
];

// Education
export const education: Education[] = [
  {
    degree: "Master's in Computer Engineering & Automation",
    institution: "Università degli Studi di Ferrara",
    period: "September 2023 - December 2025",
    location: "Ferrara, Italy",
    description: "Advanced studies in computer engineering with focus on automation, software architecture, and distributed systems.",
    isOngoing: true,
  },
  {
    degree: "Bachelor's in Computer Science & Electronics",
    institution: "Università degli Studi di Ferrara",
    period: "September 2020 - June 2023",
    location: "Ferrara, Italy",
    description: "Foundational education in computer science, software development, and electronic systems.",
    isOngoing: false,
  },
];

// Personal Projects
export const personalProjects: PersonalProject[] = [
  {
    title: "Professional Portfolio Website",
    year: "2025",
    description: "Modern, SEO-optimized portfolio website showcasing professional experience, technical skills, and projects. Built with Next.js 15 and TypeScript with comprehensive timeline visualization.",
    technologies: ["Next.js 15", "TypeScript", "React 18", "Tailwind CSS", "shadcn/ui", "MDX", "Recharts", "Vercel Analytics"],
    achievements: [
      "Advanced timeline component for work experience and education visualization",
      "SEO optimization with sitemap.xml, robots.txt, structured data (JSON-LD), and OG images",
      "Interactive skill visualizations with donut charts and radar charts",
      "MDX-powered blog with syntax highlighting and reading time calculation",
      "RSS feed for blog subscribers and social sharing functionality",
      "Vercel Analytics and Speed Insights integration for performance monitoring",
      "Full accessibility compliance (WCAG 2.1 AA) with skip-to-content navigation",
      "Responsive design with dark/light theme support",
    ],
  },
  {
    title: "VueKit",
    year: "2022",
    description: "Next.js/Firebase SaaS platform with comprehensive component library and role-based access control.",
    technologies: ["Next.js", "Firebase", "Chakra UI", "TipTap", "Framer Motion", "Tailwind CSS", "Chart.js", "Vercel"],
    achievements: [
      "65+ React components built with Chakra UI",
      "Role-based access control implementation",
      "Performance optimization with Tailwind CSS",
      "Data visualization with Chart.js",
      "Deployed on Vercel with continuous deployment",
    ],
  },
];

// Soft Skills
export const softSkills = [
  { name: "Problem Solving", description: "Analytical approach to complex technical challenges" },
  { name: "Team Collaboration", description: "Effective teamwork in Agile/Scrum environments" },
  { name: "Adaptability", description: "Quick learner with emerging technologies and frameworks" },
  { name: "Quality Focus", description: "Strong emphasis on code quality, testing, and best practices" },
];

// Professional Goal
export const professionalGoal =
  "I aim to contribute to challenging full-stack projects in a dynamic environment, leveraging my 3+ years of experience in PHP and modern web technologies to deliver scalable, high-quality solutions while continuously growing my technical expertise.";

// Bio
export const bio =
  "Full Stack Developer with ~3 years of experience, specialized in PHP and modern web technologies. Strong passion for designing scalable solutions following best practices. Active contributor to open source and private projects, handling backend, frontend, APIs, infrastructure, and user interfaces.";

// Compatibility exports for existing components
export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  technologies: string[];
  highlights: string[];
}

// Convert workExperience to flat experiences format for backward compatibility
export const experiences: Experience[] = workExperience.flatMap(work =>
  work.projects.length > 0
    ? work.projects.map(project => ({
        company: work.company,
        role: project.title,
        period: project.period,
        description: project.description,
        technologies: project.technologies,
        highlights: project.achievements,
      }))
    : [{
        company: work.company,
        role: work.role,
        period: work.period,
        description: work.description,
        technologies: [],
        highlights: [],
      }]
);

export const technicalCompetencies = {
  backend: ["PHP (Laravel, Symfony)", "Node.js (Adonis.js)"],
  frontend: [
    "JavaScript",
    "TypeScript",
    "React",
    "React Native",
    "CSS3",
    "HTML5",
    "Responsive Design",
  ],
  api: ["RESTful API", "JSON", "WebSocket"],
  database: ["MySQL", "PostgreSQL", "NoSQL"],
  devops: ["Linux", "Docker", "CI/CD", "Firebase", "Supabase", "AWS"],
  methodologies: [
    "Agile",
    "Scrum",
    "Unit Testing",
    "Integration Testing",
    "Git",
    "Code Review",
  ],
  other: [
    "Open Source Contributions",
    "Performance Optimization",
    "Technical Writing",
  ],
};
