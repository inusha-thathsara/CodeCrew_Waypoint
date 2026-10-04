# Waypoint – Seeded Account Credentials

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

## 2. Role Profiles & Access Information

### 🏢 1. Central Dispatcher
* **Persona:** Nimali Perera
* **Email:** `dispatcher@waypoint.lk`
* **Password:** `waypoint2026`
* **Direct URL:** [https://codecrew.inusha.me/dispatcher](https://codecrew.inusha.me/dispatcher)
* **Operational Scope:** Centralized fleet command across Kandy and Peliyagoda depots.

---

### 🏪 2. Store Manager
* **Persona:** Aravinda Silva
* **Email:** `manager.out077@waypoint.lk`
* **Password:** `waypoint2026`
* **Direct URL:** [https://codecrew.inusha.me/store-manager](https://codecrew.inusha.me/store-manager)
* **Operational Scope:** OUT077 – Kandy Fresh Central Outlet (Peradeniya Road).

---

### 📦 3. Warehouse Loader
* **Persona:** Sunil Perera
* **Email:** `loader.kiosk@waypoint.lk`
* **Password:** `waypoint2026`
* **Direct URL:** [https://codecrew.inusha.me/loader](https://codecrew.inusha.me/loader)
* **Operational Scope:** Bay 04 Touchscreen Kiosk, staging vehicle `VEH057`.

---

### 🚚 4. Field Delivery Driver
* **Persona:** Kasun Bandara
* **Email:** `driver.kasun@waypoint.lk`
* **Password:** `waypoint2026`
* **Direct URL:** [https://codecrew.inusha.me/driver](https://codecrew.inusha.me/driver)
* **Operational Scope:** Vehicle `VEH057` (Refrigerated Van 1.5T), Route WF-1043 (3 stops).

---

## 3. Technical Configuration & Authentication Notes

* **Authentication Protocol:** JWT stateless Bearer tokens with fast fallback (<80ms response) ensuring zero login hangs.
* **Database Engine:** PostgreSQL 15 with Prisma ORM and Supabase transaction pooler.
* **Client Offline Store:** Dexie.js v4 (IndexedDB) with schema `WaypointOfflineDB`.
* **Container Startup:** Pre-seeded via Docker Compose (`docker compose up --build`).
