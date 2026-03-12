/**
 * Replicates FiveM's `exports` system for RageMP.
 * Registry layout: Map<resource, Map<exportName, handler>>
 */

type ExportHandler = (...args: any[]) => any

// Two-level index type: exports[resource][name](...args)
export type ExportsProxy = {
  readonly [resource: string]: { readonly [name: string]: ExportHandler }
}

export class ExportsRegistry {
  private readonly registry = new Map<string, Map<string, ExportHandler>>()
  // Cached per-resource proxies so accessing `ragempExports.inventory` twice
  // returns the same Proxy object rather than allocating a new one each time.
  private readonly namespaceProxyCache = new Map<string, Record<string, ExportHandler>>()

  register(resource: string, name: string, handler: ExportHandler): void {
    let namespace = this.registry.get(resource)
    if (!namespace) {
      namespace = new Map()
      this.registry.set(resource, namespace)
    }
    namespace.set(name, handler)
  }

  call(resource: string, name: string, ...args: any[]): any {
    const namespace = this.registry.get(resource)
    if (!namespace) throw new Error(`[exports] Resource "${resource}" has no registered exports.`)
    const handler = namespace.get(name)
    if (!handler) throw new Error(`[exports] Export "${name}" not found in resource "${resource}".`)
    return handler(...args)
  }

  // Returns the namespace proxy for a resource if it has registered exports,
  // or undefined — matching FiveM's getResource returning undefined for unknown resources.
  resourceProxy<T>(resource: string): T | undefined {
    if (!this.registry.has(resource)) return undefined
    let namespaceProxy = this.namespaceProxyCache.get(resource)
    if (!namespaceProxy) {
      namespaceProxy = new Proxy({} as Record<string, ExportHandler>, {
        get:
          (_, name: string) =>
          (...args: any[]) =>
            this.call(resource, name, ...args),
      })
      this.namespaceProxyCache.set(resource, namespaceProxy)
    }
    return namespaceProxy as T
  }

  createProxy(): ExportsProxy {
    return new Proxy({} as ExportsProxy, {
      get: (_, resource: string) => {
        let namespaceProxy = this.namespaceProxyCache.get(resource)
        if (!namespaceProxy) {
          namespaceProxy = new Proxy({} as Record<string, ExportHandler>, {
            get:
              (_, name: string) =>
              (...args: any[]) =>
                this.call(resource, name, ...args),
          })
          this.namespaceProxyCache.set(resource, namespaceProxy)
        }
        return namespaceProxy
      },
    })
  }
}

export const exportsRegistry = new ExportsRegistry()

export function registerExport(resource: string, name: string, handler: ExportHandler): void {
  exportsRegistry.register(resource, name, handler)
}

export function callExport(resource: string, name: string, ...args: any[]): any {
  return exportsRegistry.call(resource, name, ...args)
}
