import { IEngineEvents } from '@open-core/framework'

const EVENT_MAP: Record<string, string> = {
  playerJoining: 'playerJoin',
  playerDropped: 'playerQuit',
}

export class RageMPEngineEvents extends IEngineEvents {
  constructor() {
    super()
    this.on('playerCommand', (player: PlayerMp, command: string) => {
      const [commandName, ...args] = command.trim().split(/\s+/)
      if (!commandName) return
      this.emit('core:execute-command', player, commandName, args)
    })
  }

  on(eventName: string, handler?: (...args: any[]) => void): void {
    if (!handler) return

    const mpEvent = EVENT_MAP[eventName] ?? eventName

    mp.events.add(mpEvent, (player: PlayerMp, ...args: any[]) => {
      const license = player.rgscId

      if (eventName === 'playerJoining') {
        handler(player.id, { license })
        return
      }

      if (eventName === 'playerDropped') {
        handler(player.id)
        return
      }

      handler(player, ...args)
    })
  }

  emit(eventName: string, ...args: any[]): void {
    mp.events.call(eventName, ...args)
  }
}
