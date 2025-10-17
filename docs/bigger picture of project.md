# TurboVets Full‑Stack Assessment — A‑to‑Z Implementation Plan (8‑Hour Scope, **Aligned to Spec**)

**Audience:** You or an AI coding agent (Cursor). 

**Project Desciption**: NestJS backend, Angular **dashboard** app, NX monorepo layout, TypeORM + Postgres, roles **Owner/Admin/Viewer**, org‑level access control, real JWT auth, required endpoints including **/audit-log**, TailwindCSS, and test expectations. No extra features at the expense of fundamentals.

---

## 0) Delivery Checklist (Spec‑Accurate)
- ✅ **NX monorepo** with apps **api** (NestJS) and **dashboard** (Angular)
- ✅ **libs/data** (shared interfaces/DTOs) and **libs/auth** (RBAC logic + decorators)
- ✅ **Authentication:** real JWT login, guard on every protected endpoint
- ✅ **RBAC:** roles **Owner**, **Admin**, **Viewer**; org‑scoped access; role inheritance
- ✅ **Backend:** NestJS + TypeORM (Postgres); required endpoints
- ✅ **Frontend:** Angular + TailwindCSS; login + task dashboard (CRUD, sort/filter/categorize, drag‑and‑drop, responsive)
- ✅ **State management:** use NgRx for credibility
- ✅ **Audit logging** (console/file) and **GET /audit-log** (Owner/Admin only)
- ✅ **Testing:** Jest on RBAC, auth, endpoints; frontend component/store tests
- ✅ **README:** setup, NX layout rationale, data model, access control, API docs, future considerations

---

## 1) Monorepo Structure (Exact Names)
```
apps/
  api/            # NestJS backend (Auth, RBAC, Tasks, Audit)
  dashboard/      # Angular frontend (Task Management UI)

libs/
  data/           # Shared TS interfaces & DTOs (User, Org, Role, Task, Auth DTOs)
  auth/           # Reusable RBAC logic: decorators, guards, permission utils
```

**Why NX:** single workspace, shared code, consistent tooling, fast dev experience.

---

## 2) Data Model (TypeORM)
> Use Postgres.

**Entities**
- **User**(id, email, passwordHash, name, createdAt, updatedAt)
- **Organization**(id, name, parentId nullable)  ➜ *enables 2‑level hierarchy (Org, Sub‑Org)*
- **Role** enum: `OWNER`, `ADMIN`, `VIEWER` (role inheritance: Owner ⟹ Admin ⟹ Viewer)
- **Permission**(id, userId → User, orgId → Organization, role: Role)
  - *A user’s effective permissions derive from their **highest** role at an org node.*
- **Task**(id, orgId → Organization, title, description, **category** (e.g., Work/Personal), status (`TODO`|`IN_PROGRESS`|`DONE`), orderIndex (for DnD), ownerUserId → User, createdAt, updatedAt)
- **AuditLog**(id, userId, orgId, action, entity, entityId, meta JSON, createdAt)

**Indexes**
- Task(orgId), Task(ownerUserId), Task(orderIndex), Task(createdAt)
- Permission(userId, orgId)

**Seeding (minimal)**
- Orgs: `Acme` (root) → `Acme/Team‑A` (child)
- Users: owner@acme.com (OWNER at Acme), admin@acme.com (ADMIN at Team‑A), viewer@acme.com (VIEWER at Team‑A)
- Tasks across both levels to demonstrate scoping.

---

## 3) Access Control Model (RBAC + Org Scope)
**Core rules**
- **Owner** at an org node has full control over that org **and its children** (inheritance downward).
- **Admin** can create/edit tasks within their org node (and children, if policy allows). Cannot delete at higher privilege unless specified (we’ll allow delete for Owner/Admin to meet “if permitted”).
- **Viewer** can list/read tasks within their org node (and children, if allowed).

**Permission Matrix (baseline)**
| Action | Viewer | Admin | Owner |
|---|---|---|---|
| List tasks (org‑scoped) | ✅ | ✅ | ✅ |
| Create task | ❌ | ✅ | ✅ |
| Edit task | ❌ | ✅ | ✅ |
| Delete task | ❌ | ✅ | ✅ |
| View audit log | ❌ | ✅ | ✅ |

**Inheritance**
- Effective role at an org = max(role across Permissions at that org or its ancestors).*Implementation note:* compute once per request using a utility that ascends `parentId` chain to root.

---

## 4) Authentication (Real JWT, No Mocks)
**Flow**
1. **POST /auth/login** { email, password } → verify bcrypt, issue **JWT** (sub, email, Permissions snapshot or just userId + server lookup). Short TTL (e.g., 30m). 
2. Attach `Authorization: Bearer <token>` to all calls from dashboard.
3. **Guard:** Global `JwtAuthGuard` on protected routes + **RBAC Guard** at handler level (see decorators).

**Nest Modules**
- `AuthModule` (local strategy, JWT strategy, bcrypt service)
- `UsersModule`
- `OrgsModule`
- `TasksModule`
- `AuditModule`
- `RbacModule` (decorators, guards, permission util)

---

## 5) Backend (NestJS + TypeORM) — Endpoints (Required Only)
**Base path:** `/api`

**Auth**
- `POST /auth/login` → `{ accessToken }`

**Tasks**
- `POST /tasks` → create (RBAC: Admin/Owner within org scope)
- `GET /tasks` → list accessible tasks (org‑scoped + role‑scoped); supports `orgId`, `q`, `status`, `category`, `cursor/limit` pagination
- `PUT /tasks/:id` → edit (Admin/Owner in scope)
- `DELETE /tasks/:id` → delete (Admin/Owner in scope)

**Audit**
- `GET /audit-log` → list audit events (Owner/Admin only in org scope)

**Notes**
- All protected routes: `JwtAuthGuard` + `RbacGuard` (custom) using **decorators**:
  - `@Roles('ADMIN','OWNER')` and `@OrgScope()` (reads `orgId` from query/body/task)
- **Audit** every mutating action: who, what, org, when; minimal console/file writer.

---

## 6) RBAC Implementation Details (Nest)
**Decorators**
- `@Roles(...roles: Role[])` → required minimum role
- `@OrgParam(paramKey?: string)` → resolves pertinent orgId (from query/body/loaded task)

**Guards**
- `JwtAuthGuard` → validates token, attaches `req.user = { id, email }`
- `RbacGuard` →
  1) Resolve target **orgId** for request.
  2) Compute user’s **effective role** at org (consider ancestor Permissions for inheritance).
  3) Compare to required role(s) from `@Roles()` metadata.
  4) `403` if insufficient.

**Services**
- `PermissionService.getEffectiveRole(userId, orgId): Role` → climbs hierarchy to root.
- `TaskService` enforces additional ownership checks when updating `ownerUserId`.

---

## 7) Validation, Security, and Logging
- **Validation:** Nest ValidationPipe + class‑validator for DTOs in `libs/data`
- **Security:** Helmet, CORS (origin = dashboard dev URL), rate limit `/auth/login`
- **Passwords:** bcrypt(12)
- **Errors:** centralized filter (hide stack traces in prod), structured logs
- **Audit:** console/file append; minimal but includes `ts, userId, orgId, action, entity, entityId`

---

## 8) Frontend (Angular + TailwindCSS)
**Pages (Minimum)**
- **/login** → form, on success store JWT, route to `/tasks`
- **/tasks** (dashboard home) →
  - List tasks with **sort**, **filter** (status, category), **search** (q)
  - **Create/Edit/Delete** actions visible per role (Admin/Owner)
  - **Drag‑and‑drop** reorder/status (updates `orderIndex`/`status`)
  - Responsive layout (stack on mobile)
- **/audit-log** (Admin/Owner) → table of recent actions (simple list)

**State Management**
- Allowed: any. 
- **Option A (recommended):** NgRx (actions/effects for auth + tasks). 
- **Option B:** Angular Signals + RxJS services for speed.

**HTTP**
- `AuthInterceptor` attaches `Authorization: Bearer` header
- Error toast on 401/403

**UI**
- TailwindCSS; simple cards/tables/forms. Dark mode optional if time allows.

---

## 9) Drag‑and‑Drop (Minimal Implementation)
- Use Angular CDK DragDrop in the task list to reorder and column‑move (status change)
- Persist via API: `PUT /tasks/:id` with new `{ orderIndex, status }`

---

## 10) Testing Strategy (Per Spec)
**Backend (Jest)**
- Auth: login success/failure
- RBAC: `RbacGuard` unit tests (effective role at parent/child orgs)
- Endpoints: 401 without token, 403 with insufficient role, 200 for allowed

**Frontend (Jest/Karma)**
- Components: task table renders actions per role
- Store/effects (if NgRx): login success, load tasks, failed auth

---

## 11) README — Required Sections
1. **Setup**: env vars (`JWT_SECRET`, DB URL), how to run api & dashboard
2. **Architecture**: NX layout, modules, why libs/data & libs/auth
3. **Data Model**: ERD (ASCII ok), org hierarchy explanation
4. **Access Control**: roles, inheritance, org scope, decorators/guards
5. **API Docs**: endpoints with sample requests/responses
6. **Future Considerations**: delegated roles, refresh tokens, CSRF, permission caching, scalable checks

---

## 12) Submission Notes
- Keep commit history logical (auth → rbac → tasks → ui → polish).

