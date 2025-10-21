// CV Data extracted from LaTeX CV
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

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  technologies: string[];
  highlights: string[];
}

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

export const languages: Language[] = [
  { name: "French", level: "Native", proficiency: 100 },
  { name: "Italian", level: "B2", proficiency: 75 },
  { name: "English", level: "B1", proficiency: 65 },
];

export const experiences: Experience[] = [
  {
    company: "A-Cube S.R.L.",
    role: "Full Stack Developer",
    period: "January 2023 - Present",
    description: "Full-stack development with focus on PHP, TypeScript, and modern web technologies",
    technologies: ["PHP", "TypeScript", "React", "Symfony", "AWS", "Docker"],
    highlights: [
      "Developed enterprise SDK for e-receipts management",
      "Created Expo module for mTLS authentication",
      "Built scalable microservices architecture",
      "Implemented AWS serverless solutions",
      "Led frontend modernization projects",
    ],
  },
];

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

export const softSkills = [
  { name: "Problem Solving", description: "Analytical approach to complex challenges" },
  { name: "Team Work", description: "Collaborative development with Agile/Scrum" },
  { name: "Adaptability", description: "Quick learner with new technologies" },
  { name: "Quality Focus", description: "Strong emphasis on code quality and testing" },
];

export const professionalGoal =
  "I aim to contribute to challenging full-stack projects in a dynamic environment, leveraging my 3+ years of experience in PHP and modern web technologies to deliver scalable, high-quality solutions while continuously growing my technical expertise.";

export const bio =
  "Full Stack Developer with ~3 years of experience, specialized in PHP and modern web technologies. Strong passion for designing scalable solutions following best practices. Active contributor to open source and private projects, handling backend, frontend, APIs, infrastructure, and user interfaces.";
