import { injectable } from 'tsyringe'
import { IClientLocalPlayerBridge } from '@open-core/framework/client'
import { Vector3 } from '@open-core/framework'

/**
 * RAGE Multiplayer implementation of local player movement helpers.
 */
@injectable()
export class RageMPLocalPlayerBridge extends IClientLocalPlayerBridge {
  setPosition(position: Vector3, heading?: number): void {
    mp.players.local.position = new mp.Vector3(position.x, position.y, position.z)

    if (typeof heading === 'number') {
      mp.players.local.heading = heading
    }
  }
}
