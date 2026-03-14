import { injectable } from 'tsyringe'
import { IPlayerServer } from '@open-core/framework/contracts/server'
import { IdentifierTypes, type PlayerIdentifier } from '@open-core/framework/contracts'

/**
 * Rage Multiplayer implementation of server-side player operations.
 */
@injectable()
export class RageMPPlayerServer extends IPlayerServer {
  private player(playerSrc: string): PlayerMp {
    return mp.players.at(Number(playerSrc))
  }

  getPed(playerSrc: string): number {
    return this.player(playerSrc).id
  }

  drop(playerSrc: string, reason: string): void {
    this.player(playerSrc).kick(reason)
  }

  setModel(playerSrc: string, model: string): void {
    this.player(playerSrc).model = mp.joaat(model)
  }

  getIdentifier(playerSrc: string, identifierType: string): string | undefined {
    const player = this.player(playerSrc)
    switch (identifierType) {
      case IdentifierTypes.ROCKSTAR:
        return player.rgscId ? `rockstar:${player.rgscId}` : undefined
      case IdentifierTypes.IP:
        return player.ip ? `ip:${player.ip}` : undefined
      case IdentifierTypes.HWID:
        return player.serial ? `hwid:${player.serial}` : undefined
      default:
        return undefined
    }
  }

  getPlayerIdentifiers(playerSrc: string): PlayerIdentifier[] {
    const player = this.player(playerSrc)
    const identifiers: PlayerIdentifier[] = []

    if (player.rgscId) {
      identifiers.push({
        type: IdentifierTypes.ROCKSTAR,
        value: player.rgscId,
        raw: `rockstar:${player.rgscId}`,
      })
    }
    if (player.ip) {
      identifiers.push({ type: IdentifierTypes.IP, value: player.ip, raw: `ip:${player.ip}` })
    }
    if (player.serial) {
      identifiers.push({
        type: IdentifierTypes.HWID,
        value: player.serial,
        raw: `hwid:${player.serial}`,
      })
    }

    return identifiers
  }

  getNumIdentifiers(playerSrc: string): number {
    return this.getPlayerIdentifiers(playerSrc).length
  }

  getName(playerSrc: string): string {
    return this.player(playerSrc).name || 'Unknown'
  }

  getPing(playerSrc: string): number {
    return this.player(playerSrc).ping
  }

  getEndpoint(playerSrc: string): string {
    return this.player(playerSrc).ip || ''
  }

  setDimension(playerSrc: string, dimension: number): void {
    this.player(playerSrc).dimension = dimension
  }

  getDimension(playerSrc: string): number {
    return this.player(playerSrc).dimension
  }

  getConnectedPlayers(): string[] {
    return mp.players.toArray().map((p) => String(p.id))
  }
}
