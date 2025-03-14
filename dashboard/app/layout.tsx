import type { Metadata } from 'next';
import './globals.css';
import { Inter, Roboto } from 'next/font/google';

export const metadata: Metadata = {
  title: 'S+ Quiz Admin',
  description: 'S+ Quiz Admin',
};

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap', // FOUT 방지
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable}`}>
      <body className="font-inter font-normal text-size-14px">{children}</body>
    </html>
  );
}
