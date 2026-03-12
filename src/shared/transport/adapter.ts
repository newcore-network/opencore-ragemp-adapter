import { MessagingTransport } from '@open-core/framework'
import { RageMPEvents } from './ragemp.events'
import { RageMPRpc } from './ragemp.rpc'

function isServerContext(): boolean {
  return !('local' in mp.players)
}

export class RageMPMessagingTransport extends MessagingTransport {
  readonly context = isServerContext() ? 'server' : 'client'
  readonly events = new RageMPEvents(this.context)
  readonly rpc = new RageMPRpc(this.context)
}
