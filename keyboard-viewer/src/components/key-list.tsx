import { Action, ActionPanel, Color, List } from "@raycast/api";
import { findKey, KEY_LABELS, KeyEntry, LayoutData, ROWS } from "../lib/keyboard-data";

const LEGEND = "Base · Shift ⇧ · Option ⌥ · Shift+Option ⇧⌥";

function display(value: string): string {
  return value.trim().length > 0 ? value : "–";
}

export function KeyList({ layout }: { layout: LayoutData }) {
  return (
    <List
      navigationTitle={`Keyboard Viewer — ${layout.layoutName}`}
      searchBarPlaceholder="Search a key or a character it produces…"
    >
      {ROWS.map((row) => (
        <List.Section title={row.title} subtitle={LEGEND} key={row.title}>
          {row.keycodes.map((keycode) => {
            const key: KeyEntry | undefined = findKey(layout, keycode);
            if (!key) return null;
            const label = KEY_LABELS[keycode] ?? String(keycode);
            return (
              <List.Item
                key={keycode}
                title={label}
                keywords={[key.base, key.shift, key.option, key.shiftOption].filter((c) => c.trim().length > 0)}
                accessories={[
                  { text: { value: display(key.base), color: Color.PrimaryText }, tooltip: "No modifier" },
                  { text: { value: display(key.shift), color: Color.Blue }, tooltip: "Shift ⇧" },
                  { text: { value: display(key.option), color: Color.Purple }, tooltip: "Option ⌥" },
                  { text: { value: display(key.shiftOption), color: Color.Orange }, tooltip: "Shift ⇧ + Option ⌥" },
                ]}
                actions={
                  <ActionPanel>
                    <ActionPanel.Section title={`${label} key`}>
                      {key.base.trim() && <Action.CopyToClipboard title="Copy Base Character" content={key.base} />}
                      {key.shift.trim() && <Action.CopyToClipboard title="Copy Shift Character" content={key.shift} />}
                      {key.option.trim() && (
                        <Action.CopyToClipboard title="Copy Option Character" content={key.option} />
                      )}
                      {key.shiftOption.trim() && (
                        <Action.CopyToClipboard title="Copy Shift-Option Character" content={key.shiftOption} />
                      )}
                    </ActionPanel.Section>
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      ))}
    </List>
  );
}
