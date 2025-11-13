// lib/placeholder.ts

/**
 * Generate a professional gradient placeholder image
 * @param width - Width of the image
 * @param height - Height of the image
 * @param seed - Seed for consistent colors (e.g., project slug)
 * @returns Data URI for the placeholder
 */
export function generateGradientPlaceholder(
    width: number = 800,
    height: number = 600,
    seed?: string
  ): string {
    // Generate colors based on seed
    const colors = seed ? getColorsFromSeed(seed) : getRandomColors();
    
    // Create SVG with gradient
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  
  /**
   * Generate colors from a seed string (deterministic)
   */
  function getColorsFromSeed(seed: string): [string, string, string] {
    const hash = Array.from(seed).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 120) % 360;
    const hue3 = (hue1 + 240) % 360;
    
    return [
      `hsl(${hue1}, 70%, 60%)`,
      `hsl(${hue2}, 70%, 50%)`,
      `hsl(${hue3}, 70%, 55%)`,
    ];
  }
  
  /**
   * Get random professional colors
   */
  function getRandomColors(): [string, string, string] {
    const palettes = [
      ['#667eea', '#764ba2', '#f093fb'], // Purple-Pink
      ['#4facfe', '#00f2fe', '#43e97b'], // Blue-Cyan-Green
      ['#fa709a', '#fee140', '#30cfd0'], // Pink-Yellow-Cyan
      ['#a8edea', '#fed6e3', '#9face6'], // Pastel
      ['#ff6b6b', '#feca57', '#48dbfb'], // Warm
      ['#667eea', '#764ba2', '#667eea'], // Deep Purple
    ];
    
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    return palette as [string, string, string];
  }
  
  /**
   * Generate a pattern-based placeholder
   */
  export function generatePatternPlaceholder(
    width: number = 800,
    height: number = 600,
    seed?: string
  ): string {
    const colors = seed ? getColorsFromSeed(seed) : getRandomColors();
    const patternSize = 40;
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
          </linearGradient>
          <pattern id="pattern" x="0" y="0" width="${patternSize}" height="${patternSize}" patternUnits="userSpaceOnUse">
            <circle cx="${patternSize / 2}" cy="${patternSize / 2}" r="2" fill="${colors[2]}" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <rect width="100%" height="100%" fill="url(#pattern)" />
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  
  /**
   * Generate placeholder with text
   */
  export function generateTextPlaceholder(
    text: string,
    width: number = 800,
    height: number = 600,
    seed?: string
  ): string {
    const colors = seed ? getColorsFromSeed(seed) : getRandomColors();
    const fontSize = Math.min(width, height) / 10;
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <text 
          x="50%" 
          y="50%" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${fontSize}px" 
          font-weight="bold"
          fill="rgba(255, 255, 255, 0.9)" 
          text-anchor="middle" 
          dominant-baseline="middle"
        >
          ${text}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  
  /**
   * Generate blur placeholder for Next.js Image
   */
  export function generateBlurPlaceholder(seed?: string): string {
    const colors = seed ? getColorsFromSeed(seed) : getRandomColors();
    
    const svg = `
      <svg width="40" height="30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)" />
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  