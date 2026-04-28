SHELL := /bin/bash

FRONTEND_DIR := frontend
BACKEND_DIR := backend

.PHONY: help test frontend-run frontend-test frontend-build frontend-lint frontend-preview backend-run backend-test backend-package backend-clean dev

help:
	@echo "Targets:"
	@echo "  make test             # Run backend tests, frontend tests, and frontend build"
	@echo "  make frontend-run     # Run Vite dev server"
	@echo "  make frontend-test    # Run frontend tests"
	@echo "  make frontend-build   # Build frontend"
	@echo "  make frontend-lint    # Lint frontend"
	@echo "  make frontend-preview # Preview production build"
	@echo "  make backend-run      # Run Spring Boot"
	@echo "  make backend-test     # Run backend tests"
	@echo "  make backend-package  # Package backend jar"
	@echo "  make backend-clean    # Clean backend build"
	@echo "  make dev              # Run frontend and backend (two terminals)"

test: backend-test frontend-test frontend-build

frontend-run:
	cd $(FRONTEND_DIR) && npm run dev

frontend-test:
	cd $(FRONTEND_DIR) && npm run test:run

frontend-build:
	cd $(FRONTEND_DIR) && npm run build

frontend-lint:
	cd $(FRONTEND_DIR) && npm run lint

frontend-preview:
	cd $(FRONTEND_DIR) && npm run preview

backend-run:
	cd $(BACKEND_DIR) && mvn spring-boot:run

backend-test:
	cd $(BACKEND_DIR) && mvn test

backend-package:
	cd $(BACKEND_DIR) && mvn package

backend-clean:
	cd $(BACKEND_DIR) && mvn clean

dev:
	@echo "Run these in separate terminals:"
	@echo "  make backend-run"
	@echo "  make frontend-run"
