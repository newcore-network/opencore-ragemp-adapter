import { IdentifierTypes } from '@open-core/framework/contracts'
import { IPlatformContext } from '@open-core/framework/contracts/server'
import { injectable } from 'tsyringe'

/**
 * RAGE Multiplayer platform context implementation.
 */
@injectable()
export class RageMPPlatformContext extends IPlatformContext {
  readonly platformName = 'ragemp'
  readonly displayName = 'RAGE Multiplayer'

  readonly identifierTypes = [
    IdentifierTypes.IP,
    IdentifierTypes.SOCIAL_CLUB,
    IdentifierTypes.HWID,
  ] as const

  readonly maxPlayers = 5000
  readonly gameProfile = 'gta5'
  readonly defaultSpawnModel = 'mp_m_freemode_01'
  readonly defaultVehicleType = 'sultan'
  readonly enableServerVehicleCreation = true
}
