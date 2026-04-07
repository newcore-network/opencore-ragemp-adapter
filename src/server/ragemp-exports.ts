import type { InjectionToken } from 'tsyringe'
import { injectable, inject } from 'tsyringe'
import { IExports, IResourceInfo } from '@open-core/framework/contracts/server'
import { exportsRegistry } from '../shared/exports-registry'

type ExportArgs = readonly unknown[]
type ExportHandler = (...args: ExportArgs) => unknown

interface ExportRequestPayload {
  requestId: string
  callerResource: string
  exportName: string
  args: ExportArgs
}

interface SerializedExportError {
  name: string
  message: string
  stack?: string
}

type ExportResponsePayload =
  | {
      requestId: string
      ok: true
      result: unknown
    }
  | {
      requestId: string
      ok: false
      error: SerializedExportError
    }

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (reason: Error) => void
  timeout: ReturnType<typeof setTimeout>
}

const REQUEST_EVENT_PREFIX = '__oc:exports:req:'
const RESPONSE_EVENT_PREFIX = '__oc:exports:res:'
const EXPORTS_TIMEOUT_MS = 7500
const WAIT_INTERVAL_MS = 150
const META_HAS_EXPORT = '__oc_meta_has_export__'

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPlayerMpLike(value: unknown): boolean {
  return isObjectRecord(value) && 'id' in value && 'serial' in value
}

function isExportRequestPayload(value: unknown): value is ExportRequestPayload {
  return (
    isObjectRecord(value) &&
    typeof value.requestId === 'string' &&
    typeof value.callerResource === 'string' &&
    typeof value.exportName === 'string' &&
    Array.isArray(value.args)
  )
}

function isExportResponsePayload(value: unknown): value is ExportResponsePayload {
  if (
    !isObjectRecord(value) ||
    typeof value.requestId !== 'string' ||
    typeof value.ok !== 'boolean'
  ) {
    return false
  }

  if (value.ok) {
    return true
  }

  return (
    isObjectRecord(value.error) &&
    typeof value.error.name === 'string' &&
    typeof value.error.message === 'string'
  )
}

@injectable()
export class RageMPExports extends IExports {
  private readonly currentResourceName: string
  private readonly requestEventName: string
  private readonly responseEventName: string
  private readonly pendingRequests = new Map<string, PendingRequest>()
  private readonly localHandlers = new Map<string, ExportHandler>()

  constructor(
    @inject(IResourceInfo as InjectionToken<IResourceInfo>)
    private readonly resourceInfo: IResourceInfo,
  ) {
    super()

    this.currentResourceName = this.resourceInfo.getCurrentResourceName()
    this.requestEventName = `${REQUEST_EVENT_PREFIX}${this.currentResourceName}`
    this.responseEventName = `${RESPONSE_EVENT_PREFIX}${this.currentResourceName}`

    this.registerTransportListeners()
  }

  register(exportName: string, handler: (...args: readonly unknown[]) => unknown): void {
    this.localHandlers.set(exportName, handler)
    exportsRegistry.register(this.currentResourceName, exportName, handler)
  }

  /**
   * Resolves exports through the local registry shared by the current adapter runtime.
   */
  getResource<T = unknown>(resourceName: string): T | undefined {
    return exportsRegistry.resourceProxy<T>(resourceName)
  }

  /**
   * Returns an async proxy that forwards method calls to another server resource.
   *
   * @remarks
   * The proxy intentionally ignores Promise-like properties (`then`, `catch`, `finally`)
   * so `await` does not accidentally treat the proxy itself as a thenable.
   */
  getRemoteResource<T = unknown>(resourceName: string): T {
    return new Proxy(
      {},
      {
        get: (_, exportName: string | symbol) => {
          if (
            typeof exportName !== 'string' ||
            exportName === 'then' ||
            exportName === 'catch' ||
            exportName === 'finally'
          ) {
            return undefined
          }

          return (...args: ExportArgs) => this.callRemoteExport(resourceName, exportName, ...args)
        },
      },
    ) as T
  }

  /**
   * Invokes a remote export by sending a server-side RageMP event to the target resource.
   */
  callRemoteExport<TResult = unknown>(
    resourceName: string,
    exportName: string,
    ...args: unknown[]
  ): Promise<TResult> {
    const requestId = this.createRequestId(resourceName, exportName)
    const requestEventName = `${REQUEST_EVENT_PREFIX}${resourceName}`

    return new Promise<unknown>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId)
        reject(
          new Error(`[exports] Timed out calling "${exportName}" on resource "${resourceName}".`),
        )
      }, EXPORTS_TIMEOUT_MS)

      this.pendingRequests.set(requestId, { resolve, reject, timeout })

      mp.events.call(requestEventName, {
        requestId,
        callerResource: this.currentResourceName,
        exportName,
        args,
      } satisfies ExportRequestPayload)
    }) as Promise<TResult>
  }

  /**
   * Waits for a remote resource to expose a matching export before returning the async proxy.
   */
  async waitForRemoteResource<T = unknown>(
    resourceName: string,
    options?: { exportName?: string; timeoutMs?: number; intervalMs?: number },
  ): Promise<T> {
    const timeoutMs = options?.timeoutMs ?? EXPORTS_TIMEOUT_MS
    const intervalMs = options?.intervalMs ?? WAIT_INTERVAL_MS
    const startedAt = Date.now()

    while (Date.now() - startedAt < timeoutMs) {
      try {
        const isAvailable = await this.callRemoteExport<boolean>(
          resourceName,
          META_HAS_EXPORT,
          options?.exportName,
        )

        if (isAvailable) {
          return this.getRemoteResource<T>(resourceName)
        }
      } catch {
        // Ignore transient availability failures while waiting.
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    throw new Error(`[exports] Timed out waiting for resource "${resourceName}" remote exports.`)
  }

  /**
   * Installs the request/response listeners used by the optional remote export helper layer.
   *
   * @remarks
   * The listeners reject payloads that look like player-originated server events so clients
   * cannot invoke server resource exports through this transport.
   */
  private registerTransportListeners(): void {
    mp.events.add(this.requestEventName, (...args: unknown[]) => {
      const payload = args[0]

      if (isPlayerMpLike(payload) || !isExportRequestPayload(payload)) {
        return
      }

      void this.handleExportRequest(payload)
    })

    mp.events.add(this.responseEventName, (...args: unknown[]) => {
      const payload = args[0]

      if (isPlayerMpLike(payload) || !isExportResponsePayload(payload)) {
        return
      }

      this.handleExportResponse(payload)
    })
  }

  /**
   * Executes one remote export request against handlers registered in the current resource.
   */
  private async handleExportRequest(payload: ExportRequestPayload): Promise<void> {
    const responseEventName = `${RESPONSE_EVENT_PREFIX}${payload.callerResource}`

    try {
      const result = await this.executeLocalExport(payload.exportName, payload.args)

      mp.events.call(responseEventName, {
        requestId: payload.requestId,
        ok: true,
        result,
      } satisfies ExportResponsePayload)
    } catch (error) {
      mp.events.call(responseEventName, {
        requestId: payload.requestId,
        ok: false,
        error: this.serializeError(error),
      } satisfies ExportResponsePayload)
    }
  }

  /**
   * Resolves or rejects the pending promise associated with a remote export response.
   */
  private handleExportResponse(payload: ExportResponsePayload): void {
    const pendingRequest = this.pendingRequests.get(payload.requestId)

    if (!pendingRequest) {
      return
    }

    clearTimeout(pendingRequest.timeout)
    this.pendingRequests.delete(payload.requestId)

    if (payload.ok) {
      pendingRequest.resolve(payload.result)
      return
    }

    pendingRequest.reject(this.deserializeError(payload.error))
  }

  /**
   * Executes an export from the current resource without going back through the shared registry.
   */
  private async executeLocalExport(exportName: string, args: ExportArgs): Promise<unknown> {
    if (exportName === META_HAS_EXPORT) {
      const requestedExportName = typeof args[0] === 'string' ? args[0] : undefined

      if (!requestedExportName) {
        return this.localHandlers.size > 0
      }

      return this.localHandlers.has(requestedExportName)
    }

    const handler = this.localHandlers.get(exportName)

    if (!handler) {
      throw new Error(
        `[exports] Export "${exportName}" not found in resource "${this.currentResourceName}".`,
      )
    }

    return Promise.resolve(handler(...args))
  }

  private createRequestId(resourceName: string, exportName: string): string {
    return `${this.currentResourceName}:${resourceName}:${exportName}:${Date.now()}:${Math.random()}`
  }

  private serializeError(error: unknown): SerializedExportError {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    return {
      name: 'Error',
      message: String(error),
    }
  }

  private deserializeError(error: SerializedExportError): Error {
    const result = new Error(error.message)
    result.name = error.name
    result.stack = error.stack
    return result
  }
}
