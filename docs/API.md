# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Endpoints

### Authentication

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid credentials
- `400` - Validation error

### Tasks

#### GET /tasks
Get tasks with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| orgId | string | Organization ID filter | No |
| status | enum | Task status (TODO, IN_PROGRESS, DONE) | No |
| category | string | Category filter | No |
| q | string | Search query | No |
| sortBy | string | Sort field (createdAt, title, etc.) | No |
| sortOrder | enum | Sort order (ASC, DESC) | No |
| limit | number | Number of results (default: 50) | No |
| offset | number | Pagination offset (default: 0) | No |

**Response:**
```json
{
  "tasks": [
    {
      "id": "string",
      "orgId": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "status": "TODO",
      "orderIndex": 0,
      "ownerUserId": "string",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

**Required Role:** VIEWER, ADMIN, or OWNER

#### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "orgId": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "status": "TODO",
  "orderIndex": 0
}
```

**Response:**
```json
{
  "id": "string",
  "orgId": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "status": "TODO",
  "orderIndex": 0,
  "ownerUserId": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Required Role:** ADMIN or OWNER

#### GET /tasks/:id
Get a specific task by ID.

**Response:**
```json
{
  "id": "string",
  "orgId": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "status": "TODO",
  "orderIndex": 0,
  "ownerUserId": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Required Role:** VIEWER, ADMIN, or OWNER

#### PATCH /tasks/:id
Update a task.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "status": "IN_PROGRESS",
  "orderIndex": 1
}
```

**Response:**
```json
{
  "id": "string",
  "orgId": "string",
  "title": "string",
  "description": "string",
  "category": "string",
  "status": "IN_PROGRESS",
  "orderIndex": 1,
  "ownerUserId": "string",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Required Role:** ADMIN or OWNER

#### DELETE /tasks/:id
Delete a task.

**Response:**
```json
{
  "message": "Task deleted successfully"
}
```

**Required Role:** ADMIN or OWNER

#### GET /tasks/categories
Get available task categories.

**Response:**
```json
[
  "Category 1",
  "Category 2",
  "Category 3"
]
```

**Required Role:** VIEWER, ADMIN, or OWNER

### Audit Logs

#### GET /audit-log
Get audit logs with filtering.

**Query Parameters:**
| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| orgId | string | Organization ID filter | No |
| limit | number | Number of results (default: 50) | No |
| offset | number | Pagination offset (default: 0) | No |

**Response:**
```json
{
  "logs": [
    {
      "id": "string",
      "userId": "string",
      "orgId": "string",
      "action": "create",
      "entity": "task",
      "entityId": "string",
      "meta": {
        "title": "Task Title",
        "category": "Category"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0,
  "hasMore": true
}
```

**Required Role:** ADMIN or OWNER

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/auth/login"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/auth/login"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required: ADMIN or OWNER, You have: VIEWER",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/tasks"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Task with ID 123 not found",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/tasks/123"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/auth/login"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/tasks"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Login endpoint**: 5 requests per 15 minutes per IP
- **Other endpoints**: 100 requests per 15 minutes per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Organization
```typescript
interface Organization {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Permission
```typescript
interface Permission {
  id: string;
  userId: string;
  orgId: string;
  role: 'OWNER' | 'ADMIN' | 'VIEWER';
  createdAt: Date;
  updatedAt: Date;
}
```

### Task
```typescript
interface Task {
  id: string;
  orgId: string;
  title: string;
  description: string;
  category: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  orderIndex: number;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### AuditLog
```typescript
interface AuditLog {
  id: string;
  userId: string;
  orgId: string;
  action: string;
  entity: string;
  entityId: string;
  meta: Record<string, any>;
  createdAt: Date;
}
```

## Examples

### Complete Task Creation Flow

1. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@acme.com", "password": "password123"}'
```

2. **Create Task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "orgId": "org-uuid",
    "title": "New Task",
    "description": "Task description",
    "category": "Development",
    "status": "TODO"
  }'
```

3. **Get Tasks:**
```bash
curl -X GET "http://localhost:3000/api/tasks?status=TODO&limit=10" \
  -H "Authorization: Bearer <jwt-token>"
```

### Error Handling Example

```javascript
try {
  const response = await fetch('/api/tasks', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error.message);
  throw error;
}
```
