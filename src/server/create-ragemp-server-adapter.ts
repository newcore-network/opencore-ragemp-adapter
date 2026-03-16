import type { InjectionToken } from 'tsyringe'
import { defineServerAdapter, type OpenCoreServerAdapter } from '@open-core/framework/server'
import { RageMPMessagingTransport } from '../shared/transport/adapter'
import { RageMPPlatformContext } from './ragemp-capabilities'
import { resolveSharedEngineEvents } from './ragemp-engine-events'
import { RageMPEntityServer } from './ragemp-entity-server'
import { RageMPExports } from './ragemp-exports'
import { RageMPHasher } from './ragemp-hasher'
import { RageMPNpcLifecycleServer } from './ragemp-npc-lifecycle-server'
import { RageMPPedServer } from './ragemp-ped-server'
import { RageMPPlayerAppearanceLifecycleServer } from './ragemp-player-appearance-lifecycle-server'
import { RageMPPlayerLifecycleServer } from './ragemp-player-lifecycle-server'
import { RageMPPlayerInfo } from './ragemp-playerinfo'
import { RageMPPlayerStateSyncServer } from './ragemp-player-state-sync-server'
import { RageMPPlayerServer } from './ragemp-player-server'
import { RageMPResourceInfo } from './ragemp-resourceinfo'
import { RageMPTick } from './ragemp-tick'
import { RageMPVehicleLifecycleServer } from './ragemp-vehicle-lifecycle-server'
import { RageMPVehicleServer } from './ragemp-vehicle-server'
import {
  IPlatformContext,
  IEngineEvents,
  IExports,
  IResourceInfo,
  ITick,
  IPlayerInfo,
  IEntityServer,
  INpcLifecycleServer,
  IPedServer,
  IPlayerAppearanceLifecycleServer,
  IPlayerStateSyncServer,
  IVehicleServer,
  IPlayerLifecycleServer,
  IVehicleLifecycleServer,
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
      ctx.bindInstance(IEngineEvents as InjectionToken<IEngineEvents>, resolveSharedEngineEvents())
      ctx.bindSingleton(IExports as InjectionToken<IExports>, RageMPExports)
      ctx.bindSingleton(IResourceInfo as InjectionToken<IResourceInfo>, RageMPResourceInfo)
      ctx.bindSingleton(ITick as InjectionToken<ITick>, RageMPTick)
      ctx.bindSingleton(IPlayerInfo as InjectionToken<IPlayerInfo>, RageMPPlayerInfo)
      ctx.bindSingleton(IEntityServer as InjectionToken<IEntityServer>, RageMPEntityServer)
      ctx.bindSingleton(IPedServer as InjectionToken<IPedServer>, RageMPPedServer)
      ctx.bindSingleton(
        INpcLifecycleServer as InjectionToken<INpcLifecycleServer>,
        RageMPNpcLifecycleServer,
      )
      ctx.bindSingleton(
        IPlayerAppearanceLifecycleServer as InjectionToken<IPlayerAppearanceLifecycleServer>,
        RageMPPlayerAppearanceLifecycleServer,
      )
      ctx.bindSingleton(
        IPlayerStateSyncServer as InjectionToken<IPlayerStateSyncServer>,
        RageMPPlayerStateSyncServer,
      )
      ctx.bindSingleton(IVehicleServer as InjectionToken<IVehicleServer>, RageMPVehicleServer)
      ctx.bindSingleton(
        IVehicleLifecycleServer as InjectionToken<IVehicleLifecycleServer>,
        RageMPVehicleLifecycleServer,
      )
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
