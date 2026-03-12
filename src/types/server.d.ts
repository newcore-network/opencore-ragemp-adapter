/**
 * Server-side Rage Multiplayer type declarations.
 */

interface Vector3Mp {
  x: number
  y: number
  z: number
}

interface EntityMp {
  readonly id: number
  readonly type: string
  dimension: number
  model: number
  position: Vector3Mp
  destroy(): void
  getVariable(key: string): any
  setVariable(key: string, value: any): void
}

interface PlayerMp extends EntityMp {
  readonly ip: string
  readonly rgscId: string
  readonly socialClub: string
  readonly serial: string
  readonly ping: number
  readonly name: string
  health: number
  armour: number
  heading: number
  kick(reason?: string): void
  call(eventName: string, args?: any[]): void
  spawn(position: Vector3Mp): void
}

interface VehicleMp extends EntityMp {
  numberPlate: string
  locked: boolean
  engine: boolean
  setColor(primary: number, secondary: number): void
  getColor(id: number): number
}

interface PedMp extends EntityMp {}

interface PlayerMpPool {
  readonly length: number
  at(id: number): PlayerMp
  exists(entity: PlayerMp | number): boolean
  forEach(callback: (player: PlayerMp) => void): void
  toArray(): PlayerMp[]
  broadcast(text: string): void
  call(eventName: string, args?: any[]): void
}

interface VehicleMpPool {
  readonly length: number
  new (
    model: number | string,
    position: Vector3Mp,
    options?: {
      heading?: number
      dimension?: number
      engine?: boolean
      locked?: boolean
      numberPlate?: string
      alpha?: number
    },
  ): VehicleMp
  at(id: number): VehicleMp
  exists(entity: VehicleMp | number): boolean
  forEach(callback: (vehicle: VehicleMp) => void): void
  toArray(): VehicleMp[]
}

interface PedMpPool {
  readonly length: number
  new (
    model: number | string,
    position: Vector3Mp,
    options?: { heading?: number; dimension?: number },
  ): PedMp
  at(id: number): PedMp
  exists(entity: PedMp | number): boolean
  forEach(callback: (ped: PedMp) => void): void
  toArray(): PedMp[]
}

interface EventMpPool {
  add(eventName: string, callback: (...args: any[]) => void): void
  add(events: Record<string, (...args: any[]) => void>): void
  addCommand(
    commandName: string,
    callback: (player: PlayerMp, fullText: string, ...args: string[]) => void,
  ): void
  addProc(procName: string, handler: (player: PlayerMp, ...args: any[]) => any): void
  call(eventName: string, ...args: any[]): void
  remove(eventName: string | string[], handler?: (...args: any[]) => void): void
}

interface MpType {
  readonly players: PlayerMpPool
  readonly vehicles: VehicleMpPool
  readonly peds: PedMpPool
  readonly events: EventMpPool
  joaat(str: string): number
  joaat(strs: string[]): number[]
  Vector3: new (x: number, y: number, z: number) => Vector3Mp
}

declare const mp: MpType
