"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ApiStatus from "@/components/ui/api-status";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Menu, X } from "lucide-react";

/**
 * Główny nagłówek strony dla Falko Project
 * - Sticky navigation z ciemnym tłem
 * - Logo w centrum
 * - Menu nawigacyjne
 * - Ikona koszyka
 * - Responsywny design
 */
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { href: "/sklep", label: "Sklep" },
    { href: "/nowosci", label: "Nowości" },
    { href: "/o-nas", label: "O Nas" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Logo Row */}
          <div className="flex h-16 items-center justify-between">
            <div></div> {/* Spacer */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold tracking-tight">
                Falko Project
              </span>
            </Link>
            {/* Shopping Cart Icon */}
            <div className="flex items-center gap-3">
              <ApiStatus />
              <CartDrawer />
            </div>
          </div>
          
          {/* Navigation Row */}
          <div className="flex h-12 items-center justify-center border-t border-border/20">
            <nav className="flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10 p-0"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>

            {/* Logo - Center on mobile */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold tracking-tight">
                Falko Project
              </span>
            </Link>

            {/* Shopping Cart Icon */}
            <CartDrawer />
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-border/40 pb-4 pt-4">
              <nav className="flex flex-col space-y-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
