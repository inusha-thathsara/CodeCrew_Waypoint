# Waypoint – Seeded Account Credentials & Operational Guide

**Competition:** Tech-Triathlon 2026 – Phase 2: Hackathon (Day 10 Submission)  
**Team Name:** CodeCrew  
**Platform:** Waypoint Intelligent Logistics Network  
**Live Production URL:** [https://codecrew.inusha.me](https://codecrew.inusha.me)  
**Local Docker Stack:** `http://localhost:3000`  
**Default Password for All Accounts:** `waypoint2026`  

---

## 1. Master Seeded Credentials Matrix

| Role | Persona Name | Email / Username | Password | Operational Scope / Assignment | Portal Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Central Dispatcher** | Nimali Perera | `dispatcher@waypoint.lk` | `waypoint2026` | Kandy Central Depot & Regional Fleet | `/dispatcher` |
| **Store Manager** | Aravinda Silva | `manager.out077@waypoint.lk` | `waypoint2026` | OUT077 (Kandy Fresh Central Outlet) | `/store-manager` |
| **Warehouse Loader** | Sunil Perera | `loader.kiosk@waypoint.lk` | `waypoint2026` | Bay 04 Kiosk (Vehicle VEH057 Reefer) | `/loader` |
| **Field Driver** | Kasun Bandara | `driver.kasun@waypoint.lk` | `waypoint2026` | Route WF-1043 (VEH057 Reefer Van) | `/driver` |

> 💡 **Quick Login Tip:** On the landing page ([https://codecrew.inusha.me](https://codecrew.inusha.me)), you can click on any of the **four Role Quick-Cards** for instant Single Sign-On (SSO) access without typing credentials manually.

---

## 2. Granular Role Profiles & Key Walkthrough Features

### 🏢 1. Central Dispatcher
* **User:** Nimali Perera
* **Email:** `dispatcher@waypoint.lk`
* **Password:** `waypoint2026`
* **Direct URL:** [https://codecrew.inusha.me/dispatcher](https://codecrew.inusha.me/dispatcher)
* **Operational Scope:** Centralized fleet command across Kandy and Peliyagoda depots.
* **Core Capabilities to Test:**
  1. **Order Queue & KPIs:** View order volume across retail brands (Fresh, Daily, Super) with real-time brand filtering.
  2. **AI Allocation Engine:** Click *"Run AI Allocation Engine"* to execute the heuristic solver respecting weight ($kg$), volume ($m^3$), reefer compartment rules, and 2-trips/day vehicle caps.
  3. **95% Punctuality Trade-off:** Verify that morning cold-chain orders (<08:00 AM) are prioritized, while capacity overages are routed into the transparent **Deferred Orders Queue**.
  4. **Live On-Road Telemetry:** Track vehicle `VEH057` with real-time refrigerated compartment temperatures (+3.8°C) and telemetry staleness tracking.

---

### 🏪 2. Store Manager
* **User:** Aravinda Silva
* **Email:** `manager.out077@waypoint.lk`
* **Password:** `waypoint2026`
* **Direct URL:** [https://codecrew.inusha.me/store-manager](https://codecrew.inusha.me/store-manager)
* **Operational Scope:** OUT077 – Kandy Fresh Central Outlet (Peradeniya Road).
* **Core Capabilities to Test:**
  1. **Daily Order Placement:** Capture stock replenishment orders before the strict **4:00 PM operational cutoff**.
  2. **Delivery Window Tracking:** Real-time visibility of scheduled delivery window (05:00 AM – 07:30 AM) and live ETA range.
  3. **Receipt & Manifest Reconciliation:** Inspect completed deliveries, view recorded proof-of-delivery timestamps, and verify digital signatures.

---

### 📦 3. Warehouse Loader
* **User:** Sunil Perera
* **Email:** `loader.kiosk@waypoint.lk`
* **Password:** `waypoint2026`
* **Direct URL:** [https://codecrew.inusha.me/loader](https://codecrew.inusha.me/loader)
* **Operational Scope:** Bay 04 Touchscreen Kiosk, staging vehicle `VEH057`.
* **Core Capabilities to Test:**
  1. **Reverse-LIFO Loading Stepper:** Follow reverse Last-In, First-Out sequence (OUT080 deep cargo $\rightarrow$ OUT079 middle cargo $\rightarrow$ OUT077 rear door first drop).
  2. **Barcode & Crate Verification:** Check off individual pallets and verify temperature seal integrity.
  3. **Discrepancy Reporting:** Flag loading shortfalls (e.g. 3 units milk unavailable at depot) with automatic credit-note triggers.
  4. **Dispatch Authorization:** Complete pre-trip inspection and release the vehicle to the road.

---

### 🚚 4. Field Delivery Driver
* **User:** Kasun Bandara
* **Email:** `driver.kasun@waypoint.lk`
* **Password:** `waypoint2026`
* **Direct URL:** [https://codecrew.inusha.me/driver](https://codecrew.inusha.me/driver)
* **Operational Scope:** Vehicle `VEH057` (Refrigerated Van 1.5T), Route WF-1043 (3 stops).
* **Core Capabilities to Test:**
  1. **Sunlight-Readable Mobile UI:** Large $\ge 44\text{px}$ touch targets optimized for mobile viewports (e.g., iPhone 14 / 390px width).
  2. **Turn-by-Turn Manifest:** Progressive stop workflow (Manifest Review $\rightarrow$ En Route $\rightarrow$ Digital POD).
  3. **Digital Proof of Delivery (POD):** Stylus/touch signature capture with store manager verification.
  4. **Offline Resilience (Dead-Zone Mode):** Disconnect network (or DevTools Offline mode) $\rightarrow$ capture delivery signature and timestamps $\rightarrow$ stored transactionally in client **IndexedDB via Dexie.js** $\rightarrow$ reconnect network to trigger automated zero-conflict cloud synchronization.

---

## 3. Technical Configuration & Authentication Notes

* **Authentication Protocol:** JWT stateless Bearer tokens with fast fallback (<80ms response) ensuring zero login hangs.
* **Database Engine:** PostgreSQL 15 with Prisma ORM and Supabase transaction pooler.
* **Client Offline Store:** Dexie.js v4 (IndexedDB) with schema `WaypointOfflineDB`.
* **Container Startup:** Pre-seeded via Docker Compose (`docker compose up --build`).
