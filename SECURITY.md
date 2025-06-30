# 🔒 Security Policy

## Ochrona Danych Wrażliwych

### ❌ NIGDY nie commituj:
- Plików `.env`, `.env.local`, `.env.production`
- API keys, passwords, tokens
- Database credentials
- Private keys (.pem, .key, .crt)
- Session secrets

### ✅ Bezpieczne do commitu:
- Pliki template (`.env.template`, `.env.production.template`)
- Publiczne API keys (Publishable keys)
- Configuration examples
- Documentation

## Pliki Wrażliwe w Projekcie

### Backend (falko-backend/)
```
.env                    # ❌ NIGDY nie commituj
.env.template          # ✅ OK (bez prawdziwych danych)
.env.production.template # ✅ OK (bez prawdziwych danych)
```

### Frontend (falko-frontend/)
```
.env.local             # ❌ NIGDY nie commituj
.env.production.template # ✅ OK (bez prawdziwych danych)
```

## Sprawdzanie Bezpieczeństwa

Przed każdym push'em:

```bash
# 1. Sprawdź czy .env files są ignorowane
git check-ignore .env
git check-ignore falko-backend/.env
git check-ignore falko-frontend/.env.local

# 2. Sprawdź czy nie ma hardcoded secrets
grep -r "pk_" . --exclude-dir=node_modules
grep -r "postgresql://" . --exclude-dir=node_modules --exclude="*.template"
grep -r "redis://" . --exclude-dir=node_modules --exclude="*.template"

# 3. Sprawdź status przed commit
git status
git diff --cached
```

## Rotating Secrets

W przypadku przypadkowego commitowania secrets:

1. **Natychmiast** zmień wszystkie exposed credentials
2. Usuń je z git history: `git filter-branch` lub `git rebase`
3. Force push: `git push --force`
4. Wygeneruj nowe klucze w:
   - Supabase Dashboard
   - Render.com Dashboard
   - Medusa Admin

## Incident Response

Jeśli sksponojesz wrażliwe dane:

1. **STOP** - nie rób więcej commitów
2. Zmień natychmiast wszystkie exposed credentials
3. Skontaktuj się z zespołem
4. Wyczyść git history
5. Zaktualizuj wszystkie środowiska

## Kontakt

W przypadku problemów z bezpieczeństwem:
- **Email:** security@falkoproject.com
- **Slack:** #security-alerts
