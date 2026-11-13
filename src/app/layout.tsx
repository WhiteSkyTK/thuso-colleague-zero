import type { Metadata } from 'next';
import { Big_Shoulders, DM_Sans, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

// DESIGN.md §3: open-licence Google Fonts, self-hosted by next/font. Variables feed --ff-* in globals.css.
const display = Big_Shoulders({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--ff-display',
  // next/font has no metric overrides for this family yet; skip the generated fallback.
  adjustFontFallback: false,
});
const body = DM_Sans({ subsets: ['latin'], variable: '--ff-body' });
const code = JetBrains_Mono({ subsets: ['latin'], variable: '--ff-code' });

export const metadata: Metadata = {
  title: 'Thuso — a learner-support colleague',
  description:
    'A team of AI agents that finds learners at risk, works out why and delivers catch-up plans.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${code.variable}`}>
      <body>{children}</body>
    </html>
  );
}
