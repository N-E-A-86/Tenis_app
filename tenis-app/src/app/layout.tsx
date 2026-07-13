import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SessionProvider from "@/providers/SessionProvider";
import AnimationProvider from "@/providers/AnimationProvider";
import PwaRegister from "@/components/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "TenisClub - Reservá tu cancha de tenis",
  description:
    "Reservá canchas de tenis fácil y rápido. Pagá con Mercado Pago, gestioná tus reservas desde cualquier dispositivo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TenisClub",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    title: "TenisClub",
    description:
      "Reservá canchas de tenis fácil y rápido. Pagá con Mercado Pago.",
    url: "https://tenis-app-sigma.vercel.app",
    siteName: "TenisClub",
    images: [
      {
        url: "/images/pelota-tenis.jpg",
        width: 1024,
        height: 905,
        alt: "TenisClub - Reservá tu cancha",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TenisClub",
    description:
      "Reservá canchas de tenis fácil y rápido. Pagá con Mercado Pago.",
    images: ["/images/pelota-tenis.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <SessionProvider>
          <AnimationProvider>
            <PwaRegister />
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </AnimationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
