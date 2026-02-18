# Frontend Architecture Review — Clean & Hexagonal Alignment

## Document Purpose

This report is a **thorough architecture review** of the technical service **frontend** (React + TypeScript + Vite). It assesses adherence to **Clean Architecture**, **Hexagonal Architecture**, and principles such as **SOLID**, **DRY**, **KISS**, **Design Patterns**, **Clean Code**, **YAGNI**, **Law of Demeter**, and **Separation of Concerns**. It serves as both a **review of the current state** and a **prioritized roadmap for improvement**, with concrete code references, recommendations, and a step-by-step action plan.

---

## Table of Contents

1. [Project Structure Overview](#1-project-structure-overview)
2. [Project Assessment by Principle](#2-project-assessment-by-principle)
3. [Recommendations](#3-recommendations)
4. [Step-by-Step Action Plan](#4-step-by-step-action-plan)
5. [Resources and Tools](#5-resources-and-tools)
6. [Conclusion](#6-conclusion)

---

## 1. Project Structure Overview

### 1.1 Current Layout

```
frontend/src/
├── domain/                    # Domain layer
│   ├── entities/              # WorkOrder, Client, Product, User, WorkOrderHistory, WorkOrderPart
│   ├── value-objects/         # WorkOrderStatus, ServiceType
│   └── repositories/          # Ports: IWorkOrderRepository, IAuthRepository, IClientRepository, etc.
├── application/               # Application layer
│   ├── use-cases/             # LoginUseCase, GetWorkOrdersUseCase, CreateWorkOrderUseCase, etc.
│   ├── mappers/               # WorkOrderMapper, ClientMapper, ProductMapper, UserMapper
│   └── index.ts
├── infrastructure/            # Adapters
│   ├── http/                  # ApiClient
│   ├── storage/               # LocalStorageAdapter
│   └── repositories/          # WorkOrderRepository, AuthRepository, ClientRepository, etc.
├── presentation/              # Presentation layer
│   └── hooks/                 # useAuth, useWorkOrders, useClients, useProducts, useUsers, useAuthorization
├── context/                   # React context (Auth, Theme, Sidebar)
├── pages/                     # Route-level components (Admin, Public, AuthPages)
├── components/               # Reusable UI and feature components
├── layout/                    # AppLayout, AdminLayout, headers, footers
├── hooks/                     # useModal (feature hook)
├── App.tsx
└── main.tsx
```

### 1.2 Alignment with Clean / Hexagonal

| Aspect | Current State | Clean/Hexagonal Ideal |
|--------|----------------|------------------------|
| **Dependency direction** | Domain has no deps; Application depends on domain ports; Infrastructure implements repositories; Presentation imports infrastructure directly | Presentation should depend on application/domain only; infrastructure injected, not imported |
| **Ports** | Repository interfaces (IWorkOrderRepository, etc.) defined in domain | ✅ Ports present |
| **Adapters** | Repositories and ApiClient are concrete implementations | ✅ Adapters present but used as singletons, not injected |
| **Domain** | Entities with behavior (getDisplayName, canTransitionTo); value objects | ✅ Domain is rich and framework-free |
| **Use cases** | One use case per operation; depend on repository interfaces | ✅ Good; but hooks/pages instantiate use cases with hard-coded repository singletons |
| **Dependency injection** | None. Repositories and ApiClient are singletons; hooks/pages import them directly | Abstractions should be injected (e.g. via React context or a DI container) for testability and flexibility |

**Summary:** The frontend has a **clear layered structure** (domain → application → infrastructure → presentation) and uses **repository ports** and **use cases**, which aligns well with Clean/Hexagonal. The main gaps are: **no dependency injection** (presentation and hooks depend on concrete infrastructure), **inconsistent use of the storage abstraction** (ApiClient and some components use `localStorage` directly), and **very large page components** that mix many concerns.

---

## 2. Project Assessment by Principle

### 2.1 SOLID

#### Single Responsibility (SRP)

**Strengths**

- Use cases are single-purpose (e.g. `GetWorkOrderDetailUseCase`, `UpdateWorkOrderStatusUseCase`).
- Repository interfaces are scoped by aggregate (WorkOrder, Client, Product, User, Auth).
- Hooks such as `useWorkOrders` and `useClients` focus on one aggregate each.

**Violations**

1. **`WorkOrderDetail.tsx`** (~620 lines) handles: routing params, loading one work order, updating status, technical report, labor cost, parts, history, technician assignment, invoice modal, multiple inline modals, permission checks, and formatting.  
   **Location:** `src/pages/Admin/WorkOrderDetail.tsx`  
   **Impact:** Hard to test, hard to change one feature without touching others; repeated UI blocks (e.g. “Costos y Repuestos” and “Información de Recepción” duplicated for admin vs employee).

2. **`NewWorkOrder.tsx`** (~620 lines) handles: client form, product form, work order form, client search with debounce, product search with debounce, brand/guarantee options from products, flatpickr for purchase date, validation, submit with client/product create or update, and navigation.  
   **Location:** `src/pages/Admin/NewWorkOrder.tsx`  
   **Impact:** One component owns too many responsibilities; client and product search logic is largely duplicated.

3. **`AuthContext.tsx`** mixes: React context provision, use of presentation hook `useAuthHook`, direct use of `storageAdapter` and `authRepository.isAuthenticated()`, and a “manual” login that writes token + user.  
   **Location:** `src/context/AuthContext.tsx`  
   **Impact:** Context is both a UI state provider and an infrastructure consumer; two login flows (credentials vs manual token) add cognitive load.

#### Open/Closed (OCP)

**Strengths**

- Adding a new resource (e.g. Invoices) can be done by adding new use cases, repository interface, and adapter without changing existing use cases.
- New UI features (e.g. a new modal) can be added by new components or new hooks without modifying existing ones, if the page is refactored to use smaller components.

**Violations**

1. **Repository interfaces** are large and wide. Adding a new operation (e.g. “archive work order”) forces changing `IWorkOrderRepository` and all implementors.  
   **Suggestion:** Consider Interface Segregation (see ISP) so new operations can be added via new interfaces or optional methods.

#### Liskov Substitution (LSP)

- No clear violations. Repository implementations are used as singletons; if they were injected, any implementation of the interface could be substituted (e.g. a mock in tests).

#### Interface Segregation (ISP)

**Violations**

1. **`IWorkOrderRepository`** has many methods (getAll, getAllWithDetails, getById, getDetail, create, updateStatus, updateTechnicalReport, assignTechnician, updateLaborCost, getNextNumber, confirmOrder, addHistory, addPart).  
   **Location:** `src/domain/repositories/IWorkOrderRepository.ts`  
   **Impact:** Any adapter must implement all methods; read-only or write-only clients cannot depend on a smaller contract.  
   **Suggestion:** Split into e.g. `IWorkOrderReadRepository` and `IWorkOrderWriteRepository`, or keep one interface but document that simple list/detail screens only need a subset.

#### Dependency Inversion (DIP)

**Violations**

1. **Presentation depends on concrete infrastructure.**  
   - `useWorkOrders.ts` imports `workOrderRepository` from `../../infrastructure/repositories/WorkOrderRepository` and passes it into use cases.  
   - `WorkOrderDetail.tsx` imports `workOrderRepository` and `userRepository` and constructs multiple use cases with them.  
   - `SignInForm.tsx` imports `authRepository` and creates `LoginUseCase(authRepository)` inside the component.  
   **Impact:** Cannot unit-test hooks or pages with mock repositories; swapping implementation (e.g. different API or offline adapter) requires changing many files.

2. **ApiClient uses `localStorage` directly.**  
   **Location:** `src/infrastructure/http/ApiClient.ts` line 24: `return localStorage.getItem('access_token');`  
   **Impact:** The app already has a `LocalStorageAdapter` (and AuthRepository uses it for token). ApiClient bypasses that abstraction, so storage cannot be substituted (e.g. for SSR or tests) and the dependency rule is violated (infrastructure should not depend on another implementation detail; it should depend on a storage port).

3. **AuthContext and UserInfoCard use storage/auth in presentation.**  
   - `AuthContext.tsx` imports `storageAdapter` and `authRepository`.  
   - `UserInfoCard.tsx` uses `localStorage.getItem('access_token')` directly.  
   **Impact:** Presentation layer is tied to concrete storage and auth implementation.

---

### 2.2 DRY (Don't Repeat Yourself)

**Violations**

1. **Loading/error/success state handling** is repeated in almost every page and hook: `setIsLoading(true)`, `setError(null)`, `try/catch/finally` with `setError(message)`, `setIsLoading(false)`.  
   **Locations:** `useWorkOrders`, `useAuth`, `useClients`, `WorkOrderDetail`, `NewWorkOrder`, `SignInForm`, etc.  
   **Suggestion:** Centralize in a small hook (e.g. `useAsyncAction`) or in a shared “run use case and set loading/error” helper.

2. **Inline modals in WorkOrderDetail** share the same structure: overlay, card, title, form/inputs, Cancel + primary button.  
   **Location:** `src/pages/Admin/WorkOrderDetail.tsx` (report, note, part, technician, labor cost, invoice modals).  
   **Suggestion:** Extract a reusable `Modal` or use the existing `components/ui/modal` and pass title, children, and actions.

3. **“Costos y Repuestos” and “Información de Recepción”** blocks are duplicated for admin vs employee views in WorkOrderDetail (same JSX structure, different visibility conditions).  
   **Suggestion:** Extract presentational components (e.g. `CostsAndPartsSection`, `ReceptionInfoSection`) and render them once with role-based props or composition.

4. **Date formatting** is implemented locally (e.g. `formatDate` in WorkOrderDetail).  
   **Suggestion:** Single utility (e.g. `formatDateTime(value)`) in a shared `utils` or `domain` helper used everywhere.

5. **Client vs product search logic in NewWorkOrder** is almost identical: debounce, filter list, single match auto-select, multiple matches dropdown, “not found” message.  
   **Suggestion:** Extract a generic `useSearchableSelect<T>` (or similar) parameterized by list, filter fn, and display fields.

6. **Token key and storage:** `'access_token'` appears in ApiClient, AuthContext, and AuthRepository (with TOKEN_KEY). AuthRepository uses `storageAdapter`; ApiClient and AuthContext use raw `localStorage` or the same key.  
   **Suggestion:** Single constant (e.g. in a small auth config or domain) and consistent use of `storageAdapter` everywhere that touches the token.

---

### 2.3 KISS (Keep It Simple, Stupid)

**Strengths**

- Domain entities and value objects are straightforward.
- Many use cases are thin wrappers over one repository call, which is easy to follow.

**Concerns**

1. **Two login flows:** credentials (SignInForm → LoginUseCase → AuthContext.login(user, token)) and “manual” login (AuthContext.login(user, token) with token already set). Keeping both for “compatibility” increases complexity; if only one is needed long-term, the other could be removed (YAGNI).

2. **Duplicate auth entry points:** AuthContext re-exports `useAuth` and wraps a hook that also performs auth. New developers may not know whether to use the context’s `useAuth` or the hook’s login.  
   **Suggestion:** Single entry point for “current user and login/logout” (e.g. only context, which internally may use the hook).

---

### 2.4 Design Patterns

**Patterns in use**

- **Repository:** Domain defines interfaces; infrastructure implements them. ✅  
- **Use case / Application service:** One class per operation, depends on repository interfaces. ✅  
- **Mapper:** DTO ↔ Entity conversion in application layer. ✅  
- **Singleton:** Repositories and ApiClient exported as single instances. ⚠️ Prevents easy substitution in tests or multiple environments.  
- **Context (React):** Auth, Theme, Sidebar. ✅  

**Missing or underused**

- **Dependency Injection:** No container or provider that injects repositories into use cases/hooks. Introducing a simple “services context” or factory would allow injecting mocks in tests and different adapters per environment.  
- **Facade:** A single “WorkOrderService” or “workOrderUseCases” facade could simplify pages that need many use cases (e.g. WorkOrderDetail) and reduce repeated construction of use cases.  
- **Strategy / Adapter for storage:** Storage is abstracted in `LocalStorageAdapter`, but ApiClient and some components do not use it; making ApiClient depend on an `IStorage` port would complete the pattern.

---

### 2.5 Clean Code

**Strengths**

- Meaningful names (use cases, repositories, entities).
- TypeScript used for types and interfaces.
- Domain logic in value objects (e.g. `getStatusLabel`, `ALLOWED_TRANSITIONS`).

**Violations**

1. **Very long files:** WorkOrderDetail and NewWorkOrder exceed 600 lines; readability and navigation suffer.  
2. **Magic strings:** Role names (`'admin'`), status values, and API paths are string literals in multiple places. Constants (e.g. from domain or config) would improve maintainability.  
3. **Debug code:** `console.log('Clientes encontrados:', ...)` and `console.log('Productos encontrados:', ...)` in NewWorkOrder; `console.error` in catch blocks is acceptable for logging but should be consistent (e.g. a small logger abstraction).  
4. **eslint-disable:** `eslint-disable-next-line react-hooks/exhaustive-deps` in useEffect in several files. Dependencies should be fixed or the effect logic refactored so the list is correct.  
5. **Inconsistent error handling:** Some places throw after setError, others only setError; some return null on error (e.g. getById in WorkOrderRepository). Standardizing “throw on error” vs “return null” and a single way to show errors in UI would simplify code.

---

### 2.6 YAGNI (You Aren't Gonna Need It)

**Reasonable use of YAGNI**

- No obvious over-engineered features; use cases are small and focused.

**Possible YAGNI**

1. **Many one-line use cases** (e.g. `GetWorkOrdersUseCase` only calling `repository.getAll`). They add consistency and a single place to extend behavior later; keeping them is reasonable. If the team prefers fewer classes, a single “WorkOrderQueries” with methods could be an alternative.  
2. **“Manual” login** in AuthContext kept for compatibility: if nothing uses it except a narrow path (e.g. UserInfoCard), consider removing it once that path is updated to use the credentials flow only.

---

### 2.7 Law of Demeter

**Strengths**

- Entities expose behavior: `client.getDisplayName()`, `product.getDisplayName()`, `h.getUserDisplayName()` instead of reaching into `h.user?.username`.  
- Value objects encapsulate status logic: `getStatusLabel(status)`, `ALLOWED_TRANSITIONS[status]`.

**Minor violations**

1. **Chaining for display:** e.g. `detail.product?.getDisplayName()`, `detail.product?.serialNumber`, `detail.product?.model`. Using `product` for display is acceptable; deep chains like `order.client.address.street` would be worse. Current usage is mostly one level (detail.X).  
2. **WorkOrderDetail** sometimes checks `detail.technicianId` and `detail.technician` in different places; centralizing “can current user edit this order?” in the domain or a small helper would align with Demeter (call one method instead of probing internals).

---

### 2.8 Separation of Concerns

**Strengths**

- Domain has no UI or HTTP.
- Application layer has no React or fetch; it depends only on domain and repository interfaces.
- Infrastructure implements HTTP and storage.

**Violations**

1. **Presentation imports infrastructure:** Hooks and pages import repositories and, in AuthContext, storage and auth repository. Concern: “where data comes from” (infrastructure) is mixed with “what the UI does” (presentation).  
2. **AuthContext** is both a React state provider and a consumer of storage + auth repository; it also knows about “manual” vs “hook” login.  
3. **Pages** know about use case constructors and repository instances instead of receiving “services” or “actions” from a provider.  
4. **ApiClient** reading `localStorage` directly mixes “HTTP client” with “token storage”; the token should be provided via a port (e.g. `getToken(): string | null`) so ApiClient stays focused on HTTP.

---

## 3. Recommendations

### 3.1 Dependency Injection and Inversion

**Why it’s a problem:** Hooks and pages depend on concrete repositories and ApiClient. Tests must patch modules or use a real backend; swapping implementations is costly.

**Recommendation:**

- Introduce a **composition root** (e.g. a `ServicesProvider` or `AppProviders`) that creates repository instances (and optionally use cases) and provides them via React context.
- Hooks receive repositories (or use cases) from context instead of importing from `infrastructure/`.
- For tests, render the app (or a subtree) with a context that provides mock repositories.

**Alternative:** Use a lightweight DI library (e.g. tsyringe, inversify) or a simple factory module that returns the default implementations and can be overridden in tests.

---

### 3.2 Storage Abstraction Consistency

**Why it’s a problem:** ApiClient and UserInfoCard use `localStorage` directly; AuthRepository and AuthContext use `storageAdapter`. This duplicates the “where the token lives” logic and breaks substitution.

**Recommendation:**

- Define a small **storage port** in domain (e.g. `IStorage` or `ITokenStorage`) with `getItem`, `setItem`, `removeItem`.
- Implement it in infrastructure (e.g. `LocalStorageAdapter` already matches; ensure it implements the port).
- **ApiClient** should receive a dependency that provides the token (e.g. `getToken(): string | null`) or the storage port, and use it instead of `localStorage.getItem('access_token')`.
- **AuthContext** and **UserInfoCard** should use the same storage port (via context or a shared auth service), not raw `localStorage`.
- Use a single constant for the token key (e.g. `AUTH_TOKEN_KEY`) in one place.

---

### 3.3 Break Down Large Pages (SRP and Clean Code)

**Why it’s a problem:** WorkOrderDetail and NewWorkOrder are hard to maintain, test, and extend; they mix data loading, many use cases, many modals, and role-based UI.

**Recommendation:**

- **WorkOrderDetail:**  
  - Extract sections into components: e.g. `WorkOrderHeader`, `WorkOrderProductSection`, `WorkOrderClientSection`, `WorkOrderReceptionInfo`, `WorkOrderTechnicalReport`, `WorkOrderCostsAndParts`, `WorkOrderHistorySection`.  
  - Extract each modal into a component (e.g. `ReportModal`, `NoteModal`, `PartModal`, `TechnicianModal`, `LaborCostModal`), receiving callbacks and state from the page or a custom hook.  
  - Consider a **custom hook** `useWorkOrderDetail(id)` that encapsulates: load detail, all use case instances, handlers (advance status, update report, add part, etc.), and loading/error state. The page then only renders and wires the hook to the sections and modals.  
  - Unify “Costos y Repuestos” and “Información de Recepción” into single components; show/hide or vary content by role via props.

- **NewWorkOrder:**  
  - Extract **client form and search** into a component + hook (e.g. `ClientSection` + `useClientSearch(clients, debounceMs)`).  
  - Extract **product form and search** similarly (`ProductSection` + `useProductSearch(products, debounceMs)`).  
  - Optionally extract **work order form** (service type, instructions, observations) into `WorkOrderFormSection`.  
  - Consider a shared `useSearchableSelect` for the client/product dropdown and “not found” flow to remove duplication.

---

### 3.4 Unify Auth Entry Point and Login Flow

**Why it’s a problem:** Two login mechanisms (credentials vs manual token) and two “useAuth” surfaces (context vs hook) make the contract unclear and harder to maintain.

**Recommendation:**

- Expose a **single public API** for auth: one context that provides `{ user, isLoading, login, logout, isLoggedIn }`.
  - `login` should accept either credentials (username, password) or (user, token) for the rare case that token is set elsewhere; internally, both paths should use the same storage and state update.
- Prefer the context to be the only consumer of the auth hook and storage; components use only the context. Remove or deprecate direct use of the presentation hook from components that only need “current user and login/logout.”
- SignInForm should call `login(username, password)` on the context; the context (or a service it uses) should call LoginUseCase and then persist token and user. That way SignInForm does not need to know about LoginUseCase or authRepository.

---

### 3.5 DRY: Shared Async and UI Patterns

**Recommendation:**

- **useAsyncAction:** A small hook that wraps an async function and manages `isLoading`, `error`, and optional `resetError`. Hooks/pages that “run a use case and show loading/error” can use it to avoid repeating try/catch/setLoading/setError.
- **Modal UI:** Use the existing `components/ui/modal` (or a single shared modal) for all modals in WorkOrderDetail and elsewhere; pass title, body, and footer actions as props or children.
- **formatDate / formatDateTime:** One utility in `utils/date` or `domain` and use it in WorkOrderDetail, WorkOrderInvoice, and any other place that formats dates.
- **Constants:** Centralize role names, status labels (if not already in domain), and API path prefixes so magic strings are removed.

---

### 3.6 Interface Segregation (Optional)

**Recommendation:** If the team wants smaller contracts, split `IWorkOrderRepository` into:

- Read: `getAll`, `getAllWithDetails`, `getById`, `getDetail`, `getNextNumber`.
- Write: `create`, `updateStatus`, `updateTechnicalReport`, `assignTechnician`, `updateLaborCost`, `addHistory`, `addPart`, `confirmOrder`.

Implementations can implement both; list/detail screens depend only on the read interface if desired. This is optional and can be done when adding new operations to avoid bloating a single interface.

---

### 3.7 Fix eslint-disable and Dependencies

**Recommendation:** For each `useEffect` that has `eslint-disable-next-line react-hooks/exhaustive-deps`:

- Either add the correct dependencies and handle stability (e.g. useCallback for functions) or
- Refactor so the effect does not depend on missing values (e.g. load once on mount with an explicit “run once” pattern or a ref).

This improves correctness and avoids subtle bugs when dependencies change.

---

## 4. Step-by-Step Action Plan

### Phase 1: Quick Wins and Consistency (1–2 weeks)

| # | Task | Priority | Est. | Owner |
|---|------|----------|------|--------|
| 1 | Use `storageAdapter` (or a token getter) in ApiClient; remove direct `localStorage.getItem('access_token')`. Define `AUTH_TOKEN_KEY` in one place and use it everywhere. | High | 0.5 d | — |
| 2 | Replace `localStorage.getItem('access_token')` in UserInfoCard with context or a shared auth helper that uses storage port. | High | 0.25 d | — |
| 3 | Add shared `formatDate`/`formatDateTime` utility and use it in WorkOrderDetail and any other component that formats dates. | Medium | 0.25 d | — |
| 4 | Remove `console.log` from NewWorkOrder (and any other debug logs in production paths). | Low | 0.25 d | — |
| 5 | Extract reusable Modal usage in WorkOrderDetail (use existing modal component); reduce duplicated overlay/card markup. | Medium | 1 d | — |

### Phase 2: Auth Simplification (≈1 week)

| # | Task | Priority | Est. | Owner |
|---|------|----------|------|--------|
| 6 | Unify auth: single context API; SignInForm calls context `login(username, password)`; context internally uses LoginUseCase and storage. | High | 1 d | — |
| 7 | Deprecate or remove “manual” login path if no longer needed; document the single supported flow. | Medium | 0.5 d | — |
| 8 | Ensure ThemeContext uses storageAdapter for theme key if the rest of the app standardizes on the storage port. | Low | 0.25 d | — |

### Phase 3: Dependency Injection and Testability (2–3 weeks)

| # | Task | Priority | Est. | Owner |
|---|------|----------|------|--------|
| 9 | Introduce a Services/Repositories context (or factory) that provides repository instances (and optionally use cases). | High | 1–2 d | — |
| 10 | Refactor `useWorkOrders`, `useClients`, `useAuth`, etc., to get repositories from context instead of importing from infrastructure. | High | 1 d | — |
| 11 | Refactor WorkOrderDetail and NewWorkOrder to get use cases or repositories from context (or a single “work order” service from context). | High | 1 d | — |
| 12 | Add one or two integration tests (or hook tests with mock context) to validate that list/detail and login work with provided repositories. | Medium | 1 d | — |

### Phase 4: Break Down Large Pages (2–3 weeks)

| # | Task | Priority | Est. | Owner |
|---|------|----------|------|--------|
| 13 | Extract WorkOrderDetail sections into components (header, product, client, reception info, report, costs/parts, history). | High | 2 d | — |
| 14 | Extract WorkOrderDetail modals into separate components; pass state and callbacks from parent or from a `useWorkOrderDetail` hook. | High | 1.5 d | — |
| 15 | Create `useWorkOrderDetail(id)` hook that owns loading, use cases, and handlers; keep page mostly presentational. | Medium | 1 d | — |
| 16 | Extract NewWorkOrder client block into ClientSection + useClientSearch (or useSearchableSelect); same for product. | High | 1.5 d | — |
| 17 | Deduplicate “Costos y Repuestos” and “Información de Recepción” in WorkOrderDetail into single components with role-based rendering. | Medium | 0.5 d | — |

### Phase 5: DRY and Clean Code (1–2 weeks)

| # | Task | Priority | Est. | Owner |
|---|------|----------|------|--------|
| 18 | Implement `useAsyncAction` (or similar) and refactor at least two hooks/pages to use it for loading/error around async calls. | Medium | 0.5 d | — |
| 19 | Replace magic strings (roles, statuses, paths) with constants from domain or config. | Medium | 0.5 d | — |
| 20 | Fix useEffect dependency arrays and remove unnecessary eslint-disable for react-hooks/exhaustive-deps. | Medium | 0.5 d | — |

### Phase 6: Optional Improvements

| # | Task | Priority | Est. | Owner |
|---|------|----------|------|--------|
| 21 | (Optional) Split IWorkOrderRepository into read/write interfaces. | Low | 0.5 d | — |
| 22 | (Optional) Add a small logger abstraction and replace ad-hoc console.error in catch blocks. | Low | 0.25 d | — |

**Total estimated effort (Phases 1–5):** ~10–14 days of development. Phase 6 is optional.

---

## 5. Resources and Tools

- **Testing:** Vitest and React Testing Library are already in the project; use them with a “mock context” or provider that injects fake repositories for hook and integration tests.
- **DI in React:** No library is strictly required; a React context that holds repository instances (created in `main.tsx` or `App.tsx`) is enough for the first iteration. For more advanced scenarios, consider tsyringe or inversify.
- **Documentation:** Keep this document and the backend `ARCHITECTURE_REVIEW.md` in sync where they touch (e.g. API contract and error handling). A short “Frontend Architecture” section in the main README or in `frontend/README.md` can point to this file and summarize the layers and dependency direction.

---

## 6. Conclusion

The frontend is **well-structured** with a clear domain, application (use cases + mappers), infrastructure (repositories, ApiClient, storage), and presentation (hooks, context, pages). It **partially adheres** to Clean and Hexagonal architecture: ports and adapters are present, but **dependency injection is missing** and **presentation depends on concrete infrastructure**. The largest maintainability issues are **very large page components** (WorkOrderDetail, NewWorkOrder), **inconsistent use of the storage abstraction**, **duplicated patterns** (loading/error, modals, date formatting, search), and **two auth flows**. Addressing these through the recommended refactors and the phased action plan will improve testability, clarity, and consistency while keeping the existing layered design.
