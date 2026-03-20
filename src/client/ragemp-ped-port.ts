import { inject, injectable } from 'tsyringe'
import {
  type ClientPedAnimationOptions,
  type ClientPedSpawnOptions,
  IClientLocalPlayerBridge,
  IClientPedPort,
  IClientPlatformBridge,
} from '@open-core/framework/contracts/client'
import type { Vector3 } from '@open-core/framework/kernel'

@injectable()
export class RageMPClientPedPort extends IClientPedPort {
  constructor(
    @inject(IClientPlatformBridge as any) private readonly platform: IClientPlatformBridge,
    @inject(IClientLocalPlayerBridge as any) private readonly localPlayer: IClientLocalPlayerBridge,
  ) {
    super()
  }

  async spawn(options: ClientPedSpawnOptions): Promise<number> {
    const {
      model,
      position,
      heading = 0,
      networked = false,
      missionEntity = true,
      blockEvents = true,
      relationshipGroup = 'CIVMALE',
    } = options

    const modelHash = this.platform.getHashKey(model)
    if (!this.platform.isModelInCdimage(modelHash) || !this.platform.isModelValid(modelHash)) {
      throw new Error(`Invalid ped model: ${model}`)
    }

    this.platform.requestModel(modelHash)
    while (!this.platform.hasModelLoaded(modelHash)) {
      await new Promise((r) => setTimeout(r, 0))
    }

    const ped = this.platform.createPed(4, modelHash, position, heading, networked, true)
    this.platform.setModelAsNoLongerNeeded(modelHash)
    if (!ped || ped === 0) throw new Error('Failed to create ped')

    if (missionEntity) this.platform.setEntityAsMissionEntity(ped, true, true)
    if (blockEvents) this.platform.setBlockingOfNonTemporaryEvents(ped, true)
    this.platform.setPedRelationshipGroupHash(ped, this.platform.getHashKey(relationshipGroup))
    return ped
  }

  delete(handle: number): void {
    if (!this.exists(handle)) return
    this.platform.setEntityAsMissionEntity(handle, true, true)
    this.platform.deletePed(handle)
  }

  exists(handle: number): boolean { return this.platform.doesEntityExist(handle) }

  async playAnimation(handle: number, options: ClientPedAnimationOptions): Promise<void> {
    if (!this.exists(handle)) return
    this.platform.requestAnimDict(options.dict)
    while (!this.platform.hasAnimDictLoaded(options.dict)) {
      await new Promise((r) => setTimeout(r, 0))
    }
    this.platform.taskPlayAnim(
      handle,
      options.dict,
      options.anim,
      options.blendInSpeed ?? 8,
      options.blendOutSpeed ?? -8,
      options.duration ?? -1,
      options.flags ?? 1,
      options.playbackRate ?? 0,
    )
  }

  stopAnimation(handle: number): void { if (this.exists(handle)) this.platform.clearPedTasks(handle) }
  stopAnimationImmediately(handle: number): void { if (this.exists(handle)) this.platform.clearPedTasksImmediately(handle) }
  freeze(handle: number, freeze: boolean): void { if (this.exists(handle)) this.platform.freezeEntityPosition(handle, freeze) }
  setInvincible(handle: number, invincible: boolean): void { if (this.exists(handle)) this.platform.setEntityInvincible(handle, invincible) }
  giveWeapon(handle: number, weapon: string, ammo = 100, hidden = false, forceInHand = true): void {
    if (!this.exists(handle)) return
    this.platform.giveWeaponToPed(handle, this.platform.getHashKey(weapon), ammo, hidden, forceInHand)
  }
  removeAllWeapons(handle: number): void { if (this.exists(handle)) this.platform.removeAllPedWeapons(handle, true) }
  getClosest(radius = 10, excludeLocalPlayer = true): number | null {
    const handle = this.platform.getClosestPed(this.localPlayer.getPosition(), radius)
    if (!handle) return null
    if (excludeLocalPlayer && handle === this.localPlayer.getHandle()) return null
    return handle
  }
  getNearby(position: Vector3, radius: number, excludeEntity?: number): number[] {
    return this.platform.getNearbyPeds(position, radius, excludeEntity)
  }
  lookAtEntity(handle: number, entity: number, duration = -1): void { if (this.exists(handle)) this.platform.taskLookAtEntity(handle, entity, duration) }
  lookAtCoords(handle: number, position: Vector3, duration = -1): void { if (this.exists(handle)) this.platform.taskLookAtCoord(handle, position, duration) }
  walkTo(handle: number, position: Vector3, speed = 1): void { if (this.exists(handle)) this.platform.taskGoStraightToCoord(handle, position, speed) }
  setCombatAttributes(handle: number, canFight: boolean, canUseCover = true): void {
    if (!this.exists(handle)) return
    this.platform.setPedCombatAttributes(handle, 46, canFight)
    this.platform.setPedCombatAttributes(handle, 0, canUseCover)
  }
}
