import { injectable } from 'tsyringe'
import {
  type ClientCameraCreateOptions,
  type ClientCameraRenderOptions,
  type ClientCameraRotation,
  type ClientCameraShakeOptions,
  type ClientCameraTransform,
  IClientCameraPort,
} from '@open-core/framework/contracts/client'
import type { Vector3 } from '@open-core/framework/kernel'

function getCameraApi(): GameCamMp {
  return (mp.game as any).cam
}

@injectable()
export class RageMPClientCameraPort extends IClientCameraPort {
  create(options: ClientCameraCreateOptions = {}): number {
    const camera = getCameraApi().createCam(
      options.camName ?? 'DEFAULT_SCRIPTED_CAMERA',
      options.active ?? false,
    )
    if (options.transform) this.setTransform(camera, options.transform)
    return camera
  }

  setActive(camera: number, active: boolean): void {
    getCameraApi().setActive(camera, active)
  }

  render(enable: boolean, options: ClientCameraRenderOptions = {}): void {
    getCameraApi().renderScriptCams(enable, options.ease ?? false, options.easeTimeMs ?? 0, true, true, 0)
  }

  destroy(camera: number, destroyActiveCamera = false): void {
    getCameraApi().destroy(camera, destroyActiveCamera)
  }

  destroyAll(destroyActiveCamera = false): void {
    getCameraApi().destroyAllCams(destroyActiveCamera)
  }

  setTransform(camera: number, transform: ClientCameraTransform): void {
    this.setPosition(camera, transform.position)
    if (transform.rotation) this.setRotation(camera, transform.rotation)
    if (typeof transform.fov === 'number') this.setFov(camera, transform.fov)
  }

  setPosition(camera: number, position: Vector3): void {
    getCameraApi().setCoord(camera, position.x, position.y, position.z)
  }

  setRotation(camera: number, rotation: ClientCameraRotation, rotationOrder = 2): void {
    getCameraApi().setRot(camera, rotation.x, rotation.y, rotation.z, rotationOrder)
  }

  setFov(camera: number, fov: number): void {
    getCameraApi().setFov(camera, fov)
  }

  pointAtCoords(camera: number, position: Vector3): void {
    getCameraApi().pointAtCoord(camera, position.x, position.y, position.z)
  }

  pointAtEntity(camera: number, entity: number, offset: Vector3 = { x: 0, y: 0, z: 0 }): void {
    getCameraApi().pointAtEntity(camera, entity, offset.x, offset.y, offset.z, true)
  }

  stopPointing(camera: number): void {
    getCameraApi().stopPointing(camera)
  }

  interpolate(
    fromCamera: number,
    toCamera: number,
    durationMs: number,
    easeLocation = true,
    easeRotation = true,
  ): void {
    getCameraApi().setActiveWithInterp(
      toCamera,
      fromCamera,
      durationMs,
      easeLocation ? 1 : 0,
      easeRotation ? 1 : 0,
    )
  }

  shake(camera: number, options: ClientCameraShakeOptions): void {
    getCameraApi().shake(camera, options.type, options.amplitude)
  }

  stopShaking(camera: number, stopImmediately = true): void {
    getCameraApi().stopShaking(camera, stopImmediately)
  }
}
