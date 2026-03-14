import type { EventsAPI } from '@open-core/framework'
import type { RGB } from '@open-core/framework'

type NativeChatGlobal = typeof globalThis & {
  __OPENCORE_RAGEMP_NATIVE_CHAT_ENABLED__?: boolean
}

const nativeChatGlobal: NativeChatGlobal = globalThis

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
  mp.gui.chat.activate(true)
  mp.gui.chat.show(true)
  mp.gui.chat.push(`!{${toHex(color)}}${text}`)
}

function formatPayload(payload: ChatMessagePayload): { text: string; color: RGB } {
  const [author, message] = payload.args ?? ['SYSTEM', '']
  return {
    text: author ? `${author}: ${message}` : String(message),
    color: payload.color ?? CHAT_TYPE_COLORS.chat,
  }
}

export function enableRageMPNativeChat(events: EventsAPI<'client'>): void {
  if (nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_ENABLED__) return
  nativeChatGlobal.__OPENCORE_RAGEMP_NATIVE_CHAT_ENABLED__ = true

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
