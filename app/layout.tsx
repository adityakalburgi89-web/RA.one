import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RAVANA AI — The Voice of Lanka',
  description: 'Multilingual AI character chatbot of King Ravana from the ancient Ramayana tradition.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-obsidian-950 text-gold-light antialiased selection:bg-gold/30 selection:text-gold-glow">
        {children}
      </body>
    </html>
  );
}
