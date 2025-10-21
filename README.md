# Anders Planck - Software Engineer Portfolio

A modern, performant portfolio website built with Next.js 15, showcasing software engineering expertise, technical blog posts, and project work.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Features

### Core Functionality
- **📝 MDX Blog System** - Write technical articles with syntax highlighting and GitHub Flavored Markdown
- **🎨 Project Showcase** - Display portfolio projects with detailed case studies
- **📊 Interactive Data Visualizations** - Skills, tech stack, and language proficiency charts using Recharts
- **📧 Advanced Contact Form** - Multi-field form with EmailJS integration and conditional logic
- **🌓 Dark/Light Mode** - Seamless theme switching with next-themes
- **📱 Fully Responsive** - Mobile-first design with optimal viewing on all devices

### Technical Highlights
- **⚡ Next.js 15 with Turbopack** - Blazing fast development and production builds
- **🎯 TypeScript** - Full type safety across the entire application
- **🎨 Tailwind CSS 4** - Modern utility-first styling with custom design system
- **♿ Accessible Components** - Built on Radix UI primitives for WCAG compliance
- **🔍 SEO Optimized** - Proper metadata, semantic HTML, and structured data
- **📦 Component Library** - Shadcn/ui components with customization

## 🚀 Quick Start

### Prerequisites
- **Bun** 1.0+ (preferred) or Node.js 20+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Anders-planck/portfolio.git
cd portfolio
```

2. **Install dependencies**
```bash
bun install
# or
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your EmailJS credentials and configure the system banner:
```env
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# System Banner Configuration
NEXT_PUBLIC_SHOW_BANNER=false
NEXT_PUBLIC_BANNER_MESSAGE=🚧 Website under construction - New features coming soon!
NEXT_PUBLIC_BANNER_TYPE=info
```

4. **Run the development server**
```bash
bun dev
# or
npm run dev
```

5. **Open your browser**

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
portfoglio/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx             # Home page
│   ├── posts/               # Blog posts routes
│   │   ├── page.tsx         # Posts index with filtering
│   │   └── [slug]/page.tsx  # Individual post
│   ├── projects/            # Projects routes
│   │   ├── page.tsx         # Projects index with filtering
│   │   └── [slug]/page.tsx  # Individual project
│   └── not-found.tsx        # 404 page
│
├── components/              # React components
│   ├── ui/                  # Shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   ├── contact-form.tsx     # Advanced contact form
│   ├── header.tsx           # Navigation header
│   ├── footer.tsx           # Site footer
│   ├── intro.tsx            # Hero section
│   ├── recent-content.tsx   # Latest posts & projects
│   ├── stats-overview.tsx   # Professional metrics
│   ├── skills-donut-chart.tsx
│   ├── languages-donut.tsx
│   ├── tech-stack-donut.tsx
│   ├── skills-radar-chart.tsx
│   └── ...
│
├── content/                 # MDX content
│   ├── posts/              # Blog posts
│   │   ├── introduction-to-mdx.mdx
│   │   ├── ai-machine-learning-2024.mdx
│   │   └── ...
│   └── projects/           # Project case studies
│       └── expo-mutual-tls.mdx
│
├── lib/                    # Utility functions
│   ├── utils.ts           # Helper functions
│   ├── posts.ts           # Blog post utilities
│   ├── projects.ts        # Project utilities
│   ├── cv-data.ts         # Professional data
│   └── emailjs.ts         # Email service integration
│
├── public/                # Static assets
│   ├── cv.pdf            # Downloadable CV
│   └── images/           # Project images
│
└── styles/               # Global styles
    └── globals.css       # Tailwind directives & custom CSS
```

## 🎨 Key Components

### Contact Form
Advanced multi-field contact form with intelligent field display:
- **Subject Dropdown** - Pre-defined inquiry types (Job, Freelance, Consulting, etc.)
- **Conditional Fields** - Project details shown for freelance/consulting inquiries
- **Form Validation** - React Hook Form with TypeScript
- **EmailJS Integration** - Client-side email sending with custom templates

```typescript
// Example usage
<ContactForm compact />
```

### Data Visualizations
Interactive charts powered by Recharts:
- **Skills Donut Chart** - Distribution across technology domains
- **Languages Donut** - Multilingual proficiency levels
- **Tech Stack Donut** - Interactive technology breakdown
- **Radar Chart** - Top 3 skills per domain

### MDX Content System
Powerful content management with:
- **Gray Matter** - YAML frontmatter parsing
- **Next MDX Remote** - Server-side MDX rendering
- **Rehype Pretty Code** - Syntax highlighting with Shiki
- **Remark GFM** - GitHub Flavored Markdown support

```mdx
---
title: "My Blog Post"
publishedAt: "2025-01-15"
summary: "Post description"
tags: ["react", "nextjs"]
---

# Content goes here
```

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15.5.6** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Tailwind Typography** - Beautiful prose styling
- **tw-animate-css** - Animation utilities

### UI Components
- **Radix UI** - Accessible component primitives
  - Select, Dialog, Popover, Tabs, Calendar, Avatar, Checkbox, Label
- **Shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **Class Variance Authority** - Component variants

### Data & Forms
- **React Hook Form** - Form state management
- **Recharts** - Chart visualizations
- **EmailJS Browser** - Client-side email service

### Content Management
- **Next MDX Remote** - MDX rendering
- **Gray Matter** - Frontmatter parsing
- **Rehype Pretty Code** - Code highlighting
- **Shiki** - Syntax highlighter
- **Remark GFM** - GitHub Flavored Markdown

### Developer Experience
- **Bun** - Fast JavaScript runtime
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing

## 🚨 System Banner

The portfolio includes a configurable system banner for displaying announcements, maintenance notices, or build status at the top of the website.

### Configuration

Control the banner via environment variables in `.env.local`:

```env
# Show or hide the banner
NEXT_PUBLIC_SHOW_BANNER=true

# Customize the message
NEXT_PUBLIC_BANNER_MESSAGE=🚧 New features coming soon!

# Set the banner type (affects color scheme)
NEXT_PUBLIC_BANNER_TYPE=info
```

### Banner Types

- **`info`** (default) - Blue banner for informational messages
- **`warning`** - Yellow banner for warnings or caution notices
- **`error`** - Red banner for errors or critical alerts
- **`success`** - Green banner for success messages or positive announcements

### Features

- **Environment-based control** - Toggle visibility with a single env variable
- **Dismissible** - Users can close the banner (saved to localStorage)
- **Responsive design** - Looks great on all screen sizes
- **Accessible** - Proper ARIA attributes and semantic HTML
- **Theme-aware** - Adapts to dark/light mode

### Example Use Cases

```env
# During maintenance
NEXT_PUBLIC_SHOW_BANNER=true
NEXT_PUBLIC_BANNER_MESSAGE=⚙️ Scheduled maintenance in progress - Some features may be unavailable
NEXT_PUBLIC_BANNER_TYPE=warning

# Build in progress
NEXT_PUBLIC_SHOW_BANNER=true
NEXT_PUBLIC_BANNER_MESSAGE=🚧 Website under construction - New features being added!
NEXT_PUBLIC_BANNER_TYPE=info

# Feature announcement
NEXT_PUBLIC_SHOW_BANNER=true
NEXT_PUBLIC_BANNER_MESSAGE=🎉 New blog posts available! Check out the latest articles
NEXT_PUBLIC_BANNER_TYPE=success
```

## 📧 EmailJS Setup

The contact form uses EmailJS for client-side email sending. Follow the [Quick Setup Guide](./QUICK_TEMPLATE_SETUP.md) to configure:

1. Create EmailJS account at [emailjs.com](https://www.emailjs.com/)
2. Set up email service (Gmail, Outlook, etc.)
3. Create template with enhanced HTML (see QUICK_TEMPLATE_SETUP.md)
4. Add credentials to `.env.local`

### Email Template Features
- Conditional field rendering (Mustache syntax)
- Professional SVG illustrations
- Responsive email design
- Orange/amber theme matching portfolio
- Project details section for freelance inquiries
- Additional contact information fields

## 📝 Creating Content

### Blog Posts

Create a new MDX file in `content/posts/`:

```mdx
---
title: "Your Blog Post Title"
publishedAt: "2025-01-21"
summary: "Brief description of your post"
tags: ["typescript", "react", "nextjs"]
---

# Your Blog Post

Your content goes here with full MDX support!

## Code Examples

```typescript
const example = "TypeScript code with syntax highlighting";
```

## Lists, Links, and More

- GitHub Flavored Markdown
- Syntax highlighting
- Typography styling
```

### Projects

Create a new MDX file in `content/projects/`:

```mdx
---
title: "Your Project Name"
publishedAt: "2025-01-21"
summary: "Project description"
tags: ["react-native", "typescript"]
image: "/images/project-screenshot.png"
---

# Project Overview

Detailed project case study...
```

## 🎯 Scripts

```bash
# Development
bun dev          # Start dev server with Turbopack
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint

# Type checking
bun run typecheck  # Run TypeScript compiler
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Anders-planck/portfolio)

### Other Platforms

Build output can be deployed to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- Any Node.js hosting

## 🎨 Customization

### Theme Colors

Edit `app/globals.css` to customize colors:

```css
@layer base {
  :root {
    --primary: 24.6 95% 53.1%;      /* Orange #d97706 */
    --primary-foreground: 0 0% 100%;
    /* ... other theme variables */
  }
}
```

### Fonts

Modify `app/layout.tsx` to change fonts:

```typescript
import { YourFont } from "next/font/google";

const customFont = YourFont({
  variable: "--font-custom",
  subsets: ["latin"],
});
```

### CV Data

Update professional information in `lib/cv-data.ts`:

```typescript
export const skills: Skill[] = [
  { name: "React", level: 90, category: "Frontend" },
  // Add your skills
];

export const languages: Language[] = [
  { name: "English", level: "Native", proficiency: 100 },
  // Add your languages
];
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Anders Planck**
- Portfolio: [anders-games.com](https://anders-games.com)
- GitHub: [@Anders-planck](https://github.com/Anders-planck)
- LinkedIn: [@Anders-planck](https://linkedin.com/in/anders-planck-53184b1b4)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Deployment platform
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [EmailJS](https://www.emailjs.com/) - Email service
- [unDraw](https://undraw.co/) - Illustrations

## 📮 Support

For questions or issues, please open an issue on [GitHub](https://github.com/Anders-planck/portfolio/issues).

---

**Built with ❤️ using Next.js 15 and React 19**
