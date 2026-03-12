import { injectable } from 'tsyringe'
import { IHasher } from '@open-core/framework'

@injectable()
export class RageMPClientHasher extends IHasher {
  getHashKey(str: string): number {
    return mp.game.joaat(str)
  }
}
