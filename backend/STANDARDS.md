# Backend Coding Standards

> This document defines the coding standards, architecture patterns, and conventions used across the backend codebase. All code must adhere to these standards.

---

## 1. Project Architecture

### 1.1 Modular Monolith Structure

```
src/
├── main.ts                        # Entry point, server bootstrap, graceful shutdown
├── app.ts                         # Express app factory, middleware registration, route mounting
├── config/                        # Environment configuration
│   ├── env.ts                     # Environment variable loading & validation
│   └── index.ts                   # Barrel export
├── modules/                       # Business logic modules (self-contained features)
│   ├── auth/
│   ├── subject/
│   ├── experience/
│   ├── request/
│   └── dashboard/
└── shared/                        # Cross-cutting concerns (reusable infrastructure)
    ├── database/
    ├── errors/
    ├── kafka/
    ├── logger/
    ├── middleware/
    ├── redis/
    └── types/
```

### 1.2 Module Internal Structure

Every module follows this exact structure:

```
moduleName/
├── moduleName.module.ts            # Route mounting (Express Router + path prefix)
├── moduleName.routes.ts            # Route definitions (HTTP methods, middleware chain)
├── moduleName.controller.ts        # Thin controller (extract params, call service, send response)
├── moduleName.service.ts           # Business logic & orchestration
├── dto/
│   └── moduleName.dto.ts           # Zod validation schemas + inferred TS types
├── interfaces/
│   └── moduleName.interface.ts     # Response shapes & type definitions
├── models/
│   └── moduleName.entity.ts        # TypeORM entity (database model)
└── repositories/
    └── moduleName.repository.ts    # Data access layer (wraps TypeORM Repository)
```

**Exception:** The `auth` module additionally includes:
- `guards/` — Authentication and authorization guards
- `utils/` — Utility functions (JWT, password hashing)

### 1.3 Layer Responsibilities

| Layer | File Pattern | Responsibility |
|-------|-------------|----------------|
| Module | `*.module.ts` | Creates Express `Router`, mounts routes under a path prefix, exports for `app.ts` |
| Routes | `*.routes.ts` | Defines HTTP method + path + middleware chain + controller handler |
| Controller | `*.controller.ts` | Extracts request data (params, body, query, user), calls service, sends response |
| Service | `*.service.ts` | Contains business logic, validation, caching, event publishing |
| Repository | `*.repository.ts` | Wraps TypeORM `Repository` for all database operations |
| DTO | `*.dto.ts` | Zod schema definitions for request validation + inferred TypeScript types |
| Interface | `*.interface.ts` | Response shape types, query parameter types, API contract types |
| Entity | `*.entity.ts` | TypeORM entity with decorators mapping to database tables |

### 1.4 Shared Layer

| Path | Purpose |
|------|---------|
| `shared/database/typeorm.ts` | Singleton `DataSource` lazy initialization |
| `shared/errors/app-error.ts` | Base `AppError` class extending `Error` |
| `shared/errors/http-error.ts` | Concrete HTTP error subclasses (400/401/403/404/409/500) |
| `shared/kafka/kafka.client.ts` | Kafka producer/consumer management, event publishing |
| `shared/logger/logger.ts` | Custom logger with level filtering, timestamps, meta support |
| `shared/middleware/async-handler.ts` | Async route handler wrapper (catches promise rejections) |
| `shared/middleware/error.middleware.ts` | Centralized Express error-handling middleware |
| `shared/middleware/validation.middleware.ts` | Zod-based request validation middleware factory |
| `shared/redis/redis.client.ts` | Singleton Redis client with cache helpers |
| `shared/types/index.ts` | Global Express `Request` augmentation, shared type definitions |

---

## 2. Naming Conventions

### 2.1 Files & Directories

| Element | Convention | Examples |
|---------|-----------|----------|
| Directories | `kebab-case`, singular nouns | `auth/`, `dto/`, `models/`, `repositories/`, `shared/` |
| Module files | `kebab-case` with dot-separated layer | `auth.controller.ts`, `user.entity.ts`, `error.middleware.ts` |
| Config files | `kebab-case` | `nodemon.json`, `tsconfig.json`, `env.ts` |
| Test files | `*.spec.ts` | `auth.service.spec.ts` |

### 2.2 Code Identifiers

| Element | Convention | Examples |
|---------|-----------|----------|
| Classes | `PascalCase` | `AuthService`, `UserRepository`, `AppError` |
| Interfaces / Types | `PascalCase`, no `I` prefix | `AuthResponse`, `TokenPayload`, `RegisterDto` |
| Functions | `camelCase` | `generateAccessToken`, `hashPassword`, `asyncHandler` |
| Variables / Constants | `camelCase` | `authService`, `experienceRouter`, `moduleRouter` |
| Enum types | `PascalCase` | `Role` |
| Enum values | `UPPER_CASE` | `Role.USER`, `Role.USER` |
| Database columns | `snake_case` (via `name:` decorator) | `password_hash`, `display_name`, `created_at` |
| Entity properties | `camelCase` (maps to `snake_case` column) | `passwordHash`, `displayName`, `createdAt` |
| File exports | Named exports preferred | `export { authRouter }`, `export class AuthService` |

---

## 3. Code Style & Formatting

### 3.1 Language & Compiler

- **Language:** TypeScript with `"strict": true`
- **Module system:** CommonJS (`module: "CommonJS"`)
- **Target:** ES2022
- **Decorators:** Enabled (`experimentalDecorators`, `emitDecoratorMetadata` for TypeORM)

### 3.2 Formatting Rules

| Rule | Standard |
|------|----------|
| Semicolons | Always required at end of statements |
| Quotes | Single quotes (`'`) for all strings |
| Indentation | 2 spaces (no tabs) |
| Trailing commas | Required in multiline objects/arrays |
| Braces | Same-line (Egyptian style) for blocks |
| Arrow functions | Preferred for method definitions in controller/service objects |
| Object destructuring | Use extensively for imports and parameter unpacking |
| Null vs undefined | Use `null` for nullable DB fields; `undefined` for optional properties |
| Type annotations | Always write explicit return types on functions |

### 3.3 Imports

- **Type-only imports:** Use `import { type X }` syntax
  ```typescript
  import { type Request, type Response, type NextFunction } from 'express';
  ```
- **Named exports:** Always prefer `export const` / `export class` over `export default`
- **Relative paths:** Always use relative paths for internal imports
- **Order:** External libraries first, then internal modules
- **No barrel files:** Import directly from the file path (except `config/index.ts`)

### 3.4 TypeScript Practices

- Use `type` keyword for Express types: `type Request`, `type Response`
- Use `as const` for configuration objects to enforce literal types
- Use `!` non-null assertion only after guard/validation guarantees (e.g., `req.user!.id`)
- Minimize `as any` casts; prefer proper type definitions
- Prefer interfaces over type aliases for object shapes

---

## 4. Error Handling

### 4.1 Error Hierarchy

```
Error
└── AppError (abstract)
    ├── BadRequestError (400)
    ├── UnauthorizedError (401)
    ├── ForbiddenError (403)
    ├── NotFoundError (404)
    ├── ConflictError (409)
    └── InternalServerError (500)
```

- All custom errors extend `AppError`, which extends `Error`
- Each error has a `statusCode` and `isOperational` flag
- Use `Object.setPrototypeOf(this, new.target.prototype)` in constructors for proper prototype chain

### 4.2 Error Propagation

1. **Services** throw HTTP-specific errors:
   ```typescript
   throw new NotFoundError('Subject not found');
   ```
2. **`asyncHandler` wrapper** catches thrown errors and forwards to `next(error)`
3. **Error middleware** (`error.middleware.ts`) is the last middleware in the chain:
   - Operational errors (`instanceof AppError`): return `{ success: false, error: { message } }` with the appropriate status code
   - Unexpected errors: return 500 with "Internal server error"
   - Stack traces exposed only in development mode

### 4.3 Controller Pattern

Controllers must NOT contain try/catch. All error handling is delegated to `asyncHandler`:

```typescript
export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as RegisterDto;
    const result = await authService.register(dto);
    res.status(201).json({ success: true, data: result });
  }),
};
```

---

## 5. API Standards

### 5.1 Response Envelope

All API responses follow a consistent envelope:

```typescript
// Success
{ success: true, data: { ... } }

// Error
{ success: false, error: { message: '...' } }
```

### 5.2 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE (no content) |
| 400 | Validation error (`BadRequestError`) |
| 401 | Missing/invalid token (`UnauthorizedError`) |
| 403 | Insufficient role (`ForbiddenError`) |
| 404 | Resource not found (`NotFoundError`) |
| 409 | Duplicate/conflict (`ConflictError`) |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error (`InternalServerError`) |

### 5.3 URL Structure

- Base path: `/api/v1`
- Module paths: `/auth`, `/subjects`, `/experiences`, `/requests`, `/dashboard`
- Health check: `GET /health` (outside API version)

### 5.4 Pagination

All list endpoints use consistent pagination query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number (coerced) | Page number (default: 1) |
| `limit` | number (coerced) | Items per page (default: 10) |
| `sortBy` | string | Field to sort by |
| `sortOrder` | `'ASC' \| 'DESC'` | Sort direction |

### 5.5 Route Definition Pattern

```typescript
// auth.routes.ts
const router = Router();

router.post('/register', validate(registerDto, 'body'), authController.register);
router.post('/login', validate(loginDto, 'body'), authController.login);
router.get('/profile', authGuard, authController.getProfile);

export const authRouter = router;
```

### 5.6 Middleware Chain Order

```
[rateLimiter] → [authGuard] → [rolesGuard(...)] → [validate(dto, source)] → controller
```

---

## 6. Validation

### 6.1 Zod DTO Pattern

All request validation uses Zod schemas defined in `dto/*.dto.ts`:

```typescript
// auth/dto/register.dto.ts
import { z } from 'zod';

export const registerDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(50),
});

export type RegisterDto = z.infer<typeof registerDto>;
```

### 6.2 Validation Middleware

The `validate(schema, source)` middleware factory validates against `body`, `query`, or `params`:

```typescript
// In routes
router.post('/', validate(createSubjectDto, 'body'), subjectController.create);
router.get('/', validate(paginationDto, 'query'), subjectController.findAll);
```

---

## 7. Database Standards

### 7.1 ORM

- **TypeORM** with **PostgreSQL**
- Connection via singleton `getDataSource()` function

### 7.2 Entity Conventions

```typescript
@Entity('table_name')                           // Plural snake_case table names
@PrimaryGeneratedColumn('uuid')                 // UUID primary keys
@Column({ name: 'column_name', type: 'varchar', nullable: true })  // snake_case columns
@CreateDateColumn({ name: 'created_at' })       // Creation timestamp
@UpdateDateColumn({ name: 'updated_at' })       // Update timestamp
```

- All entities have `id` (UUID), `createdAt`, `updatedAt`
- All columns use `snake_case` via the `name:` decorator property
- Entity property names use `camelCase`

### 7.3 Entity Relationships

```typescript
// Many side
@ManyToOne(() => User, (user) => user.experiences)
@JoinColumn({ name: 'author_id' })
author: User;

// One side
@OneToMany(() => Experience, (experience) => experience.author)
experiences: Experience[];
```

### 7.4 Repository Pattern

Each entity has a dedicated repository class:

```typescript
export class UserRepository {
  private repo = getDataSource().getRepository(User);

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }
}
```

---

## 8. Authentication & Authorization

### 8.1 Authentication (JWT)

- **Tokens:** JWT Bearer tokens via `Authorization: Bearer <token>` header
- **Token payload:** `{ sub: userId, email: string, role: Role }`
- **Guard:** `authGuard` middleware verifies and attaches `req.user`
- **Type safety:** Express `Request` augmented via `shared/types/index.ts`

### 8.2 Authorization (Role-Based)

- **Guard:** `rolesGuard(...allowedRoles)` middleware checks user role
- **Roles:** `Role.USER`, `Role.USER`
- Applied after `authGuard`

```typescript
router.post('/', authGuard, rolesGuard(Role.USER), subjectController.create);
```

---

## 9. Cross-Cutting Concerns

### 9.1 Logging

- Custom logger with level-based filtering: `info`, `warn`, `error`, `debug`
- Timestamp formatting and optional meta object support
- Use `logger.info()`, `logger.error()`, etc. throughout the codebase

### 9.2 Caching (Redis)

- Singleton Redis client with retry strategy
- Helper functions: `get(key)`, `set(key, value, ttl)`, `invalidate(key)`, `invalidateCachePattern(pattern)`
- Caching used in service layer for read-heavy operations

### 9.3 Event Publishing (Kafka)

- Topics use dot notation: `subject.events`, `experience.events`, `request.events`
- `publishEvent(topic, eventType, payload)` helper
- Fire-and-forget pattern: errors caught internally and logged (events are not critical)

### 9.4 Graceful Shutdown

`main.ts` handles `SIGTERM` and `SIGINT`:
1. Close HTTP server
2. Disconnect Redis, Kafka, and database via `Promise.allSettled`
3. Force exit after 10-second timeout

---

## 10. Configuration & Environment

### 10.1 Environment Variables

All environment variables are loaded, validated, and exported from `config/env.ts`:

```typescript
export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  // ... etc
} as const;
```

### 10.2 Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript compiler options |
| `package.json` | Dependencies, scripts, project metadata |
| `nodemon.json` | Dev server watch configuration |

---

## 11. Package Management

### 11.1 Production Dependencies

| Package | Purpose |
|---------|---------|
| `bcryptjs` | Password hashing |
| `cors` | CORS middleware |
| `dotenv` | Environment variables |
| `express` | HTTP framework |
| `express-rate-limit` | Rate limiting |
| `helmet` | Security headers |
| `ioredis` | Redis client |
| `jsonwebtoken` | JWT generation/verification |
| `kafkajs` | Kafka client |
| `morgan` | HTTP request logging |
| `pg` | PostgreSQL driver |
| `reflect-metadata` | TypeORM decorator support |
| `typeorm` | ORM |
| `uuid` | UUID generation |
| `zod` | Schema validation |

### 11.2 Dev Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `ts-node` | TypeScript execution |
| `nodemon` | Dev server auto-restart |
| `eslint` | Linter |
| `@typescript-eslint/*` | TypeScript ESLint rules |
| `prettier` | Code formatter |
| `@types/*` | Type definitions |

---

## 12. Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `nodemon` | Start dev server with hot reload |
| `build` | `tsc` | Compile TypeScript to JavaScript |
| `start` | `node dist/main.js` | Start production server |
| `lint` | `eslint src --ext .ts` | Lint all source files |
| `format` | `prettier 'src/**/*.ts' --write` | Format all source files |
| `check-types` | `tsc --noEmit` | Type-check without emitting files |
| `db:sync` | `ts-node -e ...` | Sync database schema |

---

## 13. Consistency Checklist

Before submitting code, verify:

- [ ] Module structure follows `module/` → `dto/`, `interfaces/`, `models/`, `repositories/`
- [ ] Files use `kebab-case` with dot-separated layer names
- [ ] Classes use `PascalCase`, functions/variables use `camelCase`
- [ ] All statements end with semicolons
- [ ] Strings use single quotes
- [ ] Indentation is 2 spaces
- [ ] Response follows `{ success, data }` or `{ success, error }` envelope
- [ ] All async route handlers wrapped in `asyncHandler`
- [ ] Services throw typed errors (extends `AppError`)
- [ ] Validation uses Zod schemas with `validate()` middleware
- [ ] Route definitions in `*.routes.ts`, business logic in `*.service.ts`
- [ ] Database columns use `snake_case`, entity properties use `camelCase`
- [ ] Type imports use `import { type X }` syntax

---

## 14. Testing Standards

> **Note:** No testing infrastructure is currently installed. When adding tests:
- Use `*.spec.ts` naming convention (already ignored in nodemon.json)
- Place test files alongside the source files they test
- A test framework must be added (e.g., Jest, Vitest)

---

*This document must be updated when new patterns or conventions are adopted.*
