import type { InjectionToken } from 'tsyringe'
import { injectable, inject } from 'tsyringe'
import { IExports, IResourceInfo } from '@open-core/framework'
import { exportsRegistry } from '../shared/exports-registry'

@injectable()
export class RageMPExports extends IExports {
  constructor(
    @inject(IResourceInfo as InjectionToken<IResourceInfo>)
    private readonly resourceInfo: IResourceInfo,
  ) {
    super()
  }

  register(exportName: string, handler: (...args: readonly unknown[]) => unknown): void {
    exportsRegistry.register(this.resourceInfo.getCurrentResourceName(), exportName, handler)
  }

  getResource<T = unknown>(resourceName: string): T | undefined {
    return exportsRegistry.resourceProxy<T>(resourceName)
  }
}
