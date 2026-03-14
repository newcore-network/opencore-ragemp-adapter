import { injectable } from 'tsyringe'
import { IClientWebViewBridge } from '@open-core/framework/contracts/client'
import type {
  WebViewCapabilities,
  WebViewDefinition,
  WebViewFocusOptions,
  WebViewMessage,
} from '@open-core/framework/contracts/client'

const RAGEMP_WEBVIEW_EVENT = '__opencore:webview:message'

const RAGEMP_WEBVIEW_CAPABILITIES: WebViewCapabilities = {
  supportsFocus: true,
  supportsCursor: true,
  supportsInputPassthrough: true,
  supportsBidirectionalMessaging: true,
  supportsExecute: true,
  supportsHeadless: true,
}

function js(value: unknown): string {
  return JSON.stringify(value)
}

@injectable()
export class RageMPClientWebViewBridge extends IClientWebViewBridge {
  private readonly views = new Map<string, BrowserMp>()
  private readonly handlers = new Set<(message: WebViewMessage) => void | Promise<void>>()
  private eventRegistered = false

  getCapabilities(): WebViewCapabilities { return RAGEMP_WEBVIEW_CAPABILITIES }

  create(definition: WebViewDefinition): void {
    const existing = this.views.get(definition.id)
    if (existing) existing.destroy()

    const browser = mp.browsers.new(definition.url)
    browser.active = definition.visible ?? false
    browser.inputEnabled = definition.focused ?? false
    browser.mouseInputEnabled = definition.cursor ?? false
    this.views.set(definition.id, browser)
    this.ensureEventsRegistered()

    mp.events.add('browserDomReady', (readyBrowser: BrowserMp) => {
      if (readyBrowser !== browser) return
      browser.execute(`window.__OpenCoreWebView = {
        emit: function(event, payload) {
          if (typeof mp !== 'undefined' && typeof mp.trigger === 'function') {
            mp.trigger(${js(RAGEMP_WEBVIEW_EVENT)}, ${js(definition.id)}, event, JSON.stringify(payload ?? null));
          }
        }
      };`)
    })
  }

  destroy(viewId: string): void {
    const browser = this.views.get(viewId)
    if (!browser) return
    browser.destroy()
    this.views.delete(viewId)
  }

  exists(viewId: string): boolean { return this.views.has(viewId) }
  show(viewId: string): void {
    const browser = this.views.get(viewId)
    if (!browser) return
    browser.active = true
  }
  hide(viewId: string): void {
    const browser = this.views.get(viewId)
    if (!browser) return
    browser.active = false
  }
  focus(viewId: string, options: WebViewFocusOptions = {}): void {
    const browser = this.views.get(viewId)
    if (!browser) return
    browser.inputEnabled = true
    browser.mouseInputEnabled = options.cursor ?? true
    mp.gui.cursor.show(true, options.cursor ?? true)
  }
  blur(viewId: string): void {
    const browser = this.views.get(viewId)
    if (!browser) return
    browser.inputEnabled = false
    browser.mouseInputEnabled = false
    mp.gui.cursor.show(false, false)
  }
  send(viewId: string, event: string, payload: unknown): void {
    const browser = this.views.get(viewId)
    if (!browser) return
    browser.execute(`window.postMessage({ __opencoreWebView: true, action: ${js(event)}, data: ${js(payload)} }, '*');`)
  }
  onMessage(handler: (message: WebViewMessage) => void | Promise<void>): () => void {
    this.ensureEventsRegistered()
    this.handlers.add(handler)
    return () => this.handlers.delete(handler)
  }

  markAsChat(viewId: string): void {
    this.views.get(viewId)?.markAsChat()
  }

  execute(viewId: string, code: string): void {
    this.views.get(viewId)?.execute(code)
  }

  call(viewId: string, eventName: string, ...args: unknown[]): void {
    this.views.get(viewId)?.call(eventName, ...args)
  }

  callProc<T = unknown>(viewId: string, procName: string, ...args: unknown[]): Promise<T | undefined> {
    const browser = this.views.get(viewId)
    if (!browser) return Promise.resolve(undefined)
    return browser.callProc<T>(procName, ...args)
  }

  private ensureEventsRegistered(): void {
    if (this.eventRegistered) return
    this.eventRegistered = true
    mp.events.add(RAGEMP_WEBVIEW_EVENT, async (viewId: string, event: string, payloadJson: string) => {
      const payload = payloadJson ? JSON.parse(payloadJson) : null
      for (const handler of this.handlers) {
        await handler({ viewId, event, payload })
      }
    })
  }
}
