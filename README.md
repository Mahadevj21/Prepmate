# Prepmate

Backend API for **PrepMate**: user accounts, JWT auth, AI-generated learning roadmaps (Google Gemini), and interview practice (generated questions + AI evaluation).

## Project layout

| Path | Description |
|------|-------------|
| `prepmate-backend/` | Spring Boot 3 application (`com.prepmate`) |

## Requirements

- **Java 17**
- **Maven 3.8+**
- **PostgreSQL** (local or remote)

## Configuration

Secrets are **not** committed. Use the template:

1. Copy `prepmate-backend/src/main/resources/application.properties.example` to `application.properties` in the same folder.
2. Set at least:
   - `spring.datasource.*` — your database URL, user, password  
   - `gemini.api.key` — [Google AI Studio](https://aistudio.google.com/apikey) API key  
   - `jwt.secret` — long random string (used to sign JWTs; keep it private)

Optional: `gemini.model` (default in example: `gemini-2.0-flash`).

## Run the API

```bash
cd prepmate-backend
mvn spring-boot:run
```

Default port: **8080** (see `server.port` in your `application.properties`).

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

## Repository

Source: [github.com/Mahadevj21/Prepmate](https://github.com/Mahadevj21/Prepmate)
