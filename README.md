# Technical Service App

A full-stack web application for managing technical service orders, built with FastAPI (backend) and React + TypeScript (frontend).

## Architecture

This project follows **Hexagonal Architecture** (Ports & Adapters) principles for both backend and frontend, ensuring clean separation of concerns, testability, and maintainability.

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT tokens
- **Architecture**: Hexagonal Architecture (Domain, Application, Infrastructure, Presentation)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Architecture**: Hexagonal Architecture (Domain, Application, Infrastructure, Presentation)

## Project Structure

```
technical_service_app/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API endpoints (Presentation)
│   │   ├── core/              # Configuration
│   │   ├── domain/            # Domain entities and business logic
│   │   ├── infrastructure/    # Database, Auth (Adapters)
│   │   ├── services/          # Application services (Use cases)
│   │   └── schemas/           # Pydantic schemas (DTOs)
│   ├── alembic/               # Database migrations
│   ├── env.example            # Environment variables template
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── domain/            # Domain entities and interfaces
│   │   ├── application/       # Use cases and mappers
│   │   ├── infrastructure/    # Repositories, HTTP client
│   │   ├── presentation/      # Hooks, pages, components
│   │   └── ...
│   ├── env.production.example # Production environment template
│   └── package.json           # Node dependencies
│
├── nginx/                      # Nginx configuration templates
├── scripts/                    # Deployment scripts
└── backend/systemd/            # Systemd service configuration

```

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- SQLite (development) or PostgreSQL (production)

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Production Deployment

For production deployment with Nginx and SSL, see:

- **[QUICK_START.md](QUICK_START.md)** - Quick deployment guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Detailed deployment documentation
- **[SECURITY.md](SECURITY.md)** - Security best practices

### Quick Production Setup

1. Configure environment variables (copy `.env.example` to `.env`)
2. Build frontend: `npm run build`
3. Configure Nginx (see `nginx/technical-service.conf`)
4. Set up SSL with Let's Encrypt
5. Configure systemd service (see `backend/systemd/technical-service-api.service`)

## Security

- JWT authentication with secure token management
- CORS configured for production domains only
- SSL/HTTPS enforced
- Security headers configured in Nginx
- Rate limiting enabled
- Input validation with Pydantic

See [SECURITY.md](SECURITY.md) for detailed security configuration.

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=sqlite:///./repair.db
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
CORS_ORIGINS=https://www.techvel-service.com
ENVIRONMENT=production
HOST=127.0.0.1
PORT=8000
WORKERS=4
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=https://www.techvel-service.com/api/v1
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest app/tests/test_auth.py

# Run with specific marker
pytest -m unit  # or integration, e2e

# Using Makefile
make test
make coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Using Makefile
make test
```

### Test Coverage

Both backend and frontend have minimum coverage thresholds of 80%. Tests are automatically run in CI/CD pipeline.

## CI/CD

This project uses **GitHub Actions** for continuous integration and deployment.

### CI Pipeline

The CI pipeline runs on every push and pull request to `main` or `develop` branches:

1. **Backend Tests**
   - Linting (black, flake8, mypy)
   - Unit and integration tests
   - Code coverage (minimum 80%)

2. **Frontend Tests**
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Unit tests
   - Code coverage (minimum 80%)

3. **Build Check**
   - Verifies both backend and frontend build successfully

### CD Pipeline

The CD pipeline runs on pushes to `main` branch or version tags (`v*`):

- Automatic deployment to production (configure your deployment steps)

### Running CI Locally

```bash
# Backend
cd backend
make lint          # Run all linters
make test          # Run tests
make coverage      # Run tests with coverage

# Frontend
cd frontend
npm run lint       # Run linter
npm run type-check # Type checking
npm run test       # Run tests
npm run test:coverage  # Tests with coverage
```

### Pre-commit Hooks

Install pre-commit hooks to run checks before each commit:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Code Quality Tools

**Backend:**
- `black` - Code formatter
- `flake8` - Linter
- `mypy` - Type checker
- `isort` - Import sorter
- `pytest` - Testing framework

**Frontend:**
- `ESLint` - Linter
- `TypeScript` - Type checker
- `Vitest` - Testing framework

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[SECURITY.md](SECURITY.md)** - Security configuration and best practices
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide
- **[INFRASTRUCTURE_FILES.md](INFRASTRUCTURE_FILES.md)** - Infrastructure files analysis

## Infrastructure Files

This repository includes infrastructure configuration files as **templates/examples**:

- `nginx/technical-service.conf` - Nginx configuration template
- `backend/systemd/technical-service-api.service` - Systemd service template
- `scripts/deploy.sh` - Automated deployment script

**Note**: These files should be customized for your specific server environment and are provided as reference implementations following best practices.

## License

[Add your license here]

## Contributing

[Add contributing guidelines here]

## Authors

[Add author information here]
