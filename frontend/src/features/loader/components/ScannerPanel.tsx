export function ScannerPanel() {
  return (
    <div
      className="relative grid h-44 place-items-center overflow-hidden rounded-2xl bg-navy md:h-56"
      role="img"
      aria-label="Camera scanner viewfinder, aim reticle active"
    >
      <span className="absolute left-3 top-3 flex items-center gap-1.5 text-[11px] font-bold text-white">
        <span className="size-2 animate-pulse rounded-full bg-danger" /> CAMERA
        RF SCANNER #04 · LIVE
      </span>
      <div className="h-24 w-52 rounded-lg border-2 border-cold-bright">
        <div className="mt-11 h-0.5 animate-pulse bg-danger" />
      </div>
      <span className="absolute bottom-3 text-[11px] font-bold text-cold-bright">
        AIM RETICLE ACTIVE
      </span>
    </div>
  );
}
