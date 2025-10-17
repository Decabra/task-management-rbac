# TurboVets Full‑Stack Assessment — A‑to‑Z Implementation Plan (8‑Hour Scope, Two‑Level Org + Scalable Design)

**Audience:** You or an AI coding agent (Cursor).  
**Purpose:** Deliver a secure, 2‑level organization‑based RBAC system as described in the challenge PDF, **while keeping the design future‑proof** for deeper hierarchies (3‑6 levels) with minimal refactoring.

---

## 0) Compliance & Scalability Strategy

**Business requirement (PDF):** 2‑level organization hierarchy (Root + Child).  
**Architectural goal:** Implement 2‑level behavior today, but design schema and logic so extending to N‑level later is a one‑line logic change.

### Summary
| Aspect | Implementation | Scalable Later? |
|---------|----------------|-----------------|
| **Hierarchy Depth** | Limit traversal to one parent (root → child) | Replace traversal loop for multi‑level walk |
| **Data Model** | Self‑referential `parentId` column | Already supports arbitrary nesting |
| **Effective Role Logic** | Checks org + its parent only | Expand to recursive climb or closure table |
| **Schema Change Needed** | None | None |

---

## 1) Organization Data Model (Compliant + Future‑Proof)

**Entity Concept:** Each organization has an optional parent; root has `parentId = null`.

```
organizations
-------------
id           UUID
name         STRING
parent_id    UUID (nullable)
```

- Only seed data with **Root** and **Child** orgs to satisfy PDF’s 2‑level rule.
- The schema itself already allows deeper levels; we just won’t seed or traverse beyond 2.

**Optional optimization (commented for future):** Add a `path` column to store materialized lineage (e.g. `/root/child/`) if performance becomes a concern when scaling to many levels.

---

## 2) Roles & Permissions Model

**Roles:** OWNER, ADMIN, VIEWER (exactly as per spec).  
**Table:** `permissions` (the source of truth mapping users, roles, and organizations).

```
permissions
------------
id          UUID
user_id     UUID (FK → users)
org_id      UUID (FK → organizations)
role        ENUM('OWNER','ADMIN','VIEWER')
```

This design:
- Fully satisfies the PDF requirement (role assignment per org).
- Automatically supports deeper trees since `org_id` points to any node in the hierarchy.

---

## 3) Effective Role Logic (Two‑Level Now, Scalable Later)

### Current behavior (PDF‑aligned)
> A user’s **effective role** in an org = max(role in that org, role in its parent).

This means:
- For any action in **child org**, the system looks for user’s permissions in that org **and** its parent.
- For **root org**, only direct role applies.

### Future‑proof design
> To support multi‑level hierarchy, simply extend the lookup to climb ancestors recursively until `parentId = null`.

We document this explicitly and ensure all role checks call a single helper (e.g., `getEffectiveRole(user, org)`), so that enabling N‑level access means only updating that helper.

---

## 4) Role Hierarchy & Access Rules (unchanged)

| Action | Viewer | Admin | Owner |
|---------|---------|--------|--------|
| View tasks | ✅ | ✅ | ✅ |
| Create task | ❌ | ✅ | ✅ |
| Edit task | ❌ | ✅ | ✅ |
| Delete task | ❌ | ✅ | ✅ |
| View audit log | ❌ | ✅ | ✅ |

- Owners in a parent org automatically have Owner‑level access in all children.
- Admins/Viewers are limited to their own org node.

---

## 5) Example Scenario (Two‑Level)
```
Acme Corp (root)
├── Sales Department
└── Engineering Department
```

| User | Org | Role | Effective Access |
|------|-----|------|------------------|
| Alice | Acme | OWNER | All orgs (Acme + children) |
| Bob | Sales | ADMIN | Sales only |
| Carol | Engineering | VIEWER | Engineering only |

- Alice can manage all tasks under Acme, Sales, and Engineering.
- Bob cannot see or edit anything in Engineering.
- Carol can only read Engineering tasks.

---

## 6) Access Evaluation Steps

When a user tries to act on a resource (e.g., task):
1. Identify the resource’s `orgId`.
2. Fetch user’s direct permissions for that org.
3. Fetch user’s permissions for the org’s parent (if any).
4. Compare both → pick highest privilege (Owner > Admin > Viewer).
5. If no match, deny access.

**Scalable version (future):** Instead of step 3 only checking one parent, recursively climb all ancestors until root.

---

## 7) Implementation Impact
- **RBAC Guard:** always calls `getEffectiveRole` — logic is isolated.
- **Schema:** no change needed when expanding hierarchy.
- **Seeding:** only insert two levels today to stay spec‑compliant.
- **Testing:** unit test both cases — child and root access.

---

## 8) Documentation Note for README
Add an appendix section:
> “The system currently enforces a two‑level organization hierarchy (root + child) per challenge requirements. However, the schema and RBAC logic are designed to scale to deeper levels by generalizing the `getEffectiveRole` utility to recursively check ancestor organizations. No schema or API changes would be required.”

---

## ✅ Outcome
- Fully meets the PDF’s explicit ‘two‑level hierarchy’ requirement.  
- Architecturally prepared for multi‑level extension with **zero migration** and **minimal code change (one function)**.

This dual‑layer approach will make your submission appear precise to spec while signaling strong engineering foresight during interviews.

