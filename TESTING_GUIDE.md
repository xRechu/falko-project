# 🧪 Przewodnik testowania systemu Falko Project

## 🎯 Przygotowane dane testowe

### 👤 Użytkownicy demo:
1. **demo@falkoproject.com** - gotowy do rejestracji przez frontend
2. **test@falkoproject.com** - utworzony przez skrypt seed (wymaga rejestracji)

### 🛍️ Produkty demo:
- Medusa T-Shirt (różne rozmiary i kolory)
- Medusa Sweatshirt 
- Medusa Sweatpants
- Medusa Shorts

---

## 🔄 Jak uruchomić środowisko testowe

### 1. Uruchom backend (Medusa)
```bash
cd falko-backend
npm run dev
```
Backend będzie dostępny na: `http://localhost:9000`

### 2. Uruchom frontend (Next.js)
```bash
cd falko-frontend  
npm run dev
```
Frontend będzie dostępny na: `http://localhost:3000`

### 3. Załaduj dane testowe (jeśli jeszcze nie)
```bash
cd falko-backend
npm run seed        # Produkty + podstawowy user
npm run seed:demo   # Dodatkowy demo user
```

---

## 🧪 Scenariusze testowe

### 📝 Test rejestracji nowego użytkownika

1. **Idź do:** `http://localhost:3000/register`
2. **Wypełnij formularz:**
   - Email: `demo@falkoproject.com`
   - Hasło: `DemoPassword123!`
   - Imię: `Demo`
   - Nazwisko: `User`
   - Telefon: `+48 555 123 456` (opcjonalny)
3. **Kliknij:** "Utwórz konto"
4. **Oczekiwany rezultat:** 
   - ✅ Sukces rejestracji
   - ✅ Automatyczne zalogowanie
   - ✅ Przekierowanie na stronę główną
   - ✅ Toast z sukcesem

### 🔐 Test logowania

1. **Idź do:** `http://localhost:3000/login`
2. **Wprowadź dane:**
   - Email: `demo@falkoproject.com`
   - Hasło: `DemoPassword123!`
3. **Kliknij:** "Zaloguj się"
4. **Oczekiwany rezultat:**
   - ✅ Sukces logowania
   - ✅ Przekierowanie na stronę główną
   - ✅ Toast z sukcesem

### 🔄 Test resetowania hasła

1. **Idź do:** `http://localhost:3000/forgot-password`
2. **Wprowadź email:** `demo@falkoproject.com`
3. **Kliknij:** "Wyślij instrukcje resetowania"
4. **Oczekiwany rezultat:**
   - ✅ Pokazanie strony sukcesu
   - ✅ Toast z informacją
   - ✅ (W środowisku dev email nie zostanie wysłany, ale link można testować ręcznie)

### 🛒 Test zakupów jako zalogowany użytkownik

1. **Zaloguj się** (jak wyżej)
2. **Idź do:** `http://localhost:3000/products` lub `http://localhost:3000/sklep`
3. **Wybierz produkt** i dodaj do koszyka
4. **Idź do checkout**
5. **Oczekiwany rezultat:**
   - ✅ Dane użytkownika są pre-wypełnione
   - ✅ Można dokończyć zamówienie

### 🚪 Test wylogowania

1. **Będąc zalogowanym**, kliknij przycisk wylogowania (w header)
2. **Oczekiwany rezultat:**
   - ✅ Użytkownik zostaje wylogowany
   - ✅ Przekierowanie na stronę główną
   - ✅ Toast z informacją

---

## 🔍 Testowanie błędów

### ❌ Błędne dane logowania
- **Email:** `demo@falkoproject.com`
- **Hasło:** `WrongPassword`
- **Oczekiwany rezultat:** Komunikat o błędzie

### ❌ Rejestracja z istniejącym emailem
- **Email:** `demo@falkoproject.com` (już istniejący)
- **Oczekiwany rezultat:** Komunikat o błędzie

### ❌ Słabe hasło
- **Hasło:** `123` (za krótkie)
- **Oczekiwany rezultat:** Walidacja i komunikat o błędzie

---

## 📋 Checklist funkcjonalności

### ✅ Rejestracja
- [ ] Walidacja email
- [ ] Walidacja hasła (min. 8 znaków, litery, cyfry)
- [ ] Potwierdzenie hasła
- [ ] Walidacja imienia/nazwiska
- [ ] Opcjonalny telefon
- [ ] Obsługa błędów
- [ ] Loading states
- [ ] Toast notifications

### ✅ Logowanie
- [ ] Walidacja email
- [ ] Walidacja hasła
- [ ] Pokazywanie/ukrywanie hasła
- [ ] "Remember me" (jeśli zaimplementowane)
- [ ] Link do resetowania hasła
- [ ] Obsługa błędów
- [ ] Loading states

### ✅ Resetowanie hasła
- [ ] Walidacja email
- [ ] Wysyłanie emaila (symulowane)
- [ ] Strona sukcesu
- [ ] Obsługa błędów
- [ ] Możliwość ponownego wysłania

### ✅ UX/UI
- [ ] Responsywny design
- [ ] Spójność ze stylem strony
- [ ] Trust indicators
- [ ] Płynne animacje
- [ ] Przystępna nawigacja

---

## 🛠️ Użyteczne komendy

```bash
# Backend
cd falko-backend
npm run dev              # Uruchom serwer dev
npm run seed             # Załaduj podstawowe dane
npm run seed:demo        # Dodaj demo użytkownika
npm run build            # Zbuduj na produkcję

# Frontend  
cd falko-frontend
npm run dev              # Uruchom serwer dev
npm run build            # Zbuduj na produkcję
npm run start            # Uruchom zbudowaną wersję
```

---

## 🐛 Rozwiązywanie problemów

### Backend nie odpowiada
- Sprawdź czy baza danych jest uruchomiona (Supabase)
- Sprawdź zmienne środowiskowe w `.env`
- Sprawdź port 9000

### Frontend nie łączy się z backend
- Sprawdź `NEXT_PUBLIC_MEDUSA_BACKEND_URL` w `.env.local`
- Sprawdź czy backend jest uruchomiony na porcie 9000

### Błędy autentykacji
- Sprawdź czy dane użytkownika istnieją w bazie
- Sprawdź logi backend w terminalu
- Sprawdź Developer Tools w przeglądarce (Network tab)

---

## 📚 Dodatkowe zasoby

- **Dokumentacja Medusa.js:** https://docs.medusajs.com/
- **Dokumentacja Next.js:** https://nextjs.org/docs
- **Supabase Dashboard:** https://supabase.com/dashboard
