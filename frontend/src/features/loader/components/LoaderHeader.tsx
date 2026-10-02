import type { ReactNode } from "react";
import { House, Snowflake, Truck, User } from "lucide-react";
import { Link } from "react-router-dom";
import { SyncStatus } from "./SyncStatus";

interface Props {
  title: string;
  depot: string;
  loaderName: string;
  vehicleId: string;
  driverName: string;
  reeferTempC: number;
  bayStatus: string;
}

function Pill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li
      className={`inline-flex items-center gap-1.5 rounded-full border border-navy-line bg-navy-card px-3 py-1 text-xs font-semibold text-white ${className}`}
    >
      {children}
    </li>
  );
}

export function LoaderHeader(p: Props) {
  return (
    <>
      <header className="sticky top-0 z-30 bg-navy text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 md:px-6">
          <Link
            to="/loader"
            aria-label="Home: back to dock dashboard"
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-navy-line bg-navy-card hover:bg-navy-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <House size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold tracking-wide text-slate-400">
              WAYPOINT LOGISTICS · {p.depot.toUpperCase()}
            </p>
            <h1 className="truncate text-base font-bold md:text-lg">
              {p.title}
            </h1>
          </div>
          <SyncStatus />
        </div>
      </header>
      <div className="bg-navy">
        <ul className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 pb-3 md:px-6">
          <Pill>
            <span className="size-2 rounded-full bg-ok" aria-hidden />
            {p.bayStatus}
          </Pill>
          <Pill>
            <Truck size={13} aria-hidden /> {p.vehicleId}
          </Pill>
          <Pill>
            <User size={13} aria-hidden /> {p.driverName}
          </Pill>
          <Pill className="text-cold-bright">
            <Snowflake size={13} aria-hidden />
            <span className="sr-only">Reefer temperature </span>+{p.reeferTempC}
            °C
          </Pill>
          <Pill className="max-md:hidden">Loader {p.loaderName}</Pill>
        </ul>
      </div>
    </>
  );
}
