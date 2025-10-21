import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Anders Planck - Full-Stack Developer';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        }}
      >
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
          }}
        >
          {/* Logo/Monogram */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 'bold',
              color: '#f97316',
              marginBottom: 40,
              fontFamily: 'serif',
            }}
          >
            AP
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            Anders Planck
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 36,
              color: '#d1d5db',
              marginBottom: 40,
              textAlign: 'center',
            }}
          >
            Full-Stack Developer
          </div>

          {/* Tech Stack */}
          <div
            style={{
              display: 'flex',
              gap: 20,
              fontSize: 24,
              color: '#f97316',
            }}
          >
            <span>React</span>
            <span>·</span>
            <span>Next.js</span>
            <span>·</span>
            <span>TypeScript</span>
            <span>·</span>
            <span>PHP</span>
          </div>

          {/* Location */}
          <div
            style={{
              fontSize: 20,
              color: '#9ca3af',
              marginTop: 40,
            }}
          >
            📍 Ferrara, Italy
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: '#6b7280',
          }}
        >
          anders-games.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
