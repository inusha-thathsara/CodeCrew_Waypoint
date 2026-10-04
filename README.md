# Waypoint Intelligent Delivery & Distribution System

**Team:** CodeCrew  
**Platform:** Waypoint Intelligent Logistics Network  

---

## 1. System Overview

Waypoint is an integrated delivery and distribution management platform connecting retail operations, warehouse dispatch, loading logistics, and field driver execution into a unified real-time workflow.

The platform provides role-specific interfaces for all four operational personas:
1. **Store Manager (Desktop/Tablet):** Capture & confirm orders before the 4:00 PM cutoff, track delivery ETA ranges, and record receipt/discrepancies.
2. **Dispatcher (Desktop Command Center):** Order consolidation, constraint-based fleet allocation (weight, volume, temperature, access, and fuel limits), and deferral management.
3. **Warehouse Loader (Touchscreen Kiosk):** LIFO sequence loading verification, manifest reconciliation, and discrepancy reporting.
4. **Driver (Mobile Web Application):** Route guidance, digital proof of delivery, and offline-first execution with automated reconciliation upon reconnection.

---

## 2. Quick Start with Docker

The entire platform, including database, application server, and pre-seeded dataset, starts with a single command:

```bash
# 1. Clone repository
git clone https://github.com/inusha-thathsara/CodeCrew_Waypoint.git
cd CodeCrew_Waypoint

# 2. Configure environment
cp .env.example .env

# 3. Start complete stack
docker compose up --build
```

Once running:
* **Web Application:** `http://localhost:3000`
* **API Documentation:** `http://localhost:8000/docs`
* **PostgreSQL Database:** `localhost:5432`

---

## 3. Seeded Accounts & Credentials

The system comes pre-seeded with accounts for all four operational roles:

| Role | Email / Username | Default Password | Initial Scope |
| :--- | :--- | :--- | :--- |
| **Dispatcher** | `dispatcher@waypoint.lk` | `waypoint2026` | Kandy Central Depot |
| **Store Manager** | `manager.out077@waypoint.lk` | `waypoint2026` | OUT077 (Kandy Fresh) |
| **Loader** | `loader.kiosk@waypoint.lk` | `waypoint2026` | Bay 2 Kiosk (VEH057) |
| **Driver** | `driver.kasun@waypoint.lk` | `waypoint2026` | Route WF-1043 (VEH057) |

---

## 4. Numbered Judge Walkthrough

Follow these steps to experience the complete end-to-end delivery lifecycle:

1. **Step 1: Order Placement & Cutoff (Store Manager)**
   - Log in as Store Manager (`manager.out077@waypoint.lk`).
   - Review stock needs and submit daily manifest order before 4:00 PM cutoff.
2. **Step 2: Automated Allocation & Dispatch (Dispatcher)**
   - Log in as Dispatcher (`dispatcher@waypoint.lk`).
   - Run the allocation engine to generate optimal route assignments adhering to temperature, volume, and outlet constraints.
   - Review deferred orders and approve dispatch manifests.
3. **Step 3: Staging & Loading Checkoff (Loader)**
   - Access the Loader Kiosk (`loader.kiosk@waypoint.lk`).
   - Follow reverse LIFO loading sequence for vehicle `VEH057`.
   - Confirm crate counts and flag any loading discrepancies.
4. **Step 4: Field Delivery & Offline Sync (Driver)**
   - Open Driver app on a mobile-sized viewport (`driver.kasun@waypoint.lk`).
   - Follow stop sequence from Kandy Depot $\rightarrow$ OUT077 $\rightarrow$ OUT079 $\rightarrow$ OUT080.
   - Test offline resilience: disconnect network, record delivery signature, reconnect, and review automated sync.
5. **Step 5: Delivery Receipt Confirmation (Store Manager)**
   - Return to Store Manager portal to verify delivery completion, inspect signed manifest, and reconcile received stock.

---

## 5. Documentation & Deliverables

* **System Architecture Diagram:** [docs/Archi_Diagram.png](docs/Archi_Diagram.png)
* **Entity-Relationship Data Model:** [docs/Data_Model.drawio.png](docs/Data_Model.drawio.png)
* **AI Tool Disclosure Statement:** [docs/AI_TOOL_DISCLOSURE.md](docs/AI_TOOL_DISCLOSURE.md)
