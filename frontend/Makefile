# Makefile for frontend development tasks

.PHONY: help install test lint format type-check build clean

help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make test         - Run tests"
	@echo "  make lint         - Run linter (ESLint)"
	@echo "  make format       - Format code (ESLint --fix)"
	@echo "  make type-check   - Run TypeScript type check"
	@echo "  make build        - Build production bundle"
	@echo "  make clean        - Clean node_modules and build files"

install:
	npm ci

test:
	npm run test

lint:
	npm run lint

format:
	npm run lint:fix

type-check:
	npm run type-check

build:
	npm run build

clean:
	rm -rf node_modules/
	rm -rf dist/
	rm -rf coverage/
