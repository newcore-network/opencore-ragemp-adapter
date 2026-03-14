import { inject, injectable } from 'tsyringe'
import { IVehicleServer } from '@open-core/framework/contracts/server'
import { IVehicleLifecycleServer } from '@open-core/framework/contracts/server'
import type {
  CreateVehicleServerRequest,
  CreateVehicleServerResult,
  WarpPlayerIntoVehicleRequest,
} from '@open-core/framework/contracts/server'

@injectable()
export class RageMPVehicleLifecycleServer extends IVehicleLifecycleServer {
  private toRageMPSeatIndex(seatIndex: number): number {
    return seatIndex < 0 ? 0 : seatIndex + 1
  }

  constructor(@inject(IVehicleServer as any) private readonly vehicleServer: IVehicleServer) {
    super()
  }

  create(request: CreateVehicleServerRequest): CreateVehicleServerResult {
    const handle = this.vehicleServer.createServerSetter(
      request.modelHash,
      'automobile',
      request.position.x,
      request.position.y,
      request.position.z,
      request.heading,
    )

    if (!Number.isFinite(handle) || handle < 0) {
      throw new Error('Failed to create vehicle entity')
    }

    return {
      handle,
      networkId: this.vehicleServer.getNetworkIdFromEntity(handle),
    }
  }

  async warpPlayerIntoVehicle(request: WarpPlayerIntoVehicleRequest): Promise<void> {
    const player = mp.players.at(Number(request.playerSrc))
    const vehicle = mp.vehicles.at(request.networkId)
    const seatIndex = this.toRageMPSeatIndex(request.seatIndex)

    await new Promise<void>((resolve) => setTimeout(resolve, 200))

    try {
      player.putIntoVehicle(vehicle, seatIndex)
    } catch {
      const offset = new mp.Vector3(vehicle.position.x + 1.5, vehicle.position.y, vehicle.position.z)
      player.position = offset
      player.heading = vehicle.heading
    }
  }
}
