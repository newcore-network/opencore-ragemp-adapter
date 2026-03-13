import { injectable } from 'tsyringe'
import { IPedAppearanceClient, type Vector3 as CoreVector3 } from '@open-core/framework'
import { IClientPlatformBridge } from '@open-core/framework/client'

const game: GameMp = mp.game

function toMpVector3(position: CoreVector3): Vector3 {
  return new mp.Vector3(position.x, position.y, position.z)
}

function toCoreVector3(position: IVector3): CoreVector3 {
  return { x: position.x, y: position.y, z: position.z }
}

function tryGetPed(handle: number): PedMpBase | undefined {
  try {
    return mp.players.atHandle(handle) ?? mp.peds.atHandle(handle)
  } catch {
    return undefined
  }
}

function tryGetEntity(handle: number): EntityMp | undefined {
  try {
    return mp.players.atHandle(handle)
  } catch {
    try {
      return mp.vehicles.atHandle(handle)
    } catch {
      try {
        return mp.peds.atHandle(handle)
      } catch {
        try {
          return mp.objects.atHandle(handle)
        } catch {
          return undefined
        }
      }
    }
  }
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

  override getEntityCoords(entity: number): CoreVector3 {
    return toCoreVector3(game.entity.getCoords(entity, true))
  }

  override getWorldPositionOfEntityBone(entity: number, bone: number): CoreVector3 {
    const ped = tryGetPed(entity)
    if (!ped) return this.getEntityCoords(entity)
    return toCoreVector3(ped.getBoneCoords(bone, 0, 0, 0))
  }

  override getGameplayCamCoords(): CoreVector3 { return toCoreVector3(game.cam.getGameplayCoord()) }

  override worldToScreen(position: CoreVector3): { onScreen: boolean; x: number; y: number } {
    const result = game.graphics.getScreenCoordFromWorldCoord(position.x, position.y, position.z)
    return { onScreen: result.result, x: result.screenX, y: result.screenY }
  }

  override isModelInCdimage(hash: number): boolean { return game.streaming.isModelInCdimage(hash) }
  override isModelValid(hash: number): boolean { return game.streaming.isModelValid(hash) }
  override isModelAVehicle(hash: number): boolean { return game.streaming.isModelAVehicle(hash) }
  override isModelAPed(hash: number): boolean { return game.streaming.isModelAPed(hash) }
  override requestModel(hash: number): void { game.streaming.requestModel(hash) }
  override hasModelLoaded(hash: number): boolean { return game.streaming.hasModelLoaded(hash) }
  override setModelAsNoLongerNeeded(hash: number): void { game.streaming.setModelAsNoLongerNeeded(hash) }
  override requestAnimDict(dict: string): void { game.streaming.requestAnimDict(dict) }
  override hasAnimDictLoaded(dict: string): boolean { return game.streaming.hasAnimDictLoaded(dict) }
  override removeAnimDict(dict: string): void { game.streaming.removeAnimDict(dict) }
  override doesEntityExist(entity: number): boolean { return game.entity.doesExist(entity) }
  override setEntityAsMissionEntity(entity: number, mission: boolean, scriptHostObject: boolean): void { game.entity.setAsMissionEntity(entity, mission, scriptHostObject) }
  override setBlockingOfNonTemporaryEvents(ped: number, toggle: boolean): void { game.ped.setBlockingOfNonTemporaryEvents(ped, toggle) }
  override setPedRelationshipGroupHash(ped: number, groupHash: number): void { game.ped.setRelationshipGroupHash(ped, groupHash) }
  override createPed(pedType: number, modelHash: number, position: CoreVector3, heading: number, networked: boolean, scriptHostPed: boolean): number {
    return game.ped.createPed(pedType, modelHash, position.x, position.y, position.z, heading, networked, scriptHostPed)
  }
  override deletePed(ped: number): void { tryGetPed(ped)?.destroy() }
  override createObject(modelHash: number, position: CoreVector3, networked: boolean, dynamic: boolean, _placeOnGround: boolean): number {
    return game.object.createObject(modelHash, position.x, position.y, position.z, networked, false, dynamic)
  }
  override deleteEntity(entity: number): void { tryGetEntity(entity)?.destroy() }
  override attachEntityToEntity(entity: number, target: number, boneIndex: number, offset: CoreVector3, rotation: CoreVector3): void {
    game.entity.attachToEntity(entity, target, boneIndex, offset.x, offset.y, offset.z, rotation.x, rotation.y, rotation.z, false, false, false, false, 0, true)
  }
  override getPedBoneIndex(ped: number, bone: number): number { return game.ped.getBoneIndex(ped, bone) }
  override taskPlayAnim(ped: number, dict: string, anim: string, blendInSpeed: number, blendOutSpeed: number, duration: number, flags: number, playbackRate: number): void {
    tryGetPed(ped)?.taskPlayAnim(dict, anim, blendInSpeed, blendOutSpeed, duration, flags, playbackRate, false, false, false)
  }
  override stopAnimTask(ped: number, dict: string, anim: string, blendOutSpeed: number): void { tryGetPed(ped)?.stopAnimTask(dict, anim, blendOutSpeed) }
  override clearPedTasks(ped: number): void { tryGetPed(ped)?.clearTasks() }
  override clearPedTasksImmediately(ped: number): void { tryGetPed(ped)?.clearTasksImmediately() }
  override freezeEntityPosition(entity: number, toggle: boolean): void { game.entity.freezePosition(entity, toggle) }
  override setEntityInvincible(entity: number, toggle: boolean): void { game.entity.setInvincible(entity, toggle) }
  override giveWeaponToPed(ped: number, weaponHash: number, ammoCount: number, _hidden: boolean, forceInHand: boolean): void {
    tryGetPed(ped)?.giveWeapon(weaponHash, ammoCount, forceInHand)
  }
  override removeAllPedWeapons(ped: number, _includeCurrentWeapon: boolean): void { tryGetPed(ped)?.removeAllWeapons() }
  override getClosestPed(position: CoreVector3, radius: number): number | null {
    const ped = game.ped.getClosestPed(position.x, position.y, position.z, radius, true, true, true, false, -1)
    return ped !== 0 ? ped : null
  }
  override getNearbyPeds(position: CoreVector3, radius: number, excludeEntity?: number): number[] {
    return mp.peds.toArray().filter((ped) => {
      if (excludeEntity !== undefined && ped.handle === excludeEntity) return false
      const coords = ped.position
      return this.getDistanceBetweenCoords(position, toCoreVector3(coords), true) <= radius
    }).map((ped) => ped.handle)
  }
  override taskLookAtEntity(ped: number, entity: number, duration: number): void { tryGetPed(ped)?.taskLookAt(entity, duration, 2048, 3) }
  override taskLookAtCoord(ped: number, position: CoreVector3, duration: number): void { game.task.lookAtCoord(ped, position.x, position.y, position.z, duration, 2048, 3) }
  override taskGoStraightToCoord(ped: number, position: CoreVector3, speed: number): void { tryGetPed(ped)?.taskGoStraightToCoord(position.x, position.y, position.z, speed, -1, 0, 0) }
  override setPedCombatAttributes(): void { }
  override createVehicle(modelHash: number, position: CoreVector3, heading: number, networked: boolean, scriptHostVehicle: boolean): number {
    return game.vehicle.createVehicle(modelHash, position.x, position.y, position.z, heading, networked, scriptHostVehicle, false)
  }
  override deleteVehicle(vehicle: number): void { tryGetEntity(vehicle)?.destroy() }
  override setVehicleOnGroundProperly(vehicle: number): void { mp.vehicles.atHandle(vehicle).setOnGroundProperly() }
  override getVehicleColours(vehicle: number): [number, number] {
    const colors = game.vehicle.getColours(vehicle)
    return [colors.colorPrimary, colors.colorSecondary]
  }
  override setVehicleColours(vehicle: number, primary: number, secondary: number): void { game.vehicle.setColours(vehicle, primary, secondary) }
  override setVehicleNumberPlateText(vehicle: number, plateText: string): void { game.vehicle.setNumberPlateText(vehicle, plateText) }
  override taskWarpPedIntoVehicle(ped: number, vehicle: number, seatIndex: number): void { game.task.taskEnterVehicle(ped, vehicle, -1, seatIndex, 2, 1, 0) }
  override taskLeaveVehicle(ped: number, vehicle: number, flags: number): void { tryGetPed(ped)?.taskLeaveVehicle(vehicle, flags) }
  override getClosestVehicle(position: CoreVector3, radius: number): number | null {
    const vehicle = game.vehicle.getClosestVehicle(position.x, position.y, position.z, radius, 0, 71)
    return vehicle !== 0 ? vehicle : null
  }
  override isPedInAnyVehicle(ped: number): boolean { return game.ped.isInAnyVehicle(ped, false) }
  override getVehiclePedIsIn(ped: number, lastVehicle: boolean): number | null {
    const vehicle = game.ped.getVehicleIsIn(ped, lastVehicle)
    return vehicle !== 0 ? vehicle : null
  }
  override getPedInVehicleSeat(vehicle: number, seatIndex: number): number | null {
    const ped = game.vehicle.getPedInSeat(vehicle, seatIndex, false)
    return ped !== 0 ? ped : null
  }
  override getEntitySpeed(entity: number): number { return game.entity.getSpeed(entity) }
  override networkGetNetworkIdFromEntity(entity: number): number { return game.network.getNetworkIdFromEntity(entity) }
  override networkDoesEntityExistWithNetworkId(networkId: number): boolean { return game.network.doesEntityExistWithNetworkId(networkId) }
  override networkGetEntityFromNetworkId(networkId: number): number { return game.network.netToEnt(networkId) }
  override getEntityHeading(entity: number): number { return game.entity.getHeading(entity) }
  override getEntityModel(entity: number): number { return game.entity.getModel(entity) }
  override setVehicleModKit(vehicle: number, kit: number): void { game.vehicle.setModKit(vehicle, kit) }
  override setVehicleMod(vehicle: number, modType: number, modIndex: number, customTires: boolean): void { game.vehicle.setMod(vehicle, modType, modIndex, customTires) }
  override toggleVehicleMod(vehicle: number, modType: number, toggle: boolean): void { game.vehicle.toggleMod(vehicle, modType, toggle) }
  override setVehicleWheelType(vehicle: number, wheelType: number): void { game.vehicle.setWheelType(vehicle, wheelType) }
  override setVehicleWindowTint(vehicle: number, tint: number): void { game.vehicle.setWindowTint(vehicle, tint) }
  override setVehicleLivery(vehicle: number, livery: number): void { game.vehicle.setLivery(vehicle, livery) }
  override setVehicleNumberPlateTextIndex(vehicle: number, index: number): void { game.vehicle.setNumberPlateTextIndex(vehicle, index) }
  override setVehicleNeonLightEnabled(vehicle: number, index: number, enabled: boolean): void { game.vehicle.setNeonLightEnabled(vehicle, index, enabled) }
  override setVehicleNeonLightsColour(vehicle: number, r: number, g: number, b: number): void { game.vehicle.setNeonLightsColour(vehicle, r, g, b) }
  override setVehicleExtra(vehicle: number, extraId: number, disable: boolean): void { game.vehicle.setExtra(vehicle, extraId, disable) }
  override getVehicleExtraColours(vehicle: number): [number, number] {
    const colors = game.vehicle.getExtraColours(vehicle)
    return [colors.pearlescentColor, colors.wheelColor]
  }
  override setVehicleExtraColours(vehicle: number, pearl: number, wheel: number): void { game.vehicle.setExtraColours(vehicle, pearl, wheel) }
  override setVehicleFixed(vehicle: number): void { game.vehicle.setFixed(vehicle) }
  override setVehicleDeformationFixed(vehicle: number): void { game.vehicle.setDeformationFixed(vehicle) }
  override setVehicleUndriveable(vehicle: number, toggle: boolean): void { game.vehicle.setUndriveable(vehicle, toggle) }
  override setVehicleEngineOn(vehicle: number, value: boolean, instantly: boolean, disableAutoStart: boolean): void { game.vehicle.setEngineOn(vehicle, value, instantly, disableAutoStart) }
  override setVehicleEngineHealth(vehicle: number, health: number): void { game.vehicle.setEngineHealth(vehicle, health) }
  override setVehiclePetrolTankHealth(vehicle: number, health: number): void { game.vehicle.setPetrolTankHealth(vehicle, health) }
  override setVehicleFuelLevel(_vehicle: number, _level: number): void { }
  override getVehicleFuelLevel(_vehicle: number): number { return 0 }
  override setVehicleDoorsLocked(vehicle: number, doorLockStatus: number): void { game.vehicle.setDoorsLocked(vehicle, doorLockStatus) }
  override setEntityHeading(entity: number, heading: number): void { game.entity.setHeading(entity, heading) }
  override setEntityCoords(entity: number, position: CoreVector3): void { game.entity.setCoords(entity, position.x, position.y, position.z, false, false, false, true) }
  override setEntityCoordsNoOffset(entity: number, position: CoreVector3): void { game.entity.setCoordsNoOffset(entity, position.x, position.y, position.z, false, false, false) }
  override setEntityHealth(entity: number, health: number): void { game.entity.setHealth(entity, health, 0) }
  override getEntityMaxHealth(entity: number): number { return game.entity.getMaxHealth(entity) }
  override setPedArmour(ped: number, armour: number): void { game.ped.setArmour(ped, armour) }
  override networkIsSessionStarted(): boolean { return true }
  override networkResurrectLocalPlayer(position: CoreVector3, heading: number): void {
    mp.players.local.position = toMpVector3(position)
    mp.players.local.heading = heading
  }
  override playerId(): number { return 0 }
  override setPlayerModel(_playerId: number, modelHash: number): void { game.player.setModel(modelHash) }
  override requestCollisionAtCoord(position: CoreVector3): void { game.streaming.requestCollisionAtCoord(position.x, position.y, position.z) }
  override hasCollisionLoadedAroundEntity(_entity: number): boolean { return true }
  override resetEntityAlpha(entity: number): void { tryGetEntity(entity)?.resetAlpha() }
  override setEntityAlpha(entity: number, alphaLevel: number): void { tryGetEntity(entity)?.setAlpha(alphaLevel) }
  override setEntityVisible(entity: number, toggle: boolean): void { game.entity.setVisible(entity, toggle, false) }
  override setEntityCollision(entity: number, toggle: boolean): void { game.entity.setCollision(entity, toggle, true) }
  override getVehicleNumberPlateText(vehicle: number): string { return game.vehicle.getNumberPlateText(vehicle) }
  override requestScriptAudioBank(_bank: string, _networked: boolean): boolean { return false }
}
