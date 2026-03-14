import { injectable } from 'tsyringe'
import { IPedServer } from '@open-core/framework/contracts/server'

@injectable()
export class RageMPPedServer extends IPedServer {
  create(
    _pedType: number,
    modelHash: number,
    x: number,
    y: number,
    z: number,
    heading: number,
    _networked: boolean,
  ): number {
    const ped = mp.peds.new(modelHash, new mp.Vector3(x, y, z), { heading })
    return ped.id
  }

  delete(handle: number): void {
    mp.peds.at(handle).destroy()
  }

  getNetworkIdFromEntity(handle: number): number {
    if (!mp.peds.exists(handle)) return 0
    return mp.peds.at(handle).id
  }

  getEntityFromNetworkId(networkId: number): number {
    if (!mp.peds.exists(networkId)) return 0
    return mp.peds.at(networkId).id
  }

  networkIdExists(networkId: number): boolean {
    return mp.peds.exists(networkId)
  }
}
