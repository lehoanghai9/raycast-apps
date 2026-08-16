import { useMemo } from "react";
import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import { KeyList } from "./components/key-list";
import { TryIt } from "./components/try-it";
import { CURRENT_LAYOUT, useKeyboardLayout } from "./lib/keyboard-data";
import { buildKeyboardSvg, svgToDataUri } from "./lib/keyboard-svg";

const LEGEND =
  "⚪ **Base** (large) · 🔵 **Shift** ⇧ (top-left) · 🟣 **Option** ⌥ (bottom-right) · 🟠 **Shift+Option** ⇧⌥ (top-right)";

export default function Command() {
  const { layoutId, setLayoutId, enabledLayouts, layout, isLoading, error, revalidate } = useKeyboardLayout();

  const markdown = useMemo(() => {
    if (!layout) return "Loading keyboard layout…";
    const dataUri = svgToDataUri(buildKeyboardSvg(layout));
    return (
      `# ${layout.layoutName}\n\n` +
      `![${layout.layoutName} keyboard layout](${dataUri})\n\n` +
      `${LEGEND}\n\n` +
      `*Reads your Mac's actual active layout live, so it can differ from what's printed on your keycaps.*\n\n` +
      `Press **⏎** to search & copy a character, **⌘T** to try typing, or **⌘K** to switch layout.`
    );
  }, [layout]);

  if (error) {
    return (
      <Detail
        navigationTitle="Keyboard Viewer"
        markdown={`# Couldn't read this keyboard layout\n\n${error.message}`}
      />
    );
  }

  return (
    <Detail
      isLoading={isLoading}
      navigationTitle={layout ? `Keyboard Viewer — ${layout.layoutName}` : "Keyboard Viewer"}
      markdown={markdown}
      actions={
        <ActionPanel>
          {layout && (
            <Action.Push
              title="Search & Copy Characters"
              icon={Icon.MagnifyingGlass}
              target={<KeyList layout={layout} />}
            />
          )}
          {layout && (
            <Action.Push
              title="Try Typing"
              icon={Icon.Keyboard}
              shortcut={{ modifiers: ["cmd"], key: "t" }}
              target={<TryIt layout={layout} />}
            />
          )}
          <Action
            title="Refresh Layout"
            icon={Icon.ArrowClockwise}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
            onAction={revalidate}
          />
          {enabledLayouts && enabledLayouts.length > 0 && (
            <ActionPanel.Section title="Switch Layout">
              <Action
                title="Current System Layout"
                icon={layoutId === CURRENT_LAYOUT ? Icon.CheckCircle : Icon.Circle}
                onAction={() => setLayoutId(CURRENT_LAYOUT)}
              />
              {enabledLayouts.map((l) => (
                <Action
                  key={l.layoutId}
                  title={l.layoutName}
                  icon={layoutId === l.layoutId ? Icon.CheckCircle : Icon.Circle}
                  onAction={() => setLayoutId(l.layoutId)}
                />
              ))}
            </ActionPanel.Section>
          )}
        </ActionPanel>
      }
    />
  );
}
