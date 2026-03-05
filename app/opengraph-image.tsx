import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Academic Profile - Semiconductor Research';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '60px 80px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#1a1a1a',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Academic Profile
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#666',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            Theoretical Physics & Semiconductor Research
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
