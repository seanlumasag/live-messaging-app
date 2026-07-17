# Live Chat

A full-stack real-time messaging application built with Spring Boot and React.

The application supports direct, group, and public conversations using PostgreSQL persistence and SockJS/STOMP live message delivery.

## Highlights

- Direct, group, and public conversations
- Persistent message history
- Persist-before-broadcast message delivery
- Transactional JPA workflows
- Durable users, rooms, memberships, messages, and friendships
- JWT authentication with Spring Security
- SockJS/STOMP live updates
- Client reconnect and resubscription behavior
- 44 passing backend tests
- 8 passing frontend tests

## Architecture

```text
React Frontend
      |
      +---- REST API
      |       Authentication
      |       Conversations
      |       Friendships
      |       Message history
      |
      +---- SockJS / STOMP
              Live message delivery
                     |
                     v
            Spring Boot Backend
                     |
                     +---- PostgreSQL
                     |       Users
                     |       Rooms
                     |       Memberships
                     |       Messages
                     |       Friendships
                     |
                     +---- In-process STOMP broker
                             Real-time broadcasts
```

## Message Delivery Flow

1. A client submits a message to the backend.
2. The backend validates and persists the message through a transactional JPA workflow.
3. After persistence succeeds, the saved message is broadcast through the STOMP broker.
4. Connected clients receive the live update.
5. Historical messages remain available through PostgreSQL-backed REST endpoints.

This persist-before-broadcast model gives accepted messages durable database state before live delivery.

## Technology Stack

### Frontend

- React
- Vite
- SockJS
- STOMP

### Backend

- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate

### Data

- PostgreSQL

### Security

- JWT
- BCrypt

### Development and Deployment

- Maven
- Docker
- Git
- Vercel
- Render

## Features

### Conversations

- Direct conversations
- Group conversations
- Public conversations
- Persistent room membership
- Historical message retrieval

### Messaging

- Real-time SockJS/STOMP delivery
- Persist-before-broadcast processing
- Durable message storage
- Client reconnect attempts
- Subscription restoration
- Client-side duplicate-ID suppression

### Social State

- User accounts
- Friendship records
- Friendship-gated conversation creation
- Persistent conversation membership
- Durable relationship state

### Authentication

- User registration and login
- JWT-based authentication
- BCrypt password hashing
- Secured REST endpoints

## Relational Model

The application maintains durable state across five main relational entities:

```text
Users
Rooms
Room Memberships
Messages
Friendships
```

These entities support persistent conversations, room access, message history, and friendship workflows.

## Local Development

### Requirements

- Node.js 20+
- npm 10+
- Java 17+
- Maven 3.6+
- PostgreSQL

### Backend Environment

```env
DB_URL=jdbc:postgresql://localhost:5432/livemessaging
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_EXPIRATION_MS=86400000
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend Environment

```env
VITE_API_URL=http://localhost:8080
```

### Run the Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## Testing

The audited repository state passed:

- 44 backend tests
- 8 frontend tests
- Backend build
- Frontend build

Run the backend tests:

```bash
cd backend
mvn test
```

Run the frontend tests:

```bash
cd frontend
npm install
npm test
```

Build the frontend:

```bash
cd frontend
npm run build
```
