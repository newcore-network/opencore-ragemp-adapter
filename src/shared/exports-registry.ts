/**
 * Replicates FiveM's `exports` system for RageMP.
 * Registry layout: Map<resource, Map<exportName, handler>>
 */

type ExportArgs = readonly unknown[]
type ExportHandler = (...args: ExportArgs) => unknown

type NamespaceProxy = Record<string, ExportHandler>

// Two-level index type: exports[resource][name](...args)
export type ExportsProxy = {
  readonly [resource: string]: NamespaceProxy
}

export class ExportsRegistry {
  private readonly registry = new Map<string, Map<string, ExportHandler>>()
  private readonly namespaceProxyCache = new Map<string, NamespaceProxy>()

  register(resource: string, name: string, handler: ExportHandler): void {
    let namespace = this.registry.get(resource)

    if (!namespace) {
      namespace = new Map()
      this.registry.set(resource, namespace)
    }

    if (namespace.has(name)) {
      throw new Error(`[exports] Export "${name}" already registered in "${resource}".`)
    }

    namespace.set(name, handler)
  }

  call(resource: string, name: string, ...args: ExportArgs): unknown {
    const handler = this.registry.get(resource)?.get(name)

    if (!handler) {
      const resourceExists = this.registry.has(resource)

      if (!resourceExists) {
        throw new Error(`[exports] Resource "${resource}" has no registered exports.`)
      }

      throw new Error(`[exports] Export "${name}" not found in resource "${resource}".`)
    }

    return handler(...args)
  }

  private createNamespaceProxy(resource: string): NamespaceProxy {
    return new Proxy({} as NamespaceProxy, {
      get:
        (_, name: string) =>
        (...args: ExportArgs) =>
          this.call(resource, name, ...args),
    })
  }

  private getOrCreateNamespaceProxy(resource: string): NamespaceProxy {
    let namespaceProxy = this.namespaceProxyCache.get(resource)

    if (!namespaceProxy) {
      namespaceProxy = this.createNamespaceProxy(resource)
      this.namespaceProxyCache.set(resource, namespaceProxy)
    }

    return namespaceProxy
  }

  /**
   * Returns the namespace proxy for a resource if it has registered exports.
   * Matches FiveM behavior where unknown resources return undefined.
   */
  resourceProxy<T>(resource: string): T | undefined {
    if (!this.registry.has(resource)) return undefined
    return this.getOrCreateNamespaceProxy(resource) as T
  }

  createProxy(): ExportsProxy {
    return new Proxy({} as ExportsProxy, {
      get: (_, resource: string) => this.getOrCreateNamespaceProxy(resource),
    })
  }

  list(resource: string): string[] {
    return [...(this.registry.get(resource)?.keys() ?? [])]
  }
}

/**
 * RageMP loads each resource as an independent bundle in the same Node.js process.
 * Storing the registry instance on `global` ensures it is shared across all bundles.
 */

const REGISTRY_GLOBAL_KEY = '__OPENCORE_EXPORTS_REGISTRY__'

function resolveSharedRegistry(): ExportsRegistry {
  const globalContext = global as Record<string, unknown>

  if (!globalContext[REGISTRY_GLOBAL_KEY]) {
    globalContext[REGISTRY_GLOBAL_KEY] = new ExportsRegistry()
  }

  return globalContext[REGISTRY_GLOBAL_KEY] as ExportsRegistry
}

export const exportsRegistry = resolveSharedRegistry()

export function registerExport(resource: string, name: string, handler: ExportHandler): void {
  exportsRegistry.register(resource, name, handler)
}

export function callExport(resource: string, name: string, ...args: ExportArgs): unknown {
  return exportsRegistry.call(resource, name, ...args)
}
