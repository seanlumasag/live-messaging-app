# live-messaging-app

A full-stack messaging application built with React/Vite frontend and Java/Spring Boot backend.

## Project Structure

```
live-messaging-app/
├── frontend/          # React + Vite frontend
├── backend/           # Spring Boot backend
└── README.md
```

## Prerequisites

- Node.js (v20+)
- npm (v10+)
- Java 17+
- Maven 3.6+

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

The backend API will be available at `http://localhost:8080`

## Running the Full Stack App

1. Start the backend first (terminal 1):
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. Start the frontend (terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend

- `mvn spring-boot:run` - Run the application
- `mvn test` - Run tests
- `mvn clean install` - Build the project

## API Endpoints

### Health Check
- **GET** `/api/health` - Returns backend status
  ```json
  {
    "status": "UP",
    "message": "Backend is running"
  }
  ```

## Technology Stack

### Frontend
- React 18
- Vite 6
- Modern JavaScript (ES6+)

### Backend
- Java 17
- Spring Boot 3.2.1
- Spring Web
- Maven

## Features

- ✅ React frontend with Vite for fast development
- ✅ Spring Boot REST API backend
- ✅ CORS configuration for frontend-backend communication
- ✅ Health check endpoint
- ✅ Hot Module Replacement (HMR) for frontend
- ✅ Spring DevTools for backend auto-reload

## Development

The frontend is configured to make API calls to `http://localhost:8080/api/`. The backend is configured to accept CORS requests from `http://localhost:5173`.

## Next Steps

- Add database integration (PostgreSQL, MySQL, or MongoDB)
- Implement user authentication
- Add WebSocket support for real-time messaging
- Create message sending and receiving functionality
- Add user management
- Implement chat rooms or channels
