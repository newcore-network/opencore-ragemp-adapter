import { injectable } from 'tsyringe'
import { ITick } from '@open-core/framework/contracts/server'

/**
 * Rage Multiplayer implementation of ITick using native setTick
 */
@injectable()
export class RageMPTick implements ITick {
  setTick(handler: () => void | Promise<void>): void {
    setInterval(() => {
      void handler()
    }, 0)
  }
}
