import { useState } from "react";
import { usePromise } from "@raycast/utils";
import { getCurrentLayout, getLayoutById, listEnabledLayouts } from "swift:../../swift";

export type KeyEntry = {
  keycode: number;
  base: string;
  shift: string;
  option: string;
  shiftOption: string;
};

export type LayoutData = {
  layoutName: string;
  layoutId: string;
  keys: KeyEntry[];
};

export type EnabledLayout = {
  layoutName: string;
  layoutId: string;
};

export const CURRENT_LAYOUT = "__current__";

// Virtual keycodes represent physical key position and are identical across
// every keyboard layout, so this grouping works no matter which language
// layout is active.
export const ROWS: { title: string; keycodes: number[] }[] = [
  { title: "Number Row", keycodes: [50, 18, 19, 20, 21, 23, 22, 26, 28, 25, 29, 27, 24] },
  { title: "Top Row", keycodes: [12, 13, 14, 15, 17, 16, 32, 34, 31, 35, 33, 30, 42] },
  { title: "Home Row", keycodes: [0, 1, 2, 3, 5, 4, 38, 40, 37, 41, 39] },
  { title: "Bottom Row", keycodes: [10, 6, 7, 8, 9, 11, 45, 46, 43, 47, 44] },
];

export const KEY_LABELS: Record<number, string> = {
  50: "§ / `",
  18: "1",
  19: "2",
  20: "3",
  21: "4",
  23: "5",
  22: "6",
  26: "7",
  28: "8",
  25: "9",
  29: "0",
  27: "-",
  24: "=",
  12: "Q",
  13: "W",
  14: "E",
  15: "R",
  17: "T",
  16: "Y",
  32: "U",
  34: "I",
  31: "O",
  35: "P",
  33: "[",
  30: "]",
  42: "\\",
  0: "A",
  1: "S",
  2: "D",
  3: "F",
  5: "G",
  4: "H",
  38: "J",
  40: "K",
  37: "L",
  41: ";",
  39: "'",
  10: "ISO §",
  6: "Z",
  7: "X",
  8: "C",
  9: "V",
  11: "B",
  45: "N",
  46: "M",
  43: ",",
  47: ".",
  44: "/",
};

export function findKey(layout: LayoutData, keycode: number): KeyEntry | undefined {
  return layout.keys.find((k) => k.keycode === keycode);
}

export type Modifier = "base" | "shift" | "option" | "shiftOption";

export const MODIFIER_LABELS: Record<Modifier, string> = {
  base: "No modifier",
  shift: "Shift ⇧",
  option: "Option ⌥",
  shiftOption: "Shift ⇧ + Option ⌥",
};

/**
 * Finds which key + modifier produces a given single character. A character
 * can occasionally be reachable via more than one key (some macOS layouts
 * duplicate symbols across keys), so this always prefers the simplest
 * modifier across every key before considering a more complex one.
 */
export function findKeyForChar(layout: LayoutData, char: string): { key: KeyEntry; modifier: Modifier } | undefined {
  const modifiers: Modifier[] = ["base", "shift", "option", "shiftOption"];
  for (const modifier of modifiers) {
    const key = layout.keys.find((k) => k[modifier] === char);
    if (key) return { key, modifier };
  }
  return undefined;
}

export function useKeyboardLayout() {
  const [layoutId, setLayoutId] = useState<string>(CURRENT_LAYOUT);

  const { data: enabledLayouts } = usePromise(
    async (): Promise<EnabledLayout[]> => (await listEnabledLayouts()) as EnabledLayout[],
    [],
  );

  const {
    data: layout,
    isLoading,
    error,
    revalidate,
  } = usePromise(
    async (id: string): Promise<LayoutData> =>
      (id === CURRENT_LAYOUT ? await getCurrentLayout() : await getLayoutById(id)) as LayoutData,
    [layoutId],
  );

  return { layoutId, setLayoutId, enabledLayouts, layout, isLoading, error, revalidate };
}
