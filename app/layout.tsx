import type { Metadata } from 'next';
import { Fugaz_One, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import SiteGuard from '@/components/SiteGuard';

const fugaz = Fugaz_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Ingarandi Burger! — Hambúrgueres Artesanais em Sarandi',
  description: 'Hambúrgueres artesanais feitos com obsessão. Ingredientes premium e entrega rápida.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fugaz.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-marrom-900 text-creme font-body overflow-x-hidden" suppressHydrationWarning>
        <SiteGuard>
          <CartProvider>
            {children}
          </CartProvider>
        </SiteGuard>
      </body>
    </html>
  );
}
