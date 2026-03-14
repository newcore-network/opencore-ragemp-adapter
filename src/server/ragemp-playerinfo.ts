import { IPlayerInfo } from '@open-core/framework/contracts/server'
import { Vector3 } from '@open-core/framework/kernel'

export class RageMPPlayerInfo implements IPlayerInfo {
  getPlayerName(clientId: number): string | null {
    if (!mp.players.exists(clientId)) return null
    return mp.players.at(clientId).name ?? null
  }

  getPlayerPosition(clientId: number): Vector3 {
    const pos = mp.players.at(clientId).position
    return { x: pos.x, y: pos.y, z: pos.z }
  }
}
