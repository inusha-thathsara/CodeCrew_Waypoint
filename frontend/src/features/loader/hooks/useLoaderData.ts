import { useQuery } from "@tanstack/react-query";
import { loaderApi } from "../services";

export const useDashboard = () =>
  useQuery({
    queryKey: ["loader", "dashboard"],
    queryFn: () => loaderApi.getDashboard(),
    staleTime: Infinity,
  });

export const useTrip = () =>
  useQuery({
    queryKey: ["loader", "trip"],
    queryFn: () => loaderApi.getTrip(),
    staleTime: Infinity,
  });
