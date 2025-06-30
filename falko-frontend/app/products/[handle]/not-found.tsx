import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Not Found page dla produktów
 * Wyświetlana gdy produkt o danym handle nie istnieje
 */
export default function ProductNotFound() {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">
            Produkt nie znaleziony
          </h2>
          <p className="text-muted-foreground">
            Przepraszamy, ale produkt którego szukasz nie istnieje lub został usunięty z naszej oferty.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/sklep">
              Przeglądaj wszystkie produkty
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Wróć na stronę główną
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
