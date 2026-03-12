import { injectable, inject } from 'tsyringe'
import { IExports, IResourceInfo } from '@open-core/framework'
import { exportsRegistry } from '../shared/exports-registry'

@injectable()
export class RageMPExports extends IExports {
  constructor(@inject(IResourceInfo as any) private readonly resourceInfo: IResourceInfo) {
    super()
  }

  register(exportName: string, handler: (...args: any[]) => any): void {
    exportsRegistry.register(this.resourceInfo.getCurrentResourceName(), exportName, handler)
  }

  getResource<T = any>(resourceName: string): T | undefined {
    return exportsRegistry.resourceProxy<T>(resourceName)
  }
}
