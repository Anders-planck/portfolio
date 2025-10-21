import { getPosts } from '@/lib/posts';

export async function GET() {
  const posts = await getPosts();
  const baseUrl = 'https://anders-games.com';

  const rssItemsXml = posts
    .map((post) => {
      const postUrl = `${baseUrl}/posts/${post.slug}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.summary || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>anders.jipwouo@gmail.com (Anders Planck)</author>
      ${post.tags?.map((tag) => `<category>${tag}</category>`).join('\n      ') || ''}
    </item>`;
    })
    .join('\n');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Anders Planck - Blog</title>
    <link>${baseUrl}</link>
    <description>Full-Stack Developer blog - Articles on React, Next.js, TypeScript, PHP, and modern web technologies</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
