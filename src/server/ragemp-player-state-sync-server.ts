import { injectable } from 'tsyringe'
import { IPlayerStateSyncServer } from '@open-core/framework/contracts/server'

@injectable()
export class RageMPPlayerStateSyncServer extends IPlayerStateSyncServer {
  getHealth(playerSrc: string): number {
    return mp.players.at(Number(playerSrc)).health
  }

  setHealth(playerSrc: string, health: number): void {
    mp.players.at(Number(playerSrc)).health = health
  }

  getArmor(playerSrc: string): number {
    return mp.players.at(Number(playerSrc)).armour
  }

  setArmor(playerSrc: string, armor: number): void {
    mp.players.at(Number(playerSrc)).armour = armor
  }
}
