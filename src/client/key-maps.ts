/**
 * Maps key names (used in RegisterKeyMapping) to
 * JavaScript key codes accepted by mp.keys.bind.
 */
export const KEYBOARD_KEY_MAP: Readonly<Record<string, number>> = {
  // Letters
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  // Top-row numbers
  '0': 48,
  '1': 49,
  '2': 50,
  '3': 51,
  '4': 52,
  '5': 53,
  '6': 54,
  '7': 55,
  '8': 56,
  '9': 57,
  // Function keys
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  // Navigation
  HOME: 36,
  END: 35,
  INSERT: 45,
  DELETE: 46,
  PRIOR: 33, // Page Up
  NEXT: 34, // Page Down
  // Arrow keys
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  // Modifiers
  SHIFT: 16,
  LSHIFT: 160,
  RSHIFT: 161,
  CONTROL: 17,
  LCONTROL: 162,
  RCONTROL: 163,
  MENU: 18,
  LMENU: 164,
  RMENU: 165, // Alt
  // Special
  BACK: 8, // Backspace
  TAB: 9,
  RETURN: 13, // Enter
  ESCAPE: 27,
  SPACE: 32,
  CAPITAL: 20, // Caps Lock
  // Numpad
  NUMPAD0: 96,
  NUMPAD1: 97,
  NUMPAD2: 98,
  NUMPAD3: 99,
  NUMPAD4: 100,
  NUMPAD5: 101,
  NUMPAD6: 102,
  NUMPAD7: 103,
  NUMPAD8: 104,
  NUMPAD9: 105,
  MULTIPLY: 106,
  ADD: 107,
  SEPARATOR: 108,
  SUBTRACT: 109,
  DECIMAL: 110,
  DIVIDE: 111,
  // OEM / punctuation
  OEM_SEMICOLON: 186,
  OEM_PLUS: 187,
  OEM_COMMA: 188,
  OEM_MINUS: 189,
  OEM_PERIOD: 190,
  OEM_2: 191,
  OEM_3: 192,
  OEM_4: 219,
  OEM_5: 220,
  OEM_6: 221,
  OEM_7: 222,
}

/**
 * Maps FiveM mouse button names to JavaScript key codes accepted by mp.keys.bind.
 */
export const MOUSE_KEY_MAP: Readonly<Record<string, number>> = {
  MOUSE_LEFT: 1,
  MOUSE_RIGHT: 2,
  MOUSE_MIDDLE: 4,
  MOUSE_4: 5,
  MOUSE_5: 6,
}
