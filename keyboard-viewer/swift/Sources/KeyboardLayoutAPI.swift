import Carbon
import Foundation
import RaycastSwiftMacros

struct KeyEntry: Encodable {
  let keycode: Int
  let base: String
  let shift: String
  let option: String
  let shiftOption: String
}

struct LayoutResult: Encodable {
  let layoutName: String
  let layoutId: String
}

struct FullLayoutResult: Encodable {
  let layoutName: String
  let layoutId: String
  let keys: [KeyEntry]
}

// Physical keys we care about (letters, digits, punctuation). Virtual keycodes
// represent hardware position and are the same regardless of which keyboard
// layout is active, so this list works for any language.
private let physicalKeycodes: [Int] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 50,
]

private func stringProperty(_ source: TISInputSource, _ key: CFString) -> String {
  guard let ptr = TISGetInputSourceProperty(source, key) else { return "" }
  return Unmanaged<CFString>.fromOpaque(ptr).takeUnretainedValue() as String
}

private func translate(_ layout: UnsafePointer<UCKeyboardLayout>, keycode: Int, modifiers: UInt32) -> String {
  var deadKeyState: UInt32 = 0
  var chars = [UniChar](repeating: 0, count: 4)
  var length = 0
  let status = UCKeyTranslate(
    layout, UInt16(keycode), UInt16(kUCKeyActionDown), modifiers, UInt32(LMGetKbdType()),
    UInt32(kUCKeyTranslateNoDeadKeysBit), &deadKeyState, 4, &length, &chars
  )
  guard status == noErr, length > 0 else { return "" }
  return String(utf16CodeUnits: chars, count: length)
}

private func buildFullLayout(source: TISInputSource, name: String, id: String) throws -> FullLayoutResult {
  guard let dataPtr = TISGetInputSourceProperty(source, kTISPropertyUnicodeKeyLayoutData) else {
    throw "The \"\(name)\" input source has no character layout data (it may be a non-keyboard input method)."
  }
  let data = Unmanaged<CFData>.fromOpaque(dataPtr).takeUnretainedValue() as Data
  return try data.withUnsafeBytes { rawBuffer -> FullLayoutResult in
    guard let base = rawBuffer.baseAddress else {
      throw "Could not read layout data for \"\(name)\"."
    }
    let layoutPtr = base.assumingMemoryBound(to: UCKeyboardLayout.self)
    let shiftMod = UInt32(shiftKey >> 8)
    let optionMod = UInt32(optionKey >> 8)
    let keys: [KeyEntry] = physicalKeycodes.map { keycode in
      KeyEntry(
        keycode: keycode,
        base: translate(layoutPtr, keycode: keycode, modifiers: 0),
        shift: translate(layoutPtr, keycode: keycode, modifiers: shiftMod),
        option: translate(layoutPtr, keycode: keycode, modifiers: optionMod),
        shiftOption: translate(layoutPtr, keycode: keycode, modifiers: shiftMod | optionMod)
      )
    }
    return FullLayoutResult(layoutName: name, layoutId: id, keys: keys)
  }
}

/// Returns the character map for whichever keyboard layout is currently
/// selected in macOS right now (works for any language, e.g. Hungarian,
/// German, French, ...).
@raycast func getCurrentLayout() throws -> FullLayoutResult {
  guard let source = TISCopyCurrentKeyboardLayoutInputSource()?.takeRetainedValue() else {
    throw "Could not determine the current keyboard layout."
  }
  let name = stringProperty(source, kTISPropertyLocalizedName)
  let id = stringProperty(source, kTISPropertyInputSourceID)
  return try buildFullLayout(source: source, name: name, id: id)
}

/// Lists every keyboard layout the user currently has enabled in
/// System Settings > Keyboard > Input Sources, so the extension can offer
/// switching between them without leaving Raycast.
@raycast func listEnabledLayouts() throws -> [LayoutResult] {
  let props: [CFString: Any] = [kTISPropertyInputSourceIsEnabled: true]
  guard let list = TISCreateInputSourceList(props as CFDictionary, false)?.takeRetainedValue() as? [TISInputSource]
  else {
    throw "Could not list enabled keyboard layouts."
  }
  return list.compactMap { source in
    let category = stringProperty(source, kTISPropertyInputSourceCategory)
    guard category == (kTISCategoryKeyboardInputSource as String) else { return nil }
    guard TISGetInputSourceProperty(source, kTISPropertyUnicodeKeyLayoutData) != nil else { return nil }
    let name = stringProperty(source, kTISPropertyLocalizedName)
    let id = stringProperty(source, kTISPropertyInputSourceID)
    guard !id.isEmpty else { return nil }
    return LayoutResult(layoutName: name, layoutId: id)
  }
}

/// Returns the character map for a specific layout id (as returned by
/// listEnabledLayouts), so the user can inspect a layout other than the one
/// currently active.
@raycast func getLayoutById(id: String) throws -> FullLayoutResult {
  let props: [CFString: Any] = [kTISPropertyInputSourceID: id]
  guard let list = TISCreateInputSourceList(props as CFDictionary, true)?.takeRetainedValue() as? [TISInputSource],
    let source = list.first
  else {
    throw "Could not find keyboard layout \"\(id)\"."
  }
  let name = stringProperty(source, kTISPropertyLocalizedName)
  return try buildFullLayout(source: source, name: name, id: id)
}

extension String: Swift.Error {}
