# System Architecture

## Overview

The RBAC Task Management System is built using a modern, scalable architecture that separates concerns and provides clear boundaries between different layers of the application.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Angular)     │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • Components    │    │ • Controllers   │    │ • Tables        │
│ • Services      │    │ • Services      │    │ • Indexes       │
│ • NgRx Store    │    │ • Guards        │    │ • Constraints   │
│ • Interceptors  │    │ • Interceptors  │    │ • Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Monorepo Structure

```
rbac/
├── apps/
│   ├── api/                    # NestJS Backend
│   ├── dashboard/              # Angular Frontend
│   ├── api-e2e/               # Backend E2E Tests
│   └── dashboard-e2e/         # Frontend E2E Tests
├── libs/
│   ├── data/                  # Shared Data Models
│   └── auth/                  # RBAC Utilities
├── docs/                      # Documentation
└── plan/                      # Project Planning
```

## Backend Architecture (NestJS)

### Module Structure
```
apps/api/src/
├── auth/                      # Authentication Module
│   ├── auth.controller.ts    # Login endpoint
│   ├── auth.service.ts        # Auth business logic
│   ├── auth.module.ts        # Module definition
│   ├── guards/               # JWT authentication guard
│   └── strategies/           # JWT strategy
├── rbac/                      # RBAC Module
│   ├── permissions.service.ts # Permission logic
│   ├── rbac.guard.ts         # RBAC authorization guard
│   └── rbac.module.ts        # Module definition
├── tasks/                     # Task Management Module
│   ├── tasks.controller.ts    # Task CRUD endpoints
│   ├── tasks.service.ts       # Task business logic
│   └── tasks.module.ts        # Module definition
├── audit/                     # Audit Module
│   ├── audit.controller.ts    # Audit log endpoints
│   ├── audit.service.ts       # Audit logging logic
│   └── audit.interceptor.ts   # Automatic audit logging
├── database/                  # Database Layer
│   ├── entities/             # TypeORM entities
│   ├── migrations/           # Database migrations
│   └── seeds/                # Database seeding
└── common/                    # Shared Utilities
    └── filters/              # Error handling
```

### Key Design Patterns

#### 1. Dependency Injection
All services and controllers use NestJS's built-in dependency injection system for loose coupling and testability.

#### 2. Guard Pattern
Authentication and authorization are handled through guards that can be applied to controllers or individual methods.

#### 3. Interceptor Pattern
Audit logging is implemented as an interceptor that automatically logs mutating operations.

#### 4. Repository Pattern
TypeORM repositories provide a clean abstraction over database operations.

## Frontend Architecture (Angular)

### Component Structure
```
apps/dashboard/src/app/
├── components/                # Feature Components
│   ├── login/               # Authentication
│   ├── tasks/               # Task Management
│   ├── audit/               # Audit Logs
│   └── shared/              # Shared Components
├── store/                    # NgRx State Management
│   ├── auth/                # Authentication State
│   ├── tasks/               # Task State
│   └── audit/               # Audit State
├── services/                 # API Services
│   ├── auth.service.ts      # Authentication API
│   ├── tasks.service.ts     # Tasks API
│   └── audit.service.ts     # Audit API
└── interceptors/             # HTTP Interceptors
    └── auth.interceptor.ts  # JWT token injection
```

### State Management (NgRx)

#### Store Structure
```typescript
interface AppState {
  auth: AuthState;           # Authentication state
  tasks: TasksState;         # Task management state
  audit: AuditState;         # Audit log state
}
```

#### State Flow
1. **Actions**: User interactions trigger actions
2. **Effects**: Actions trigger side effects (API calls)
3. **Reducers**: State updates based on actions
4. **Selectors**: Components subscribe to state changes

#### Key Benefits
- **Predictable State**: Single source of truth
- **Time Travel Debugging**: Redux DevTools support
- **Testability**: Pure functions for reducers
- **Performance**: OnPush change detection

## Database Architecture

### Entity Relationships
```
Users (1) ── (N) Permissions (N) ── (1) Organizations
   │                                    │
   │                                    │
   └── (N) Tasks (N) ──────────────────┘
           │
           └── (N) AuditLogs
```

### Key Design Decisions

#### 1. UUID Primary Keys
All entities use UUIDs for primary keys to ensure uniqueness across distributed systems.

#### 2. Soft Delete Pattern
Critical entities use soft delete to maintain referential integrity and audit trails.

#### 3. Audit Trail
All mutating operations are automatically logged with metadata for compliance and debugging.

#### 4. Indexing Strategy
- **Primary Keys**: Automatic indexes
- **Foreign Keys**: Indexed for join performance
- **Query Fields**: Status, category, organization filters
- **Composite Indexes**: User-organization combinations

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Backend validates credentials
3. JWT token generated and returned
4. Frontend stores token
5. Token included in subsequent requests
6. Backend validates token on each request
```

### Authorization Flow
```
1. Extract user from JWT token
2. Determine target organization
3. Check user's effective role
4. Apply role-based permissions
5. Allow or deny access
```

### Security Layers
1. **Network**: HTTPS in production
2. **Application**: JWT tokens, rate limiting
3. **Database**: Encrypted connections, parameterized queries
4. **Infrastructure**: Firewall rules, access controls

## Data Flow

### Task Creation Flow
```
1. User clicks "Create Task"
2. Frontend opens modal
3. User fills form and submits
4. Frontend dispatches createTask action
5. NgRx effect calls API service
6. Service makes HTTP POST request
7. Backend validates request
8. RBAC guard checks permissions
9. Service creates task in database
10. Audit interceptor logs action
11. Response returned to frontend
12. NgRx reducer updates state
13. UI updates with new task
```

### Authentication Flow
```
1. User enters credentials
2. Frontend validates form
3. Login action dispatched
4. Auth service calls login API
5. Backend validates credentials
6. JWT token generated
7. Token returned to frontend
8. Token stored in localStorage
9. User redirected to dashboard
10. Auth state updated
```

## Scalability Considerations

### Horizontal Scaling
- **Stateless Backend**: No server-side sessions
- **Database Connection Pooling**: Efficient connection management
- **Load Balancing**: Multiple backend instances
- **CDN**: Static asset delivery

### Performance Optimizations
- **Database Indexing**: Optimized query performance
- **Pagination**: Large dataset handling
- **Caching**: NgRx store for client-side caching
- **Lazy Loading**: Code splitting for faster initial load

### Future Enhancements
- **Microservices**: Split into domain services
- **Event Sourcing**: Audit trail as event stream
- **CQRS**: Separate read/write models
- **GraphQL**: Flexible API queries

## Testing Strategy

### Backend Testing
- **Unit Tests**: Service and controller logic
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full workflow testing

### Frontend Testing
- **Component Tests**: UI component behavior
- **Service Tests**: API service mocking
- **Store Tests**: NgRx reducer and effect testing
- **E2E Tests**: User workflow testing

### Test Pyramid
```
    ┌─────────┐
    │   E2E   │  ← Few, slow, expensive
    ├─────────┤
    │Integration│  ← Some, medium speed
    ├─────────┤
    │  Unit   │  ← Many, fast, cheap
    └─────────┘
```

## Deployment Architecture

### Development Environment
```
Developer Machine
├── Node.js Runtime
├── PostgreSQL Database
├── NX CLI
└── Hot Reload
```

### Production Environment
```
Load Balancer
├── Frontend (Static Files)
├── Backend (Node.js)
├── Database (PostgreSQL)
└── Monitoring
```

### Container Strategy
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
# Build applications

FROM node:18-alpine AS runtime
# Production runtime
```

## Monitoring and Observability

### Logging Strategy
- **Structured Logging**: JSON format for parsing
- **Log Levels**: Error, Warn, Info, Debug
- **Correlation IDs**: Request tracing
- **Audit Logs**: Compliance and security

### Metrics Collection
- **Application Metrics**: Response times, error rates
- **Business Metrics**: Task completion, user activity
- **Infrastructure Metrics**: CPU, memory, disk usage

### Health Checks
- **Liveness Probe**: Application is running
- **Readiness Probe**: Application is ready to serve
- **Database Health**: Connection and query performance

## Error Handling

### Backend Error Handling
```typescript
// Global exception filter
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Centralized error processing
  }
}
```

### Frontend Error Handling
```typescript
// NgRx error handling
createEffect(() =>
  this.actions$.pipe(
    ofType(TasksActions.loadTasks),
    switchMap(() =>
      this.tasksService.getTasks().pipe(
        map(tasks => TasksActions.loadTasksSuccess({ tasks })),
        catchError(error => of(TasksActions.loadTasksFailure({ error })))
      )
    )
  )
);
```

## Configuration Management

### Environment Variables
- **Development**: Local development settings
- **Staging**: Pre-production testing
- **Production**: Live environment settings

### Feature Flags
- **Runtime Configuration**: Dynamic feature toggling
- **A/B Testing**: Gradual feature rollouts
- **Maintenance Mode**: System-wide controls

## Documentation Strategy

### Code Documentation
- **JSDoc Comments**: Function and class documentation
- **Type Definitions**: TypeScript interfaces
- **API Documentation**: OpenAPI/Swagger specs

### Architecture Documentation
- **Decision Records**: ADR format for major decisions
- **Diagrams**: System and component diagrams
- **Runbooks**: Operational procedures

This architecture provides a solid foundation for the RBAC Task Management System while maintaining flexibility for future enhancements and scaling requirements.
