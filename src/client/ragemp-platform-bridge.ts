import { injectable } from 'tsyringe'
import { IPedAppearanceClient } from '@open-core/framework'
import { IClientPlatformBridge } from '@open-core/framework/client'
import type { Vector3 } from '@open-core/framework'

const game = () => (mp as any).game as any

function toMpVector3(position: Vector3): any {
  return new mp.Vector3(position.x, position.y, position.z)
}

@injectable()
export class RageMPPedAppearanceClient extends IPedAppearanceClient {
  setComponentVariation(): void { }
  setPropIndex(): void { }
  clearProp(): void { }
  setDefaultComponentVariation(): void { }
  setHeadBlendData(): void { }
  setFaceFeature(): void { }
  setHeadOverlay(): void { }
  setHeadOverlayColor(): void { }
  setHairColor(): void { }
  setEyeColor(): void { }
  addDecoration(): void { }
  clearDecorations(): void { }
  getDrawableVariation(): number { return 0 }
  getTextureVariation(): number { return 0 }
  getPropIndex(): number { return -1 }
  getPropTextureIndex(): number { return 0 }
  getNumDrawableVariations(): number { return 0 }
  getNumTextureVariations(): number { return 0 }
  getNumPropDrawableVariations(): number { return 0 }
  getNumPropTextureVariations(): number { return 0 }
  getNumOverlayValues(): number { return 0 }
  getNumHairColors(): number { return 0 }
  getNumMakeupColors(): number { return 0 }
}

@injectable()
export class RageMPPlatformBridge extends IClientPlatformBridge {
  override getLocalPlayerPed(): number {
    return mp.players.local.handle ?? 0
  }

  override getEntityCoords(entity: number): Vector3 {
    const coords = game().entity.getEntityCoords(entity, true)
    return { x: coords.x, y: coords.y, z: coords.z }
  }

  override getGameplayCamCoords(): Vector3 {
    const coords = game().cam.getGameplayCamCoord()
    return { x: coords.x, y: coords.y, z: coords.z }
  }

  override worldToScreen(position: Vector3): { onScreen: boolean; x: number; y: number } {
    const result = game().graphics.world3dToScreen2d(position.x, position.y, position.z)
    return { onScreen: Array.isArray(result) ? !!result[0] : false, x: result?.[1] ?? 0, y: result?.[2] ?? 0 }
  }

  override isModelInCdimage(hash: number): boolean {
    return game().streaming.isModelInCdimage(hash)
  }

  override isModelValid(hash: number): boolean {
    return game().streaming.isModelValid(hash)
  }

  override isModelAVehicle(hash: number): boolean {
    return game().vehicle.isThisModelAVehicle(hash)
  }

  override isModelAPed(hash: number): boolean {
    return game().ped.isModelAPed(hash)
  }

  override requestModel(hash: number): void {
    game().streaming.requestModel(hash)
  }

  override hasModelLoaded(hash: number): boolean {
    return game().streaming.hasModelLoaded(hash)
  }

  override setModelAsNoLongerNeeded(hash: number): void {
    game().streaming.setModelAsNoLongerNeeded(hash)
  }

  override requestAnimDict(dict: string): void {
    game().streaming.requestAnimDict(dict)
  }

  override hasAnimDictLoaded(dict: string): boolean {
    return game().streaming.hasAnimDictLoaded(dict)
  }

  override removeAnimDict(dict: string): void {
    game().streaming.removeAnimDict(dict)
  }

  override doesEntityExist(entity: number): boolean {
    return game().entity.doesEntityExist(entity)
  }

  override setEntityAsMissionEntity(entity: number, mission: boolean, scriptHostObject: boolean): void {
    game().entity.setEntityAsMissionEntity(entity, mission, scriptHostObject)
  }

  override clearPedTasksImmediately(ped: number): void {
    game().ai.clearPedTasksImmediately(ped)
  }

  override removeAllPedWeapons(ped: number, includeCurrentWeapon: boolean): void {
    game().weapon.removeAllPedWeapons(ped, includeCurrentWeapon)
  }

  override resetEntityAlpha(entity: number): void {
    game().entity.resetEntityAlpha(entity)
  }

  override setEntityAlpha(entity: number, alphaLevel: number): void {
    game().entity.setEntityAlpha(entity, alphaLevel, false)
  }

  override setEntityVisible(entity: number, toggle: boolean): void {
    game().entity.setEntityVisible(entity, toggle, false)
  }

  override setEntityCollision(entity: number, toggle: boolean): void {
    game().entity.setEntityCollision(entity, toggle, true)
  }

  override setEntityInvincible(entity: number, toggle: boolean): void {
    game().entity.setEntityInvincible(entity, toggle)
  }

  override freezeEntityPosition(entity: number, toggle: boolean): void {
    game().entity.freezeEntityPosition(entity, toggle)
  }

  override setEntityCoordsNoOffset(entity: number, position: Vector3): void {
    game().entity.setEntityCoordsNoOffset(entity, position.x, position.y, position.z, false, false, false)
  }

  override setEntityCoords(entity: number, position: Vector3): void {
    game().entity.setEntityCoords(entity, position.x, position.y, position.z, false, false, false, true)
  }

  override setEntityHeading(entity: number, heading: number): void {
    game().entity.setEntityHeading(entity, heading)
  }

  override setEntityHealth(entity: number, health: number): void {
    game().entity.setEntityHealth(entity, health, 0)
  }

  override getEntityMaxHealth(entity: number): number {
    return game().entity.getEntityMaxHealth(entity)
  }

  override networkIsSessionStarted(): boolean {
    return true
  }

  override networkResurrectLocalPlayer(position: Vector3, heading: number): void {
    mp.players.local.position = toMpVector3(position)
    mp.players.local.heading = heading
  }

  override playerId(): number {
    return 0
  }

  override setPlayerModel(_playerId: number, modelHash: number): void {
    mp.players.local.model = modelHash
  }

  override requestCollisionAtCoord(_position: Vector3): void { }

  override hasCollisionLoadedAroundEntity(_entity: number): boolean {
    return true
  }

  override createVehicle(modelHash: number, position: Vector3, heading: number, networked: boolean, scriptHostVehicle: boolean): number {
    return game().vehicle.createVehicle(modelHash, position.x, position.y, position.z, heading, networked, scriptHostVehicle)
  }

  override deleteVehicle(vehicle: number): void {
    game().vehicle.deleteVehicle(vehicle)
  }

  override getClosestVehicle(position: Vector3, radius: number): number | null {
    const vehicle = game().vehicle.getClosestVehicle(position.x, position.y, position.z, radius, 0, 71)
    return vehicle !== 0 ? vehicle : null
  }

  override isPedInAnyVehicle(ped: number): boolean {
    return game().ped.isPedInAnyVehicle(ped, false)
  }

  override getVehiclePedIsIn(ped: number, lastVehicle: boolean): number | null {
    const vehicle = game().vehicle.getVehiclePedIsIn(ped, lastVehicle)
    return vehicle !== 0 ? vehicle : null
  }

  override getPedInVehicleSeat(vehicle: number, seatIndex: number): number | null {
    const ped = game().vehicle.getPedInVehicleSeat(vehicle, seatIndex, false)
    return ped !== 0 ? ped : null
  }

  override getEntitySpeed(entity: number): number {
    return game().entity.getEntitySpeed(entity)
  }

  override networkGetNetworkIdFromEntity(entity: number): number {
    return game().network.networkGetNetworkIdFromEntity(entity)
  }

  override networkDoesEntityExistWithNetworkId(networkId: number): boolean {
    return game().network.networkDoesEntityExistWithNetworkId(networkId)
  }

  override networkGetEntityFromNetworkId(networkId: number): number {
    return game().network.networkGetEntityFromNetworkId(networkId)
  }

  override getEntityHeading(entity: number): number {
    return game().entity.getEntityHeading(entity)
  }

  override getEntityModel(entity: number): number {
    return game().entity.getEntityModel(entity)
  }

  override taskWarpPedIntoVehicle(ped: number, vehicle: number, seatIndex: number): void {
    game().ai.taskWarpPedIntoVehicle(ped, vehicle, seatIndex)
  }

  override taskLeaveVehicle(ped: number, vehicle: number, flags: number): void {
    game().ai.taskLeaveVehicle(ped, vehicle, flags)
  }

  override setVehicleOnGroundProperly(vehicle: number): void {
    game().vehicle.setVehicleOnGroundProperly(vehicle)
  }

  override getVehicleColours(vehicle: number): [number, number] {
    return game().vehicle.getVehicleColours(vehicle)
  }

  override setVehicleColours(vehicle: number, primary: number, secondary: number): void {
    game().vehicle.setVehicleColours(vehicle, primary, secondary)
  }

  override setVehicleNumberPlateText(vehicle: number, plateText: string): void {
    game().vehicle.setVehicleNumberPlateText(vehicle, plateText)
  }

  override setVehicleModKit(vehicle: number, kit: number): void { game().vehicle.setVehicleModKit(vehicle, kit) }
  override setVehicleMod(vehicle: number, modType: number, modIndex: number, customTires: boolean): void { game().vehicle.setVehicleMod(vehicle, modType, modIndex, customTires) }
  override toggleVehicleMod(vehicle: number, modType: number, toggle: boolean): void { game().vehicle.toggleVehicleMod(vehicle, modType, toggle) }
  override setVehicleWheelType(vehicle: number, wheelType: number): void { game().vehicle.setVehicleWheelType(vehicle, wheelType) }
  override setVehicleWindowTint(vehicle: number, tint: number): void { game().vehicle.setVehicleWindowTint(vehicle, tint) }
  override setVehicleLivery(vehicle: number, livery: number): void { game().vehicle.setVehicleLivery(vehicle, livery) }
  override setVehicleNumberPlateTextIndex(vehicle: number, index: number): void { game().vehicle.setVehicleNumberPlateTextIndex(vehicle, index) }
  override setVehicleNeonLightEnabled(vehicle: number, index: number, enabled: boolean): void { game().vehicle.setVehicleNeonLightEnabled(vehicle, index, enabled) }
  override setVehicleNeonLightsColour(vehicle: number, r: number, g: number, b: number): void { game().vehicle.setVehicleNeonLightsColour(vehicle, r, g, b) }
  override setVehicleExtra(vehicle: number, extraId: number, disable: boolean): void { game().vehicle.setVehicleExtra(vehicle, extraId, disable) }
  override getVehicleExtraColours(vehicle: number): [number, number] { return game().vehicle.getVehicleExtraColours(vehicle) }
  override setVehicleExtraColours(vehicle: number, pearl: number, wheel: number): void { game().vehicle.setVehicleExtraColours(vehicle, pearl, wheel) }
  override setVehicleFixed(vehicle: number): void { game().vehicle.setVehicleFixed(vehicle) }
  override setVehicleDeformationFixed(vehicle: number): void { game().vehicle.setVehicleDeformationFixed(vehicle) }
  override setVehicleUndriveable(vehicle: number, toggle: boolean): void { game().vehicle.setVehicleUndriveable(vehicle, toggle) }
  override setVehicleEngineOn(vehicle: number, value: boolean, instantly: boolean, disableAutoStart: boolean): void { game().vehicle.setVehicleEngineOn(vehicle, value, instantly, disableAutoStart) }
  override setVehicleEngineHealth(vehicle: number, health: number): void { game().vehicle.setVehicleEngineHealth(vehicle, health) }
  override setVehiclePetrolTankHealth(vehicle: number, health: number): void { game().vehicle.setVehiclePetrolTankHealth(vehicle, health) }
  override setVehicleFuelLevel(vehicle: number, level: number): void { game().vehicle.setVehicleFuelLevel(vehicle, level) }
  override getVehicleFuelLevel(vehicle: number): number { return game().vehicle.getVehicleFuelLevel(vehicle) }
  override setVehicleDoorsLocked(vehicle: number, doorLockStatus: number): void { game().vehicle.setVehicleDoorsLocked(vehicle, doorLockStatus) }
  override getVehicleNumberPlateText(vehicle: number): string { return game().vehicle.getVehicleNumberPlateText(vehicle) }

  override requestScriptAudioBank(_bank: string, _networked: boolean): boolean { return false }
}
