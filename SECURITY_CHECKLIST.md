# 🔒 Security Checklist - Before Production Deployment

## Backend (Medusa.js na Render)

### 1. Environment Variables
```bash
# ✅ Zmień na Render.com:
JWT_SECRET=długie-losowe-hasło-min-256-bitów
COOKIE_SECRET=inne-długie-losowe-hasło-min-256-bitów

# ✅ Zaktualizuj CORS:
STORE_CORS=https://twoja-domena.vercel.app,https://falkoproject.com
ADMIN_CORS=https://admin.falkoproject.com
AUTH_CORS=https://twoja-domena.vercel.app,https://admin.falkoproject.com

# ✅ Dodaj SSL do PostgreSQL:
DATABASE_URL=postgresql://...?sslmode=require

# ✅ Zabezpiecz Redis:
REDIS_URL=rediss://...  # SSL connection
```

### 2. Custom Endpoints Security
- ✅ `/store/inventory` - tylko odczyt, OK
- ✅ `/store/prices` - tylko odczyt, OK  
- ✅ Rate limiting dodany do auth endpoints (login/register)
- ⚠️ Rozważ cache'owanie wyników (Redis)

### 3. Database Security
- ✅ Supabase ma built-in security
- ✅ Connection pooling aktywny
- ⚠️ Sprawdź RLS (Row Level Security) w Supabase

## Frontend (Next.js na Vercel)

### 1. Environment Variables w Vercel Panel
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://twoj-backend.onrender.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_... # Ten sam co w backend
NEXT_PUBLIC_STRAPI_API_URL=https://twoj-strapi.onrender.com
```

### 2. Security Headers
Dodaj w `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

### 3. Sensitive Data
- ✅ Publishable API Key może być public
- ✅ Nie mamy secret keys w frontend
- ⚠️ Sprawdź czy nie logujemy sensitive data w console

## Networking & Infrastructure

### 1. SSL/TLS
- ✅ Vercel automatycznie dodaje HTTPS
- ✅ Render automatycznie dodaje HTTPS  
- ✅ Supabase ma HTTPS by default

### 2. CDN & Caching
- ✅ Vercel Edge Network - automatyczne
- ⚠️ Skonfiguruj cache headers dla produktów
- ⚠️ Invalidate cache przy zmianie produktów

### 3. Monitoring
- ⚠️ Dodaj error tracking (Sentry)
- ⚠️ Dodaj uptime monitoring
- ⚠️ Monitoruj performance (Vercel Analytics)

## Pre-Launch Security Audit

### 1. Testowanie
- [ ] Sprawdź wszystkie endpointy pod kątem SQL injection
- [ ] Test CORS policy
- [ ] Test rate limiting
- [ ] Sprawdź error handling (nie wyciekają sensitive data)

### 2. Dependencies
- [ ] `npm audit` w obu projektach
- [ ] Aktualizuj wszystkie paczki do najnowszych wersji
- [ ] Sprawdź Medusa.js security advisories

### 3. Backup & Recovery
- [ ] Supabase automatic backups włączone
- [ ] Test przywracania z backup
- [ ] Plan disaster recovery

## Status: 🟡 MEDIUM RISK (Okay for MVP, needs fixes for production)

**Główne ryzyka:**
1. Słabe hasła w JWT/Cookie secrets
2. Rozwojowe CORS ustawienia
3. Brak monitoring

**Priorytet poprawek:**
1. **HIGH**: Zmiana JWT_SECRET, COOKIE_SECRET
2. **HIGH**: Aktualizacja CORS 
3. **MEDIUM**: Dodanie security headers
4. **LOW**: Monitoring
