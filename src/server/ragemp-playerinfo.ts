import { IPlayerInfo } from '@open-core/framework/contracts/server'
import { Vector3 } from '@open-core/framework/kernel'

export class RageMPPlayerInfo implements IPlayerInfo {
  getPlayerName(clientId: number): string | null {
    const player = mp.players.at(clientId)
    if (!player || !mp.players.exists(player)) return null
    return player.name ?? null
  }

  getPlayerPosition(clientId: number): Vector3 {
    const player = mp.players.at(clientId)
    if (!player || !mp.players.exists(player)) return { x: 0, y: 0, z: 0 }
    const pos = player.position
    return { x: pos.x, y: pos.y, z: pos.z }
  }
}
