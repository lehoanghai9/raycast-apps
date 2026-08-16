# raycast-apps

Custom Raycast extensions, developed and used locally (not published to the Raycast Store).

## Extensions

### [keyboard-viewer](./keyboard-viewer)

Shows whichever macOS keyboard layout is currently active — works with any language, not just one. Reads live from macOS's own layout APIs via a bundled Swift helper, so it always reflects reality rather than a hardcoded mapping.

- **Keyboard diagram** — a generated visual keyboard, each key showing what it types with no modifier, Shift, Option, and Shift+Option.
- **Search & Copy Characters** — a searchable table; type a character to find which key produces it, and copy it to the clipboard.
- **Try Typing** — type or paste any text and see each character resolved live to its key + modifier.
- **Switch Layout** — preview any other keyboard layout you have enabled, not just the active one.

## Setup

Each extension is a standalone Raycast extension folder. To run one locally:

```bash
cd <extension-folder>
npm install
npm run dev
```

This starts hot-reloading dev mode and the command becomes available in Raycast immediately. `Ctrl+C` stops the dev server; the extension stays installed.

Extensions using the Swift bridge (like `keyboard-viewer`) require Xcode (not just the Command Line Tools) to build — see `swift/Package.swift` in that extension for its dependencies.
