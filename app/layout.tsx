import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import MetaPixel from "@/components/MetaPixel";
import { META_PIXEL_ID } from "@/lib/meta-pixel";

const BASE_URL = 'https://labjiujitsu.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'The Jiu-Jitsu Lab | Brazilian Jiu-Jitsu in Waterloo, ON',
    template: '%s | The Jiu-Jitsu Lab Waterloo',
  },
  description: "Waterloo's dedicated Brazilian Jiu-Jitsu academy. Led by IBJJF No-Gi World Silver Medalist Brandon Twaddle and IBJJF World Champion Dave Knowles. Gi, No-Gi, Kids, Women's & Competition programs. First week free.",
  keywords: [
    'BJJ Waterloo', 'Brazilian Jiu-Jitsu Waterloo', 'BJJ Kitchener',
    'martial arts Waterloo', 'jiu jitsu Waterloo Ontario', 'kids BJJ Waterloo',
    'no-gi grappling Waterloo', 'MMA training Waterloo', 'self defence Waterloo',
    'The Jiu-Jitsu Lab', 'BJJ gym Waterloo', 'grappling gym KW',
    'self defense Waterloo', 'jiu jitsu', 'BJJ', 'Brazilian Jiu-Jitsu',
    'martial arts', 'fitness Waterloo', 'empowerment', 'self improvement',
    'UFC training', 'MMA Waterloo', 'grappling', 'submission wrestling',
    'combat sports Waterloo', 'adult fitness Waterloo', 'kids martial arts Waterloo',
  ],
  authors: [{ name: 'The Jiu-Jitsu Lab' }],
  creator: 'The Jiu-Jitsu Lab',
  publisher: 'The Jiu-Jitsu Lab',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: BASE_URL,
    siteName: 'The Jiu-Jitsu Lab',
    title: 'The Jiu-Jitsu Lab | Brazilian Jiu-Jitsu in Waterloo, ON',
    description: "Waterloo's dedicated BJJ academy. World-class coaching, all levels welcome. First week free.",
    images: [
      {
        url: '/images/hero/hero-group.jpg',
        width: 1200,
        height: 630,
        alt: 'The Jiu-Jitsu Lab — BJJ in Waterloo, ON',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Jiu-Jitsu Lab | Brazilian Jiu-Jitsu in Waterloo, ON',
    description: "Waterloo's dedicated BJJ academy. World-class coaching, all levels welcome. First week free.",
    images: ['/images/hero/hero-group.jpg'],
  },
  icons: {
    icon: '/favicon-32.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          id="meta-pixel"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            alt=""
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <FloatingContact />
        <MetaPixel />

        {/* Local Business structured data */}
        <Script id="local-business-jsonld" type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            "name": "The Jiu-Jitsu Lab",
            "description": "Waterloo's dedicated Brazilian Jiu-Jitsu academy. Led by IBJJF World Champion Dave Knowles and IBJJF No-Gi World Silver Medalist Brandon Twaddle.",
            "url": "https://labjiujitsu.com",
            "logo": "https://labjiujitsu.com/the-lab-bjj-logo_no_bjj.png",
            "image": "https://labjiujitsu.com/images/hero/hero-group.jpg",
            "telephone": "+12269893140",
            "email": "support@labjiujitsu.com",
            "foundingDate": "1998",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "420 Weber St N",
              "addressLocality": "Waterloo",
              "addressRegion": "ON",
              "postalCode": "N2L 4E7",
              "addressCountry": "CA"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 43.4847,
              "longitude": -80.5365
            },
            "openingHoursSpecification": [
              { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Wednesday"], "opens": "17:00", "closes": "20:30" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday","Thursday"], "opens": "06:30", "closes": "20:30" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday", "opens": "17:00", "closes": "20:30" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "10:00", "closes": "12:00" },
              { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "10:30", "closes": "12:00" }
            ],
            "priceRange": "$$",
            "currenciesAccepted": "CAD",
            "paymentAccepted": "Cash, Credit Card",
            "sameAs": [
              "https://www.instagram.com/thelabwaterloo"
            ]
          }
        `}</Script>

        <Script src="https://www.googletagmanager.com/gtag/js?id=G-PHS0NYH28S" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-PHS0NYH28S');
        `}</Script>
      </body>
    </html>
  );
}
