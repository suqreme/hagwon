import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ThemeInitializer } from '@/components/providers/theme-initializer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oxanium = Oxanium({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hagwon - AI-Powered Learning Platform",
  description: "Global, AI-guided, self-paced education system for GED and K-12 students, accessible even in underserved areas",
  keywords: ["education", "learning", "AI tutor", "GED", "K-12", "global education", "rural education", "offline learning"],
  authors: [{ name: "Hagwon Team" }],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style id="initial-theme" dangerouslySetInnerHTML={{
          __html: `
            :root {
              --background: oklch(0.9809 0.0025 228.7836);
              --foreground: oklch(0.3211 0 0);
              --card: oklch(1.0000 0 0);
              --card-foreground: oklch(0.3211 0 0);
              --popover: oklch(1.0000 0 0);
              --popover-foreground: oklch(0.3211 0 0);
              --primary: oklch(0.8677 0.0735 7.0855);
              --primary-foreground: oklch(0 0 0);
              --secondary: oklch(0.8148 0.0819 225.7537);
              --secondary-foreground: oklch(0 0 0);
              --muted: oklch(0.8828 0.0285 98.1033);
              --muted-foreground: oklch(0.5382 0 0);
              --accent: oklch(0.9680 0.2110 109.7692);
              --accent-foreground: oklch(0 0 0);
              --destructive: oklch(0.6368 0.2078 25.3313);
              --destructive-foreground: oklch(1.0000 0 0);
              --border: oklch(0.8699 0 0);
              --input: oklch(0.8699 0 0);
              --ring: oklch(0.8677 0.0735 7.0855);
              --chart-1: oklch(0.8677 0.0735 7.0855);
              --chart-2: oklch(0.8148 0.0819 225.7537);
              --chart-3: oklch(0.9680 0.2110 109.7692);
              --chart-4: oklch(0.8027 0.1355 349.2347);
              --chart-5: oklch(0.7395 0.2268 142.8504);
            }
            .dark {
              --background: oklch(0.2303 0.0125 264.2926);
              --foreground: oklch(0.9219 0 0);
              --card: oklch(0.3210 0.0078 223.6661);
              --card-foreground: oklch(0.9219 0 0);
              --popover: oklch(0.3210 0.0078 223.6661);
              --popover-foreground: oklch(0.9219 0 0);
              --primary: oklch(0.8027 0.1355 349.2347);
              --primary-foreground: oklch(0 0 0);
              --secondary: oklch(0.7395 0.2268 142.8504);
              --secondary-foreground: oklch(0 0 0);
              --muted: oklch(0.3867 0 0);
              --muted-foreground: oklch(0.7155 0 0);
              --accent: oklch(0.8148 0.0819 225.7537);
              --accent-foreground: oklch(0 0 0);
              --destructive: oklch(0.6368 0.2078 25.3313);
              --destructive-foreground: oklch(1.0000 0 0);
              --border: oklch(0.3867 0 0);
              --input: oklch(0.3867 0 0);
              --ring: oklch(0.8027 0.1355 349.2347);
              --chart-1: oklch(0.8027 0.1355 349.2347);
              --chart-2: oklch(0.7395 0.2268 142.8504);
              --chart-3: oklch(0.8148 0.0819 225.7537);
              --chart-4: oklch(0.9680 0.2110 109.7692);
              --chart-5: oklch(0.8652 0.1768 90.3816);
            }
          `
        }} />
      </head>
      <body
        className={`${oxanium.variable} ${sourceCodePro.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeInitializer />
          <AuthProvider>
            <ProfileProvider>
              {children}
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
