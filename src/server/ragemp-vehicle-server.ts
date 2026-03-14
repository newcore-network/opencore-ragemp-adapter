import { injectable } from 'tsyringe'
import { IVehicleServer } from '@open-core/framework/contracts/server'

/**
 * Rage Multiplayer implementation of server-side vehicle operations.
 */
@injectable()
export class RageMPVehicleServer extends IVehicleServer {
  createServerSetter(
    modelHash: number,
    _vehicleType: string,
    x: number,
    y: number,
    z: number,
    heading: number,
  ): number {
    const vehicle = mp.vehicles.new(modelHash, new mp.Vector3(x, y, z), {
      heading,
    })
    return vehicle.id
  }

  getColours(handle: number): [number, number] {
    const vehicle = mp.vehicles.at(handle)
    return [vehicle.getColor(0), vehicle.getColor(1)]
  }

  setColours(handle: number, primary: number, secondary: number): void {
    mp.vehicles.at(handle).setColor(primary, secondary)
  }

  getNumberPlateText(handle: number): string {
    return mp.vehicles.at(handle).numberPlate
  }

  setNumberPlateText(handle: number, text: string): void {
    mp.vehicles.at(handle).numberPlate = text
  }

  setDoorsLocked(handle: number, state: number): void {
    mp.vehicles.at(handle).locked = state >= 2
  }

  getNetworkIdFromEntity(handle: number): number {
    // This implementation attempts to mimic FiveM behavior in RageMP,
    // but it's not guaranteed to be fully implemented.
    if (!mp.vehicles.exists(handle)) return 0
    return mp.vehicles.at(handle).id
  }

  getEntityFromNetworkId(networkId: number): number {
    // This implementation attempts to mimic FiveM behavior in RageMP,
    // but it's not guaranteed to be fully implemented.
    if (!mp.vehicles.exists(networkId)) return 0
    return mp.vehicles.at(networkId).id
  }

  networkIdExists(networkId: number): boolean {
    return mp.vehicles.exists(networkId)
  }
}
