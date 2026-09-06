import type { CSSProperties } from "react";

interface PixelProps {
  rows: string[];
  map: Record<string, string>;
  px?: number;
  className?: string;
}

export function Pixel({ rows, map, px = 12, className }: PixelProps) {
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length));
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const fill = map[ch];
      if (!fill || fill === "transparent") continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    }
  });
  const style: CSSProperties = {
    shapeRendering: "crispEdges",
    imageRendering: "pixelated",
    width: width * px,
    height: height * px,
  };
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} style={style} role="img" aria-hidden="true">
      {rects}
    </svg>
  );
}

const CAT_GRID = [
  "....xx..xx....",
  "...xxxxxx.....",
  "..xxxxxxxx....",
  ".xffffffffx...",
  ".xfffeffefx...",
  ".xfffeffefx...",
  ".xffffwnwffx..",
  ".xffffwwwffx..",
  ".xxffffffxx...",
  "...xxxxxx.....",
  "...xxxxx......",
  "....xx........",
];

export function PixelCat({
  fur = "#ffc4e1",
  px = 14,
  className,
}: {
  fur?: string;
  px?: number;
  className?: string;
}) {
  return (
    <Pixel
      rows={CAT_GRID}
      px={px}
      className={className}
      map={{
        x: "#2f2a44",
        f: fur,
        e: "#2f2a44",
        n: "#ff7aa8",
        w: "#fffbf3",
      }}
    />
  );
}

const COIN_GRID = [
  "...kkkk...",
  "..kggggk..",
  ".kggggggk.",
  "kggggggggk",
  "kggggggggk",
  "kgggghgggk",
  "kggggggggk",
  ".kggggggk.",
  "..kggggk..",
  "...kkkk...",
];

export function PixelCoin({ px = 10, className }: { px?: number; className?: string }) {
  return (
    <Pixel
      rows={COIN_GRID}
      px={px}
      className={className}
      map={{ k: "#2f2a44", g: "#ffd76b", h: "#fff3c4" }}
    />
  );
}

export function PixelCoinStack({ count = 2, px = 10, className }: { count?: number; px?: number; className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <PixelCoin key={i} px={px} className="-mt-[4px]" />
      ))}
    </div>
  );
}

export function PixelJar({
  fill = 0,
  coin = "#ffd76b",
  px = 10,
  className,
}: {
  fill?: number;
  coin?: string;
  px?: number;
  className?: string;
}) {
  const bodyRows = 8;
  const full = Math.max(0, Math.min(1, fill));
  const fullCount = Math.round(full * bodyRows);
  const body: string[] = [];
  for (let i = 0; i < bodyRows; i++) {
    body.push(i >= bodyRows - fullCount ? ".kcccccccck." : ".k........k.");
  }
  const rows = [
    "..kkkkkk...",
    "..kkkkkk...",
    "..kkkkkk...",
    "..k....k...",
    ...body,
    ".kkkkkkkkkk.",
    "..kkkkkkkk..",
  ];
  return (
    <Pixel
      rows={rows}
      px={px}
      className={className}
      map={{ k: "#2f2a44", c: coin, ".": "transparent" }}
    />
  );
}

const STAR_GRID = [
  "..s..",
  ".s.s.",
  "..s..",
  ".s.s.",
  "..s..",
];

export function PixelStar({ color = "#ffc4e1", px = 6, className }: { color?: string; px?: number; className?: string }) {
  return <Pixel rows={STAR_GRID} px={px} className={className} map={{ s: color }} />;
}
