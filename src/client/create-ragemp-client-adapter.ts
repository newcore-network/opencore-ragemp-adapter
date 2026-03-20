import type { InjectionToken } from 'tsyringe'
import {
  defineClientAdapter,
  IClientWebViewBridge,
  IClientLocalPlayerBridge,
  IClientPlatformBridge,
  IClientRuntimeBridge,
  type OpenCoreClientAdapter,
} from '@open-core/framework/client'
import {
  IClientBlipBridge,
  IClientCameraPort,
  IClientLogConsole,
  IClientMarkerBridge,
  IClientNotificationBridge,
  IClientPedPort,
  IClientProgressPort,
  IClientSpawnBridge,
  IClientSpawnPort,
  IClientVehiclePort,
  IGtaPedAppearanceBridge,
} from '@open-core/framework/contracts/client'
import { RageMPMessagingTransport } from '../shared/transport/adapter'
import { RageMPClientHasher } from './ragemp-hasher'
import { installRageMPClientLogConsole, RageMPClientLogConsole } from './ragemp-log-console'
import { RageMPLocalPlayerBridge } from './ragemp-local-player-bridge'
import { RageMPClientBlipBridge } from './ragemp-blip-bridge'
import { RageMPClientCameraPort } from './ragemp-camera-port'
import { RageMPClientMarkerBridge } from './ragemp-marker-bridge'
import { RageMPClientNotificationBridge } from './ragemp-notification-bridge'
import { RageMPClientPedPort } from './ragemp-ped-port'
import { RageMPClientProgressPort } from './ragemp-progress-port'
import { RageMPPedAppearanceClient, RageMPPlatformBridge } from './ragemp-platform-bridge'
import { RageMPClientSpawnBridge } from './ragemp-spawn-bridge'
import { RageMPClientVehiclePort } from './ragemp-vehicle-port'
import { RageMPRuntimeBridge } from './ragemp-runtime-bridge'
import { RageMPClientWebViewBridge } from './ragemp-webview-bridge'
import { IHasher } from '@open-core/framework/contracts'

/**
 * Creates the external RAGE Multiplayer client adapter.
 */
export function RageMPClientAdapter(): OpenCoreClientAdapter {
  return defineClientAdapter({
    name: 'ragemp',
    register(ctx) {
      const transport = new RageMPMessagingTransport()
      ctx.bindMessagingTransport(transport)
      ctx.bindSingleton(IHasher as InjectionToken<IHasher>, RageMPClientHasher)
      ctx.bindSingleton(
        IClientLogConsole as InjectionToken<IClientLogConsole>,
        RageMPClientLogConsole,
      )
      ctx.bindSingleton(
        IClientRuntimeBridge as InjectionToken<IClientRuntimeBridge>,
        RageMPRuntimeBridge,
      )
      ctx.bindSingleton(
        IClientLocalPlayerBridge as InjectionToken<IClientLocalPlayerBridge>,
        RageMPLocalPlayerBridge,
      )
      ctx.bindSingleton(
        IClientPlatformBridge as InjectionToken<IClientPlatformBridge>,
        RageMPPlatformBridge,
      )
      ctx.bindSingleton(IClientCameraPort as InjectionToken<IClientCameraPort>, RageMPClientCameraPort)
      ctx.bindSingleton(IClientPedPort as InjectionToken<IClientPedPort>, RageMPClientPedPort)
      ctx.bindSingleton(IClientProgressPort as InjectionToken<IClientProgressPort>, RageMPClientProgressPort)
      ctx.bindSingleton(
        IClientSpawnPort as InjectionToken<IClientSpawnPort>,
        RageMPClientSpawnBridge,
      )
      ctx.bindSingleton(IClientVehiclePort as InjectionToken<IClientVehiclePort>, RageMPClientVehiclePort)
      ctx.bindFactory(IClientSpawnBridge as InjectionToken<IClientSpawnBridge>, () =>
        ctx.container.resolve(IClientSpawnPort as InjectionToken<IClientSpawnPort>),
      )
      ctx.bindSingleton(IClientBlipBridge as InjectionToken<IClientBlipBridge>, RageMPClientBlipBridge)
      ctx.bindSingleton(
        IClientMarkerBridge as InjectionToken<IClientMarkerBridge>,
        RageMPClientMarkerBridge,
      )
      ctx.bindSingleton(
        IClientNotificationBridge as InjectionToken<IClientNotificationBridge>,
        RageMPClientNotificationBridge,
      )
      ctx.bindSingleton(
        IClientWebViewBridge as InjectionToken<IClientWebViewBridge>,
        RageMPClientWebViewBridge,
      )
      ctx.bindSingleton(
        IGtaPedAppearanceBridge as InjectionToken<IGtaPedAppearanceBridge>,
        RageMPPedAppearanceClient,
      )
      installRageMPClientLogConsole(new RageMPClientLogConsole())
    },
  })
}

/**
 * Backward-compatible factory name for external consumers.
 */
export const createRageMPClientAdapter = RageMPClientAdapter
