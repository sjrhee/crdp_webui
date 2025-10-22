.PHONY: help setup dev dev-backend dev-frontend test test-backend test-frontend clean stop build docker-up docker-down

help:
	@echo "CRDP WebUI - Development Commands"
	@echo "=================================="
	@echo "setup           - Install all dependencies (backend + frontend)"
	@echo "dev             - Run both backend and frontend in development mode"
	@echo "dev-backend     - Run only backend server"
	@echo "dev-frontend    - Run only frontend server"
	@echo "test            - Run all tests"
	@echo "test-backend    - Run backend tests only"
	@echo "test-frontend   - Run frontend tests only"
	@echo "stop            - Stop all running services"
	@echo "clean           - Remove all build artifacts and dependencies"
	@echo "build           - Build Docker images"
	@echo "docker-up       - Start services with Docker Compose"
	@echo "docker-down     - Stop Docker Compose services"

# Setup
setup: setup-backend setup-frontend
	@echo "✅ Setup complete!"

setup-backend:
	@echo "🔧 Setting up backend..."
	cd backend && python3 -m venv .venv
	cd backend && .venv/bin/pip install --upgrade pip
	cd backend && .venv/bin/pip install -r requirements.txt
	@echo "✅ Backend setup complete"

setup-frontend:
	@echo "🔧 Setting up frontend..."
	cd frontend && npm install
	@echo "✅ Frontend setup complete"

# Development
dev:
	@echo "🚀 Starting development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	@echo "🐍 Starting backend..."
	cd backend && .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@echo "⚛️  Starting frontend..."
	cd frontend && npm run dev -- --host

# Testing
test: test-backend test-frontend
	@echo "✅ All tests passed!"

test-backend:
	@echo "🧪 Running backend tests..."
	cd backend && .venv/bin/pytest -v

test-frontend:
	@echo "🧪 Running frontend tests..."
	@echo "⚠️  Frontend tests not configured yet"
	# cd frontend && npm test

# Cleanup
clean: stop
	@echo "🧹 Cleaning up..."
	rm -rf backend/.venv
	rm -rf backend/__pycache__
	rm -rf backend/**/__pycache__
	rm -rf backend/.pytest_cache
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	@echo "✅ Cleanup complete"

stop:
	@echo "Stopping services..."
	-@pkill -f "uvicorn app.main:app" 2>/dev/null || true
	-@sudo pkill -f "uvicorn app.main:app" 2>/dev/null || true
	-@pkill -f "vite" 2>/dev/null || true
	-@sudo pkill -f "vite" 2>/dev/null || true
	@echo "Services stopped"

# Docker
build:
	@echo "🐳 Building Docker images..."
	docker build -t crdp-webui-backend:latest ./backend
	docker build -t crdp-webui-frontend:latest ./frontend
	@echo "✅ Docker images built"

docker-up:
	@echo "🐳 Starting Docker Compose..."
	docker-compose up -d
	@echo "✅ Services started"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:8080"

docker-down:
	@echo "🐳 Stopping Docker Compose..."
	docker-compose down
	@echo "✅ Services stopped"

# Quick start for first time users
quick-start: setup
	@echo "🎉 Quick start complete!"
	@echo "Run 'make dev' to start development servers"
