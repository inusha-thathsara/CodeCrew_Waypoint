-- ==============================================================================
-- WAYPOINT LOGISTICS PLATFORM: DATABASE INITIALIZATION & SEED SCRIPT
-- Auto-executed on PostgreSQL container startup
-- ==============================================================================

-- Drop tables if exists
DROP TABLE IF EXISTS trip_stops CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS service_allowance CASCADE;
DROP TABLE IF EXISTS district_travel CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS outlets CASCADE;

-- 1. Outlets Table
CREATE TABLE outlets (
    outlet_id VARCHAR(20) PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    depot VARCHAR(50) NOT NULL,
    dock_type VARCHAR(50) NOT NULL,
    parking_constraint VARCHAR(50),
    mall_window VARCHAR(50),
    window_open_time VARCHAR(10) NOT NULL,
    window_close_time VARCHAR(10) NOT NULL
);

-- 2. Vehicles Table
CREATE TABLE vehicles (
    vehicle_id VARCHAR(20) PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    temp VARCHAR(20) NOT NULL,
    weight_cap_kg NUMERIC NOT NULL,
    volume_cap_m3 NUMERIC NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    km_per_l NUMERIC NOT NULL,
    weekly_fuel_quota_l NUMERIC NOT NULL,
    depot VARCHAR(50) NOT NULL
);

-- 3. Service Allowance Table
CREATE TABLE service_allowance (
    brand VARCHAR(50) NOT NULL,
    dock_type VARCHAR(50) NOT NULL,
    service_allowance_min INT NOT NULL
);

-- 4. District Travel Table
CREATE TABLE district_travel (
    district VARCHAR(50) NOT NULL,
    depot VARCHAR(50) NOT NULL,
    road_class VARCHAR(50) NOT NULL,
    free_flow_kmh NUMERIC NOT NULL,
    depot_to_district_km NUMERIC NOT NULL,
    depot_to_district_freeflow_min NUMERIC NOT NULL,
    inter_stop_km NUMERIC NOT NULL,
    inter_stop_freeflow_min NUMERIC NOT NULL
);

-- 5. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- DISPATCHER, STORE_MANAGER, LOADER, DRIVER
    assigned_scope VARCHAR(100) NOT NULL
);

-- 6. Orders Table
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    outlet_id VARCHAR(20) REFERENCES outlets(outlet_id),
    delivery_date DATE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    weight_kg NUMERIC NOT NULL,
    volume_m3 NUMERIC NOT NULL,
    crate_count INT NOT NULL,
    requires_chilled BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED', -- DRAFT, CONFIRMED, PLANNED, DEFERRED, DELIVERED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Trips Table
CREATE TABLE trips (
    trip_id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(20) REFERENCES vehicles(vehicle_id),
    driver_name VARCHAR(100) NOT NULL,
    depot VARCHAR(50) NOT NULL,
    trip_number INT NOT NULL, -- 1 or 2
    delivery_date DATE NOT NULL,
    total_weight_kg NUMERIC NOT NULL,
    total_volume_m3 NUMERIC NOT NULL,
    total_crates INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED', -- PLANNED, LOADING, ON_ROUTE, COMPLETED, DEGRADED_OFFLINE
    departure_time VARCHAR(10),
    last_sync_time TIMESTAMP,
    is_telemetry_stale BOOLEAN DEFAULT false
);

-- 8. Trip Stops Table
CREATE TABLE trip_stops (
    id SERIAL PRIMARY KEY,
    trip_id VARCHAR(50) REFERENCES trips(trip_id),
    outlet_id VARCHAR(20) REFERENCES outlets(outlet_id),
    stop_sequence INT NOT NULL,
    eta_start VARCHAR(10) NOT NULL,
    eta_end VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED', -- PLANNED, DELIVERED, FAILED
    discrepancy_note TEXT,
    signature_data TEXT,
    is_offline_record BOOLEAN DEFAULT false,
    completed_at TIMESTAMP
);


-- Seed Outlets (120 records)
INSERT INTO outlets VALUES ('OUT001', 'Fresh', 'Colombo', 'Peliyagoda', 'street', 'van_only', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT002', 'Fresh', 'Colombo', 'Peliyagoda', 'street', 'van_only', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT003', 'Fresh', 'Colombo', 'Peliyagoda', 'street', 'van_only', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT004', 'Fresh', 'Colombo', 'Peliyagoda', 'street', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT005', 'Fresh', 'Colombo', 'Peliyagoda', 'rear_dock', 'normal', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT006', 'Fresh', 'Colombo', 'Peliyagoda', 'street', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT007', 'Fresh', 'Colombo', 'Peliyagoda', 'street', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT008', 'Fresh', 'Colombo', 'Peliyagoda', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT009', 'Fresh', 'Colombo', 'Peliyagoda', 'rear_dock', 'normal', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT010', 'Fresh', 'Colombo', 'Peliyagoda', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT011', 'Fresh', 'Colombo', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT012', 'Fresh', 'Colombo', 'Peliyagoda', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT013', 'Fresh', 'Colombo', 'Peliyagoda', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT014', 'Fresh', 'Colombo', 'Peliyagoda', 'street', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT015', 'Style', 'Colombo', 'Peliyagoda', 'mall_bay', 'mall_dock', '09:00-11:00', '09:00', '11:00');
INSERT INTO outlets VALUES ('OUT016', 'Style', 'Colombo', 'Peliyagoda', 'mall_bay', 'mall_dock', '09:00-11:00', '09:00', '11:00');
INSERT INTO outlets VALUES ('OUT017', 'Style', 'Colombo', 'Peliyagoda', 'mall_bay', 'mall_dock', '10:30-12:30', '10:30', '12:30');
INSERT INTO outlets VALUES ('OUT018', 'Style', 'Colombo', 'Peliyagoda', 'mall_bay', 'mall_dock', '10:30-12:30', '10:30', '12:30');
INSERT INTO outlets VALUES ('OUT019', 'Style', 'Colombo', 'Peliyagoda', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT020', 'Style', 'Colombo', 'Peliyagoda', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT021', 'Tech', 'Colombo', 'Peliyagoda', 'mall_bay', 'mall_dock', '10:30-12:30', '10:30', '12:30');
INSERT INTO outlets VALUES ('OUT022', 'Tech', 'Colombo', 'Peliyagoda', 'mall_bay', 'mall_dock', '10:00-12:00', '10:00', '12:00');
INSERT INTO outlets VALUES ('OUT023', 'Tech', 'Colombo', 'Peliyagoda', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT024', 'Tech', 'Colombo', 'Peliyagoda', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT025', 'Fresh', 'Gampaha', 'Peliyagoda', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT026', 'Fresh', 'Gampaha', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT027', 'Fresh', 'Gampaha', 'Peliyagoda', 'street', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT028', 'Fresh', 'Gampaha', 'Peliyagoda', 'street', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT029', 'Fresh', 'Gampaha', 'Peliyagoda', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT030', 'Fresh', 'Gampaha', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT031', 'Fresh', 'Gampaha', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT032', 'Fresh', 'Gampaha', 'Peliyagoda', 'rear_dock', 'normal', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT033', 'Fresh', 'Gampaha', 'Peliyagoda', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT034', 'Fresh', 'Gampaha', 'Peliyagoda', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT035', 'Style', 'Gampaha', 'Peliyagoda', 'mall_bay', 'mall_dock', '10:30-12:30', '10:30', '12:30');
INSERT INTO outlets VALUES ('OUT036', 'Style', 'Gampaha', 'Peliyagoda', 'mall_bay', 'mall_dock', '10:30-12:30', '10:30', '12:30');
INSERT INTO outlets VALUES ('OUT037', 'Style', 'Gampaha', 'Peliyagoda', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT038', 'Tech', 'Gampaha', 'Peliyagoda', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT039', 'Tech', 'Gampaha', 'Peliyagoda', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT040', 'Fresh', 'Kalutara', 'Peliyagoda', 'street', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT041', 'Fresh', 'Kalutara', 'Peliyagoda', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT042', 'Fresh', 'Kalutara', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT043', 'Fresh', 'Kalutara', 'Peliyagoda', 'street', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT044', 'Fresh', 'Kalutara', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT045', 'Fresh', 'Kalutara', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT046', 'Fresh', 'Kalutara', 'Peliyagoda', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT047', 'Style', 'Kalutara', 'Peliyagoda', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT048', 'Style', 'Kalutara', 'Peliyagoda', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT049', 'Tech', 'Kalutara', 'Peliyagoda', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT050', 'Fresh', 'Galle', 'Peliyagoda', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT051', 'Fresh', 'Galle', 'Peliyagoda', 'street', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT052', 'Fresh', 'Galle', 'Peliyagoda', 'street', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT053', 'Fresh', 'Galle', 'Peliyagoda', 'street', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT054', 'Fresh', 'Galle', 'Peliyagoda', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT055', 'Fresh', 'Galle', 'Peliyagoda', 'street', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT056', 'Style', 'Galle', 'Peliyagoda', 'mall_bay', 'mall_dock', '10:00-12:00', '10:00', '12:00');
INSERT INTO outlets VALUES ('OUT057', 'Style', 'Galle', 'Peliyagoda', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT058', 'Tech', 'Galle', 'Peliyagoda', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT059', 'Fresh', 'Matara', 'Peliyagoda', 'rear_dock', 'normal', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT060', 'Fresh', 'Matara', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT061', 'Fresh', 'Matara', 'Peliyagoda', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT062', 'Fresh', 'Matara', 'Peliyagoda', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT063', 'Style', 'Matara', 'Peliyagoda', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT064', 'Tech', 'Matara', 'Peliyagoda', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT065', 'Fresh', 'Kurunegala', 'Peliyagoda', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT066', 'Fresh', 'Kurunegala', 'Peliyagoda', 'rear_dock', 'normal', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT067', 'Fresh', 'Kurunegala', 'Peliyagoda', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT068', 'Fresh', 'Kurunegala', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT069', 'Fresh', 'Kurunegala', 'Peliyagoda', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT070', 'Style', 'Kurunegala', 'Peliyagoda', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT071', 'Style', 'Kurunegala', 'Peliyagoda', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT072', 'Tech', 'Kurunegala', 'Peliyagoda', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT073', 'Fresh', 'Puttalam', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT074', 'Fresh', 'Puttalam', 'Peliyagoda', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT075', 'Fresh', 'Puttalam', 'Peliyagoda', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT076', 'Fresh', 'Kandy', 'Kandy', 'street', 'van_only', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT077', 'Fresh', 'Kandy', 'Kandy', 'street', 'van_only', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT078', 'Fresh', 'Kandy', 'Kandy', 'street', 'van_only', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT079', 'Fresh', 'Kandy', 'Kandy', 'street', 'van_only', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT080', 'Fresh', 'Kandy', 'Kandy', 'street', 'van_only', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT081', 'Fresh', 'Kandy', 'Kandy', 'street', 'van_only', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT082', 'Fresh', 'Kandy', 'Kandy', 'street', 'van_only', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT083', 'Fresh', 'Kandy', 'Kandy', 'street', 'van_only', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT084', 'Fresh', 'Kandy', 'Kandy', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT085', 'Fresh', 'Kandy', 'Kandy', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT086', 'Fresh', 'Kandy', 'Kandy', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT087', 'Fresh', 'Kandy', 'Kandy', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT088', 'Style', 'Kandy', 'Kandy', 'street', 'van_only', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT089', 'Style', 'Kandy', 'Kandy', 'mall_bay', 'mall_dock', '10:30-12:30', '10:30', '12:30');
INSERT INTO outlets VALUES ('OUT090', 'Style', 'Kandy', 'Kandy', 'mall_bay', 'mall_dock', '10:30-12:30', '10:30', '12:30');
INSERT INTO outlets VALUES ('OUT091', 'Style', 'Kandy', 'Kandy', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT092', 'Style', 'Kandy', 'Kandy', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT093', 'Tech', 'Kandy', 'Kandy', 'street', 'van_only', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT094', 'Tech', 'Kandy', 'Kandy', 'mall_bay', 'mall_dock', '09:00-11:00', '09:00', '11:00');
INSERT INTO outlets VALUES ('OUT095', 'Tech', 'Kandy', 'Kandy', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT096', 'Fresh', 'Matale', 'Kandy', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT097', 'Fresh', 'Matale', 'Kandy', 'street', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT098', 'Fresh', 'Matale', 'Kandy', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT099', 'Fresh', 'Matale', 'Kandy', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT100', 'Fresh', 'Matale', 'Kandy', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT101', 'Fresh', 'Matale', 'Kandy', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT102', 'Style', 'Matale', 'Kandy', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT103', 'Tech', 'Matale', 'Kandy', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT104', 'Fresh', 'Nuwara Eliya', 'Kandy', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT105', 'Fresh', 'Nuwara Eliya', 'Kandy', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT106', 'Fresh', 'Nuwara Eliya', 'Kandy', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT107', 'Fresh', 'Nuwara Eliya', 'Kandy', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT108', 'Fresh', 'Nuwara Eliya', 'Kandy', 'rear_dock', 'normal', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT109', 'Style', 'Nuwara Eliya', 'Kandy', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT110', 'Fresh', 'Badulla', 'Kandy', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT111', 'Fresh', 'Badulla', 'Kandy', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT112', 'Fresh', 'Badulla', 'Kandy', 'rear_dock', 'normal', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT113', 'Fresh', 'Badulla', 'Kandy', 'rear_dock', 'normal', '', '05:30', '08:00');
INSERT INTO outlets VALUES ('OUT114', 'Style', 'Badulla', 'Kandy', 'rear_dock', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT115', 'Tech', 'Badulla', 'Kandy', 'street', 'normal', '', '09:00', '17:00');
INSERT INTO outlets VALUES ('OUT116', 'Fresh', 'Kegalle', 'Kandy', 'rear_dock', 'normal', '', '05:00', '07:30');
INSERT INTO outlets VALUES ('OUT117', 'Fresh', 'Kegalle', 'Kandy', 'rear_dock', 'normal', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT118', 'Fresh', 'Kegalle', 'Kandy', 'street', 'normal', '', '04:00', '07:45');
INSERT INTO outlets VALUES ('OUT119', 'Fresh', 'Kegalle', 'Kandy', 'rear_dock', 'normal', '', '03:00', '08:00');
INSERT INTO outlets VALUES ('OUT120', 'Style', 'Kegalle', 'Kandy', 'rear_dock', 'normal', '', '09:00', '17:00');

-- Seed Vehicles (60 records)
INSERT INTO vehicles VALUES ('VEH001', 'truck', 'reefer', 5510, 26.4, 'diesel', 4.7, 340, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH002', 'truck', 'reefer', 3990, 21.1, 'diesel', 6.1, 610, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH003', 'truck', 'reefer', 5510, 26.4, 'diesel', 4.7, 480, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH004', 'truck', 'reefer', 6840, 33.4, 'diesel', 4.4, 430, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH005', 'truck', 'reefer', 6840, 33.4, 'diesel', 4.4, 490, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH006', 'truck', 'reefer', 6840, 33.4, 'diesel', 4.4, 380, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH007', 'truck', 'reefer', 3610, 19.4, 'diesel', 6.4, 590, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH008', 'truck', 'ambient', 3800, 22.0, 'diesel', 7.1, 460, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH009', 'truck', 'ambient', 5800, 30.0, 'diesel', 5.2, 440, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH010', 'truck', 'ambient', 6500, 34.0, 'diesel', 5.6, 540, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH011', 'truck', 'ambient', 7200, 38.0, 'diesel', 4.9, 600, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH012', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 540, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH013', 'truck', 'ambient', 5800, 30.0, 'diesel', 5.2, 430, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH014', 'truck', 'ambient', 7200, 38.0, 'diesel', 4.9, 530, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH015', 'truck', 'ambient', 3800, 22.0, 'diesel', 7.1, 560, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH016', 'truck', 'ambient', 3800, 22.0, 'diesel', 7.1, 550, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH017', 'truck', 'ambient', 3800, 22.0, 'diesel', 7.1, 470, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH018', 'truck', 'ambient', 3800, 22.0, 'diesel', 7.1, 450, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH019', 'truck', 'ambient', 7200, 38.0, 'diesel', 4.9, 610, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH020', 'truck', 'ambient', 6500, 34.0, 'diesel', 5.6, 460, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH021', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 440, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH022', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 580, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH023', 'truck', 'ambient', 7200, 38.0, 'diesel', 4.9, 530, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH024', 'truck', 'ambient', 6500, 34.0, 'diesel', 5.6, 600, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH025', 'truck', 'ambient', 3800, 22.0, 'diesel', 7.1, 580, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH026', 'truck', 'ambient', 7200, 38.0, 'diesel', 4.9, 340, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH027', 'truck', 'ambient', 3800, 22.0, 'diesel', 7.1, 440, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH028', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 380, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH029', 'truck', 'ambient', 5800, 30.0, 'diesel', 5.2, 600, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH030', 'truck', 'ambient', 6500, 34.0, 'diesel', 5.6, 360, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH031', 'truck', 'ambient', 7200, 38.0, 'diesel', 4.9, 350, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH032', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 610, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH033', 'truck', 'ambient', 7200, 38.0, 'diesel', 4.9, 470, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH034', 'truck', 'ambient', 3800, 22.0, 'diesel', 7.1, 440, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH035', 'van', 'reefer', 1040, 7.0, 'diesel', 10.3, 480, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH036', 'van', 'reefer', 1040, 7.0, 'diesel', 10.3, 480, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH037', 'van', 'ambient', 1100, 8.0, 'diesel', 11.5, 340, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH038', 'van', 'ambient', 1200, 9.0, 'diesel', 10.8, 620, 'Peliyagoda');
INSERT INTO vehicles VALUES ('VEH039', 'truck', 'reefer', 6180, 29.9, 'diesel', 5.0, 370, 'Kandy');
INSERT INTO vehicles VALUES ('VEH040', 'truck', 'reefer', 5510, 26.4, 'diesel', 4.7, 380, 'Kandy');
INSERT INTO vehicles VALUES ('VEH041', 'truck', 'reefer', 3610, 19.4, 'diesel', 6.4, 600, 'Kandy');
INSERT INTO vehicles VALUES ('VEH042', 'truck', 'reefer', 6180, 29.9, 'diesel', 5.0, 480, 'Kandy');
INSERT INTO vehicles VALUES ('VEH043', 'truck', 'reefer', 5510, 26.4, 'diesel', 4.7, 450, 'Kandy');
INSERT INTO vehicles VALUES ('VEH044', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 340, 'Kandy');
INSERT INTO vehicles VALUES ('VEH045', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 530, 'Kandy');
INSERT INTO vehicles VALUES ('VEH046', 'truck', 'ambient', 3800, 22.0, 'diesel', 7.1, 350, 'Kandy');
INSERT INTO vehicles VALUES ('VEH047', 'truck', 'ambient', 5800, 30.0, 'diesel', 5.2, 510, 'Kandy');
INSERT INTO vehicles VALUES ('VEH048', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 570, 'Kandy');
INSERT INTO vehicles VALUES ('VEH049', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 390, 'Kandy');
INSERT INTO vehicles VALUES ('VEH050', 'truck', 'ambient', 6500, 34.0, 'diesel', 5.6, 560, 'Kandy');
INSERT INTO vehicles VALUES ('VEH051', 'truck', 'ambient', 7200, 38.0, 'diesel', 4.9, 400, 'Kandy');
INSERT INTO vehicles VALUES ('VEH052', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 570, 'Kandy');
INSERT INTO vehicles VALUES ('VEH053', 'truck', 'ambient', 6500, 34.0, 'diesel', 5.6, 370, 'Kandy');
INSERT INTO vehicles VALUES ('VEH054', 'truck', 'ambient', 7200, 38.0, 'diesel', 4.9, 520, 'Kandy');
INSERT INTO vehicles VALUES ('VEH055', 'truck', 'ambient', 4200, 24.0, 'diesel', 6.8, 530, 'Kandy');
INSERT INTO vehicles VALUES ('VEH056', 'truck', 'ambient', 3800, 22.0, 'diesel', 7.1, 610, 'Kandy');
INSERT INTO vehicles VALUES ('VEH057', 'van', 'reefer', 1040, 7.0, 'diesel', 10.3, 450, 'Kandy');
INSERT INTO vehicles VALUES ('VEH058', 'van', 'reefer', 1040, 7.0, 'diesel', 10.3, 550, 'Kandy');
INSERT INTO vehicles VALUES ('VEH059', 'van', 'ambient', 1200, 9.0, 'diesel', 10.8, 610, 'Kandy');
INSERT INTO vehicles VALUES ('VEH060', 'van', 'ambient', 1200, 9.0, 'diesel', 10.8, 520, 'Kandy');

-- Seed Service Allowance
INSERT INTO service_allowance VALUES ('Fresh', 'rear_dock', 15);
INSERT INTO service_allowance VALUES ('Fresh', 'street', 16);
INSERT INTO service_allowance VALUES ('Fresh', 'mall_bay', 18);
INSERT INTO service_allowance VALUES ('Style', 'rear_dock', 38);
INSERT INTO service_allowance VALUES ('Style', 'street', 46);
INSERT INTO service_allowance VALUES ('Style', 'mall_bay', 59);
INSERT INTO service_allowance VALUES ('Tech', 'rear_dock', 43);
INSERT INTO service_allowance VALUES ('Tech', 'street', 55);
INSERT INTO service_allowance VALUES ('Tech', 'mall_bay', 55);

-- Seed District Travel
INSERT INTO district_travel VALUES ('Colombo', 'Peliyagoda', 'urban', 30.0, 12, 24, 4.0, 8);
INSERT INTO district_travel VALUES ('Gampaha', 'Peliyagoda', 'suburban', 45.0, 28, 37, 7.0, 9);
INSERT INTO district_travel VALUES ('Kalutara', 'Peliyagoda', 'suburban', 45.0, 48, 64, 9.0, 12);
INSERT INTO district_travel VALUES ('Galle', 'Peliyagoda', 'highway', 70.0, 120, 103, 10.0, 9);
INSERT INTO district_travel VALUES ('Matara', 'Peliyagoda', 'highway', 70.0, 160, 137, 12.0, 10);
INSERT INTO district_travel VALUES ('Kurunegala', 'Peliyagoda', 'suburban', 45.0, 95, 127, 14.0, 19);
INSERT INTO district_travel VALUES ('Puttalam', 'Peliyagoda', 'suburban', 45.0, 130, 173, 18.0, 24);
INSERT INTO district_travel VALUES ('Kandy', 'Kandy', 'urban', 30.0, 8, 16, 3.0, 6);
INSERT INTO district_travel VALUES ('Matale', 'Kandy', 'suburban', 45.0, 26, 35, 8.0, 11);
INSERT INTO district_travel VALUES ('Nuwara Eliya', 'Kandy', 'hill', 42.0, 78, 111, 14.0, 20);
INSERT INTO district_travel VALUES ('Badulla', 'Kandy', 'hill', 42.0, 130, 186, 16.0, 23);
INSERT INTO district_travel VALUES ('Kegalle', 'Kandy', 'suburban', 45.0, 40, 53, 10.0, 13);

-- Seed Pre-configured User Accounts
INSERT INTO users (email, password_hash, name, role, assigned_scope) VALUES
('dispatcher@waypoint.lk', '$2a$10$wT3x9eI8V1K1sW8fA3jNuuG1j0P2z1Q7x9E8V1K1sW8fA3jNuuG1j', 'Nimali Perera', 'DISPATCHER', 'Kandy Central Depot'),
('manager.out077@waypoint.lk', '$2a$10$wT3x9eI8V1K1sW8fA3jNuuG1j0P2z1Q7x9E8V1K1sW8fA3jNuuG1j', 'Aravinda Silva', 'STORE_MANAGER', 'OUT077'),
('loader.kiosk@waypoint.lk', '$2a$10$wT3x9eI8V1K1sW8fA3jNuuG1j0P2z1Q7x9E8V1K1sW8fA3jNuuG1j', 'Samantha Perera', 'LOADER', 'Kandy Depot Bay 2'),
('driver.kasun@waypoint.lk', '$2a$10$wT3x9eI8V1K1sW8fA3jNuuG1j0P2z1Q7x9E8V1K1sW8fA3jNuuG1j', 'Kasun Silva', 'DRIVER', 'VEH057');

-- Seed Sample Delivery Day (2026-09-28)
INSERT INTO orders (order_id, outlet_id, delivery_date, brand, weight_kg, volume_m3, crate_count, requires_chilled, status) VALUES
('WF-1043-1', 'OUT077', '2026-09-28', 'Fresh', 320, 1.4, 18, true, 'PLANNED'),
('WF-1043-2', 'OUT079', '2026-09-28', 'Fresh', 280, 1.2, 15, true, 'PLANNED'),
('WF-1043-3', 'OUT080', '2026-09-28', 'Fresh', 265, 1.1, 14, true, 'PLANNED'),
('WF-1044-1', 'OUT084', '2026-09-28', 'Fresh', 450, 1.8, 22, true, 'PLANNED');

INSERT INTO trips (trip_id, vehicle_id, driver_name, depot, trip_number, delivery_date, total_weight_kg, total_volume_m3, total_crates, status, departure_time, last_sync_time, is_telemetry_stale) VALUES
('TRIP-WF-1043', 'VEH057', 'Kasun Silva', 'Kandy', 1, '2026-09-28', 865, 3.7, 47, 'DEGRADED_OFFLINE', '04:50', '2026-09-28 06:42:00', true),
('TRIP-WF-1044', 'VEH039', 'Dilan Silva', 'Kandy', 1, '2026-09-28', 450, 1.8, 22, 'ON_ROUTE', '05:30', '2026-09-28 06:55:00', false);

INSERT INTO trip_stops (trip_id, outlet_id, stop_sequence, eta_start, eta_end, status, discrepancy_note, is_offline_record) VALUES
('TRIP-WF-1043', 'OUT077', 1, '07:12', '07:34', 'DELIVERED', 'Milk short by 3 units (loading issue recorded)', true),
('TRIP-WF-1043', 'OUT079', 2, '07:35', '07:50', 'PLANNED', NULL, false),
('TRIP-WF-1043', 'OUT080', 3, '07:55', '08:10', 'PLANNED', NULL, false);
