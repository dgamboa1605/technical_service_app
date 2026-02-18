# Backend Architecture Review — Clean & Hexagonal Alignment

## Document Purpose

This report is a **thorough architecture review** of the technical service backend. It assesses adherence to **Clean Architecture**, **Hexagonal Architecture**, and principles such as **SOLID**, **DRY**, **KISS**, **Design Patterns**, **Clean Code**, **YAGNI**, **Law of Demeter**, and **Separation of Concerns**. It serves as both a **review of the current state** and a **prioritized roadmap for improvement**, with concrete code references, recommendations, and a step-by-step action plan.

---

## Table of Contents

1. [Project Structure Overview](#1-project-structure-overview)
2. [Project Assessment by Principle](#2-project-assessment-by-principle)
3. [Recommendations (Why + How + Alternatives)](#3-recommendations)
4. [Step-by-Step Action Plan](#4-step-by-step-action-plan)
5. [Resources and Tools](#5-resources-and-tools)
6. [Conclusion](#6-conclusion)

---

## 1. Project Structure Overview

### 1.1 Current Layout

```
backend/app/
├── api/
│   ├── dependencies/     # auth, roles, database (session)
│   └── v1/endpoints/     # HTTP handlers: users, clients, products, work_orders, auth, utils
├── core/                 # config (Settings)
├── domain/
│   ├── enums.py          # RoleEnum, WorkOrderStatusEnum, ServiceTypeEnum (in use)
│   └── models/           # WorkOrderEntity, UserEntity, ClientEntity, ProductEntity (unused)
├── infrastructure/
│   ├── auth/             # JWT (login_handler)
│   └── db/               # engine, session, ORM models
├── schemas/              # Pydantic request/response DTOs
├── services/             # work_order_service, user_service, client_service, product_service, auth_service
├── main.py
└── tests/
```

### 1.2 Alignment with Clean / Hexagonal

| Aspect | Current State | Clean/Hexagonal Ideal |
|--------|----------------|------------------------|
| **Dependency direction** | Services depend on SQLAlchemy and ORM models directly | Application depends on abstractions (ports); infrastructure implements adapters |
| **Domain** | Enums used; domain entities defined but **never used** | Domain is the center; no framework dependencies |
| **Ports** | No formal repository or use-case interfaces | Ports (interfaces) for persistence and external services |
| **Adapters** | ORM and JWT are used directly in services/auth | Adapters implement ports; injectable |
| **API layer** | Endpoints call services; some auth/authorization logic in handlers | Handlers only translate HTTP ↔ application; no business rules |

**Summary:** The backend uses a **layered structure** (API → Services → Infrastructure/Domain) with clear separation between HTTP, business logic, and persistence. It **partially** aligns with Clean/Hexagonal (domain enums, infrastructure split) but **does not fully apply** them: no repository abstractions, domain entities are unused, and authorization/response shaping are mixed into endpoints.

---

## 2. Project Assessment by Principle

### 2.1 SOLID

#### Single Responsibility (SRP)

**Strengths**

- Services are scoped by aggregate (`work_order_service`, `user_service`, etc.).
- Each endpoint file handles one resource.

**Violations**

1. **`work_order_service.py`** concentrates many responsibilities: CRUD, state machine (transitions), history, parts, labor cost, and “next number.”  
   **Location:** `app/services/work_order_service.py` (single ~280-line module).  
   **Impact:** Harder to test and change one concern without touching others.

2. **Auth dependencies** are correctly separated from session creation: `get_db` lives in `app/api/dependencies/database.py` and is imported by `auth.py`. No SRP violation here in current code.

#### Open/Closed (OCP)

**Strengths**

- Adding a new resource (e.g. Invoices) is done by adding new endpoints, service, schemas, and models without changing existing code.

**Violations**

- Role and “employee can edit only if assigned” checks are **repeated inline** in multiple endpoints. Adding a new role or permission would require editing many routes.  
  **Example:** `app/api/v1/endpoints/work_orders.py` — same “get work order → if not admin check technician_id” pattern in:
  - `get_work_order_detail` (lines 81–87)
  - `update_work_order_status` (109–115)
  - `update_work_order_technical_report` (141–146)
  - `update_work_order_labor_cost` (184–192)
  - `add_work_order_part` (222–230)

#### Liskov Substitution (LSP)

**Strengths**

- No problematic inheritance hierarchies. Enums (`RoleEnum`, `WorkOrderStatusEnum`) are used consistently.

**Minor**

- `get_technicians` (user_service) returns users with role `admin` or `employee`. If “technician” is meant to mean only employees, the name does not match the contract; either rename to `get_staff` or restrict to `RoleEnum.employee`.

#### Interface Segregation (ISP)

**Strengths**

- Endpoints depend on small service functions (e.g. `get_work_order`, `update_work_order_status`), not a single fat interface.

**Gap**

- No formal “port” layer. If repositories are introduced later, keep interface methods minimal (e.g. `get_by_id`, `save`, `list`) so clients do not depend on methods they do not use.

#### Dependency Inversion (DIP)

**Violations**

- **High-level code depends on low-level details:** Services import and use SQLAlchemy models and `Session` directly (`app.infrastructure.db.models.*`). In strict Clean Architecture, the application layer would depend on abstractions (e.g. `WorkOrderRepository`) and infrastructure would implement them.
- **No abstraction over persistence:** There are no repository interfaces; services are the first place where `db.query(...)` appears, making unit testing without a DB and swapping storage harder.

**Location:** e.g. `app/services/work_order_service.py` — direct use of `Session`, `WorkOrder`, `WorkOrderHistory`, `WorkOrderPart`.

---

### 2.2 DRY (Don't Repeat Yourself)

#### Resolved

- **`get_db`** is defined **once** in `app/api/dependencies/database.py` and re-exported via `app/api/v1/endpoints/utils.py`. Auth and endpoints use the same dependency. No duplication.

#### Violations

1. **Work order “employee can only edit if assigned”** — Same logic repeated in five handlers in `work_orders.py` (see OCP section above): get work order by id, if not admin check `work_order.technician_id` vs `current_user.id`, raise 403.

2. **404 handling** — Repeated pattern across endpoints:
   ```python
   entity = some_service.get_*(db, id)
   if not entity:
       raise HTTPException(status_code=404, detail="... not found")
   ```
   **Examples:** `work_orders.py` (e.g. lines 64–66, 77–78, 106–107), `clients.py`, `products.py`, etc.

3. **Role normalization in `roles.py`** — The same pattern appears in four places:
   ```python
   role_value = role.value if hasattr(role, 'value') else str(role)
   ```
   **Location:** `app/api/dependencies/roles.py` in `require_admin`, `require_employee`, `is_admin`, and `is_employee` (with slight variation).

4. **Schema / Pydantic** — In `app/schemas/work_order.py`, `UserOut` is imported once (line 7); no duplicate import in current file. Use of deprecated `.dict()` in endpoints (Pydantic v2 prefers `model_dump()`).  
   **Locations:** `work_orders.py` lines 31, 206, 234; `clients.py` 19, 57; `products.py` 19.

5. **Pydantic v2 compatibility** — Several schemas use `orm_mode = True` in `Config`; in Pydantic v2 the recommended form is `model_config = ConfigDict(from_attributes=True)`.

---

### 2.3 KISS (Keep It Simple, Stupid)

**Strengths**

- No unnecessary abstractions. Services are plain functions; no heavy frameworks.
- `ALLOWED_TRANSITIONS` in `work_order_service.py` is a simple, clear state machine.
- Auth is straightforward (JWT + verify/create token).

**Recommendation**

- Avoid introducing repositories, use cases, and DTOs everywhere “just for Clean Architecture” without a concrete need (e.g. multiple data sources, heavy unit testing with mocks). Current simplicity is a strength.

---

### 2.4 Design Patterns

| Pattern | Current | Assessment |
|--------|---------|------------|
| **Repository** | Not used; services use `Session` and `db.query(Model)` directly | Acceptable for single DB and current size. Introduce only if you need to test without DB or support multiple backends. |
| **Factory** | Objects built in services (e.g. `WorkOrder(...)`) | Fine as-is. |
| **Strategy** | Role checks are if/else (`is_admin` / `require_employee`) | Optional: if many permission rules appear, a small strategy/policy per resource could help. Not required at current complexity. |
| **Dependency Injection** | FastAPI `Depends(get_db)`, `Depends(get_current_user)` | Appropriate; no need for a custom container. |

---

### 2.5 Clean Code

**Naming**

- Good: `create_work_order`, `get_work_order_detail`, `WorkOrderStatusUpdate`, `require_admin`.
- Inconsistent: module names `work_order_service` vs `user_service` — consider aligning (e.g. all `*_service`).
- Minor: `get_technicians` returns admins and employees; name suggests “technicians” only.

**Readability**

- Short functions and clear parameters. Repeated “get work order → check technician → act” blocks in `work_orders.py` could be replaced by a shared dependency (see recommendations).

**Comments**

- Useful docstrings on endpoints and state flow in `work_order_service`.
- `main.py` has commented-out `TrustedHostMiddleware`; remove or document why it is disabled.

**Code quality**

- Prefer Pydantic v2: `model_dump()` instead of `.dict()`; `model_config` with `from_attributes=True` instead of `orm_mode`.
- Add explicit return types on service functions where missing (e.g. `-> Optional[WorkOrder]`, `-> bool`).

---

### 2.6 YAGNI (You Aren't Gonna Need It)

**Violations**

1. **Unused domain entities** — `app/domain/models/` defines `WorkOrderEntity`, `UserEntity`, `ClientEntity`, `ProductEntity`. These are **never imported** in application code. The app uses SQLAlchemy models and Pydantic schemas only.

2. **Unused auth helpers** — `require_customer` in `roles.py` is never used. `get_current_active_admin` in `auth.py` is never used (endpoints use `require_admin` from roles instead).

3. **Commented middleware** — TrustedHostMiddleware block in `main.py` (lines 44–50). Remove or document and re-enable when needed.

4. **Placeholder tests** — `app/tests/test_main.py`: `test_health_check` and `test_docs_accessible` only `pass`; implement or remove/skip.

---

### 2.7 Law of Demeter

**Strengths**

- Endpoints call services; services use `db` and models. No long chains like `request.user.organization.settings.xxx`.

**Violation**

- In `get_work_order_detail` (`work_orders.py` lines 89–91), the endpoint mutates the returned object: `work_order.client = None` to hide client data for employees. The endpoint thus depends on the internal structure of `work_order`. Prefer: service or a response builder returns a DTO/view that already omits `client` for non-admin users, so the endpoint does not touch domain/ORM internals.

---

### 2.8 Separation of Concerns

**Strengths**

- Routes do not contain SQL; they delegate to services. Config in `core`. Clear split between HTTP and business logic.

**Violations**

1. **Endpoints know “employee vs admin” and work order internals** — “If not admin, set work_order.client = None” and repeated technician checks mix authorization and response shaping in the endpoint. Moving “who can see what” and “what to return” into a dependency or service would improve separation.

2. **Auth module and DB** — `get_current_user` in `dependencies/auth.py` uses `Session` and `User` directly. Acceptable for a small app; for stricter Hexagonal Architecture, “resolve user from token” could be an adapter using a “user repository” abstraction.

---

## 3. Recommendations

For each major issue: **why it is a problem**, **concrete improvement**, and **alternative patterns** where relevant.

### R1. Extract “employee work order access” into one dependency (DRY, OCP, SoC)

- **Why:** Repeated logic in five endpoints; any change to the rule (e.g. new role) forces edits in many places. Endpoints mix HTTP with authorization rules.
- **Improvement:** Introduce a single dependency that returns the work order only if the current user is admin or the assigned technician, otherwise raises 403/404. Example:

```python
# app/api/dependencies/work_order_access.py
def require_work_order_access(
    work_order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> tuple[WorkOrder, Session]:
    work_order = work_order_service.get_work_order(db, work_order_id)
    if not work_order:
        raise HTTPException(404, "Work order not found")
    if not is_admin(current_user):
        if work_order.technician_id and work_order.technician_id != current_user.id:
            raise HTTPException(403, "You can only access orders assigned to you")
    return work_order, db
```

- Endpoints that need “admin or assigned technician” depend on this and no longer duplicate the check.
- **Alternative:** Authorization service or policy object (e.g. `WorkOrderAccessPolicy.can_edit(user, work_order)`) if you later have many resource-specific rules.

### R2. Move “who can see what” out of the endpoint (SoC, Law of Demeter)

- **Why:** Mutating `work_order.client = None` in the endpoint ties the handler to the model structure and mixes presentation with authorization.
- **Improvement:** Either (A) a service method that returns a “detail for employee” DTO (no client field), or (B) a response builder/serializer that, given user role and work order, returns the appropriate shape. The endpoint then just returns the result without touching `work_order` internals.
- **Alternative:** Schema that conditionally omits `client` based on role (e.g. via a serializer or different response models for admin vs employee).

### R3. Normalize role in one place (DRY)

- **Why:** Same “enum vs string” normalization duplicated in `require_admin`, `require_employee`, `is_admin`, `is_employee`; bugs or new roles would require multiple edits.
- **Improvement:** In `roles.py`, add a single helper, e.g. `def _role_value(role) -> str`, and use it in all four places. Optionally align `require_customer` to use it and then remove if still unused.

### R4. Remove or use domain entities (YAGNI)

- **Why:** Unused code adds confusion and maintenance cost; they are not part of the current design.
- **Options:** (A) Remove `app/domain/models/*` (and any references) if you do not plan to use them soon. (B) If you want a domain layer: have services return entities and add a thin mapper ORM → entity; then remove duplication between ORM and “domain” representation. Do one or the other; avoid leaving unused entities in place.

### R5. Remove unused auth helpers and placeholders (YAGNI, Clean Code)

- **Why:** Dead code and placeholder tests add noise and can mislead.
- **Improvement:** Remove `require_customer` and `get_current_active_admin` if there is no concrete plan to use them; alternatively, keep only if you will use them in the next sprint. For `test_health_check` and `test_docs_accessible`, either implement (e.g. call `/` or `/docs` and assert status) or mark as skipped with a clear reason.

### R6. Optional 404 helper (DRY)

- **Why:** Many endpoints repeat “get by id → if not found raise 404.”
- **Improvement:** Option A: Keep as-is (explicit and clear). Option B: Service-layer helper, e.g. `get_work_order_or_raise(db, id)`, that raises a domain or HTTP exception. Use sparingly so HTTP semantics do not leak deep into services. Prefer a single place (e.g. dependency or small helper) rather than duplicating in every endpoint.

### R7. Global exception handler and logging (Best practices)

- **Why:** Unhandled exceptions can leak stack traces; production needs a safe 500 response and logging.
- **Improvement:** In `main.py`, add a catch-all exception handler that logs the exception (without PII) and returns a generic 500 response. Use a logger per module (`logging.getLogger(__name__)`), log at appropriate levels (e.g. warning for 4xx, error for 5xx).

### R8. Auth service and HTTP (SoC)

- **Why:** `auth_service.login` raises `HTTPException`, tying the service to HTTP. Services are easier to test and reuse if they raise domain exceptions.
- **Improvement:** Have `authenticate_user` / `login` return `None` or raise a domain exception (e.g. `InvalidCredentials`). In the auth endpoint or a dedicated exception handler, map that to 401. Keeps HTTP concerns at the edge.

### R9. Pydantic v2 and types (Clean Code)

- **Why:** `.dict()` is deprecated in Pydantic v2; `orm_mode` is replaced by `model_config`; missing return types reduce clarity and tooling.
- **Improvement:** Replace `.dict()` with `model_dump()`. In schemas, use `model_config = ConfigDict(from_attributes=True)` where needed. Add return types to service functions (e.g. `-> Optional[WorkOrder]`).

### R10. Split work_order_service when it grows (SRP)

- **Why:** One module currently holds CRUD, state machine, history, parts, labor cost, and next number; change risk and test surface are high as it grows.
- **Improvement:** When the file or responsibilities grow, consider: `WorkOrderCommandService` (create, assign, status updates), `WorkOrderQueryService` (get, list, detail), and optionally a small domain or rules module for `ALLOWED_TRANSITIONS`. Not urgent at current size.

### R11. Repository layer (DIP, optional)

- **Why:** Services depend directly on SQLAlchemy; swapping storage or unit testing without a DB is harder.
- **Improvement:** Only if you have a concrete need (e.g. multiple data sources, heavy unit tests with mocks): define abstract repositories in domain/application (e.g. `protocols/work_order_repository.py`) and implement them in infrastructure; inject into services via `Depends` or a small container. Optional for current scope.

---

## 4. Step-by-Step Action Plan

Prioritized, with rough timeframes and dependencies. Estimates assume one developer familiar with the codebase.

### Phase 1 — Quick wins (high impact, low effort)

| # | Action | Description | Est. | Deps |
|---|--------|-------------|------|------|
| 1.1 | Extract work order access dependency | Add `require_work_order_access` (or similar) and use it in all five work order endpoints that need “admin or assigned technician”. | 1–2 h | None |
| 1.2 | Normalize role in one helper | Add `_role_value(role)` in `roles.py` and refactor `require_admin`, `require_employee`, `is_admin`, `is_employee` to use it. | 0.5 h | None |
| 1.3 | Remove unused code | Remove `require_customer`, `get_current_active_admin` (or document and keep if planned). Remove or document commented TrustedHostMiddleware in `main.py`. | 0.5 h | None |
| 1.4 | Fix placeholder tests | In `test_main.py`, implement `test_health_check` and `test_docs_accessible` (e.g. assert redirect and docs status) or mark as skipped with a reason. | 0.5 h | None |
| 1.5 | Pydantic v2 and types | Replace `.dict()` with `model_dump()` in endpoints; add `model_config`/`from_attributes` where needed; add return types to key service functions. | 1–2 h | None |

**Phase 1 total:** ~4–6 h.

### Phase 2 — Separation of concerns and response shaping

| # | Action | Description | Est. | Deps |
|---|--------|-------------|------|------|
| 2.1 | Move “detail for employee” out of endpoint | Introduce a service method or response builder that returns work order detail with client omitted for non-admin users; remove `work_order.client = None` from the endpoint. | 1–2 h | 1.1 optional |
| 2.2 | Global exception handler | Add catch-all exception handler in `main.py`; return generic 500 and log. Add per-module loggers where useful. | 1 h | None |
| 2.3 | Auth: domain exception for invalid login | Introduce `InvalidCredentials` (or similar); have auth service raise it; map to 401 in endpoint or exception handler. | 0.5–1 h | None |

**Phase 2 total:** ~2.5–4 h.

### Phase 3 — YAGNI and optional 404

| # | Action | Description | Est. | Deps |
|---|--------|-------------|------|------|
| 3.1 | Domain entities: remove or use | Either delete `app/domain/models/*` (and references) or introduce entities in the service layer with a mapper; avoid leaving unused entities. | 1 h (remove) / 4–8 h (use) | None |
| 3.2 | Optional 404 helper | If desired, add `get_work_order_or_raise` (and optionally for other resources) and use in selected endpoints to reduce boilerplate. | 0.5–1 h | None |

**Phase 3 total:** ~1.5–9 h depending on 3.1 choice.

### Phase 4 — When scaling (lower priority)

| # | Action | Description | Est. | Deps |
|---|--------|-------------|------|------|
| 4.1 | Split work_order_service | When the module grows, split into command/query (and optionally state rules). | 2–4 h | — |
| 4.2 | Repository layer | Only if needed: define repository ports and implementations; inject into services. | 1–2 d | — |
| 4.3 | Structured logging / request IDs | Add request ID middleware and structured logging for observability. | 2–4 h | — |

---

## 5. Resources and Tools

- **Pydantic v2:** [Migration guide](https://docs.pydantic.dev/latest/migration/) for `model_dump`, `model_config`, `ConfigDict`.
- **FastAPI:** [Dependency injection](https://fastapi.tiangolo.com/tutorial/dependencies/) for patterns like `require_work_order_access`.
- **Clean Architecture:** “Clean Architecture” (Robert C. Martin) for dependency rules and boundaries.
- **Testing:** pytest, `TestClient`, dependency overrides (already in use); consider `pytest-cov` for coverage and a few integration tests for critical flows (e.g. create work order → update status, login → `/auth/me`).
- **Linting/formatting:** Existing `.flake8`; consider `ruff` for speed and consistency; `mypy` or `pyright` for gradual typing.

---

## 6. Conclusion

The backend is **readable, layered, and maintainable** for its size. The main improvements are:

1. **DRY and OCP:** Single work-order access dependency and single role normalization helper.
2. **YAGNI:** Remove or use domain entities; remove unused auth helpers and fix placeholder tests.
3. **Separation of concerns:** Move “who can see what” and “what to return” out of endpoints (response shaping / service or dependency).
4. **Clean code and safety:** Pydantic v2, return types, global exception handler, and optional auth domain exception.

Introducing repositories and full DIP is **optional** and recommended only when there is a concrete need (e.g. testing without DB or multiple data sources). The prioritized action plan above allows the team to tackle high-impact, low-effort items first and defer larger refactors until they are justified.
