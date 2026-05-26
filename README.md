# Prepmate

Full-stack PrepMate project:
- `prepmate-backend`: Spring Boot API with JWT auth + Gemini integration
- `prepmate-frontend`: React app for register/login, roadmap generation, interview generation, and answer evaluation

## Project layout

| Path | Description |
|------|-------------|
| `prepmate-backend/` | Spring Boot 3 application (`com.prepmate`) |
| `prepmate-frontend/` | Vite + React frontend client |

## Requirements

- **Java 17**
- **Maven 3.8+**
- **PostgreSQL** (local or remote)
- **Node.js 20+**

## Configuration

Secrets are **not** committed. Use the template:

1. Copy `prepmate-backend/src/main/resources/application.properties.example` to `application.properties` in the same folder.
2. Set at least:
   - `spring.datasource.*` — your database URL, user, password  
   - `gemini.api.key` — [Google AI Studio](https://aistudio.google.com/apikey) API key  
   - `jwt.secret` — long random string (used to sign JWTs; keep it private)

Optional: `gemini.model` (default: `gemini-2.5-flash`). Avoid `gemini-2.0-flash` on free tier — its quota is often 0.

## Run the backend API

```bash
cd prepmate-backend
mvn spring-boot:run
```

Default port: **8080** (see `server.port` in your `application.properties`).

## Run the frontend

```bash
cd prepmate-frontend
cp .env.example .env
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`  
It connects to backend using `VITE_API_BASE_URL` (default `http://localhost:8080`).

## API (summary)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login; returns JWT + email |
| GET | `/api/test/gemini?prompt=...` | No | Smoke-test Gemini |
| POST | `/api/roadmap/generate` | **Yes** | Body: `goal`, `userId` — AI roadmap |
| POST | `/api/interview/generate` | **Yes** | Body: `topic`, `difficulty`, `userId` |
| POST | `/api/interview/evaluate` | **Yes** | Body: `questionId`, `userAnswer` |

Protected routes expect:

```http
Authorization: Bearer <token from login>
```

## Stack

- Spring Boot 3, Spring Data JPA, PostgreSQL  
- Spring Security + JWT (JJWT)  
- Lombok, Jakarta Validation  
- Gemini via `java.net.http.HttpClient` + Jackson  
- React 19 + Vite frontend

## Repository

Source: [github.com/Mahadevj21/Prepmate](https://github.com/Mahadevj21/Prepmate)
