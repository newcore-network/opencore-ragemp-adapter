import { EventsAPI, type RuntimeContext } from '@open-core/framework/contracts'
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

  on<TArgs extends readonly unknown[]>(
    event: string,
    handler: (
      source: { clientId: number | undefined; raw: PlayerMp | undefined },
      ...args: TArgs
    ) => void | Promise<void>,
  ): void {
    onNet(this.context, event, (source, ...args) => {
      void handler(
        { clientId: source?.id, raw: source },
        ...(args as unknown as TArgs),
      )
    })
  }

  emit(event: string, ...args: unknown[]): void {
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
    if (typeof target === 'number') {
      emitNet(this.context, event, target, ...payload)
    }
  }
}
