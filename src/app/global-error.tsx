'use client';

import Link from 'next/link';

/** Last line of defence: if even the root layout fails, still show a calm page with a way out. */
export default function GlobalError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Arial, sans-serif', background: '#fbf6ee', color: '#16152b' }}>
        <main style={{ maxWidth: 560, margin: '15vh auto', padding: 16, textAlign: 'center' }}>
          <h1 style={{ fontSize: 40, textTransform: 'uppercase' }}>Thuso will be right back</h1>
          <p style={{ fontSize: 18 }}>Something went wrong loading the school. It’s not you.</p>
          <p style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                border: 0,
                background: '#6e5fd3',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                border: '2px solid #16152b',
                color: '#16152b',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Home
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
