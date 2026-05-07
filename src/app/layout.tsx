import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner'; // Add this import
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NextTopLoader from 'nextjs-toploader';
import { AuthProvider } from "@/context/AuthContext";
import Providers from "@/context/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KYRIOS",
  description: "AI Math Learning Platform",
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
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <NextTopLoader
              color="#ea580c"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              showSpinner={false}
              easing="ease"
              speed={200}
            />

            {/* React Query Provider */}
            <Providers>
              {children}
            </Providers>

            {/* Add Toaster component here - it will render toasts at the top of your app */}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                },
                className: 'font-medium',
              }}
            />

          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}