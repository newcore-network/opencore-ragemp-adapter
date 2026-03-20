import { inject, injectable } from 'tsyringe'
import {
  type ClientVehicleMods,
  type ClientVehicleSpawnOptions,
  IClientLocalPlayerBridge,
  IClientPlatformBridge,
  IClientVehiclePort,
} from '@open-core/framework/contracts/client'
import type { Vector3 } from '@open-core/framework/kernel'

@injectable()
export class RageMPClientVehiclePort extends IClientVehiclePort {
  constructor(
    @inject(IClientPlatformBridge as any) private readonly platform: IClientPlatformBridge,
    @inject(IClientLocalPlayerBridge as any) private readonly localPlayer: IClientLocalPlayerBridge,
  ) {
    super()
  }

  async spawn(options: ClientVehicleSpawnOptions): Promise<number> {
    const {
      model,
      position,
      heading = 0,
      placeOnGround = true,
      warpIntoVehicle = false,
      seatIndex = -1,
      primaryColor,
      secondaryColor,
      plate,
      networked = true,
    } = options

    const modelHash = this.platform.getHashKey(model)
    if (!this.platform.isModelInCdimage(modelHash) || !this.platform.isModelAVehicle(modelHash)) {
      throw new Error(`Invalid vehicle model: ${model}`)
    }

    this.platform.requestModel(modelHash)
    while (!this.platform.hasModelLoaded(modelHash)) {
      await new Promise((r) => setTimeout(r, 0))
    }

    const vehicle = this.platform.createVehicle(modelHash, position, heading, networked, false)
    this.platform.setModelAsNoLongerNeeded(modelHash)
    if (!vehicle || vehicle === 0) throw new Error('Failed to create vehicle')

    if (placeOnGround) this.platform.setVehicleOnGroundProperly(vehicle)
    if (primaryColor !== undefined || secondaryColor !== undefined) {
      const [currentPrimary, currentSecondary] = this.platform.getVehicleColours(vehicle)
      this.platform.setVehicleColours(vehicle, primaryColor ?? currentPrimary, secondaryColor ?? currentSecondary)
    }
    if (plate) this.platform.setVehicleNumberPlateText(vehicle, plate)
    if (warpIntoVehicle) this.warpLocalPlayerInto(vehicle, seatIndex)

    return vehicle
  }

  delete(vehicle: number): void {
    if (!this.exists(vehicle)) return
    this.platform.setEntityAsMissionEntity(vehicle, true, true)
    this.platform.deleteVehicle(vehicle)
  }

  repair(vehicle: number): void {
    if (!this.exists(vehicle)) return
    this.platform.setVehicleFixed(vehicle)
    this.platform.setVehicleDeformationFixed(vehicle)
    this.platform.setVehicleUndriveable(vehicle, false)
    this.platform.setVehicleEngineOn(vehicle, true, true, false)
    this.platform.setVehicleEngineHealth(vehicle, 1000.0)
    this.platform.setVehiclePetrolTankHealth(vehicle, 1000.0)
  }

  setFuel(vehicle: number, level: number): void {
    if (!this.exists(vehicle)) return
    this.platform.setVehicleFuelLevel(vehicle, Math.max(0, Math.min(100, level)))
  }

  getFuel(vehicle: number): number {
    if (!this.exists(vehicle)) return 0
    return this.platform.getVehicleFuelLevel(vehicle)
  }

  getClosest(radius = 10): number | null {
    return this.platform.getClosestVehicle(this.localPlayer.getPosition(), radius)
  }

  isLocalPlayerInVehicle(): boolean {
    return this.platform.isPedInAnyVehicle(this.localPlayer.getHandle())
  }

  getCurrentForLocalPlayer(): number | null {
    const ped = this.localPlayer.getHandle()
    if (!this.platform.isPedInAnyVehicle(ped)) return null
    return this.platform.getVehiclePedIsIn(ped, false)
  }

  getLastForLocalPlayer(): number | null {
    return this.platform.getVehiclePedIsIn(this.localPlayer.getHandle(), true)
  }

  isLocalPlayerDriver(vehicle: number): boolean {
    return this.platform.getPedInVehicleSeat(vehicle, -1) === this.localPlayer.getHandle()
  }

  warpLocalPlayerInto(vehicle: number, seatIndex = -1): void {
    if (!this.exists(vehicle)) return
    this.platform.taskWarpPedIntoVehicle(this.localPlayer.getHandle(), vehicle, seatIndex)
  }

  leaveLocalPlayerVehicle(vehicle: number, flags = 16): void {
    if (!this.exists(vehicle)) return
    this.platform.taskLeaveVehicle(this.localPlayer.getHandle(), vehicle, flags)
  }

  applyMods(vehicle: number, mods: ClientVehicleMods): void {
    if (!this.exists(vehicle)) return
    this.platform.setVehicleModKit(vehicle, 0)
    if (mods.spoiler !== undefined) this.platform.setVehicleMod(vehicle, 0, mods.spoiler, false)
    if (mods.frontBumper !== undefined) this.platform.setVehicleMod(vehicle, 1, mods.frontBumper, false)
    if (mods.rearBumper !== undefined) this.platform.setVehicleMod(vehicle, 2, mods.rearBumper, false)
    if (mods.sideSkirt !== undefined) this.platform.setVehicleMod(vehicle, 3, mods.sideSkirt, false)
    if (mods.exhaust !== undefined) this.platform.setVehicleMod(vehicle, 4, mods.exhaust, false)
    if (mods.frame !== undefined) this.platform.setVehicleMod(vehicle, 5, mods.frame, false)
    if (mods.grille !== undefined) this.platform.setVehicleMod(vehicle, 6, mods.grille, false)
    if (mods.hood !== undefined) this.platform.setVehicleMod(vehicle, 7, mods.hood, false)
    if (mods.fender !== undefined) this.platform.setVehicleMod(vehicle, 8, mods.fender, false)
    if (mods.rightFender !== undefined) this.platform.setVehicleMod(vehicle, 9, mods.rightFender, false)
    if (mods.roof !== undefined) this.platform.setVehicleMod(vehicle, 10, mods.roof, false)
    if (mods.engine !== undefined) this.platform.setVehicleMod(vehicle, 11, mods.engine, false)
    if (mods.brakes !== undefined) this.platform.setVehicleMod(vehicle, 12, mods.brakes, false)
    if (mods.transmission !== undefined) this.platform.setVehicleMod(vehicle, 13, mods.transmission, false)
    if (mods.horns !== undefined) this.platform.setVehicleMod(vehicle, 14, mods.horns, false)
    if (mods.suspension !== undefined) this.platform.setVehicleMod(vehicle, 15, mods.suspension, false)
    if (mods.armor !== undefined) this.platform.setVehicleMod(vehicle, 16, mods.armor, false)
    if (mods.turbo !== undefined) this.platform.toggleVehicleMod(vehicle, 18, mods.turbo)
    if (mods.xenon !== undefined) this.platform.toggleVehicleMod(vehicle, 22, mods.xenon)
    if (mods.wheelType !== undefined) this.platform.setVehicleWheelType(vehicle, mods.wheelType)
    if (mods.wheels !== undefined) this.platform.setVehicleMod(vehicle, 23, mods.wheels, false)
    if (mods.windowTint !== undefined) this.platform.setVehicleWindowTint(vehicle, mods.windowTint)
    if (mods.livery !== undefined) this.platform.setVehicleLivery(vehicle, mods.livery)
    if (mods.plateStyle !== undefined) this.platform.setVehicleNumberPlateTextIndex(vehicle, mods.plateStyle)
    if (mods.neonEnabled !== undefined) {
      this.platform.setVehicleNeonLightEnabled(vehicle, 0, mods.neonEnabled[0])
      this.platform.setVehicleNeonLightEnabled(vehicle, 1, mods.neonEnabled[1])
      this.platform.setVehicleNeonLightEnabled(vehicle, 2, mods.neonEnabled[2])
      this.platform.setVehicleNeonLightEnabled(vehicle, 3, mods.neonEnabled[3])
    }
    if (mods.neonColor !== undefined) {
      this.platform.setVehicleNeonLightsColour(vehicle, mods.neonColor[0], mods.neonColor[1], mods.neonColor[2])
    }
    if (mods.extras) {
      for (const [extraId, enabled] of Object.entries(mods.extras)) {
        this.platform.setVehicleExtra(vehicle, Number(extraId), !enabled)
      }
    }
    if (mods.pearlescentColor !== undefined || mods.wheelColor !== undefined) {
      const [currentPearl, currentWheel] = this.platform.getVehicleExtraColours(vehicle)
      this.platform.setVehicleExtraColours(vehicle, mods.pearlescentColor ?? currentPearl, mods.wheelColor ?? currentWheel)
    }
  }

  setDoorsLocked(vehicle: number, locked: boolean): void {
    if (!this.exists(vehicle)) return
    this.platform.setVehicleDoorsLocked(vehicle, locked ? 2 : 0)
  }

  setEngineRunning(vehicle: number, running: boolean, instant = false): void {
    if (!this.exists(vehicle)) return
    this.platform.setVehicleEngineOn(vehicle, running, instant, true)
  }

  setInvincible(vehicle: number, invincible: boolean): void {
    if (!this.exists(vehicle)) return
    this.platform.setEntityInvincible(vehicle, invincible)
  }

  getSpeed(vehicle: number): number {
    if (!this.exists(vehicle)) return 0
    return this.platform.getEntitySpeed(vehicle)
  }

  setHeading(vehicle: number, heading: number): void {
    if (!this.exists(vehicle)) return
    this.platform.setEntityHeading(vehicle, heading)
  }

  teleport(vehicle: number, position: Vector3, heading?: number): void {
    if (!this.exists(vehicle)) return
    this.platform.setEntityCoords(vehicle, position)
    if (heading !== undefined) this.platform.setEntityHeading(vehicle, heading)
    this.platform.setVehicleOnGroundProperly(vehicle)
  }

  exists(vehicle: number): boolean {
    return this.platform.doesEntityExist(vehicle)
  }

  getNetworkId(vehicle: number): number {
    if (!this.exists(vehicle)) return 0
    return this.platform.networkGetNetworkIdFromEntity(vehicle)
  }

  getFromNetworkId(networkId: number): number {
    if (!this.platform.networkDoesEntityExistWithNetworkId(networkId)) return 0
    return this.platform.networkGetEntityFromNetworkId(networkId)
  }

  getState<T = unknown>(vehicle: number, key: string): T | undefined {
    if (!this.exists(vehicle)) return undefined
    return this.platform.getEntityState<T>(vehicle, key)
  }

  getPosition(vehicle: number): Vector3 | null {
    if (!this.exists(vehicle)) return null
    return this.platform.getEntityCoords(vehicle)
  }

  getHeading(vehicle: number): number {
    if (!this.exists(vehicle)) return 0
    return this.platform.getEntityHeading(vehicle)
  }

  getModel(vehicle: number): number {
    if (!this.exists(vehicle)) return 0
    return this.platform.getEntityModel(vehicle)
  }

  getPlate(vehicle: number): string {
    if (!this.exists(vehicle)) return ''
    return this.platform.getVehicleNumberPlateText(vehicle)
  }
}
