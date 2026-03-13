import {
  DEFAULT_RUNTIME_EVENT_MAP,
  IEngineEvents,
  RUNTIME_EVENTS,
  type RuntimeEventMap,
  type RuntimeEventName,
} from '@open-core/framework'

const EVENT_MAP: RuntimeEventMap = {
  ...DEFAULT_RUNTIME_EVENT_MAP,
  [RUNTIME_EVENTS.playerJoining]: 'playerJoin',
  [RUNTIME_EVENTS.playerDropped]: 'playerQuit',
}

export class RageMPEngineEvents extends IEngineEvents {
  constructor() {
    super()
    this.onRuntime(RUNTIME_EVENTS.playerCommand, (player: PlayerMp, command: string) => {
      const [commandName, ...args] = command.trim().split(/\s+/)
      if (!commandName) return
      this.emit('core:execute-command', player, commandName, args)
    })
  }

  override getRuntimeEventMap(): RuntimeEventMap {
    return EVENT_MAP
  }

  override onRuntime(eventName: RuntimeEventName, handler?: (...args: any[]) => void): void {
    if (!handler) return

    const mpEvent = this.getRuntimeEventMap()[eventName] ?? eventName

    mp.events.add(mpEvent, (player: PlayerMp, ...args: any[]) => {
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

  on(eventName: string, handler?: (...args: any[]) => void): void {
    if (!handler) return
    mp.events.add(eventName, (...args: any[]) => {
      handler(...args)
    })
  }

  emit(eventName: string, ...args: any[]): void {
    mp.events.call(eventName, ...args)
  }
}
