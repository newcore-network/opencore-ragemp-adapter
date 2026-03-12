import { EventsAPI, type RuntimeContext } from '@open-core/framework'
import { onNet, emitNet } from './helpers'

function isPlayerTarget(value: unknown): value is { clientID: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'clientID' in value &&
    typeof (value as { clientID: unknown }).clientID === 'number'
  )
}

export class RageMPEvents extends EventsAPI<RuntimeContext> {
  constructor(private readonly context: RuntimeContext) {
    super()
  }

  on(
    event: string,
    handler: (
      source: { clientId: number | undefined; raw: PlayerMp | undefined },
      ...args: any[]
    ) => void,
  ): void {
    onNet(this.context, event, (source, ...args) => {
      handler({ clientId: source?.id, raw: source }, ...args)
    })
  }

  emit(event: string, ...args: any[]): void {
    // Client-side: always send to server; target is not used.
    if (this.context !== 'server') {
      emitNet(this.context, event, -1, ...args)
      return
    }

    // Server-side: first arg is the target descriptor.
    const [target, ...payload] = args

    if (target === 'all') {
      emitNet(this.context, event, -1, ...payload)
      return
    }
    if (Array.isArray(target)) {
      emitNet(this.context, event, target as number[], ...payload)
      return
    }
    if (isPlayerTarget(target)) {
      emitNet(this.context, event, target.clientID, ...payload)
      return
    }
    emitNet(this.context, event, target as number, ...payload)
  }
}
