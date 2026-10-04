import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardPage from "@/features/loader/pages/DashboardPage";
import VehicleCheckPage from "@/features/loader/pages/VehicleCheckPage";
import LoadPlanPage from "@/features/loader/pages/LoadPlanPage";
import ScanPage from "@/features/loader/pages/ScanPage";
import ExceptionPage from "@/features/loader/pages/ExceptionPage";
import SupervisorPage from "@/features/loader/pages/SupervisorPage";
import StowagePage from "@/features/loader/pages/StowagePage";
import DeparturePage from "@/features/loader/pages/DeparturePage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/loader" replace /> },
  { path: "/loader", element: <DashboardPage /> },
  { path: "/loader/vehicle/:vehicleId/check", element: <VehicleCheckPage /> },
  { path: "/loader/trip/:tripId/load-plan", element: <LoadPlanPage /> },
  { path: "/loader/trip/:tripId/scan", element: <ScanPage /> },
  { path: "/loader/trip/:tripId/exception", element: <ExceptionPage /> },
  { path: "/loader/trip/:tripId/supervisor", element: <SupervisorPage /> },
  { path: "/loader/trip/:tripId/stowage", element: <StowagePage /> },
  { path: "/loader/trip/:tripId/departure", element: <DeparturePage /> },
]);
