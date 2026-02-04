# LiveChat

Real-time messaging web app with JWT authentication, chat rooms, and message history.

## Demo

- Live demo: not deployed yet
- Screenshot/GIF: add one when ready

## Features

- Email/password authentication (JWT-based)
- Create, join, and delete chat rooms
- Message history per room
- Room membership enforcement on API calls
- REST API backend with health check endpoint

## Tech Stack

- Frontend: React 18 + Vite 6 + Tailwind CSS
- Backend: Java 17 + Spring Boot 3.2
- Database: PostgreSQL (default config)
- Auth: JWT
- Deploy: Docker (Render), Vercel (frontend)

## Setup

Prereqs:
- Node.js 20+
- npm 10+
- Java 17+
- Maven 3.6+
- PostgreSQL

Backend env vars (required unless using defaults):
```
DB_URL=jdbc:postgresql://localhost:5432/livemessaging
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_EXPIRATION_MS=86400000
```

Frontend env vars:
```
VITE_API_URL=http://localhost:8080
```

Run locally:
```
git clone <repo-url>
cd live-messaging-app

cd backend
mvn clean install
mvn spring-boot:run
```

In a second terminal:
```
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8080`

## Architecture

The frontend is a React SPA that calls a Spring Boot REST API. Authentication uses JWTs stored in local storage and sent on API requests. Rooms, memberships, and messages are persisted in PostgreSQL. Room membership is enforced server-side before listing or writing messages. The backend also exposes a health check endpoint at `/api/health`.