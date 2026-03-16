import { injectable } from 'tsyringe'
import {
  IClientMarkerBridge,
  type ClientMarkerDefinition,
} from '@open-core/framework/contracts/client'

@injectable()
export class RageMPClientMarkerBridge extends IClientMarkerBridge {
  private readonly markers = new Map<string, ClientMarkerDefinition>()

  constructor() {
    super()
    mp.events.add('render', () => {
      for (const marker of this.markers.values()) {
        if (marker.visible === false) continue
        this.draw(marker)
      }
    })
  }

  create(id: string, definition: ClientMarkerDefinition): void {
    this.markers.set(id, { ...definition })
  }

  update(id: string, patch: Partial<ClientMarkerDefinition>): boolean {
    const current = this.markers.get(id)
    if (!current) return false
    this.markers.set(id, { ...current, ...patch })
    return true
  }

  remove(id: string): boolean {
    return this.markers.delete(id)
  }

  exists(id: string): boolean {
    return this.markers.has(id)
  }

  clear(): void {
    this.markers.clear()
  }

  draw(definition: ClientMarkerDefinition): void {
    const rotation = definition.rotation ?? { x: 0, y: 0, z: 0 }
    const size = definition.size ?? definition.scale ?? { x: 1, y: 1, z: 1 }
    const color = definition.color ?? { r: 255, g: 0, b: 0, a: 200 }

    mp.game.graphics.drawMarker(
      definition.variant ?? definition.type ?? 1,
      definition.position.x,
      definition.position.y,
      definition.position.z,
      0,
      0,
      0,
      rotation.x,
      rotation.y,
      rotation.z,
      size.x,
      size.y,
      size.z,
      color.r,
      color.g,
      color.b,
      color.a,
      definition.bob ?? definition.bobUpAndDown ?? false,
      definition.faceCamera ?? false,
      2,
      definition.rotate ?? false,
      null,
      null,
      definition.drawOnEnts ?? false,
    )
  }
}
