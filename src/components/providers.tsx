"use client";

import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "./ui/sonner";

export default function Providers({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
