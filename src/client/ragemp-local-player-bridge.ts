import { injectable } from 'tsyringe'
import { IClientLocalPlayerBridge } from '@open-core/framework/contracts/client'
import type { Vector3 } from '@open-core/framework/kernel'

/**
 * RAGE Multiplayer implementation of local player movement helpers.
 */
@injectable()
export class RageMPLocalPlayerBridge extends IClientLocalPlayerBridge {
  getHandle(): number {
    return mp.players.local.handle
  }

  getPosition(): Vector3 {
    const { x, y, z } = mp.players.local.position
    return { x, y, z }
  }

  getHeading(): number {
    return mp.players.local.heading
  }

  setPosition(position: Vector3, heading?: number): void {
    mp.players.local.position = new mp.Vector3(position.x, position.y, position.z)

    if (typeof heading === 'number') {
      mp.players.local.heading = heading
    }
  }
}
