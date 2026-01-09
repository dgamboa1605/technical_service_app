# Makefile for backend development tasks

.PHONY: help install test lint format type-check coverage clean

help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make test         - Run tests"
	@echo "  make lint         - Run linters"
	@echo "  make format       - Format code with black and isort"
	@echo "  make type-check   - Run type checker (mypy)"
	@echo "  make coverage     - Run tests with coverage"
	@echo "  make clean        - Clean cache and build files"

install:
	pip install -r requirements.txt

test:
	pytest app/tests/ -v

lint:
	black --check app/
	isort --check app/
	flake8 app/ --max-line-length=100 --extend-ignore=E203,W503
	mypy app/ --ignore-missing-imports || true

format:
	black app/
	isort app/

type-check:
	mypy app/ --ignore-missing-imports

coverage:
	pytest app/tests/ -v --cov=app --cov-report=html --cov-report=term-missing

clean:
	find . -type d -name __pycache__ -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} +
	find . -type d -name ".pytest_cache" -exec rm -r {} +
	find . -type d -name ".mypy_cache" -exec rm -r {} +
	rm -rf htmlcov/
	rm -rf coverage.xml
	rm -rf .coverage
