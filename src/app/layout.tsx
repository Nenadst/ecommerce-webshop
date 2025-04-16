import type { Metadata } from 'next';
import './globals.css';
import { METADATA } from '../data/metadata';
import { poppins } from '@/lib/fonts';
import ClientProviders from '@/components/clientProviders/CllientProviders';
import { Toaster } from 'react-hot-toast';

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
        <ClientProviders>
          {children}{' '}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#000',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
              },
            }}
          />
        </ClientProviders>
      </body>
    </html>
  );
}
