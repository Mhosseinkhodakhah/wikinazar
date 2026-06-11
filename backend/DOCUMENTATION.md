# Backend Directory Documentation — Wikinazar

## Overview

The `backend/` directory contains a **modular monolith** REST API for the Wikinazar experience-sharing platform. Built with **Express.js**, **TypeScript**, and **TypeORM** (PostgreSQL), it follows a clean architecture pattern with feature-based modules, shared infrastructure, and enterprise-grade cross-cutting concerns (caching, event streaming, rate limiting, security).

---

## Tech Stack

| Technology                    | Purpose                                  |
| ----------------------------- | ---------------------------------------- |
| **Express.js**                | HTTP framework                           |
| **TypeScript**                | Type-safe JavaScript                     |
| **TypeORM**                   | ORM with PostgreSQL                      |
| **PostgreSQL**                | Primary database                         |
| **Redis** (ioredis)           | Caching layer                            |
| **Kafka** (kafkajs)           | Event streaming / async messaging        |
| **Zod**                       | Schema validation                        |
| **JSON Web Token** (jsonwebtoken) | Authentication                        |
| **bcryptjs**                  | Password hashing                         |
| **helmet**                    | Security headers                         |
| **express-rate-limit**        | Rate limiting                            |
| **morgan**                    | HTTP request logging                     |
| **uuid**                      | UUID generation                          |

---

## Project Structure

```
backend/
├── .env                    # Environment variables
├── .env.example            # Environment template
├── nodemon.json            # Nodemon config for dev
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies & scripts
├── STANDARDS.md            # Coding standards (516 lines)
└── src/
    ├── app.ts              # Express app factory (middleware, routes, error handling)
    ├── main.ts             # Entry point (boot, DB/Redis/Kafka init, graceful shutdown)
    ├── config/
    │   ├── env.ts          # Environment variable definitions
    │   └── index.ts        # Re-exports env
    ├── modules/
    │   ├── auth/           # Authentication module
    │   ├── subject/        # Subject module
    │   ├── experience/     # Experience module
    │   ├── request/        # Request module
    │   └── dashboard/      # Dashboard module
    └── shared/
        ├── database/       # TypeORM data source setup
        ├── errors/         # Custom error classes
        ├── kafka/          # Kafka client (producer/consumer)
        ├── logger/         # Structured logger
        ├── middleware/     # Express middleware (async handler, validation, error)
        ├── redis/          # Redis client (cache get/set/invalidate)
        └── types/          # Global TypeScript type augmentations
```

---

## Module Architecture

Each module follows a consistent layered structure:

```
module/
├── module.routes.ts       # Route definitions
├── module.controller.ts   # HTTP request handling
├── module.service.ts      # Business logic
├── module.module.ts       # Router aggregator (used by app.ts)
├── dto/                   # Zod validation schemas & DTO types
├── interfaces/            # Response type definitions
├── models/                # TypeORM entity definitions
└── repositories/          # Database access layer
```

---

## Modules

### Auth Module (`/api/v1/auth`)

**Routes:**

| Method | Endpoint          | Auth Required | Description                 |
| ------ | ----------------- | ------------- | --------------------------- |
| POST   | `/auth/register`  | No            | Register a new user         |
| POST   | `/auth/login`     | No            | Login with email/password   |
| GET    | `/auth/profile`   | Yes           | Get current user profile    |
| POST   | `/auth/refresh`   | Yes           | Refresh access token        |

**Key files:**
- `models/user.entity.ts` — `User` entity with enum `Role` (USER, EXPERT), fields: email, username, passwordHash, displayName, avatarUrl, bio
- `dto/register.dto.ts` — Zod schema: email (valid), username (3-30 chars, alphanumeric + underscore), password (8-128 chars), displayName (optional)
- `dto/login.dto.ts` — Zod schema: email, password
- `guards/auth.guard.ts` — Extracts Bearer token from Authorization header, verifies JWT, sets `req.user`
- `guards/roles.guard.ts` — Checks user role against allowed roles
- `repositories/user.repository.ts` — CRUD operations for User entity
- `utils/jwt.utils.ts` — `generateAccessToken`, `generateRefreshToken`, `verifyToken`
- `utils/password.utils.ts` — `hashPassword` (bcrypt, 12 rounds), `comparePassword`

---

### Subject Module (`/api/v1/subjects`)

**Routes:**

| Method | Endpoint               | Auth Required | Role Required | Description                      |
| ------ | ---------------------- | ------------- | ------------- | -------------------------------- |
| GET    | `/subjects`            | No            | —             | List subjects (paginated, filterable) |
| GET    | `/subjects/slug/:slug` | No            | —             | Get subject by slug              |
| GET    | `/subjects/:id`        | No            | —             | Get subject by ID                |
| POST   | `/subjects`            | Yes           | EXPERT        | Create a new subject             |
| PATCH  | `/subjects/:id`        | Yes           | EXPERT        | Update a subject                 |
| DELETE | `/subjects/:id`        | Yes           | EXPERT        | Delete a subject                 |

**Key files:**
- `models/subject.entity.ts` — `Subject` entity: title, slug (unique), description, category, icon, experienceCount
- `dto/subject.dto.ts` — Zod schemas: `createSubjectSchema` (title 2-200 chars, optional description/category/icon), `updateSubjectSchema` (partial), `subjectQuerySchema` (page, limit, search, category, sortBy, sortOrder)
- `repositories/subject.repository.ts` — CRUD with search (ILIKE on title + description), category filtering, pagination
- `subject.service.ts` — Business logic with Redis caching (`subjects:*` pattern), Kafka event publishing (`subject.events`), slug generation from title

---

### Experience Module (`/api/v1/experiences`)

**Routes:**

| Method | Endpoint                        | Auth Required | Description                          |
| ------ | ------------------------------- | ------------- | ------------------------------------ |
| GET    | `/experiences`                  | No            | List experiences (paginated, filterable) |
| GET    | `/experiences/stats/:subjectId` | No            | Get average rating and count for a subject |
| GET    | `/experiences/:id`              | No            | Get experience by ID                 |
| POST   | `/experiences`                  | Yes           | Create a new experience              |
| PATCH  | `/experiences/:id`              | Yes           | Update own experience                |
| DELETE | `/experiences/:id`              | Yes           | Delete own experience                |
| POST   | `/experiences/:id/like`         | Yes           | Like an experience                   |

**Key files:**
- `models/experience.entity.ts` — `Experience` entity: content, rating (1-5, default 5), likes (default 0), authorId (FK→User), subjectId (FK→Subject)
- `dto/experience.dto.ts` — Zod schemas: `createExperienceSchema` (content 10-5000 chars, rating 1-5, subjectId UUID), `updateExperienceSchema` (partial), `experienceQuerySchema` (page, limit, subjectId, authorId, minRating, sortBy, sortOrder)
- `repositories/experience.repository.ts` — CRUD with relations (author, subject), `incrementLikes`, `getSubjectRatingStats` (AVG rating query), `updateSubjectExperienceCount` (syncs experienceCount on Subject)
- `experience.service.ts` — Ownership enforcement (can only update/delete own experiences), Redis caching (`experiences:*`), Kafka events (`experience.events`), auto-syncs subject experience count on create/delete

---

### Request Module (`/api/v1/requests`)

**Routes:**

| Method | Endpoint                   | Auth Required | Role Required | Description                    |
| ------ | -------------------------- | ------------- | ------------- | ------------------------------ |
| GET    | `/requests`                | No            | —             | List requests (paginated, filterable) |
| POST   | `/requests`                | Yes           | —             | Create a new request           |
| POST   | `/requests/:id/vote`       | Yes           | —             | Upvote a request               |
| PATCH  | `/requests/:id/status`     | Yes           | EXPERT        | Update request status          |

**Key files:**
- `models/request.entity.ts` — `Request` entity: title, description, votes (default 0), status (default 'open'), requesterId (FK→User)
- `dto/request.dto.ts` — Zod schemas: `createRequestSchema` (title 5-200 chars, optional description), `requestQuerySchema` (page, limit, status filter, sortBy createdAt/votes)
- `repositories/request.repository.ts` — CRUD, `incrementVotes`, `updateStatus`
- `request.service.ts` — Redis caching (`requests:*`), Kafka events (`request.events`)

---

### Dashboard Module (`/api/v1/dashboard`)

**Routes:**

| Method | Endpoint      | Auth Required | Description                           |
| ------ | ------------- | ------------- | ------------------------------------- |
| GET    | `/dashboard`  | Yes           | Get user dashboard (profile, stats, recent items) |

**Key files:**
- `interfaces/dashboard.interface.ts` — `DashboardResponse` type: profile + stats + recentExperiences + recentRequests
- `dashboard.service.ts` — Aggregates user profile, experience stats (AVG rating, total count), recent experiences/requests for the authenticated user

---

## Shared Infrastructure

### Database — `src/shared/database/typeorm.ts`
- Singleton `DataSource` connected to PostgreSQL via `DATABASE_URL`
- Entities: `User`, `Subject`, `Experience`, `Request`
- `synchronize: true` only in production (auto-sync schema)
- `initializeDatabase()` / `disconnectDatabase()` — lifecycle management

### Errors — `src/shared/errors/`
- **`AppError`** — base class with `statusCode` and `isOperational` flag
- **HTTP error subclasses**: `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `InternalServerError` (500)

### Logger — `src/shared/logger/logger.ts`
- Structured console logger with levels: `debug`, `info`, `warn`, `error`
- Configurable level: `debug` in development, `info` in production
- ISO timestamps and optional metadata object

### Middleware — `src/shared/middleware/`
- **`asyncHandler`** — wraps async route handlers, forwards rejected promises to error middleware
- **`errorMiddleware`** — centralized error handler; distinguishes operational (`AppError`) from unexpected errors; includes stack trace in development
- **`validation`** — `validate(schema, source)` middleware using Zod; returns 400 with comma-separated field errors

### Redis — `src/shared/redis/redis.client.ts`
- Singleton Redis client (ioredis) with retry strategy and configurable host/port/password
- **`getCache<T>(key)`** / **`setCache(key, value, ttlSeconds)`** — JSON serialization/deserialization
- **`invalidateCache(key)`** / **`invalidateCachePattern(pattern)`** — cache invalidation by exact key or glob pattern

### Kafka — `src/shared/kafka/kafka.client.ts`
- Singleton Kafka producer with configurable broker and client ID
- **`publishEvent(topic, event)`** — sends JSON event with timestamp
- **`createConsumer(groupId)`** — returns connected consumer
- **`disconnectKafka()`** — graceful shutdown

### Types — `src/shared/types/index.ts`
- **`AuthenticatedRequest`** — extends Express `Request` with optional `user` property
- Global augmentation of `Express.Request` with `user` field

---

## Configuration — `src/config/env.ts`

All environment variables loaded via `dotenv`:

| Variable                     | Default                                              | Description                     |
| ---------------------------- | ---------------------------------------------------- | ------------------------------- |
| `NODE_ENV`                   | `development`                                        | Environment mode                |
| `PORT`                       | `5050`                                               | Server port                     |
| `CORS_ORIGIN`                | `http://localhost:3000`                               | CORS allowed origin             |
| `DATABASE_URL`               | `postgresql://postgres:postgres@localhost:5432/...`  | PostgreSQL connection string    |
| `REDIS_HOST`                 | `localhost`                                          | Redis host                      |
| `REDIS_PORT`                 | `6379`                                               | Redis port                      |
| `REDIS_PASSWORD`             | —                                                    | Redis password                  |
| `KAFKA_BROKER`               | `localhost:9092`                                     | Kafka broker address            |
| `KAFKA_CLIENT_ID`            | `experience-platform`                                | Kafka client ID                 |
| `JWT_SECRET`                 | `default-secret-change-me`                           | JWT signing secret              |
| `JWT_EXPIRES_IN`             | `7d`                                                 | Access token expiry             |
| `JWT_REFRESH_EXPIRES_IN`     | `30d`                                                | Refresh token expiry            |
| `BCRYPT_SALT_ROUNDS`         | `12`                                                 | Password hash rounds            |

---

## App Bootstrap — `src/main.ts`

Startup sequence:
1. Create Express app via `createApp()`
2. Initialize PostgreSQL (TypeORM DataSource)
3. Initialize Redis (continues if unavailable)
4. Start HTTP server on configured port
5. Register graceful shutdown handlers (SIGTERM, SIGINT) — closes HTTP server, then disconnects Redis, Kafka, and PostgreSQL with a 10-second forced shutdown timeout

## App Factory — `src/app.ts`

Express app setup order:
1. **CORS** — permissive (all origins, standard methods/headers)
2. **Helmet** — security headers (`crossOriginResourcePolicy: cross-origin`)
3. **Rate Limiting** — 100 requests per 15-minute window
4. **Body Parsing** — JSON (10mb limit) + URL-encoded
5. **Logging** — morgan `dev` format (skipped in test)
6. **Health Check** — `GET /health`
7. **API v1 Routes** — mounts all modules under `/api/v1`
8. **404 Handler** — catches unmatched routes
9. **Error Middleware** — centralized error handling

---

## Available Scripts

```bash
npm run dev              # Start with nodemon (hot reload)
npm run build            # Compile TypeScript to dist/
npm run start            # Run compiled production build
npm run lint             # ESLint check
npm run format           # Prettier format
npm run check-types      # TypeScript type checking
npm run db:sync          # Manually sync database schema
```
