import { MessagingTransport, type RuntimeContext } from '@open-core/framework/contracts'
import { RageMPEvents } from './ragemp.events'
import { RageMPRpc } from './ragemp.rpc'

function getRuntimeContext(): RuntimeContext {
  return 'local' in mp.players ? 'client' : 'server'
}

export class RageMPMessagingTransport extends MessagingTransport {
  readonly context: RuntimeContext = getRuntimeContext()
  readonly events = new RageMPEvents(this.context)
  readonly rpc = new RageMPRpc(this.context)
}
