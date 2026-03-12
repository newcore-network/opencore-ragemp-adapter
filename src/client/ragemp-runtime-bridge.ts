import { injectable } from 'tsyringe'
import { IClientRuntimeBridge } from '@open-core/framework/client'
import { exportsRegistry } from '../shared/exports-registry'
import { KEYBOARD_KEY_MAP, MOUSE_KEY_MAP } from './key-maps'

/**
 * RAGE Multiplayer implementation of the client runtime bridge.
 *
 * RageMP does not have NUI, key mappings, or resource exports in the same
 * way as FiveM. Methods that have no direct equivalent are no-ops or fall
 * back to sensible alternatives.
 */
@injectable()
export class RageMPRuntimeBridge extends IClientRuntimeBridge {
  private readonly tickHandles = new Map<unknown, ReturnType<typeof setInterval>>()
  private readonly commandHandlers = new Map<string, (...args: any[]) => void>()
  private tickSeq = 0

  private executeRegisteredCommand(commandName: string, ...args: any[]): void {
    const handler = this.commandHandlers.get(commandName)
    if (!handler) return
    handler(...args)
  }

  getCurrentResourceName(): string {
    // RageMP does not provide an equivalent to FiveM's GetCurrentResourceName().
    // Client scripts are executed from the compiled bundle inside the resource
    // folder (usually under `client_packages/<resourceName>/...`).
    // To emulate FiveM behaviour in the adapter layer, we infer the resource
    // name by parsing `__dirname` and extracting the folder located directly
    // after `client_packages`. If the structure cannot be detected, we fall
    // back to the last directory name.

    if (typeof __dirname !== 'string') return 'default'

    const normalized = __dirname.replace(/\\/g, '/')
    const parts = normalized.split('/')

    const clientPackageLastIndex = parts.lastIndexOf('client_packages')

    if (clientPackageLastIndex !== -1 && parts[clientPackageLastIndex + 1]) {
      return parts[clientPackageLastIndex + 1]
    }

    // fallback: last folder name
    return parts[parts.length - 1] || 'default'
  }

  on(eventName: string, handler: (...args: any[]) => void | Promise<void>): void {
    mp.events.add(eventName, (...args: any[]) => {
      void handler(...args)
    })
  }

  registerCommand(
    commandName: string,
    handler: (...args: any[]) => void,
    _restricted: boolean,
  ): void {
    if (commandName.startsWith('+') || commandName.startsWith('-')) {
      this.commandHandlers.set(commandName, handler)
      return
    }

    // RageMP does not support registering chat/console commands from the client.
  }

  registerKeyMapping(
    commandName: string,
    _description: string,
    inputMapper: string,
    key: string,
  ): void {
    let keyCode: number | undefined

    if (inputMapper === 'keyboard') {
      keyCode = KEYBOARD_KEY_MAP[key.toUpperCase()]
    } else if (inputMapper === 'mouse_button') {
      keyCode = MOUSE_KEY_MAP[key.toUpperCase()]
    }

    if (keyCode === undefined) return

    mp.keys.bind(keyCode, true, () => {
      this.executeRegisteredCommand(commandName)
    })
    mp.keys.bind(keyCode, false, () => {
      this.executeRegisteredCommand(
        commandName.startsWith('+') ? `-${commandName.slice(1)}` : `-${commandName}`,
      )
    })
  }

  setTick(handler: () => void | Promise<void>): unknown {
    const handle = ++this.tickSeq
    const interval = setInterval(() => {
      void handler()
    }, 0)
    this.tickHandles.set(handle, interval)
    return handle
  }

  clearTick(handle: unknown): void {
    const interval = this.tickHandles.get(handle)
    if (interval !== undefined) {
      clearInterval(interval)
      this.tickHandles.delete(handle)
    }
  }

  getGameTimer(): number {
    return mp.game.invoke('0xA4EA0691') // GetGameTimer
  }

  registerNuiCallback(
    _eventName: string,
    _handler: (data: any, cb: (response: unknown) => void) => void | Promise<void>,
  ): void {
    // TODO: Still looking for a good way to implement this.
  }

  sendNuiMessage(_message: string): void {
    // TODO: Still looking for a good way to implement this.
  }

  setNuiFocus(_hasFocus: boolean, _hasCursor: boolean): void {
    // TODO: Still looking for a good way to implement this.
  }

  setNuiFocusKeepInput(_keepInput: boolean): void {
    // TODO: Still looking for a good way to implement this.
  }

  registerExport(exportName: string, handler: (...args: any[]) => any): void {
    exportsRegistry.register(this.getCurrentResourceName(), exportName, handler)
  }
}
