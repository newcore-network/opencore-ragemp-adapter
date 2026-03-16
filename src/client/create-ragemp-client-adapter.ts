import type { InjectionToken } from 'tsyringe'
import {
  defineClientAdapter,
  IClientWebViewBridge,
  PlatformNotificationBridge,
  IClientLocalPlayerBridge,
  IClientPlatformBridge,
  IClientRuntimeBridge,
  type OpenCoreClientAdapter,
} from '@open-core/framework/client'
import {
  IClientBlipBridge,
  IClientLogConsole,
  IClientMarkerBridge,
  IClientNotificationBridge,
  IClientSpawnBridge,
  IPedAppearanceClient,
} from '@open-core/framework/contracts/client'
import { RageMPMessagingTransport } from '../shared/transport/adapter'
import { enableRageMPNativeChat } from './native-chat'
import { RageMPClientHasher } from './ragemp-hasher'
import { installRageMPClientLogConsole, RageMPClientLogConsole } from './ragemp-log-console'
import { RageMPLocalPlayerBridge } from './ragemp-local-player-bridge'
import { RageMPClientBlipBridge } from './ragemp-blip-bridge'
import { RageMPClientMarkerBridge } from './ragemp-marker-bridge'
import { RageMPPedAppearanceClient, RageMPPlatformBridge } from './ragemp-platform-bridge'
import { RageMPClientSpawnBridge } from './ragemp-spawn-bridge'
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
      enableRageMPNativeChat(transport.events)
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
      ctx.bindSingleton(
        IClientSpawnBridge as InjectionToken<IClientSpawnBridge>,
        RageMPClientSpawnBridge,
      )
      ctx.bindSingleton(IClientBlipBridge as InjectionToken<IClientBlipBridge>, RageMPClientBlipBridge)
      ctx.bindSingleton(
        IClientMarkerBridge as InjectionToken<IClientMarkerBridge>,
        RageMPClientMarkerBridge,
      )
      ctx.bindSingleton(
        IClientNotificationBridge as InjectionToken<IClientNotificationBridge>,
        PlatformNotificationBridge,
      )
      ctx.bindSingleton(
        IClientWebViewBridge as InjectionToken<IClientWebViewBridge>,
        RageMPClientWebViewBridge,
      )
      ctx.bindSingleton(
        IPedAppearanceClient as InjectionToken<IPedAppearanceClient>,
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
