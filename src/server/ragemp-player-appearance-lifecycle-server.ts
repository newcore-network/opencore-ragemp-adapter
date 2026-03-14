import { inject, injectable } from 'tsyringe'
import { EventsAPI } from '@open-core/framework/contracts'
import { IPlayerAppearanceLifecycleServer } from '@open-core/framework/contracts/server'
import type { PlayerAppearance } from '@open-core/framework'

@injectable()
export class RageMPPlayerAppearanceLifecycleServer extends IPlayerAppearanceLifecycleServer {
  constructor(@inject(EventsAPI as any) private readonly events: EventsAPI<'server'>) {
    super()
  }

  apply(
    playerSrc: string,
    appearance: PlayerAppearance,
  ): { success: boolean; appearance?: PlayerAppearance; errors?: string[] } {
    this.events.emit('opencore:appearance:apply', Number(playerSrc), appearance)
    return { success: true, appearance }
  }

  applyClothing(
    playerSrc: string,
    appearance: Pick<PlayerAppearance, 'components' | 'props'>,
  ): boolean {
    this.events.emit('opencore:appearance:apply', Number(playerSrc), appearance)
    return true
  }

  reset(playerSrc: string): boolean {
    this.events.emit('opencore:appearance:reset', Number(playerSrc))
    return true
  }
}
