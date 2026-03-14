import { injectable } from 'tsyringe'
import {
  IPlayerLifecycleServer,
  type RespawnPlayerRequest,
  type SpawnPlayerRequest,
  type TeleportPlayerRequest,
} from '@open-core/framework/contracts/server'

@injectable()
export class RageMPPlayerLifecycleServer extends IPlayerLifecycleServer {
  private player(playerSrc: string): PlayerMp {
    return mp.players.at(Number(playerSrc))
  }

  spawn(playerSrc: string, request: SpawnPlayerRequest): void {
    const player = this.player(playerSrc)
    if (request.model) {
      player.model = mp.joaat(request.model)
    }

    player.spawn(new mp.Vector3(request.position.x, request.position.y, request.position.z))
    if (typeof request.heading === 'number') {
      player.heading = request.heading
    }
  }

  teleport(playerSrc: string, request: TeleportPlayerRequest): void {
    const player = this.player(playerSrc)
    player.position = new mp.Vector3(request.position.x, request.position.y, request.position.z)
    if (typeof request.heading === 'number') {
      player.heading = request.heading
    }
  }

  respawn(playerSrc: string, request: RespawnPlayerRequest): void {
    this.spawn(playerSrc, request)
  }
}
