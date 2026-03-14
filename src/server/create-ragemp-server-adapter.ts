import type { InjectionToken } from 'tsyringe'
import { defineServerAdapter, type OpenCoreServerAdapter } from '@open-core/framework/server'
import { RageMPMessagingTransport } from '../shared/transport/adapter'
import { RageMPPlatformContext } from './ragemp-capabilities'
import { RageMPEngineEvents } from './ragemp-engine-events'
import { RageMPEntityServer } from './ragemp-entity-server'
import { RageMPExports } from './ragemp-exports'
import { RageMPHasher } from './ragemp-hasher'
import { RageMPPlayerLifecycleServer } from './ragemp-player-lifecycle-server'
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
  IPlayerLifecycleServer,
  IPlayerServer,
  IHasher,
} from '@open-core/framework/contracts/server'

/**
 * Creates the external RAGE Multiplayer server adapter.
 */
export function RageMPServerAdapter(): OpenCoreServerAdapter {
  return defineServerAdapter({
    name: 'ragemp',
    register(ctx) {
      ctx.bindMessagingTransport(new RageMPMessagingTransport())
      ctx.bindSingleton(IPlatformContext as InjectionToken<IPlatformContext>, RageMPPlatformContext)
      ctx.bindSingleton(IEngineEvents as InjectionToken<IEngineEvents>, RageMPEngineEvents)
      ctx.bindSingleton(IExports as InjectionToken<IExports>, RageMPExports)
      ctx.bindSingleton(IResourceInfo as InjectionToken<IResourceInfo>, RageMPResourceInfo)
      ctx.bindSingleton(ITick as InjectionToken<ITick>, RageMPTick)
      ctx.bindSingleton(IPlayerInfo as InjectionToken<IPlayerInfo>, RageMPPlayerInfo)
      ctx.bindSingleton(IEntityServer as InjectionToken<IEntityServer>, RageMPEntityServer)
      ctx.bindSingleton(IVehicleServer as InjectionToken<IVehicleServer>, RageMPVehicleServer)
      ctx.bindSingleton(
        IPlayerLifecycleServer as InjectionToken<IPlayerLifecycleServer>,
        RageMPPlayerLifecycleServer,
      )
      ctx.bindSingleton(IPlayerServer as InjectionToken<IPlayerServer>, RageMPPlayerServer)
      ctx.bindSingleton(IHasher as InjectionToken<IHasher>, RageMPHasher)
    },
  })
}

/**
 * Backward-compatible factory name for external consumers.
 */
export const createRageMPServerAdapter = RageMPServerAdapter
