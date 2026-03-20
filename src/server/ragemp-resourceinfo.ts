import { IResourceInfo } from '@open-core/framework/contracts/server'

declare const __OPENCORE_RESOURCE_NAME__: string | undefined

export class RageMPResourceInfo extends IResourceInfo {
  getCurrentResourceName(): string {
    if (typeof __OPENCORE_RESOURCE_NAME__ === 'string' && __OPENCORE_RESOURCE_NAME__.trim()) {
      return __OPENCORE_RESOURCE_NAME__
    }

    if (typeof __dirname !== 'string') return 'default'

    const normalized = __dirname.replace(/\\/g, '/')
    const parts = normalized.split('/')

    // RageMP server scripts live under packages/<resourceName>/...
    const packagesIndex = parts.lastIndexOf('packages')
    if (packagesIndex !== -1 && parts[packagesIndex + 1]) {
      return parts[packagesIndex + 1]
    }

    // fallback: last folder segment
    return parts[parts.length - 1] || 'default'
  }

  getCurrentResourcePath(): string {
    if (typeof __dirname === 'string') return __dirname
    return process.cwd()
  }
}
