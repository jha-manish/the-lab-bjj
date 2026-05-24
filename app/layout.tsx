import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Jiu-Jitsu Lab | Brazilian Jiu-Jitsu in Waterloo, ON",
  description: "Waterloo's dedicated BJJ academy coached by IBJJF World Champion Dave Knowles. Gi, No-Gi, Kids, Women's & Competition programs. First week free.",
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
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
