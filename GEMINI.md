---
name: yoga-club-back
description: Senior Architect for Yoga Club Back-end (NestJS + Mongoose).
---

# Project Context

You are an expert developer working on "Yoga Club" back-end. The project follows a pragmatic Clean Architecture and DDD principles, optimized for MongoDB/Mongoose.

# Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Persistence**: MongoDB (Mongoose)
- **Validation**: class-validator
- **CQRS**: @nestjs/cqrs (Commands only for business logic)

# Architectural Layers (CRITICAL)

1. **Domain Layer (`src/modules/*/domain`)**:
   - Contains core entities and business logic.
   - Methods inside entities are encouraged for state changes.

2. **Application Layer (`src/modules/*/application`)**:
   - **Use Cases**: All state-changing actions must be standalone Use Case classes (Handlers).
   - **Errors**: UseCases MUST NOT throw NestJS built-in HTTP exceptions. Use `DomainException` only.
   - **Logic**: Executes via `usecase.execute()`.

3. **Infrastructure Layer (`src/modules/*/infrastructure`)**:
   - **Command Repositories**: Persistent logic for saving/updating.
   - **Query Repositories**: Located in `infrastructure/query`. Handle data retrieval for View Models.

4. **Interface Layer**:
   - **Controllers**: Handle HTTP.
   - **Direct Access**: Controllers can call `QueryRepository` directly for GET requests.
   - **Mappers**: Located in `api/mappers` or `infrastructure/mappers`. Used to convert DB models to View Models.

# Coding Standards

- **Dependency Injection**: Use constructor injection for repositories and services.
- **Pragmatic DIP**: UseCases may inject Repository classes directly (no mandatory interfaces).
- **Mappers Naming**: Follow `<entity>-to-<target>.mapper.ts` (e.g., `user-to-view.mapper.ts`).

# Naming Conventions

- **Files**: kebab-case.
- **Use cases**: `<action>.usecase.ts` (e.g., `create-session.usecase.ts`).
- **Repositories**:
  - Commands: `<entity>.repository.ts` (e.g., `users.repository.ts`).
  - Queries: `<entity>-query.repository.ts` (e.g., `users-query.repository.ts`).
- **Mappers**: `<entity>-to-<target>.mapper.ts`.

# Instructions

1. When generating UseCases, ensure they are registered in the Module's `providers`.
2. Always use `_id` and `.toString()` when handling MongoDB identifiers.
3. Ensure `DomainException` is caught by a global filter to convert into HTTP responses.

## Agent Skills

- **Location**: `./agent-skills/`
- **Active Skills**:
  - `nestjs-mongoose-best-practices`: Инструкции по типизации Mongoose и работе с Virtuals.
  - `cqrs-handler-registry`: Навык автоматической проверки регистрации Handler в Module.
  - `yoga-club-domain-rules`: Специфические бизнес-правила для проекта Yoga Club.

## Instructions for Agent

1. При выполнении сложных задач сначала проверь наличие подходящего навыка в `./agent-skills`.
2. Если навык найден, считай его `SKILL.md` перед генерацией кода.
