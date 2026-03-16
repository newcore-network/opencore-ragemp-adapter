import { injectable } from 'tsyringe'
import { IClientPlatformBridge, IGtaPedAppearanceBridge } from '@open-core/framework/contracts/client'
import type { Vector3 as CoreVector3 } from '@open-core/framework/kernel'
import type { HeadBlendData } from '@open-core/framework/kernel'
import { loggers } from '@open-core/framework/kernel'

function getMp(): Mp {
  return mp
}

function getGame(): GameMp {
  return mp.game
}

function toMpVector3(position: CoreVector3): Vector3 {
  return new (getMp().Vector3)(position.x, position.y, position.z)
}

function toCoreVector3(position: IVector3): CoreVector3 {
  return { x: position.x, y: position.y, z: position.z }
}

function tryGetPed(handle: number): PedMpBase | undefined {
  const runtime = getMp()
  try {
    return runtime.players.atHandle(handle) ?? runtime.peds.atHandle(handle)
  } catch {
    return undefined
  }
}

function tryGetEntity(handle: number): EntityMp | undefined {
  const runtime = getMp()
  try {
    return runtime.players.atHandle(handle)
  } catch {
    try {
      return runtime.vehicles.atHandle(handle)
    } catch {
      try {
        return runtime.peds.atHandle(handle)
      } catch {
        try {
          return runtime.objects.atHandle(handle)
        } catch {
          return undefined
        }
      }
    }
  }
}

@injectable()
export class RageMPPedAppearanceClient extends IGtaPedAppearanceBridge {
  setComponentVariation(ped: number, componentId: number, drawableId: number, textureId: number): void {
    getGame().ped.setComponentVariation(ped, componentId, drawableId, textureId, 0)
  }

  setPropIndex(ped: number, propId: number, drawableId: number, textureId: number): void {
    getGame().ped.setPropIndex(ped, propId, drawableId, textureId, true)
  }

  clearProp(ped: number, propId: number): void {
    getGame().ped.clearProp(ped, propId)
  }

  setDefaultComponentVariation(ped: number): void {
    getGame().ped.setDefaultComponentVariation(ped)
  }

  setHeadBlendData(
    ped: number,
    data: HeadBlendData,
  ): void {
    getGame().ped.setHeadBlendData(
      ped,
      data.shapeFirst,
      data.shapeSecond,
      data.shapeThird ?? 0,
      data.skinFirst,
      data.skinSecond,
      data.skinThird ?? 0,
      data.shapeMix,
      data.skinMix,
      data.thirdMix ?? 0,
      false,
    )
  }

  setFaceFeature(ped: number, index: number, scale: number): void {
    getGame().ped.setFaceFeature(ped, index, scale)
  }

  setHeadOverlay(ped: number, overlayId: number, index: number, opacity: number): void {
    getGame().ped.setHeadOverlay(ped, overlayId, index, opacity)
  }

  setHeadOverlayColor(
    ped: number,
    overlayId: number,
    colorType: number,
    colorId: number,
    secondColorId: number,
  ): void {
    getGame().ped.setHeadOverlayColor(ped, overlayId, colorType, colorId, secondColorId)
  }

  setHairColor(ped: number, colorId: number, highlightColorId: number): void {
    getGame().ped.setHairColor(ped, colorId, highlightColorId)
  }

  setEyeColor(ped: number, colorId: number): void {
    getGame().ped.setEyeColor(ped, colorId)
  }

  addDecoration(ped: number, collectionHash: number, overlayHash: number): void {
    getGame().ped.addDecorationFromHashes(ped, collectionHash, overlayHash)
  }

  clearDecorations(ped: number): void {
    getGame().ped.clearDecorations(ped)
  }

  getDrawableVariation(ped: number, componentId: number): number {
    return getGame().ped.getDrawableVariation(ped, componentId)
  }

  getTextureVariation(ped: number, componentId: number): number {
    return getGame().ped.getTextureVariation(ped, componentId)
  }

  getPropIndex(ped: number, propId: number): number {
    return getGame().ped.getPropIndex(ped, propId)
  }

  getPropTextureIndex(ped: number, propId: number): number {
    return getGame().ped.getPropTextureIndex(ped, propId)
  }

  getNumDrawableVariations(ped: number, componentId: number): number {
    return getGame().ped.getNumberOfDrawableVariations(ped, componentId)
  }

  getNumTextureVariations(ped: number, componentId: number, drawableId: number): number {
    return getGame().ped.getNumberOfTextureVariations(ped, componentId, drawableId)
  }

  getNumPropDrawableVariations(ped: number, propId: number): number {
    return getGame().ped.getNumberOfPropDrawableVariations(ped, propId)
  }

  getNumPropTextureVariations(ped: number, propId: number, drawableId: number): number {
    return getGame().ped.getNumberOfPropTextureVariations(ped, propId, drawableId)
  }

  getNumOverlayValues(overlayId: number): number {
    return getGame().ped.getNumHeadOverlayValues(overlayId)
  }

  getNumHairColors(): number {
    return getGame().ped.getNumHairColors()
  }

  getNumMakeupColors(): number {
    return getGame().ped.getNumMakeupColors()
  }
}

@injectable()
export class RageMPPlatformBridge extends IClientPlatformBridge {
  private playerReady = false

  constructor() {
    super()

    mp.events.add('playerReady', () => {
      this.playerReady = true
      loggers.spawn.debug('RageMP playerReady fired')
    })
  }

  override getHashKey(value: string): number {
    return getGame().joaat(value)
  }

  override getLocalPlayerPed(): number {
    return getMp().players.local.handle ?? 0
  }

  override getEntityCoords(entity: number): CoreVector3 {
    return toCoreVector3(getGame().entity.getCoords(entity, true))
  }

  override getWorldPositionOfEntityBone(entity: number, bone: number): CoreVector3 {
    const ped = tryGetPed(entity)
    if (!ped) return this.getEntityCoords(entity)
    return toCoreVector3(ped.getBoneCoords(bone, 0, 0, 0))
  }

  override getGameplayCamCoords(): CoreVector3 {
    return toCoreVector3(getGame().cam.getGameplayCoord())
  }

  override worldToScreen(position: CoreVector3): { onScreen: boolean; x: number; y: number } {
    const result = getGame().graphics.getScreenCoordFromWorldCoord(
      position.x,
      position.y,
      position.z,
    )
    return { onScreen: result.result, x: result.screenX, y: result.screenY }
  }

  override isModelInCdimage(hash: number): boolean {
    return getGame().streaming.isModelInCdimage(hash)
  }
  override isModelValid(hash: number): boolean {
    return getGame().streaming.isModelValid(hash)
  }
  override isModelAVehicle(hash: number): boolean {
    return getGame().streaming.isModelAVehicle(hash)
  }
  override isModelAPed(hash: number): boolean {
    return getGame().streaming.isModelAPed(hash)
  }
  override requestModel(hash: number): void {
    getGame().streaming.requestModel(hash)
  }
  override hasModelLoaded(hash: number): boolean {
    return getGame().streaming.hasModelLoaded(hash)
  }
  override setModelAsNoLongerNeeded(hash: number): void {
    getGame().streaming.setModelAsNoLongerNeeded(hash)
  }
  override requestAnimDict(dict: string): void {
    getGame().streaming.requestAnimDict(dict)
  }
  override hasAnimDictLoaded(dict: string): boolean {
    return getGame().streaming.hasAnimDictLoaded(dict)
  }
  override removeAnimDict(dict: string): void {
    getGame().streaming.removeAnimDict(dict)
  }
  override doesEntityExist(entity: number): boolean {
    return getGame().entity.doesExist(entity)
  }
  override setEntityAsMissionEntity(
    entity: number,
    mission: boolean,
    scriptHostObject: boolean,
  ): void {
    getGame().entity.setAsMissionEntity(entity, mission, scriptHostObject)
  }
  override setBlockingOfNonTemporaryEvents(ped: number, toggle: boolean): void {
    getGame().ped.setBlockingOfNonTemporaryEvents(ped, toggle)
  }
  override setPedRelationshipGroupHash(ped: number, groupHash: number): void {
    getGame().ped.setRelationshipGroupHash(ped, groupHash)
  }
  override createPed(
    pedType: number,
    modelHash: number,
    position: CoreVector3,
    heading: number,
    networked: boolean,
    scriptHostPed: boolean,
  ): number {
    return getGame().ped.createPed(
      pedType,
      modelHash,
      position.x,
      position.y,
      position.z,
      heading,
      networked,
      scriptHostPed,
    )
  }
  override deletePed(ped: number): void {
    tryGetPed(ped)?.destroy()
  }
  override createObject(
    modelHash: number,
    position: CoreVector3,
    networked: boolean,
    dynamic: boolean,
    _placeOnGround: boolean,
  ): number {
    return getGame().object.createObject(
      modelHash,
      position.x,
      position.y,
      position.z,
      networked,
      false,
      dynamic,
    )
  }
  override deleteEntity(entity: number): void {
    tryGetEntity(entity)?.destroy()
  }
  override attachEntityToEntity(
    entity: number,
    target: number,
    boneIndex: number,
    offset: CoreVector3,
    rotation: CoreVector3,
  ): void {
    getGame().entity.attachToEntity(
      entity,
      target,
      boneIndex,
      offset.x,
      offset.y,
      offset.z,
      rotation.x,
      rotation.y,
      rotation.z,
      false,
      false,
      false,
      false,
      0,
      true,
    )
  }
  override getPedBoneIndex(ped: number, bone: number): number {
    return getGame().ped.getBoneIndex(ped, bone)
  }
  override taskPlayAnim(
    ped: number,
    dict: string,
    anim: string,
    blendInSpeed: number,
    blendOutSpeed: number,
    duration: number,
    flags: number,
    playbackRate: number,
  ): void {
    tryGetPed(ped)?.taskPlayAnim(
      dict,
      anim,
      blendInSpeed,
      blendOutSpeed,
      duration,
      flags,
      playbackRate,
      false,
      false,
      false,
    )
  }
  override stopAnimTask(ped: number, dict: string, anim: string, blendOutSpeed: number): void {
    tryGetPed(ped)?.stopAnimTask(dict, anim, blendOutSpeed)
  }
  override clearPedTasks(ped: number): void {
    tryGetPed(ped)?.clearTasks()
  }
  override clearPedTasksImmediately(ped: number): void {
    tryGetPed(ped)?.clearTasksImmediately()
  }
  override freezeEntityPosition(entity: number, toggle: boolean): void {
    getGame().entity.freezePosition(entity, toggle)
  }
  override setEntityInvincible(entity: number, toggle: boolean): void {
    getGame().entity.setInvincible(entity, toggle)
  }
  override giveWeaponToPed(
    ped: number,
    weaponHash: number,
    ammoCount: number,
    _hidden: boolean,
    forceInHand: boolean,
  ): void {
    tryGetPed(ped)?.giveWeapon(weaponHash, ammoCount, forceInHand)
  }
  override removeAllPedWeapons(ped: number, _includeCurrentWeapon: boolean): void {
    tryGetPed(ped)?.removeAllWeapons()
  }
  override getClosestPed(position: CoreVector3, radius: number): number | null {
    const ped = getGame().ped.getClosestPed(
      position.x,
      position.y,
      position.z,
      radius,
      true,
      true,
      true,
      false,
      -1,
    )
    return ped !== 0 ? ped : null
  }
  override getNearbyPeds(position: CoreVector3, radius: number, excludeEntity?: number): number[] {
    return getMp()
      .peds.toArray()
      .filter((ped) => {
        if (excludeEntity !== undefined && ped.handle === excludeEntity) return false
        const coords = ped.position
        return this.getDistanceBetweenCoords(position, toCoreVector3(coords), true) <= radius
      })
      .map((ped) => ped.handle)
  }
  override taskLookAtEntity(ped: number, entity: number, duration: number): void {
    tryGetPed(ped)?.taskLookAt(entity, duration, 2048, 3)
  }
  override taskLookAtCoord(ped: number, position: CoreVector3, duration: number): void {
    getGame().task.lookAtCoord(ped, position.x, position.y, position.z, duration, 2048, 3)
  }
  override taskGoStraightToCoord(ped: number, position: CoreVector3, speed: number): void {
    tryGetPed(ped)?.taskGoStraightToCoord(position.x, position.y, position.z, speed, -1, 0, 0)
  }
  override setPedCombatAttributes(): void { }
  override createVehicle(
    modelHash: number,
    position: CoreVector3,
    heading: number,
    networked: boolean,
    scriptHostVehicle: boolean,
  ): number {
    return getGame().vehicle.createVehicle(
      modelHash,
      position.x,
      position.y,
      position.z,
      heading,
      networked,
      scriptHostVehicle,
      false,
    )
  }
  override deleteVehicle(vehicle: number): void {
    tryGetEntity(vehicle)?.destroy()
  }
  override setVehicleOnGroundProperly(vehicle: number): void {
    getMp().vehicles.atHandle(vehicle).setOnGroundProperly()
  }
  override getVehicleColours(vehicle: number): [number, number] {
    const colors = getGame().vehicle.getColours(vehicle)
    return [colors.colorPrimary, colors.colorSecondary]
  }
  override setVehicleColours(vehicle: number, primary: number, secondary: number): void {
    getGame().vehicle.setColours(vehicle, primary, secondary)
  }
  override setVehicleNumberPlateText(vehicle: number, plateText: string): void {
    getGame().vehicle.setNumberPlateText(vehicle, plateText)
  }
  override taskWarpPedIntoVehicle(ped: number, vehicle: number, seatIndex: number): void {
    getGame().task.taskEnterVehicle(ped, vehicle, -1, seatIndex, 2, 1, 0)
  }
  override taskLeaveVehicle(ped: number, vehicle: number, flags: number): void {
    tryGetPed(ped)?.taskLeaveVehicle(vehicle, flags)
  }
  override getClosestVehicle(position: CoreVector3, radius: number): number | null {
    const vehicle = getGame().vehicle.getClosestVehicle(
      position.x,
      position.y,
      position.z,
      radius,
      0,
      71,
    )
    return vehicle !== 0 ? vehicle : null
  }
  override isPedInAnyVehicle(ped: number): boolean {
    return getGame().ped.isInAnyVehicle(ped, false)
  }
  override getVehiclePedIsIn(ped: number, lastVehicle: boolean): number | null {
    const vehicle = getGame().ped.getVehicleIsIn(ped, lastVehicle)
    return vehicle !== 0 ? vehicle : null
  }
  override getPedInVehicleSeat(vehicle: number, seatIndex: number): number | null {
    const ped = getGame().vehicle.getPedInSeat(vehicle, seatIndex, false)
    return ped !== 0 ? ped : null
  }
  override getEntitySpeed(entity: number): number {
    return getGame().entity.getSpeed(entity)
  }
  override networkGetNetworkIdFromEntity(entity: number): number {
    return getGame().network.getNetworkIdFromEntity(entity)
  }
  override networkDoesEntityExistWithNetworkId(networkId: number): boolean {
    return getGame().network.doesEntityExistWithNetworkId(networkId)
  }
  override networkGetEntityFromNetworkId(networkId: number): number {
    return getGame().network.netToEnt(networkId)
  }
  override getEntityHeading(entity: number): number {
    return getGame().entity.getHeading(entity)
  }
  override getEntityModel(entity: number): number {
    return getGame().entity.getModel(entity)
  }
  override setVehicleModKit(vehicle: number, kit: number): void {
    getGame().vehicle.setModKit(vehicle, kit)
  }
  override setVehicleMod(
    vehicle: number,
    modType: number,
    modIndex: number,
    customTires: boolean,
  ): void {
    getGame().vehicle.setMod(vehicle, modType, modIndex, customTires)
  }
  override toggleVehicleMod(vehicle: number, modType: number, toggle: boolean): void {
    getGame().vehicle.toggleMod(vehicle, modType, toggle)
  }
  override setVehicleWheelType(vehicle: number, wheelType: number): void {
    getGame().vehicle.setWheelType(vehicle, wheelType)
  }
  override setVehicleWindowTint(vehicle: number, tint: number): void {
    getGame().vehicle.setWindowTint(vehicle, tint)
  }
  override setVehicleLivery(vehicle: number, livery: number): void {
    getGame().vehicle.setLivery(vehicle, livery)
  }
  override setVehicleNumberPlateTextIndex(vehicle: number, index: number): void {
    getGame().vehicle.setNumberPlateTextIndex(vehicle, index)
  }
  override setVehicleNeonLightEnabled(vehicle: number, index: number, enabled: boolean): void {
    getGame().vehicle.setNeonLightEnabled(vehicle, index, enabled)
  }
  override setVehicleNeonLightsColour(vehicle: number, r: number, g: number, b: number): void {
    getGame().vehicle.setNeonLightsColour(vehicle, r, g, b)
  }
  override setVehicleExtra(vehicle: number, extraId: number, disable: boolean): void {
    getGame().vehicle.setExtra(vehicle, extraId, disable)
  }
  override getVehicleExtraColours(vehicle: number): [number, number] {
    const colors = getGame().vehicle.getExtraColours(vehicle)
    return [colors.pearlescentColor, colors.wheelColor]
  }
  override setVehicleExtraColours(vehicle: number, pearl: number, wheel: number): void {
    getGame().vehicle.setExtraColours(vehicle, pearl, wheel)
  }
  override setVehicleFixed(vehicle: number): void {
    getGame().vehicle.setFixed(vehicle)
  }
  override setVehicleDeformationFixed(vehicle: number): void {
    getGame().vehicle.setDeformationFixed(vehicle)
  }
  override setVehicleUndriveable(vehicle: number, toggle: boolean): void {
    getGame().vehicle.setUndriveable(vehicle, toggle)
  }
  override setVehicleEngineOn(
    vehicle: number,
    value: boolean,
    instantly: boolean,
    disableAutoStart: boolean,
  ): void {
    getGame().vehicle.setEngineOn(vehicle, value, instantly, disableAutoStart)
  }
  override setVehicleEngineHealth(vehicle: number, health: number): void {
    getGame().vehicle.setEngineHealth(vehicle, health)
  }
  override setVehiclePetrolTankHealth(vehicle: number, health: number): void {
    getGame().vehicle.setPetrolTankHealth(vehicle, health)
  }
  override setVehicleFuelLevel(_vehicle: number, _level: number): void { }
  override getVehicleFuelLevel(_vehicle: number): number {
    return 0
  }
  override setVehicleDoorsLocked(vehicle: number, doorLockStatus: number): void {
    getGame().vehicle.setDoorsLocked(vehicle, doorLockStatus)
  }
  override setEntityHeading(entity: number, heading: number): void {
    getGame().entity.setHeading(entity, heading)
  }
  override setEntityCoords(entity: number, position: CoreVector3): void {
    getGame().entity.setCoords(
      entity,
      position.x,
      position.y,
      position.z,
      false,
      false,
      false,
      true,
    )
  }
  override setEntityCoordsNoOffset(entity: number, position: CoreVector3): void {
    getGame().entity.setCoordsNoOffset(
      entity,
      position.x,
      position.y,
      position.z,
      false,
      false,
      false,
    )
  }
  override setEntityHealth(entity: number, health: number): void {
    getGame().entity.setHealth(entity, health, 0)
  }
  override getEntityMaxHealth(entity: number): number {
    return getGame().entity.getMaxHealth(entity)
  }
  override setPedArmour(ped: number, armour: number): void {
    getGame().ped.setArmour(ped, armour)
  }
  override networkIsSessionStarted(): boolean {
    return this.playerReady
  }
  override isScreenFadedOut(): boolean {
    return getGame().cam.isScreenFadedOut()
  }
  override isScreenFadingOut(): boolean {
    return getGame().cam.isScreenFadingOut()
  }
  override doScreenFadeOut(ms: number): void {
    getGame().cam.doScreenFadeOut(ms)
  }
  override isScreenFadedIn(): boolean {
    return getGame().cam.isScreenFadedIn()
  }
  override isScreenFadingIn(): boolean {
    return getGame().cam.isScreenFadingIn()
  }
  override doScreenFadeIn(ms: number): void {
    getGame().cam.doScreenFadeIn(ms)
  }
  override networkResurrectLocalPlayer(position: CoreVector3, heading: number): void {
    getMp().players.local.position = toMpVector3(position)
    getMp().players.local.heading = heading
  }
  override playerId(): number {
    return 0
  }
  override setPlayerModel(_playerId: number, modelHash: number): void {
    getGame().player.setModel(modelHash)
  }
  override requestCollisionAtCoord(position: CoreVector3): void {
    getGame().streaming.requestCollisionAtCoord(position.x, position.y, position.z)
  }
  override shutdownLoadingScreen(): void {
    getGame().script.setNoLoadingScreen(true)
    getGame().script.shutdownLoadingScreen()
  }
  override shutdownLoadingScreenNui(): void { }
  override hasCollisionLoadedAroundEntity(_entity: number): boolean {
    return true
  }
  override resetEntityAlpha(entity: number): void {
    tryGetEntity(entity)?.resetAlpha()
  }
  override setEntityAlpha(entity: number, alphaLevel: number): void {
    tryGetEntity(entity)?.setAlpha(alphaLevel)
  }
  override setEntityVisible(entity: number, toggle: boolean): void {
    getGame().entity.setVisible(entity, toggle, false)
  }
  override setEntityCollision(entity: number, toggle: boolean): void {
    getGame().entity.setCollision(entity, toggle, true)
  }
  override getVehicleNumberPlateText(vehicle: number): string {
    return getGame().vehicle.getNumberPlateText(vehicle)
  }
  override requestScriptAudioBank(_bank: string, _networked: boolean): boolean {
    return false
  }
}
