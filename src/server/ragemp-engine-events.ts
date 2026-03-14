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
