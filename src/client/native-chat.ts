import type { EventsAPI } from '@open-core/framework/contracts'
import type { RGB } from '@open-core/framework/kernel'

type NativeChatGlobal = typeof globalThis & {
  __OPENCORE_RAGEMP_NATIVE_CHAT_ENABLED__?: boolean
  __OPENCORE_RAGEMP_NATIVE_CHAT_VISIBLE__?: boolean
  __OPENCORE_RAGEMP_NATIVE_CHAT_SUPPRESSORS__?: Set<string>
}

const nativeChatGlobal: NativeChatGlobal = globalThis

function getSuppressors(): Set<string> {
  if (!nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_SUPPRESSORS__) {
    nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_SUPPRESSORS__ = new Set<string>()
  }

  return nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_SUPPRESSORS__
}

interface ChatMessagePayload {
  args?: readonly [string, string] | readonly string[]
  color?: RGB
}

const CHAT_TYPE_COLORS: Record<'chat' | 'error' | 'success' | 'warning', RGB> = {
  chat: { r: 255, g: 255, b: 255 },
  error: { r: 224, g: 62, b: 62 },
  success: { r: 88, g: 196, b: 110 },
  warning: { r: 232, g: 181, b: 55 },
}

function toHex(color: RGB): string {
  const part = (value: number) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0')
  return `${part(color.r)}${part(color.g)}${part(color.b)}`
}

function pushNativeChatLine(text: string, color: RGB): void {
  if (nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_VISIBLE__ === false) {
    return
  }

  try {
    mp.gui.chat.push(`!{${toHex(color)}}${text}`)
  } catch {
    // Ignore chat output when RageMP chat runtime is not ready yet.
  }
}

function setNativeChatVisible(visible: boolean): void {
  nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_VISIBLE__ = visible

  try {
    mp.gui.chat.activate(false)
    mp.gui.chat.show(visible)
  } catch {
    // Ignore when the chat runtime is not ready yet.
  }
}

function syncNativeChatVisibility(): void {
  setNativeChatVisible(getSuppressors().size === 0)
}

function formatPayload(payload: ChatMessagePayload): { text: string; color: RGB } {
  const [author, message] = payload.args ?? ['SYSTEM', '']
  return {
    text: author ? `${author}: ${message}` : String(message),
    color: payload.color ?? CHAT_TYPE_COLORS.chat,
  }
}

/**
 * Optional native RageMP chat bridge.
 *
 * This is intentionally opt-in. Resources using a WebView chat should not
 * enable it, otherwise the native chat UI can interfere with the custom one.
 */
export function enableRageMPNativeChat(events: EventsAPI<'client'>): void {
  if (nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_ENABLED__) return
  nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_ENABLED__ = true
  if (nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_VISIBLE__ === undefined) {
    nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_VISIBLE__ = true
  }

  events.on('core:chat:addMessage', (_ctx, payload: ChatMessagePayload) => {
    const { text, color } = formatPayload(payload)
    pushNativeChatLine(text, color)
  })

  events.on('core:chat:message', (_ctx, payload: ChatMessagePayload) => {
    const { text, color } = formatPayload(payload)
    pushNativeChatLine(text, color)
  })

  events.on(
    'core:chat:send',
    (_ctx, message: string, type: 'chat' | 'error' | 'success' | 'warning' = 'chat') => {
      pushNativeChatLine(message, CHAT_TYPE_COLORS[type] ?? CHAT_TYPE_COLORS.chat)
    },
  )

  events.on('core:chat:clear', () => {
    // RageMP native chat has no public clear API.
  })
}

export function disableRageMPNativeChatUi(): void {
  getSuppressors().add('__manual__')
  syncNativeChatVisibility()
}

export function enableRageMPNativeChatUi(): void {
  getSuppressors().delete('__manual__')
  syncNativeChatVisibility()
}

export function suppressRageMPNativeChat(source: string): void {
  getSuppressors().add(source)
  syncNativeChatVisibility()
}

export function releaseRageMPNativeChat(source: string): void {
  getSuppressors().delete(source)
  syncNativeChatVisibility()
}

if (typeof mp !== 'undefined') {
  mp.events.add('render', () => {
    if (nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_VISIBLE__ === false) {
      try {
        mp.gui.chat.activate(false)
        mp.gui.chat.show(false)
      } catch {
        // Ignore while chat runtime is unavailable.
      }
    }
  })
}
