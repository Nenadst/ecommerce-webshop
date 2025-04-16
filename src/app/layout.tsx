import type { Metadata } from 'next';
import './globals.css';
import { METADATA } from '../data/metadata';
import { poppins } from '@/lib/fonts';
import ClientProviders from '@/components/clientProviders/CllientProviders';

export const metadata: Metadata = {
  title: METADATA.title + METADATA.bTitle,
  description: METADATA.description,
  keywords: METADATA.keywords,
  authors: {
    name: METADATA.author,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
