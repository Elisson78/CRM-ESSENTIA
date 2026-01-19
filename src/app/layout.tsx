import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import HeaderWrapper from "@/components/header-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ESSENTIA TRAVEL - Explore a Itália com quem entende",
  description: "Descubra a magia da Itália com roteiros personalizados, guias locais experientes e experiências autênticas. Turismo romântico, em grupo e cultural.",
  openGraph: {
    title: "ESSENTIA TRAVEL - Explore a Itália com quem entende",
    description: "Descubra a magia da Itália com roteiros personalizados, guias locais experientes e experiências autênticas.",
    type: "website",
    locale: "pt_BR",
    siteName: "ESSENTIA TRAVEL",
  },
  twitter: {
    card: "summary_large_image",
    title: "ESSENTIA TRAVEL - Explore a Itália com quem entende",
    description: "Descubra a magia da Itália com roteiros personalizados, guias locais experientes e experiências autênticas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <HeaderWrapper />
          {children}
        </Providers>
      </body>
    </html>
  );
}
