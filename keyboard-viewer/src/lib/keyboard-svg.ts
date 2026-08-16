import { findKey, KEY_LABELS, LayoutData, ROWS } from "./keyboard-data";

const KEY_SIZE = 68;
const GAP = 8;
const STEP = KEY_SIZE + GAP;
const ROW_OFFSETS = [0, STEP * 0.5, STEP * 0.75, STEP * 1.3];
const PADDING = 20;

const BG = "#1e1f24";
const KEY_FILL = "#26282e";
const KEY_STROKE = "#37393f";
const BASE_COLOR = "#f4f4f5";
const SHIFT_COLOR = "#409cff";
const OPTION_COLOR = "#d17aff";
const SHIFT_OPTION_COLOR = "#ffb340";
const EMPTY_COLOR = "#4b4d54";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function glyph(value: string): { text: string; empty: boolean } {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { text: "–", empty: true };
  return { text: trimmed, empty: false };
}

export function buildKeyboardSvg(layout: LayoutData): string {
  const maxKeys = Math.max(...ROWS.map((row) => row.keycodes.length));
  const width = PADDING * 2 + maxKeys * STEP + Math.max(...ROW_OFFSETS);
  const height = PADDING * 2 + ROWS.length * STEP;

  const keyTiles: string[] = [];

  ROWS.forEach((row, rowIndex) => {
    const y = PADDING + rowIndex * STEP;
    const xOffset = PADDING + ROW_OFFSETS[rowIndex];

    row.keycodes.forEach((keycode, colIndex) => {
      const key = findKey(layout, keycode);
      if (!key) return;
      const x = xOffset + colIndex * STEP;

      const base = glyph(key.base);
      const shift = glyph(key.shift);
      const option = glyph(key.option);
      const shiftOption = glyph(key.shiftOption);
      const label = KEY_LABELS[keycode] ?? String(keycode);

      keyTiles.push(`
        <g>
          <rect x="${x}" y="${y}" width="${KEY_SIZE}" height="${KEY_SIZE}" rx="12" fill="${KEY_FILL}" stroke="${KEY_STROKE}" stroke-width="1.5"/>
          <text x="${x + 8}" y="${y + 17}" font-size="12" font-weight="500" fill="${shift.empty ? EMPTY_COLOR : SHIFT_COLOR}" font-family="-apple-system, Helvetica, sans-serif">${escapeXml(shift.text)}</text>
          <text x="${x + KEY_SIZE - 8}" y="${y + 17}" font-size="12" font-weight="500" text-anchor="end" fill="${shiftOption.empty ? EMPTY_COLOR : SHIFT_OPTION_COLOR}" font-family="-apple-system, Helvetica, sans-serif">${escapeXml(shiftOption.text)}</text>
          <text x="${x + 10}" y="${y + KEY_SIZE - 10}" font-size="23" font-weight="700" fill="${base.empty ? EMPTY_COLOR : BASE_COLOR}" font-family="-apple-system, Helvetica, sans-serif">${escapeXml(base.text)}</text>
          <text x="${x + KEY_SIZE - 8}" y="${y + KEY_SIZE - 11}" font-size="12" font-weight="500" text-anchor="end" fill="${option.empty ? EMPTY_COLOR : OPTION_COLOR}" font-family="-apple-system, Helvetica, sans-serif">${escapeXml(option.text)}</text>
          <title>${escapeXml(label)} key — base "${escapeXml(base.text)}", shift "${escapeXml(shift.text)}", option "${escapeXml(option.text)}", shift+option "${escapeXml(shiftOption.text)}"</title>
        </g>`);
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="${BG}"/>
    ${keyTiles.join("\n")}
  </svg>`;
}

export function svgToDataUri(svg: string): string {
  const base64 = Buffer.from(svg, "utf-8").toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
