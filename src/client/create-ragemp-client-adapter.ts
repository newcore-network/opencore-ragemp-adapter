import {
  defineClientAdapter,
  IClientLocalPlayerBridge,
  IClientPlatformBridge,
  IClientRuntimeBridge,
  type OpenCoreClientAdapter,
} from '@open-core/framework/client'
import { RageMPMessagingTransport } from '../shared/transport/adapter'
import { RageMPClientHasher } from './ragemp-hasher'
import { RageMPLocalPlayerBridge } from './ragemp-local-player-bridge'
import { RageMPPedAppearanceClient, RageMPPlatformBridge } from './ragemp-platform-bridge'
import { RageMPRuntimeBridge } from './ragemp-runtime-bridge'
import { IHasher, IPedAppearanceClient } from '@open-core/framework'

/**
 * Creates the external RAGE Multiplayer client adapter.
 */
export function RageMPClientAdapter(): OpenCoreClientAdapter {
  return defineClientAdapter({
    name: 'ragemp',
    register(ctx) {
      ctx.bindMessagingTransport(new RageMPMessagingTransport())
      ctx.bindSingleton(IHasher as any, RageMPClientHasher)
      ctx.bindSingleton(IClientRuntimeBridge as any, RageMPRuntimeBridge)
      ctx.bindSingleton(IClientLocalPlayerBridge as any, RageMPLocalPlayerBridge)
      ctx.bindSingleton(IClientPlatformBridge as any, RageMPPlatformBridge)
      ctx.bindSingleton(IPedAppearanceClient as any, RageMPPedAppearanceClient)
    },
  })
}

/**
 * Backward-compatible factory name for external consumers.
 */
export const createRageMPClientAdapter = RageMPClientAdapter
