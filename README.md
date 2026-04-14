# RecipeBox – Receptkezelő alkalmazás

A RecipeBox egy egyszerű full-stack webalkalmazás receptek kezelésére. A projekt célja egy 3-as szintű beadandó követelményeinek teljesítése az **Alkalmazásfejlesztés technológiái** tárgyhoz.

## Fő technológiák

- Frontend: Angular
- Backend: ASP.NET Web API
- Adatbázis: MongoDB
- Konténerizálás: Docker, Docker Compose
- CI: GitHub Actions
- Registry: GHCR

## Funkciók

- Receptek listázása lapozással
- Recept részleteinek megtekintése
- Új recept létrehozása
- Recept szerkesztése
- Recept törlése

## Projektstruktúra

```text
recipebox/
├── frontend/
├── backend/
├── docs/
├── .github/workflows/
├── docker-compose.yml
└── README.md
```

## Gyors indítás

### 1. Indítás Docker Compose-zal

```bash
docker compose up --build
```

### 2. Elérhetőségek

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger`

## Dokumentáció

- [Felhasználói útmutató](docs/user-guide.md)
- [Telepítési és fejlesztői útmutató](docs/developer-guide.md)
- [Követelménylefedettség](docs/requirement-mapping.md)
