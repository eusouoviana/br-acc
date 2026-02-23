import { dataColors, relationshipColors } from "@/styles/tokens";

export const NODE_COLORS = dataColors;
export const EDGE_COLORS = relationshipColors;

// Node sizes based on connection count
export const NODE_SIZE_MIN = 5;
export const NODE_SIZE_MAX = 14;
export const NODE_SIZE_CENTER = 16;

// LOD thresholds
export const LOD_DOTS_ONLY = 0.5; // zoom < 0.5 = dots only
export const LOD_ICONS = 1.5; // 0.5-1.5 = dots + icon
// > 1.5 = full detail (dots + icon + label + badges)

// Icon map: entity type -> lucide icon name
export const ICON_MAP: Record<string, string> = {
  person: "User",
  company: "Building2",
  election: "Vote",
  contract: "FileText",
  sanction: "AlertTriangle",
  amendment: "FileEdit",
};

// Pre-rendered icon cache
const iconCache = new Map<string, HTMLImageElement>();

export function getIconImage(
  type: string,
  color: string,
  size: number,
): HTMLImageElement | null {
  const key = `${type}-${size}`;
  if (iconCache.has(key)) return iconCache.get(key)!;

  const svg = createIconSvg(type, color, size);
  if (!svg) return null;

  const img = new Image();
  img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  iconCache.set(key, img);
  return img;
}

function createIconSvg(type: string, color: string, size: number): string {
  const s = size;
  const shapes: Record<string, string> = {
    person: `<circle cx="${s / 2}" cy="${s * 0.35}" r="${s * 0.2}" fill="${color}"/><ellipse cx="${s / 2}" cy="${s * 0.75}" rx="${s * 0.3}" ry="${s * 0.2}" fill="${color}"/>`,
    company: `<rect x="${s * 0.15}" y="${s * 0.3}" width="${s * 0.7}" height="${s * 0.6}" rx="1" fill="${color}"/><rect x="${s * 0.3}" y="${s * 0.15}" width="${s * 0.4}" height="${s * 0.3}" rx="1" fill="${color}"/>`,
    election: `<rect x="${s * 0.2}" y="${s * 0.2}" width="${s * 0.6}" height="${s * 0.7}" rx="1" fill="${color}"/><polyline points="${s * 0.35},${s * 0.55} ${s * 0.45},${s * 0.65} ${s * 0.65},${s * 0.4}" stroke="#060a07" stroke-width="1.5" fill="none"/>`,
    contract: `<rect x="${s * 0.2}" y="${s * 0.15}" width="${s * 0.6}" height="${s * 0.7}" rx="1" fill="${color}"/><line x1="${s * 0.35}" y1="${s * 0.4}" x2="${s * 0.65}" y2="${s * 0.4}" stroke="#060a07" stroke-width="1"/><line x1="${s * 0.35}" y1="${s * 0.55}" x2="${s * 0.65}" y2="${s * 0.55}" stroke="#060a07" stroke-width="1"/>`,
    sanction: `<polygon points="${s / 2},${s * 0.15} ${s * 0.8},${s * 0.8} ${s * 0.2},${s * 0.8}" fill="${color}"/><text x="${s / 2}" y="${s * 0.7}" text-anchor="middle" font-size="${s * 0.4}" fill="#060a07" font-weight="bold">!</text>`,
    amendment: `<rect x="${s * 0.2}" y="${s * 0.15}" width="${s * 0.6}" height="${s * 0.7}" rx="1" fill="${color}"/><path d="M${s * 0.55} ${s * 0.35} L${s * 0.65} ${s * 0.45} L${s * 0.45} ${s * 0.65} L${s * 0.35} ${s * 0.55} Z" fill="#060a07"/>`,
  };
  const shape =
    shapes[type] ??
    `<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.35}" fill="${color}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${shape}</svg>`;
}
