import React from 'react';

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Anders Planck Portfolio",
    "url": "https://anders-games.com",
    "description": "Full-stack developer specializing in React, Next.js, TypeScript, PHP, and modern web technologies.",
    "author": {
      "@type": "Person",
      "@id": "https://anders-games.com/#person"
    },
    "publisher": {
      "@type": "Person",
      "@id": "https://anders-games.com/#person"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function PersonStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://anders-games.com/#person",
    "name": "Anders Planck",
    "givenName": "Anders",
    "familyName": "Planck",
    "jobTitle": "Full-Stack Developer",
    "description": "Full-stack developer with 3+ years of experience, specialized in PHP and modern web technologies.",
    "url": "https://anders-games.com",
    "image": "https://anders-games.com/images/authors/me2.jpg",
    "sameAs": [
      "https://github.com/Anders-planck",
      "https://linkedin.com/in/anders-planck-53184b1b4"
    ],
    "knowsAbout": [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "PHP",
      "Laravel",
      "Symfony",
      "Node.js",
      "Web Development",
      "Full-Stack Development"
    ],
    "alumniOf": {
      "@type": "Organization",
      "name": "Software Engineering"
    },
    "worksFor": {
      "@type": "Organization",
      "name": "A-Cube S.R.L."
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ferrara",
      "addressCountry": "IT"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BlogPostingStructuredDataProps {
  title: string;
  description: string;
  publishedAt: string;
  slug: string;
  image?: string;
  author?: string;
  tags?: string[];
}

export function BlogPostingStructuredData({
  title,
  description,
  publishedAt,
  slug,
  image,
  author = "Anders Planck",
  tags = []
}: BlogPostingStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": image || "https://anders-games.com/opengraph-image",
    "datePublished": publishedAt,
    "dateModified": publishedAt,
    "author": {
      "@type": "Person",
      "name": author,
      "@id": "https://anders-games.com/#person"
    },
    "publisher": {
      "@type": "Person",
      "name": "Anders Planck",
      "@id": "https://anders-games.com/#person"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://anders-games.com/posts/${slug}`
    },
    "keywords": tags.join(", "),
    "articleSection": "Technology",
    "inLanguage": "en-US"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
