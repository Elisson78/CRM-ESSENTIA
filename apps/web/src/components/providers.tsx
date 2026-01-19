"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "./ui/sonner";

export default function Providers({
  children
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <AuthProvider>{children}</AuthProvider>;
  }

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
