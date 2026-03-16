import { injectable } from 'tsyringe'
import {
  IClientBlipBridge,
  type ClientBlipDefinition,
} from '@open-core/framework/contracts/client'

type RageMPBlipRef =
  | { kind: 'mp'; blip: BlipMp }
  | { kind: 'native'; handle: number }

function toVector3(position: { x: number; y: number; z: number }): Vector3 {
  return new mp.Vector3(position.x, position.y, position.z)
}

@injectable()
export class RageMPClientBlipBridge extends IClientBlipBridge {
  private readonly blips = new Map<string, RageMPBlipRef>()
  private readonly definitions = new Map<string, ClientBlipDefinition>()

  create(id: string, definition: ClientBlipDefinition): void {
    this.remove(id)
    const ref = this.createRef(definition)
    if (!ref) return
    this.blips.set(id, ref)
    this.definitions.set(id, { ...definition })
    this.apply(id, definition)
  }

  update(id: string, patch: Partial<ClientBlipDefinition>): boolean {
    const current = this.definitions.get(id)
    if (!current) return false
    const next = { ...current, ...patch }
    const changedAnchor =
      patch.position !== undefined || patch.entity !== undefined || patch.radius !== undefined

    if (changedAnchor) {
      this.create(id, next)
      return this.exists(id)
    }

    this.definitions.set(id, next)
    this.apply(id, next)
    return true
  }

  exists(id: string): boolean {
    return this.blips.has(id)
  }

  remove(id: string): boolean {
    const ref = this.blips.get(id)
    if (!ref) return false
    if (ref.kind === 'mp') ref.blip.destroy()
    else mp.game.ui.removeBlip(ref.handle)
    this.blips.delete(id)
    this.definitions.delete(id)
    return true
  }

  clear(): void {
    for (const id of this.blips.keys()) this.remove(id)
  }

  private createRef(definition: ClientBlipDefinition): RageMPBlipRef | null {
    if (definition.entity !== undefined) {
      return { kind: 'native', handle: mp.game.ui.addBlipForEntity(definition.entity) }
    }

    if (definition.radius !== undefined && definition.position) {
      return {
        kind: 'native',
        handle: mp.game.ui.addBlipForRadius(
          definition.position.x,
          definition.position.y,
          definition.position.z,
          definition.radius,
        ),
      }
    }

    if (!definition.position) return null

    return {
      kind: 'mp',
      blip: mp.blips.new(definition.icon ?? 1, toVector3(definition.position), {
        color: definition.color,
        scale: definition.scale,
        shortRange: definition.shortRange,
        name: definition.label,
        alpha: definition.alpha,
      }),
    }
  }

  private apply(id: string, definition: ClientBlipDefinition): void {
    const ref = this.blips.get(id)
    if (!ref) return

    if (ref.kind === 'mp') {
      if (definition.position) ref.blip.setCoords(toVector3(definition.position))
      if (definition.icon !== undefined) ref.blip.setSprite(definition.icon)
      if (definition.color !== undefined) ref.blip.setColour(definition.color)
      if (definition.scale !== undefined) ref.blip.setScale(definition.scale)
      if (definition.shortRange !== undefined) ref.blip.setAsShortRange(definition.shortRange)
      if (definition.route !== undefined) ref.blip.setRoute(definition.route)
      if (definition.routeColor !== undefined) ref.blip.setRouteColour(definition.routeColor)
      if (definition.alpha !== undefined) ref.blip.setAlpha(definition.alpha)
      if (definition.visible !== undefined) ref.blip.setDisplay(definition.visible ? 4 : 0)
      if (definition.label) {
        ;(ref.blip as BlipMp & { name?: string }).name = definition.label
      }
      return
    }

    const handle = ref.handle
    if (definition.position) mp.game.ui.setBlipCoords(handle, definition.position.x, definition.position.y, definition.position.z)
    if (definition.icon !== undefined) mp.game.ui.setBlipSprite(handle, definition.icon)
    if (definition.color !== undefined) mp.game.ui.setBlipColour(handle, definition.color)
    if (definition.scale !== undefined) mp.game.ui.setBlipScale(handle, definition.scale)
    if (definition.shortRange !== undefined) mp.game.ui.setBlipAsShortRange(handle, definition.shortRange)
    if (definition.route !== undefined) mp.game.ui.setBlipRoute(handle, definition.route)
    if (definition.routeColor !== undefined) mp.game.ui.setBlipRouteColour(handle, definition.routeColor)
    if (definition.alpha !== undefined) mp.game.ui.setBlipAlpha(handle, definition.alpha)
    if (definition.visible !== undefined) mp.game.ui.setBlipDisplay(handle, definition.visible ? 4 : 0)
  }
}
