# PrepMate

PrepMate is a high-fidelity, full-stack web app designed for people preparing for technical job interviews. Users register to access a premium, bento-grid based dashboard where they can generate AI-written learning roadmaps, run practice or mock interview sessions with Gemini-generated questions, submit answers for scored feedback, and perform deep-dive resume intelligence audits. The system features a modern Material Design 3 aesthetic with Material Symbols iconography and glassmorphic UI elements.

Live frontend: [prepmate-snowy.vercel.app](https://prepmate-snowy.vercel.app/)
> [!NOTE]
> This project is hosted on free-tier services (Render/Supabase). The first request may take 30–60 seconds if services are waking from inactivity.

## Architecture

![Architecture diagram](docs/images/architecture.png)

The project follows a decoupled client-server architecture:

- **React Frontend** (Vite + React 19, Tailwind CSS 4): A premium, high-fidelity UI utilizing modern design tokens, Material Symbols, and responsive bento-grid layouts.
- **Spring Boot Backend** (Java 17): Orchestrates authentication, roadmap generation, interview logic, and resume analysis.
- **Resume Intelligence Audit**: Integrated with **Apache PDFBox** for robust text extraction and Gemini-driven feedback on ATS compatibility and impact.
- **GenAiService** (Key Rotation Manager): A resilient wrapper for Gemini calls. It manages up to three API keys and rotates on quota errors, keeping the current working key sticky.
- **Response Cache**: Successful responses are stored in an in-memory `ResponseCache` (60-minute TTL) to minimize redundant LLM calls.
- **PostgreSQL**: High-availability storage for user data, generated content, and session history via Spring Data JPA.

## Tech stack

**Backend** (`prepmate-backend/`)
- Spring Boot 3.3.5 (Web, Data JPA, Security, Validation)
- **Apache PDFBox 3.0.1** (Resume text extraction)
- PostgreSQL & H2 (Runtime scope)
- JJWT 0.11.5 (Secure JWT handling)
- Lombok
- Google Gemini HTTP API via `java.net.http.HttpClient`

**Frontend** (`prepmate-frontend/`)
- React 19.2, React Router 7.15
- Vite 8 & Tailwind CSS 4
- **Material Symbols Outlined** (Iconography)
- **Glassmorphism & Bento Design System** (Vanilla CSS + Tailwind)

## How the AI Features Work

### 1. Resume Intelligence Audit
Unlike simple keyword matchers, PrepMate's analyzer performs a **semantic audit** of the document:
- **ATS Compatibility**: Evaluates structural parser readability.
- **Action Verb Velocity**: Analyzes the impact of professional language choice.
- **Layout Integrity**: Flags multi-column or graphical elements that break standard parsers.
- **Strategic Keywords**: Identifies missing or underrepresented technical markers.

### 2. API Key Rotation
All Gemini calls go through `GenAiService.ask(String prompt)`.
- **Sticky Rotation**: The service stays on a working key until a 429/quota error is detected.
- **Per-Key Retries**: Failed calls are retried twice per key with exponential backoff before rotating.
- **Cache Pre-check**: Prompts are hashed and checked against an in-memory TTL cache to save quota and improve performance.

## Setup

### Prerequisites
Java 17, Maven 3.9+, Node.js, PostgreSQL, and at least one Gemini API key.

### Backend (local)
```bash
cd prepmate-backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
```
Set `SPRING_DATASOURCE_URL`, `GEMINI_API_KEY`, and `JWT_SECRET` in the properties file.
```bash
mvn spring-boot:run
```

### Frontend
```bash
cd prepmate-frontend
cp .env.example .env
npm install
npm run dev
```

## API overview

| Area | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/change-password` |
| **Resume** | `POST /api/resume/analyze` (Multipart PDF) |
| **Roadmap** | `POST /api/roadmap/generate`, `GET /api/roadmap/history/{userId}` |
| **Interview** | `POST /api/interview/generate`, `POST /api/interview/evaluate`, `GET /api/interview/history/{userId}` |
| **Admin** | `GET /api/admin/metrics`, `GET /api/admin/users`, `GET /api/admin/insights` |
| **Health** | `GET /api/test/ping` |

## Architecture Decisions

- **Direct HTTP vs SDK**: Chose `java.net.http.HttpClient` for Gemini to keep the JAR footprint small and have granular control over retry headers.
- **Stateless JWT**: Tokens are kept small with only the email subject; roles are resolved from the DB on each request to allow real-time permission updates.
- **Bento UI Design**: Implemented a card-centric layout to manage high-density information (stats, feedback, roadmaps) effectively across devices.

## License
MIT. Copyright 2026 Mahadev J.
