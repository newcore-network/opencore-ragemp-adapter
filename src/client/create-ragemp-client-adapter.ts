import type { InjectionToken } from 'tsyringe'
import {
  defineClientAdapter,
  IClientLocalPlayerBridge,
  IClientPlatformBridge,
  IClientRuntimeBridge,
  type OpenCoreClientAdapter,
} from '@open-core/framework/client'
import { RageMPMessagingTransport } from '../shared/transport/adapter'
import { enableRageMPNativeChat } from './native-chat'
import { RageMPClientHasher } from './ragemp-hasher'
import { RageMPLocalPlayerBridge } from './ragemp-local-player-bridge'
import { RageMPPedAppearanceClient, RageMPPlatformBridge } from './ragemp-platform-bridge'
import { RageMPRuntimeBridge } from './ragemp-runtime-bridge'
import { IHasher, IPedAppearanceClient } from '@open-core/framework/contracts'

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
        IPedAppearanceClient as InjectionToken<IPedAppearanceClient>,
        RageMPPedAppearanceClient,
      )
    },
  })
}

/**
 * Backward-compatible factory name for external consumers.
 */
export const createRageMPClientAdapter = RageMPClientAdapter
