/**
 * Client-side Rage Multiplayer type declarations.
 */

interface EventMpPool {
  callRemote(eventName: string, ...args: any[]): void
  callRemoteProc(procName: string, ...args: any[]): Promise<any>
}

interface PlayerMpPool {
  local?: PlayerMp
}

interface KeysMp {
  bind(keyCode: number, keyHold: boolean, handler: Function): void
  isUp(keyCode: number): boolean
  isDown(keyCode: number): boolean
  unbind(keyCode: number, keyHold: boolean, handler?: Function): void
}

interface MpType {
  readonly keys: KeysMp
  readonly game: GameMp
}

interface GameMp {
  invoke(hash: string, ...args: any[]): any
}
