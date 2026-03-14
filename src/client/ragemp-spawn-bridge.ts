import { inject, injectable } from 'tsyringe'
import {
  IClientSpawnBridge,
  type RespawnRequest,
  type SpawnRequest,
  type TeleportRequest,
} from '@open-core/framework/contracts/client'
import { IClientPlatformBridge, IClientRuntimeBridge } from '@open-core/framework/contracts/client'

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const READY_TIMEOUT_MS = 15_000
const PED_TIMEOUT_MS = 10_000
const MODEL_LOAD_TIMEOUT_MS = 10_000

@injectable()
export class RageMPClientSpawnBridge extends IClientSpawnBridge {
  private playerReady = false

  constructor(
    @inject(IClientPlatformBridge as any) private readonly platform: IClientPlatformBridge,
    @inject(IClientRuntimeBridge as any) private readonly runtime: IClientRuntimeBridge,
  ) {
    super()

    mp.events.add('playerReady', () => {
      this.playerReady = true
    })
  }

  async waitUntilReady(timeoutMs = READY_TIMEOUT_MS): Promise<void> {
    const started = this.runtime.getGameTimer()
    while (!this.playerReady) {
      if (this.runtime.getGameTimer() - started > timeoutMs) {
        throw new Error('PLAYER_READY_TIMEOUT')
      }
      await delay(0)
    }
  }

  async spawn(request: SpawnRequest): Promise<void> {
    this.closeLoadingScreens()
    await this.setPlayerModel(request.model)
    await this.ensurePed()
    mp.players.local.position = new mp.Vector3(request.position.x, request.position.y, request.position.z)
    mp.players.local.heading = request.heading ?? 0
  }

  async respawn(request: RespawnRequest): Promise<void> {
    await this.ensurePed()
    mp.players.local.position = new mp.Vector3(request.position.x, request.position.y, request.position.z)
    mp.players.local.heading = request.heading ?? 0
  }

  async teleport(request: TeleportRequest): Promise<void> {
    await this.ensurePed()
    mp.players.local.position = new mp.Vector3(request.position.x, request.position.y, request.position.z)
    if (typeof request.heading === 'number') {
      mp.players.local.heading = request.heading
    }
  }

  private closeLoadingScreens(): void {
    try {
      this.platform.shutdownLoadingScreen()
    } catch {}
    try {
      this.platform.shutdownLoadingScreenNui()
    } catch {}
  }

  private async setPlayerModel(model: string): Promise<void> {
    const modelHash = this.platform.getHashKey(model)
    if (!this.platform.isModelInCdimage(modelHash) || !this.platform.isModelValid(modelHash)) {
      throw new Error('MODEL_INVALID')
    }

    this.platform.requestModel(modelHash)
    const started = this.runtime.getGameTimer()
    while (!this.platform.hasModelLoaded(modelHash)) {
      if (this.runtime.getGameTimer() - started > MODEL_LOAD_TIMEOUT_MS) {
        throw new Error('MODEL_LOAD_TIMEOUT')
      }
      await delay(0)
    }

    this.platform.setPlayerModel(this.platform.playerId(), modelHash)
    this.platform.setModelAsNoLongerNeeded(modelHash)
  }

  private async ensurePed(): Promise<number> {
    const started = this.runtime.getGameTimer()
    let ped = this.platform.getLocalPlayerPed()
    while (ped === 0) {
      if (this.runtime.getGameTimer() - started > PED_TIMEOUT_MS) {
        throw new Error('PED_TIMEOUT')
      }
      await delay(0)
      ped = this.platform.getLocalPlayerPed()
    }
    return ped
  }
}
