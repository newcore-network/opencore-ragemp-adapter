import { defineServerAdapter, type OpenCoreServerAdapter } from '@open-core/framework/server'
import { RageMPMessagingTransport } from '../shared/transport/adapter'
import { RageMPPlatformContext } from './ragemp-capabilities'
import { RageMPEngineEvents } from './ragemp-engine-events'
import { RageMPEntityServer } from './ragemp-entity-server'
import { RageMPExports } from './ragemp-exports'
import { RageMPHasher } from './ragemp-hasher'
import { RageMPPlayerInfo } from './ragemp-playerinfo'
import { RageMPPlayerServer } from './ragemp-player-server'
import { RageMPResourceInfo } from './ragemp-resourceinfo'
import { RageMPTick } from './ragemp-tick'
import { RageMPVehicleServer } from './ragemp-vehicle-server'
import {
  IPlatformContext,
  IEngineEvents,
  IExports,
  IResourceInfo,
  ITick,
  IPlayerInfo,
  IEntityServer,
  IVehicleServer,
  IPlayerServer,
  IHasher,
} from '@open-core/framework'

/**
 * Creates the external RAGE Multiplayer server adapter.
 */
export function RageMPServerAdapter(): OpenCoreServerAdapter {
  return defineServerAdapter({
    name: 'ragemp',
    register(ctx) {
      ctx.bindMessagingTransport(new RageMPMessagingTransport())
      ctx.bindSingleton(IPlatformContext as any, RageMPPlatformContext)
      ctx.bindSingleton(IEngineEvents as any, RageMPEngineEvents)
      ctx.bindSingleton(IExports as any, RageMPExports)
      ctx.bindSingleton(IResourceInfo as any, RageMPResourceInfo)
      ctx.bindSingleton(ITick as any, RageMPTick)
      ctx.bindSingleton(IPlayerInfo as any, RageMPPlayerInfo)
      ctx.bindSingleton(IEntityServer as any, RageMPEntityServer)
      ctx.bindSingleton(IVehicleServer as any, RageMPVehicleServer)
      ctx.bindSingleton(IPlayerServer as any, RageMPPlayerServer)
      ctx.bindSingleton(IHasher as any, RageMPHasher)
    },
  })
}

/**
 * Backward-compatible factory name for external consumers.
 */
export const createRageMPServerAdapter = RageMPServerAdapter
