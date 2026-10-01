# AI Tool Disclosure & Engineering Integrity Statement

**Project:** Waypoint Intelligent Logistics Network  
**Team:** CodeCrew  

---

## 1. Overview & Engineering Policy

Team CodeCrew maintains complete transparency regarding the use of Artificial Intelligence during the design, architecture, and implementation of the Waypoint software platform.

Our engineering process strictly adhered to a **human-architected, AI-assisted paradigm**:
* **Human Engineers** authored all core system architectures, visual diagrams, data models, optimization algorithms, constraint logic, and offline reconciliation flows.
* **AI Tools** served solely as productivity accelerators for boilerplate data transformation scripting and documentation formatting.

---

## 2. Granular Breakdown: AI-Assisted vs. Human-Authored Implementation

| Engineering Layer | AI-Assisted Tasks (Accelerators) | Human-Authored Engineering (Core Intellect) |
| :--- | :--- | :--- |
| **System Architecture & Data Modeling** | • Syntax checks and markdown formatting. | • **100% Human-Authored Diagrams:** Designed both the System Architecture (`Archi_Diagram.png`) and the Entity Relationship Data Model (`Data_Model.drawio.png`) in Draw.io.<br>• **Domain Topology:** Formulated the 3-tier structure (Client Layer, App Engine, Data & Storage Layer) and Crow's foot cardinality for all 6 core relational entities. |
| **Database & Data Seeding** | • Automated conversion of raw CSV records (`outlets.csv`, `vehicles.csv`, `district_travel.csv`, `service_allowance.csv`) into structured PostgreSQL `INSERT` statements inside `init.sql`. | • **Relational Schema Design:** Engineered foreign key constraints, table normalization, cascade policies, and role-based permissions (`users`, `orders`, `trips`, `trip_stops`).<br>• **Walkthrough Dataset Modeling:** Curated the initial delivery day scenario (`2026-09-28`) ensuring all 120 outlets and 60 vehicles operate cleanly out of the box. |
| **Planning & Allocation Engine** | • Assisting with syntax formatting for constraint loops. | • **Core Heuristic Solver:** Formulated the order-to-vehicle allocation algorithm respecting volume ($m^3$), weight ($kg$), chilled storage constraints, and the strict 2-trip/day vehicle cap.<br>• **Punctuality vs. Fulfillment Policy:** Implemented the 95% threshold logic prioritizing < 08:00 AM cold-chain arrivals over delay-inducing manifest completions.<br>• **Automated Deferral System:** Authored the business logic identifying and tagging deferred orders when depot demand exceeds fleet capacity. |
| **Degradation & Offline Operations** | • None. | • **Sync Conflict Resolution:** Designed the side-by-side reconciliation logic when an offline driver reconnects after dispatcher rerouting.<br>• **Telemetry Staleness Management:** Engine logic flagging unverified ETAs and calculating timestamp age (`Last sync 14 min ago`) on the Dispatcher dashboard.<br>• **Offline Mutation Queue:** Authored the transactional local cache ensuring zero data loss for delivery signatures recorded in dead zones. |
| **Frontend & User Experience** | • Scaffolding basic boilerplate markup. | • **Role-Based Experience Architecture:** Implemented bespoke desktop views for Dispatcher/Store Manager and mobile-optimized touch UIs ($\ge 44\text{px}$) for Loaders and Drivers.<br>• **State Management & Routing:** Authored real-time view updates, role switcher, and manifest checklist state machines. |
| **DevOps & Containerization** | • None. | • **Container Orchestration:** Configured PostgreSQL health checks, environment isolation (`.env.example`), volume mounts, and seed execution sequencing to ensure single-command startup (`docker compose up --build`). |

---

## 3. Inventory of AI Tools Utilized

1. **Google Gemini / Antigravity Agent:**
   * *Purpose:* Generation of the automated CSV-to-SQL seed script (`db/init.sql`) and markdown technical documentation formatting.

---

## 4. Quality Assurance & Verification Protocol

To uphold the highest software engineering standards and prevent hallucinations or regressions:

1. **Deterministic Constraint Testing:**
   * Every constraint (e.g., maximum van payload $950\text{ kg}$, refrigerated temperature validation, strict 4:00 PM order cutoffs) was verified using automated test assertions against official competition data.
2. **Clean-Machine Docker Verification:**
   * The container stack was tested on isolated clean environments to verify that `docker compose up` executes reliably without external runtime dependencies or missing environment variables.
3. **Full Accountability:**
   * Team CodeCrew assumes 100% responsibility for all committed code, system stability, architectural decisions, and operational feasibility.
