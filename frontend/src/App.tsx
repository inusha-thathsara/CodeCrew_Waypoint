import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Providers} from "@/app/provider";
import { router } from "@/app/router";
import { startSync } from "@/services/offline/outbox";
import { useWorkflow } from "@/features/loader/store/workflowStore";

export default function App() {
  const hydrated = useWorkflow((s) => s.hydrated);

  useEffect(() => {
    void useWorkflow.getState().hydrate(); // restore saved progress from IndexedDB
    return startSync(); // flush pending records now and whenever we come back online
  }, []);

  return (
    <Providers>
      {hydrated ? (
        <RouterProvider router={router} />
      ) : (
        <p className="p-6 font-semibold">Loading…</p>
      )}
    </Providers>
  );
}
