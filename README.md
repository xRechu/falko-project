# 🚀 Falko Project - Nowoczesny Sklep E-commerce

Headless e-commerce store dla marki odzieżowej "Falko Project" zbudowany w oparciu o najnowsze technologie.

## 🏗️ Architektura

### Frontend (Head)
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Język:** TypeScript (strong typing)  
- **Hosting:** Vercel
- **Port:** `localhost:3000`

### Backend E-commerce  
- **Framework:** Medusa.js v2
- **Hosting:** Render.com
- **Port:** `localhost:9000`

### Backend CMS
- **Framework:** Strapi
- **Hosting:** Render.com  
- **Port:** `localhost:1337`

### Baza Danych & Storage
- **Database:** PostgreSQL na Supabase
- **File Storage:** Supabase Storage
- **Cache/Queue:** Redis na Render.com

## 🛠️ Setup Lokalne

### Wymagania
- Node.js 18+
- npm/yarn/pnpm
- Git

### 1. Klonowanie
```bash
git clone https://github.com/twój-username/falko-project.git
cd falko-project
```

### 2. Backend Medusa.js
```bash
cd falko-backend
npm install
cp .env.template .env  # Wypełnij zmienne środowiskowe
npm run dev  # Uruchom na localhost:9000
```

### 3. Frontend Next.js
```bash
cd falko-frontend  
npm install
cp .env.local.template .env.local  # Wypełnij zmienne środowiskowe
npm run dev  # Uruchom na localhost:3000
```

## 📦 Kluczowe Funkcjonalności

### ✅ Zaimplementowane
- 🎨 **Premium UI/UX** - Tailwind, shadcn/ui, Framer Motion, Aceternity UI
- 🛍️ **Pełna obsługa produktów** - dynamiczne pobieranie z Medusa API
- 🔄 **Warianty produktów** - rozmiary (S, M, L), kolory, dynamiczny wybór
- 💰 **System cen** - real-time z custom endpointów `/store/prices`
- 📦 **Zarządzanie inventory** - dostępność z `/store/inventory`
- 🛒 **Koszyk** - localStorage + Context API + Medusa integration
- 📱 **Responsive Design** - mobile-first approach
- 🌐 **Polski język** - kompletna lokalizacja

### 🔮 Roadmap
- 🔐 Autentykacja użytkowników
- 💳 Payment integration (Stripe/PayU)
- 📧 Email notifications
- 📊 Analytics & tracking
- 🚚 Shipping calculator
- ⭐ Reviews & ratings

## 🗂️ Struktura Projektu

```
falko-project/
├── falko-frontend/          # Next.js frontend
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── products/       # Product-related components
│   │   └── cart/           # Cart & checkout components
│   ├── lib/                # Utilities & API clients
│   └── public/             # Static assets
├── falko-backend/          # Medusa.js backend
│   ├── src/
│   │   └── api/            # Custom API endpoints
│   └── medusa-config.js    # Medusa configuration
├── docs/                   # Documentation
└── README.md
```

## 🔌 API Endpoints

### Medusa Store API
- `GET /store/products` - Lista produktów
- `GET /store/products/:id` - Szczegóły produktu
- `POST /store/carts` - Tworzenie koszyka
- `POST /store/carts/:id/line-items` - Dodawanie do koszyka

### Custom Endpoints  
- `GET /store/inventory` - Stany magazynowe wszystkich wariantów
- `GET /store/prices` - Ceny wszystkich wariantów

## 🚀 Deployment

### Production URLs
- **Frontend:** `https://falkoproject.com` (Vercel)
- **Backend:** `https://falko-backend.onrender.com` (Render)
- **CMS:** `https://falko-strapi.onrender.com` (Render)

### Konfiguracja Production
1. Sprawdź `SECURITY_CHECKLIST.md`
2. Użyj `.env.production.template` jako bazy
3. Zaktualizuj CORS settings
4. Wygeneruj silne JWT secrets

## 📋 Development Status

**Aktualna wersja:** MVP v1.0  
**Status:** ✅ Gotowe do testów  
**Ostatnia aktualizacja:** 30 czerwca 2025

### Recent Changes
- ✅ Dodane opcje wyboru wariantów (S, M, L)
- ✅ Custom endpointy `/store/inventory` i `/store/prices`
- ✅ Context API dla inventory i prices
- ✅ Pełna integracja z Medusa v2
- ✅ Security checklist i production templates

## 🤝 Contributing

1. Fork repository
2. Stwórz feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Otwórz Pull Request

## 📄 License

Projekt własny dla marki Falko Project.

## 📞 Kontakt

**Falko Project Team**  
- Website: [falkoproject.com](https://falkoproject.com)
- Email: contact@falkoproject.com

---
*Zbudowane z ❤️ używając Next.js, Medusa.js, i najnowszych technologii web dev.*
