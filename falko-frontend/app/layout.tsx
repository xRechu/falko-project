import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { CartProvider } from "@/lib/context/cart-context";
import { InventoryProvider } from "@/lib/context/inventory-context";
import { PricesProvider } from "@/lib/context/prices-context";
import { Toaster } from "@/components/ui/sonner";

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
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </CartProvider>
          </InventoryProvider>
        </PricesProvider>
      </body>
    </html>
  );
}
