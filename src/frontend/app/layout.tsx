import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { ToastProvider } from "@/components/toast";
import { LanguageProvider } from "@/lib/i18n";
import { MapSettingsProvider } from "@/lib/map-settings";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Leger Yogyakarta",
  description:
    "3D geospatial viewer for land boundary survey data in the Special Region of Yogyakarta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <LanguageProvider>
            <MapSettingsProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </MapSettingsProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
