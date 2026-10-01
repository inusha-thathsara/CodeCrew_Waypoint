# AI Tool Disclosure & Engineering Integrity Statement

**Project:** Waypoint Intelligent Logistics Network  
**Team:** CodeCrew  

---

## 1. Overview & Engineering Policy

Team CodeCrew maintains complete transparency regarding the use of Artificial Intelligence during the design, architecture, and implementation of the Waypoint software platform.

Our engineering process strictly adhered to a **human-architected, AI-assisted paradigm**:
* **Human Engineers** authored all core optimization algorithms, constraint logic, security boundaries, database schema relationships, and offline reconciliation flows.
* **AI Tools** served solely as productivity accelerators for boilerplate code generation, syntax references, data transformation scripting, and documentation formatting.

---

## 2. Granular Breakdown: AI-Assisted vs. Human-Authored Implementation

| Engineering Layer | AI-Assisted Tasks (Accelerators) | Human-Authored Engineering (Core Intellect) |
| :--- | :--- | :--- |
| **Planning & Allocation Engine** | • Assisting with Python/TypeScript syntax for constraint validation loops.<br>• Brainstorming edge-case test payloads for vehicle capacity overflows. | • **Core Heuristic Solver:** Formulated the order-to-vehicle allocation algorithm respecting volume ($m^3$), weight ($kg$), chilled storage constraints, and the strict 2-trip/day vehicle cap.<br>• **Punctuality vs. Fulfillment Policy:** Implemented the 95% threshold logic prioritizing < 08:00 AM cold-chain arrivals over delay-inducing manifest completions.<br>• **Automated Deferral System:** Authored the business logic identifying and tagging deferred orders when depot demand exceeds fleet capacity. |
| **Degradation & Offline Operations** | • Boilerplate patterns for browser IndexedDB and LocalStorage event listeners.<br>• Standard template for network connectivity detection (`navigator.onLine`). | • **Sync Conflict Resolution:** Designed the side-by-side reconciliation logic when an offline driver reconnects after dispatcher rerouting.<br>• **Telemetry Staleness Management:** Engine logic flagging unverified ETAs and calculating timestamp age (`Last sync 14 min ago`) on the Dispatcher dashboard.<br>• **Offline Mutation Queue:** Authored the transactional local cache ensuring zero data loss for delivery signatures recorded in dead zones. |
| **Database & Data Seeding** | • Automated conversion of raw CSV rows (`outlets.csv`, `vehicles.csv`) into structured PostgreSQL `INSERT` statements inside `init.sql`. | • **Relational Schema Design:** Engineered foreign key constraints, table normalization, cascade policies, and role-based permissions (`users`, `orders`, `trips`, `trip_stops`).<br>• **Walkthrough Dataset Modeling:** Curated the initial delivery day scenario (`2026-09-28`) ensuring all 120 outlets and 60 vehicles operate cleanly out of the box. |
| **Frontend & User Experience** | • Rapid component scaffolding for basic HTML forms and CSS utility layout boilerplate.<br>• Responsive flexbox/grid alignment snippets for mobile viewports. | • **Role-Based Experience Architecture:** Implemented bespoke desktop views for Dispatcher/Store Manager and mobile-optimized touch UIs ($\ge 44\text{px}$) for Loaders and Drivers.<br>• **State Management & Routing:** Authored real-time view updates, role switcher, and manifest checklist state machines. |
| **DevOps & Containerization** | • Boilerplate syntax suggestions for Docker Compose and multi-stage Dockerfile configurations. | • **Container Orchestration:** Configured PostgreSQL health checks, environment isolation (`.env.example`), volume mounts, and seed execution sequencing to ensure single-command startup (`docker compose up --build`). |

---

## 3. Inventory of AI Tools Utilized

1. **Google Gemini / Antigravity Agent:**
   * *Purpose:* Generation of dataset-to-SQL compiler scripts (`db/init.sql`), system architecture diagram generation, and documentation review.
2. **GitHub Copilot / Cursor:**
   * *Purpose:* In-editor inline code completion for boilerplate TypeScript types, repetitive CRUD endpoints, and test fixtures.
3. **Claude 3.5 Sonnet:**
   * *Purpose:* Syntax debugging for complex SQL joins and Docker container network configurations.

---

## 4. Quality Assurance & Verification Protocol

To uphold the highest software engineering standards and prevent hallucinations or regressions:

1. **Deterministic Constraint Testing:**
   * Every constraint (e.g., maximum van payload $950\text{ kg}$, refrigerated temperature validation, strict 4:00 PM order cutoffs) was verified using automated test assertions against official competition data.
2. **Clean-Machine Docker Verification:**
   * The container stack was tested on isolated clean environments to verify that `docker compose up` executes reliably without external runtime dependencies or missing environment variables.
3. **Code Quality & Security Audits:**
   * All AI-generated snippets underwent manual code review, linting, and refactoring to eliminate insecure defaults (e.g., parameterized SQL queries to prevent injection attacks).
4. **Full Accountability:**
   * Team CodeCrew assumes 100% responsibility for all committed code, system stability, architectural decisions, and operational feasibility.
