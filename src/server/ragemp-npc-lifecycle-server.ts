import { inject, injectable } from 'tsyringe'
import { IEntityServer, INpcLifecycleServer, IPedServer } from '@open-core/framework/contracts/server'
import type {
  CreateNpcServerRequest,
  CreateNpcServerResult,
  DeleteNpcServerRequest,
} from '@open-core/framework/contracts/server'

@injectable()
export class RageMPNpcLifecycleServer extends INpcLifecycleServer {
  constructor(
    @inject(IPedServer as any) private readonly pedServer: IPedServer,
    @inject(IEntityServer as any) private readonly entityServer: IEntityServer,
  ) {
    super()
  }

  create(request: CreateNpcServerRequest): CreateNpcServerResult {
    const handle = this.pedServer.create(
      4,
      request.modelHash,
      request.position.x,
      request.position.y,
      request.position.z,
      request.heading,
      request.networked,
    )

    if (!handle || handle <= 0) {
      throw new Error('Failed to create NPC ped entity')
    }

    if (request.routingBucket !== undefined) {
      this.entityServer.setDimension(handle, request.routingBucket)
    }

    if (request.persistent) {
      this.entityServer.setOrphanMode(handle, 2)
    }

    const netId = request.networked ? this.pedServer.getNetworkIdFromEntity(handle) : undefined
    return { handle, netId: netId && netId > 0 ? netId : undefined }
  }

  delete(request: DeleteNpcServerRequest): void {
    if (!this.entityServer.doesExist(request.handle)) return
    this.pedServer.delete(request.handle)
  }
}
