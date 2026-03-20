import type { RuntimeContext } from '@open-core/framework/contracts'

const JSON_WIRE_PREFIX = '__OPENCORE_JSON__:'

function serializeWireValue(value: unknown): unknown {
  if (value === null || value === undefined) return value

  if (Array.isArray(value) || (typeof value === 'object' && value.constructor === Object)) {
    return `${JSON_WIRE_PREFIX}${JSON.stringify(value)}`
  }

  return value
}

function deserializeWireValue<T>(value: T): T | unknown {
  if (typeof value !== 'string' || !value.startsWith(JSON_WIRE_PREFIX)) {
    return value
  }

  try {
    return JSON.parse(value.slice(JSON_WIRE_PREFIX.length))
  } catch {
    return value
  }
}

function deserializeWireArgs(args: any[]): any[] {
  return args.map((arg) => deserializeWireValue(arg))
}

/**
 * Resolves a player by numeric ID, returning undefined when the player no
 * longer exists (disconnected, invalid handle, etc.).
 *
 * NOTE: This helper only covers players — vehicles and peds are not
 * addressable network targets in either FiveM or RageMP's emitNet.
 */
function resolvePlayer(id: number): PlayerMp | undefined {
  const player = mp.players.at(id)
  if (player && mp.players.exists(player)) return player
  return undefined
}

/**
 * Normalizes RageMP's different server/client event subscription signatures
 * into a single uniform interface.
 *
 * Analogous to FiveM's `onNet`:
 * - Server: RageMP prepends the PlayerMp as the first native argument.
 *   We expose it as-is so callers can read player.id before any await.
 * - Client: no source argument; we pass undefined to keep the signature uniform.
 */
export function onNet(
  context: RuntimeContext,
  event: string,
  handler: (source: PlayerMp | undefined, ...args: any[]) => void,
): void {
  if (context === 'server') {
    mp.events.add(event, (player: PlayerMp, ...args: any[]) => {
      // Validate the player is still connected before forwarding.
      // A 'playerQuit' event fires with the player still technically present;
      // all other events should be safe to guard this way.
      if (!mp.players.exists(player.id)) return
      handler(player, ...deserializeWireArgs(args))
    })
  } else {
    mp.events.add(event, (...args: any[]) => handler(undefined, ...deserializeWireArgs(args)))
  }
}

/**
 * Normalizes RageMP's server/client event emission into a single interface.
 *
 * Analogous to FiveM's `TriggerClientEvent` / `TriggerServerEvent`:
 * - Server, target=-1   → mp.players.call (broadcast to all connected players)
 * - Server, target=id   → single player, skipped silently if disconnected
 * - Server, target=id[] → per-player send, each skipped if disconnected
 * - Client              → mp.events.callRemote to server (target is ignored)
 *
 * NOTE: Only player targets are supported — vehicles/peds are not valid
 * network targets, matching FiveM's TriggerClientEvent semantics.
 */
export function emitNet(
  context: RuntimeContext,
  event: string,
  target: number | number[] | -1,
  ...payload: any[]
): void {
  const serializedPayload = payload.map((item) => serializeWireValue(item))

  if (context !== 'server') {
    mp.events.callRemote(event, ...serializedPayload)
    return
  }

  if (target === -1) {
    mp.players.call(event, serializedPayload)
    return
  }

  if (Array.isArray(target)) {
    for (const id of target) {
      resolvePlayer(id)?.call(event, serializedPayload)
    }
    return
  }

  resolvePlayer(target)?.call(event, serializedPayload)
}
