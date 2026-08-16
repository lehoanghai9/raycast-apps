import { useState } from "react";
import { Color, Icon, List } from "@raycast/api";
import { findKeyForChar, KEY_LABELS, LayoutData, MODIFIER_LABELS, Modifier } from "../lib/keyboard-data";

const MODIFIER_COLOR: Record<Modifier, Color> = {
  base: Color.PrimaryText,
  shift: Color.Blue,
  option: Color.Purple,
  shiftOption: Color.Orange,
};

export function TryIt({ layout }: { layout: LayoutData }) {
  const [text, setText] = useState("");
  const chars = Array.from(text).filter((c) => c.trim().length > 0);

  return (
    <List
      navigationTitle={`Try It — ${layout.layoutName}`}
      searchBarPlaceholder="Type or paste any text…"
      searchText={text}
      onSearchTextChange={setText}
      filtering={false}
    >
      {chars.length === 0 ? (
        <List.EmptyView
          icon={Icon.Keyboard}
          title="Type or paste a character"
          description={`See exactly which key and modifier types it on the ${layout.layoutName} layout.`}
        />
      ) : (
        chars.map((char, index) => {
          const match = findKeyForChar(layout, char);
          const label = match ? (KEY_LABELS[match.key.keycode] ?? String(match.key.keycode)) : undefined;
          return (
            <List.Item
              key={`${index}-${char}`}
              title={char}
              subtitle={match ? `${label} key` : undefined}
              accessories={[
                match
                  ? { tag: { value: MODIFIER_LABELS[match.modifier], color: MODIFIER_COLOR[match.modifier] } }
                  : { tag: { value: "Not on this layout", color: Color.SecondaryText } },
              ]}
            />
          );
        })
      )}
    </List>
  );
}
