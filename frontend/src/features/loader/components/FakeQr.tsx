function Finder({ r, c }: { r: number; c: number }) {
  return (
    <g>
      <rect x={c} y={r} width="7" height="7" fill="#0f172a" />
      <rect x={c + 1} y={r + 1} width="5" height="5" fill="#fff" />
      <rect x={c + 2} y={r + 2} width="3" height="3" fill="#0f172a" />
    </g>
  );
}

export function FakeQr({ value, size = 21 }: { value: string; size?: number }) {
  let h = 2166136261;
  for (const ch of value) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const finder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
      if (!finder(r, c) && h >>> 28 > 7) cells.push({ r, c });
    }
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="size-36 rounded-lg border border-line bg-white p-1"
      role="img"
      aria-label="Gate pass QR code (demo)"
    >
      {cells.map(({ r, c }) => (
        <rect
          key={`${r}-${c}`}
          x={c}
          y={r}
          width="1"
          height="1"
          fill="#0f172a"
        />
      ))}
      <Finder r={0} c={0} />
      <Finder r={0} c={size - 7} />
      <Finder r={size - 7} c={0} />
    </svg>
  );
}
