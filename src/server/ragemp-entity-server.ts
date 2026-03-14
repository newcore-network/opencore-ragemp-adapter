import { injectable } from 'tsyringe'
import { type EntityStateBag, IEntityServer, type SetPositionOptions } from '@open-core/framework/contracts/server'
import { Vector3 } from '@open-core/framework/kernel'

/**
 * RAGE Multiplayer implementation of server-side entity operations.
 *
 * The framework handle maps to the RageMP entity.id (server-side integer ID).
 */
@injectable()
export class RageMPEntityServer extends IEntityServer {
  doesExist(handle: number): boolean {
    return this.findEntity(handle) !== undefined
  }

  getCoords(handle: number): Vector3 {
    const entity = this.findEntity(handle)
    if (!entity) return { x: 0, y: 0, z: 0 }
    return { x: entity.position.x, y: entity.position.y, z: entity.position.z }
  }

  setPosition(handle: number, position: Vector3, _options?: SetPositionOptions): void {
    // TODO: Handle options like keepAlive, clearArea, platformOpts and extract flags from platformOptions
    const entity = this.findEntity(handle)
    if (!entity) return
    entity.position = new mp.Vector3(position.x, position.y, position.z)
  }

  /**
   * @deprecated Use setPosition() for cross-platform compatibility.
   */
  setCoords(handle: number, x: number, y: number, z: number): void {
    this.setPosition(handle, { x, y, z })
  }

  getHeading(handle: number): number {
    const player = mp.players.at(handle)
    return (player && mp.players.exists(player)) ? player.heading : 0
  }

  setHeading(handle: number, heading: number): void {
    const player = mp.players.at(handle)
    if (player && mp.players.exists(player)) {
      player.heading = heading
    }
  }

  getModel(handle: number): number {
    return this.findEntity(handle)?.model ?? 0
  }

  delete(handle: number): void {
    this.findEntity(handle)?.destroy()
  }

  setOrphanMode(_handle: number, _mode: number): void {
    // Not applicable in RageMP — entities are always managed by the server.
  }

  setDimension(handle: number, dimension: number): void {
    const entity = this.findEntity(handle)
    if (entity) entity.dimension = dimension
  }

  getDimension(handle: number): number {
    return this.findEntity(handle)?.dimension ?? 0
  }

  getStateBag(handle: number): EntityStateBag {
    const entity = this.findEntity(handle)
    return {
      set: (key: string, value: unknown) => {
        entity?.setVariable(key, value)
      },
      get: (key: string) => {
        return entity?.getVariable(key)
      },
    }
  }

  getHealth(handle: number): number {
    const player = mp.players.at(handle)
    if (player && mp.players.exists(player)) return player.health
    return this.findEntity(handle)?.getVariable('health') ?? 200
  }

  setHealth(handle: number, health: number): void {
    const player = mp.players.at(handle)
    if (player && mp.players.exists(player)) {
      player.health = health
      return
    }
    this.findEntity(handle)?.setVariable('health', health)
  }

  getArmor(handle: number): number {
    const player = mp.players.at(handle)
    if (player && mp.players.exists(player)) return player.armour
    return this.findEntity(handle)?.getVariable('armor') ?? 0
  }

  setArmor(handle: number, armor: number): void {
    const player = mp.players.at(handle)
    if (player && mp.players.exists(player)) {
      player.armour = armor
      return
    }
    this.findEntity(handle)?.setVariable('armor', armor)
  }

  private findEntity(id: number): EntityMp | undefined {
    const player = mp.players.at(id)
    if (player && mp.players.exists(player)) return player
    const vehicle = mp.vehicles.at(id)
    if (vehicle && mp.vehicles.exists(vehicle)) return vehicle
    const ped = mp.peds.at(id)
    if (ped && mp.peds.exists(ped)) return ped
    return undefined
  }
}
