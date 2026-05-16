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
  title: "EXPLORA AVENTURA - Descubra São Tomé e Príncipe com quem entende",
  description: "Explore a magia das ilhas de São Tomé e Príncipe. Roteiros personalizados, guias locais experientes e experiências autênticas em roças, praias e natureza selvagem.",
  openGraph: {
    title: "EXPLORA AVENTURA - Descubra São Tomé e Príncipe com quem entende",
    description: "Explore a magia das ilhas de São Tomé e Príncipe. Roteiros personalizados, guias locais experientes e experiências autênticas.",
    type: "website",
    locale: "pt_BR",
    siteName: "EXPLORA AVENTURA",
  },
  twitter: {
    card: "summary_large_image",
    title: "EXPLORA AVENTURA - Descubra São Tomé e Príncipe com quem entende",
    description: "Explore a magia das ilhas de São Tomé e Príncipe. Roteiros personalizados, guias locais experientes e experiências autênticas.",
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
        className={`${geistSans?.variable || ""} ${geistMono?.variable || ""} antialiased`}
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
