import type { Metadata } from 'next';
import { Poppins } from 'next/font/google'; // Changed from Inter to Poppins
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

// Initialize Poppins font with desired subsets and weights
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'], // Include weights used in the design
  variable: '--font-sans', // Assign to CSS variable
});

export const metadata: Metadata = {
  title: 'StoryMagic',
  description: 'Personalized Children\'s Story Generator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          poppins.variable // Use the Poppins font variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
