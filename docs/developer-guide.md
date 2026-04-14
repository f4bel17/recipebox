# Fejlesztői és telepítési útmutató

## Előfeltételek
- Docker
- Docker Compose
- GitHub repository
- GHCR jogosultság

## Lokális indítás

```bash
docker compose up --build
```

## Backend fejlesztés
A backend ASP.NET Web API alapú, MongoDB adatbázissal.

## Frontend fejlesztés
A frontend Angular alapú.

## CI működés
A GitHub Actions workflow:
1. checkoutolja a kódot
2. belép a GHCR registry-be
3. buildeli a backend image-et
4. buildeli a frontend image-et
5. feltölti mindkét image-et
