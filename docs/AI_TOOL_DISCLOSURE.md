# AI Tool Disclosure & Engineering Integrity Statement

**Competition:** Tech-Triathlon 2026 – Phase 2: Hackathon (Day 10 Final Submission)  
**Team Name:** CodeCrew  
**Platform:** Waypoint Intelligent Logistics & Distribution Network  
**Monorepo:** `CodeCrew_Waypoint`  
**Live Production URL:** [https://codecrew.inusha.me](https://codecrew.inusha.me)  
**Deliverable Requirement:** Mandatory AI Tool Disclosure (*Challenge Booklet*, Pages 11–13)  

---

## 1. Executive Engineering Policy & Ethical Framework

Team CodeCrew maintains absolute transparency regarding the role of Artificial Intelligence throughout the design, software engineering, and deployment of the **Waypoint** platform. 

Our team operates under a strict **Human-Architected, AI-Assisted Engineering Paradigm**:
* **100% Human Intellectual Ownership:** All core software architecture, mathematical formulations, constraint-satisfaction heuristic models, business domain rules, multi-role degradation workflows, UX design system tokens, and operational trade-offs were conceived, designed, and directed entirely by human engineers.
* **AI as Productivity Accelerators:** Generative AI tools and automated programming assistants were utilized solely to eliminate repetitive boilerplate overhead, translate schema definitions, synthesize SQL seed queries from raw CSV datasets, perform code linting, and assist with syntax formatting. At no point was domain logic, architectural decision-making, or system modeling delegated autonomously to an AI model.

---

## 2. Comprehensive Inventory of AI Tools Utilized

The table below outlines every AI tool, model version, operational scope, and responsible engineering team member involved across the project lifecycle:

| Tool & Version | Provider | Primary Application Scope | Operating Environment |
| :--- | :--- | :--- | :--- |
| **Google Antigravity IDE**<br>*(Google Gemini Models)* | Google DeepMind | • Interactive coding assistant for Next.js App Router boilerplate.<br>• Automated conversion of raw dataset CSVs into structured PostgreSQL `INSERT` statements (`db/init.sql`).<br>• Scaffolding TypeScript type definitions and Prisma database queries.<br>• Autonomous headless browser UI verification and visual regression checks.<br>• Syntax auditing and optimization for constraint loops in the allocation solver (`web/src/lib/allocation.ts`). | Local IDE & Agentic Environment |
| **Native Figma AI (Beta)** | Figma | • In-canvas layout scaffolding during Phase 1 Designathon.<br>• Auto-layout micro-adjustments and sample form placeholder text generation. | Figma Desktop Application |

---

## 3. Granular Layer-by-Layer Disclosure Matrix

To provide judges with complete auditability, the following matrix breaks down every technical subsystem into **AI-Assisted Tasks** versus **Human-Authored Engineering**:

| Engineering Layer | AI-Assisted Tasks (Productivity Acceleration) | Human-Authored Work (Core Intellect & Craftsmanship) |
| :--- | :--- | :--- |
| **1. System Architecture & Domain Modeling** | • Syntax checking of markdown specifications.<br>• Formatting documentation structure and table alignments. | • **Architecture Blueprints:** 100% human-designed System Architecture diagram (`docs/Archi_Diagram.png`) and Entity-Relationship model (`docs/Data_Model.drawio.png`).<br>• **3-Tier Topology:** Formulated the Client Layer, Next.js Fullstack Serverless App Engine, and PostgreSQL Storage Layer.<br>• **Relational Entity Cardinality:** Conceived the multi-role schema (Users, Outlets, Vehicles, Orders, Trips, Trip Stops) enforcing strict relational integrity, UUID primary keys, and cascade rules. |
| **2. Database & Data Seeding** | • Batch-parsing official CSV datasets (`outlets.csv`, `vehicles.csv`, `district_travel.csv`, `service_allowance.csv`) into 120 outlet and 60 vehicle PostgreSQL `INSERT` statements in `db/init.sql`.<br>• Generating repetitive Prisma schema boilerplate (`schema.prisma`). | • **Data Engineering:** Engineered indexes, foreign key relationships, ENUM types (`Role`, `OrderStatus`, `TripStatus`, `TempType`), and connection pooling configurations for Supabase PgBouncer.<br>• **Curated Walkthrough Scenario:** Conceived the realistic delivery day scenario (`2026-09-28`) modeling peak pre-festival orders across Kandy and Peliyagoda depots to ensure fresh-install deterministic walkthroughs. |
| **3. Constraint-Satisfaction Allocation Engine**<br>*(web/src/lib/allocation.ts)* | • Assisting with TypeScript interface syntax definitions and array utility helper functions.<br>• Drafting Haversine distance calculation boilerplate. | • **Core Heuristic Solver:** Formulated the multi-dimensional bin-packing and vehicle-routing heuristics respecting vehicle weight ($kg$), volume ($m^3$), reefer vs. ambient compartments, and physical dock access constraints (`van_only` vs `truck`).<br>• **95% Punctuality Trade-off Policy:** Formulated the mathematical priority threshold enforcing < 08:00 AM cold-chain arrivals over delay-inducing 100% manifest completions.<br>• **Operating Limits:** Enforced the strict 2 trips/vehicle/day limit, store delivery windows (`window_open_time` to `window_close_time`), dock unloading service allowances, and driver time budgets.<br>• **Automated Deferral Engine:** Formulated the priority classification logic identifying deferred orders when regional demand exceeds fleet capacity. |
| **4. Role-Based User Portals**<br>*(Dispatcher, Loader, Driver, Store Manager)* | • Scaffolding repetitive JSX/HTML markup, Tailwind CSS class utility layouts, and Lucide icon imports.<br>• Converting Figma pixel values into Tailwind spacing tokens. | • **1:1 Designathon Fidelity:** Translated the approved Day 5 Figma design into 4 fully functional, high-fidelity responsive web portals:<br>  1. *Dispatcher Command Center* (`/dispatcher`): Dark Navy (`#0A1224`) command interface, live KPI badges, multi-brand filters, interactive allocation review, and real-time on-road telemetry tracking.<br>  2. *Warehouse Loader Kiosk* (`/loader`): High-contrast tactile kiosk UI with reverse-LIFO sequential loading verification and barcode discrepancy reporting.<br>  3. *Field Driver Web App* (`/driver`): Mobile-optimized sunlight-readable PWA interface ($\ge 44\text{px}$ touch targets), turn-by-turn stop manifest, and digital signature capture.<br>  4. *Store Manager Portal* (`/store-manager`): Inventory replenishment capture before the 4:00 PM cutoff, live ETA countdowns, and delivery reconciliation.<br>• **State Machines:** Authored client-side state machines handling step transitions, modal dialogs, and instant local feedback. |
| **5. Degradation & Offline-First Operations**<br>*(web/src/lib/offline-store.ts)* | • Scaffolding Dexie.js IndexedDB schema wrapper code. | • **Degradation Failure Scenario:** Conceived the end-to-end Kandy mountain corridor network blackout scenario.<br>• **Transactional Offline Queue:** Engineered local IndexedDB storage capturing digital signatures, proof of delivery timestamps, and discrepancy notes during connectivity drops.<br>• **Automated Sync & Conflict Resolution:** Implemented the reconciliation engine that syncs queued mutations when network restores, recalculating driver telemetry age (`Last sync X min ago`) and flagging unverified ETAs for dispatchers. |
| **6. DevOps, Containerization & Cloud Deployment** | • Scaffolding Dockerfile multi-stage build boilerplate.<br>• Formatting environment variable templates (`.env.example`). | • **Docker Compose Orchestration:** Configured multi-container orchestration with PostgreSQL health checks, auto-seeding hooks, and volume isolation for single-command launch (`docker compose up --build`).<br>• **Production Cloud Architecture:** Architected Vercel edge deployment with Supabase serverless PostgreSQL pooler, connection timeout mitigation (<80ms auth fallback), and custom DNS routing (`codecrew.inusha.me`). |
| **7. Quality Assurance & Verification** | • Executing automated browser navigation scripts via Antigravity browser subagent to verify DOM elements and responsive viewports. | • **Manual End-to-End Walkthroughs:** Personally verified all four role journeys on both desktop (1920x1080) and physical mobile devices (390x844).<br>• **Constraint Boundary Auditing:** Manually checked edge cases (overweight vans, ambient goods mistakenly placed in reefers, late afternoon order submissions).<br>• **Production Hardening:** Stripped all prototype simulator controls, developer toggles, and mock badges to ensure enterprise-grade production readiness. |

---

## 4. Deep-Dive: Human Engineering vs. AI Acceleration

### 4.1 System Architecture & Data Modeling
The architectural diagrams in `docs/Archi_Diagram.png` and `docs/Data_Model.drawio.png` were drafted entirely by Team CodeCrew members using Draw.io. The domain model reflects real-world multi-brand FMCG retail logistics in Sri Lanka (covering FoodCity, Keells, and Arpico distribution flows). AI tools were exclusively used to parse the resulting relational schema into Prisma DSL syntax and automated SQL DDL scripts.

### 4.2 Constraint-Satisfaction Allocation Engine (`web/src/lib/allocation.ts`)
The allocation engine represents the computational heart of Waypoint. Solving the Vehicle Routing Problem with Time Windows (VRPTW) and 3D Capacity constraints requires strict operational heuristics:
1. **Capacity Constraints:** Every vehicle is strictly bounded by weight ($kg$) and volume ($m^3$) limits (e.g. `VEH057` capped at 950 kg / 4.5 m³).
2. **Temperature Compartments:** Reefer orders (`requires_chilled = true`) cannot be assigned to ambient vans, while ambient orders can backfill reefer space only when temperature integrity is maintained.
3. **Physical Access Rules:** Outlets marked as `van_only` or with narrow physical access reject rigid 10-ton trucks.
4. **Service Allowances:** Unloading durations vary deterministically by dock type and brand crate count.
5. **The 95% Punctuality Trade-off:** When facing depot congestion or travel delays, the human-designed algorithm prioritizes high-value morning cold-chain delivery windows (< 08:00 AM) over 100% manifest volume completion, systematically routing deferrals into a transparent secondary queue.

AI assistance in this module was strictly confined to writing generic utility functions (e.g., Euclidean/Haversine distance math) and TypeScript type guards. All constraint logic, prioritization algorithms, and business decision branches were formulated by human engineers.

### 4.3 Degradation, Offline-First Architecture & Sync (`web/src/lib/offline-store.ts`)
In rural Sri Lankan delivery routes, cellular connectivity frequently drops. Human engineers conceived the offline failure scenario along the Kandy mountain corridor and engineered an offline-first data synchronization strategy:
* Uses browser **IndexedDB via Dexie.js** as an append-only local mutation log.
* When connectivity drops, the Driver portal seamlessly transitions to offline mode, capturing signatures, timestamps, and crate counts locally without blocking delivery execution.
* Upon reconnection, the client automatically flushes the local queue via idempotent API requests.
* AI was used strictly to generate the standard Dexie schema boilerplate; the transaction lifecycle, state transitions, and UI indicators were human-authored.

---

## 5. Verification & Anti-Hallucination Protocol

To eliminate AI-generated hallucinations and ensure data integrity across all four portals:

1. **Ground-Truth Dataset Cross-Validation:**
   * All 120 outlets and 60 vehicles were cross-checked against the competition's official `outlets.csv` and `vehicles.csv`. No synthetic or fictional vehicle capacities, outlet names, or depot associations exist in the codebase.
2. **Deterministic Constraint Testing:**
   * Automated assertions in `web/src/lib/allocation.ts` verify that no vehicle exceeds 100% capacity under any allocation scenario.
   * Chilled goods are programmatically prohibited from ambient vehicles.
   * Delivery window closures (e.g. strict 4:00 PM cutoff) are hardcoded and non-bypassable.
3. **Clean-Machine Docker Compose Audit:**
   * The complete stack was validated on an isolated clean virtual machine using `docker compose down -v && docker compose up --build` to confirm that all migrations, seeds, and client builds execute without manual developer intervention.
4. **Autonomous & Human UI Testing:**
   * In addition to manual human verification across iPhone and desktop browsers, the Antigravity headless browser subagent was used to execute reproducible end-to-end clicks, verify form inputs, and inspect DOM accessibility trees across all 4 user roles.

---

## 6. Intellectual Integrity & Team Declaration

We, the members of **Team CodeCrew**, hereby certify that:
1. This disclosure represents a complete, truthful, and accurate record of all AI tools utilized during the development of Waypoint for Tech-Triathlon 2026.
2. All core algorithms, system architectures, database designs, user experiences, and strategic trade-offs represent the original intellectual work of Team CodeCrew.
3. No automated end-to-end code generation platforms or low-code application builders were used to circumvent software engineering responsibilities.
4. Team CodeCrew assumes 100% accountability for the correctness, stability, security, and performance of all submitted source code and live deployments.

**Date:** Sunday, October 4, 2026  
**Signed:** *Team CodeCrew*  
