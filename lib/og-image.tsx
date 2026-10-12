import { ImageResponse } from 'next/og';

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = 'image/png';

/** Shared brand-card generator for app/opengraph-image.tsx and
 * app/twitter-image.tsx -- same hex values as app/globals.css (no CSS vars;
 * satori renders this independently of Tailwind). */
export function renderOgImage(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FBF5EE',
          backgroundImage: 'linear-gradient(135deg, #FBF5EE 0%, #F6DCD4 100%)',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '2px solid #C9A27A',
            color: '#8E5B52',
            fontSize: 56,
            marginBottom: 32,
          }}
        >
          R
        </div>
        <div style={{ fontSize: 72, color: '#5B3A34' }}>{title}</div>
        <div style={{ fontSize: 28, color: '#8E5B52', marginTop: 16, letterSpacing: 2 }}>{subtitle}</div>
      </div>
    ),
    { ...ogImageSize },
  );
}
