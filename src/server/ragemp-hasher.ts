import { injectable } from 'tsyringe'
import { IHasher } from '@open-core/framework/contracts/server'

/**
 * Rage Multiplayer implementation of hash utilities.
 */
@injectable()
export class RageMPHasher extends IHasher {
  getHashKey(str: string): number {
    return mp.joaat(str)
  }
}
