import type { Metadata, Viewport } from 'next';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';
import './components.css';
import { AppShell } from '@/components/layout/AppShell';
import { SplashScreen } from '@/components/pwa/SplashScreen';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

config.autoAddCss = false;

export const metadata: Metadata = {
  title: {
    default: 'Gadget Malawi — Buy & Sell Gadgets, Phones, Laptops, PC Parts',
    template: '%s · Gadget Malawi',
  },
  description:
    'Buy and sell genuine gadgets, phones, laptops, PC parts, and accessories across Malawi. Verified sellers, clear prices in MWK, and secure mobile money payments.',
  applicationName: 'Gadget Malawi',
  keywords: [
    'Gadget Malawi',
    'Malawi marketplace',
    'buy laptop Malawi',
    'sell phone Malawi',
    'PC parts Malawi',
    'GPU Malawi',
    'SSD Malawi',
    'Blantyre tech',
    'Lilongwe tech',
    'Airtel Money',
    'TNM Mpamba',
  ],
  authors: [{ name: 'Gadget Malawi' }],
  creator: 'Gadget Malawi',
  publisher: 'Gadget Malawi',
  metadataBase: new URL('https://gadgetmalawi.mw'),
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Gadget Malawi',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    locale: 'en_MW',
    url: 'https://gadgetmalawi.mw',
    siteName: 'Gadget Malawi',
    title: 'Gadget Malawi — Buy & Sell Gadgets Across Malawi',
    description:
      'Verified sellers. Clear MWK prices. Secure mobile money payments. The trusted marketplace for gadgets and PC parts in Malawi.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gadget Malawi',
    description: 'The trusted marketplace for gadgets and PC parts in Malawi.',
  },
   icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b2518' },
    { media: '(prefers-color-scheme: light)', color: '#f5f7f2' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-MW" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('gadget-malawi-theme');
                  if (saved === 'light' || saved === 'dark') {
                    document.documentElement.dataset.theme = saved;
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <SplashScreen />
        <AppShell>{children}</AppShell>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}