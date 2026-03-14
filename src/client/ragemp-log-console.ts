import { injectable } from 'tsyringe'
import {
  IClientLogConsole,
  type ClientLogConsoleCapabilities,
} from '@open-core/framework/contracts/client'
import { setClientLogConsole } from '@open-core/framework/kernel'

const RAGEMP_CLIENT_LOG_CAPABILITIES: ClientLogConsoleCapabilities = {
  supportsColors: false,
  supportsStructuredData: false,
  supportsRichFormatting: false,
}

function stringifyDetails(details: unknown): string {
  if (details === undefined) return ''
  if (typeof details === 'string') return details

  try {
    return JSON.stringify(details)
  } catch {
    return String(details)
  }
}

@injectable()
export class RageMPClientLogConsole extends IClientLogConsole {
  getCapabilities(): ClientLogConsoleCapabilities {
    return RAGEMP_CLIENT_LOG_CAPABILITIES
  }

  trace(message: string, details?: unknown): void {
    this.write('logInfo', `[TRACE] ${message}`, details)
  }

  debug(message: string, details?: unknown): void {
    this.write('logInfo', `[DEBUG] ${message}`, details)
  }

  info(message: string, details?: unknown): void {
    this.write('logInfo', message, details)
  }

  warn(message: string, details?: unknown): void {
    this.write('logWarning', message, details)
  }

  error(message: string, details?: unknown): void {
    this.write('logError', message, details)
  }

  private write(method: 'logInfo' | 'logWarning' | 'logError', message: string, details?: unknown): void {
    const suffix = stringifyDetails(details)
    const output = suffix ? `${message} ${suffix}` : message
    mp.console[method](output)
  }
}

export function installRageMPClientLogConsole(logConsole: IClientLogConsole): void {
  setClientLogConsole(logConsole)
}
