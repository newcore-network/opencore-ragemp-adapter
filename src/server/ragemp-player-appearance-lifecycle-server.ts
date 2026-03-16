import { inject, injectable } from 'tsyringe'
import { EventsAPI } from '@open-core/framework/contracts'
import { Players } from '@open-core/framework/server'
import { IPlayerServer } from '@open-core/framework/contracts/server'
import { IPlayerAppearanceLifecycleServer } from '@open-core/framework/contracts/server'
import type { PlayerAppearance } from '@open-core/framework'

@injectable()
export class RageMPPlayerAppearanceLifecycleServer extends IPlayerAppearanceLifecycleServer {
  constructor(
    @inject(EventsAPI as any) private readonly events: EventsAPI<'server'>,
    @inject(Players as any) private readonly players: Players,
    @inject(IPlayerServer as any) private readonly playerServer: IPlayerServer,
  ) {
    super()
  }

  apply(
    playerSrc: string,
    appearance: PlayerAppearance,
  ): { success: boolean; appearance?: PlayerAppearance; errors?: string[] } {
    const target = this.resolveTarget(playerSrc)
    if (!target) {
      return { success: false, errors: ['Player not found'] }
    }

    if (appearance.model) {
      this.playerServer.setModel(playerSrc, appearance.model)
    }

    this.events.emit('opencore:appearance:apply', target, appearance)
    return { success: true, appearance }
  }

  applyClothing(
    playerSrc: string,
    appearance: Pick<PlayerAppearance, 'components' | 'props'>,
  ): boolean {
    const target = this.resolveTarget(playerSrc)
    if (!target) return false
    this.events.emit('opencore:appearance:apply', target, appearance)
    return true
  }

  reset(playerSrc: string): boolean {
    const target = this.resolveTarget(playerSrc)
    if (!target) return false
    this.events.emit('opencore:appearance:reset', target)
    return true
  }

  private resolveTarget(playerSrc: string) {
    return this.players.getByClient(Number(playerSrc))
  }
}
