import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { AuthProvider } from "@/lib/context/auth-context";
import { CartProvider } from "@/lib/context/cart-context";
import { InventoryProvider } from "@/lib/context/inventory-context";
import { PricesProvider } from "@/lib/context/prices-context";
import { Toaster } from "@/components/ui/sonner";

// Force import medusa-client to initialize SDK
import '@/lib/medusa-client';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Falko Project - Premium Streetwear",
  description: "Ekskluzywna odzież streetwear dla wymagających. Bluzy, koszulki i czapki najwyższej jakości.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
      >
        <PricesProvider>
          <InventoryProvider>
            <AuthProvider>
              <CartProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </InventoryProvider>
        </PricesProvider>
      </body>
    </html>
  );
}
