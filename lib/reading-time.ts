/**
 * Calculate estimated reading time for text content
 * Average reading speed: 200-250 words per minute
 * Using 225 wpm as a middle ground
 */
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 225;

  // Remove code blocks and special characters for more accurate word count
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/[*_~`]/g, '') // Remove markdown formatting
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links, keep text
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // Remove images
    .trim();

  const words = cleanContent.split(/\s+/).filter((word) => word.length > 0).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  if (minutes === 1) {
    return '1 min read';
  }

  return `${minutes} min read`;
}

/**
 * Get word count from content
 */
export function getWordCount(content: string): number {
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .trim();

  return cleanContent.split(/\s+/).filter((word) => word.length > 0).length;
}
