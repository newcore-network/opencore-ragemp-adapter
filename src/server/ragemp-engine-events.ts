import {
  DEFAULT_RUNTIME_EVENT_MAP,
  IEngineEvents,
  RUNTIME_EVENTS,
  type RuntimeEventMap,
  type RuntimeEventName,
} from '@open-core/framework/contracts/server'

const EVENT_MAP: RuntimeEventMap = {
  ...DEFAULT_RUNTIME_EVENT_MAP,
  [RUNTIME_EVENTS.playerJoining]: 'playerJoin',
  [RUNTIME_EVENTS.playerDropped]: 'playerQuit',
}

type EngineHandler = (...args: readonly unknown[]) => void

function isPlayerMp(value: unknown): value is PlayerMp {
  return typeof value === 'object' && value !== null && 'id' in value
}

// TODO: Refactor runtime event handling to use a single engine listener per event.
// The listener should forward events to an internal dispatcher/event bus so that
// multiple framework handlers do not register duplicate mp.events listeners.
export class RageMPEngineEvents extends IEngineEvents {
  constructor() {
    super()
    this.onRuntime(RUNTIME_EVENTS.playerCommand, (player: unknown, command: unknown) => {
      if (!isPlayerMp(player) || typeof command !== 'string') return
      const [commandName, ...args] = command.trim().split(/\s+/)
      if (!commandName) return
      this.emit('core:execute-command', player, commandName, args)
    })
  }

  override getRuntimeEventMap(): RuntimeEventMap {
    return EVENT_MAP
  }

  override onRuntime(eventName: RuntimeEventName, handler?: EngineHandler): void {
    if (!handler) return

    const mpEvent = this.getRuntimeEventMap()[eventName] ?? eventName

    mp.events.add(mpEvent, (player: PlayerMp, ...args: unknown[]) => {
      const license = player.rgscId

      if (eventName === RUNTIME_EVENTS.playerJoining) {
        handler(player.id, { license })
        return
      }

      if (eventName === RUNTIME_EVENTS.playerDropped) {
        handler(player.id)
        return
      }

      handler(player, ...args)
    })
  }

  on(eventName: string, handler?: EngineHandler): void {
    if (!handler) return
    mp.events.add(eventName, (...args: unknown[]) => {
      handler(...args)
    })
  }

  emit(eventName: string, ...args: readonly unknown[]): void {
    mp.events.call(eventName, ...args)
  }
}

// In RageMP every package runs as an independent bundle in the same Node.js
// process. Each bundle would instantiate its own RageMPEngineEvents, causing
// listeners like `playerCommand` to be registered multiple times.
// Storing the instance on `global` ensures a single shared instance.

const ENGINE_EVENTS_GLOBAL_KEY = '__opencore_engine_events__'

export function resolveSharedEngineEvents(): RageMPEngineEvents {
  const globalContext = global as Record<string, unknown>
  if (!globalContext[ENGINE_EVENTS_GLOBAL_KEY]) {
    globalContext[ENGINE_EVENTS_GLOBAL_KEY] = new RageMPEngineEvents()
  }
  return globalContext[ENGINE_EVENTS_GLOBAL_KEY] as RageMPEngineEvents
}
