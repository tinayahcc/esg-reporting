"use client";

import { AccessControlProvider } from "@/components/access-control";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <AccessControlProvider>{children}</AccessControlProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
