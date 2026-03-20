import { injectable } from 'tsyringe'
import { IClientWebViewBridge } from '@open-core/framework/contracts/client'
import type {
  WebViewCapabilities,
  WebViewDefinition,
  WebViewFocusOptions,
  WebViewMessage,
} from '@open-core/framework/contracts/client'
import { releaseRageMPNativeChat, suppressRageMPNativeChat } from './native-chat'

const RAGEMP_WEBVIEW_EVENT = '__opencore:webview:message'

const RAGEMP_WEBVIEW_CAPABILITIES: WebViewCapabilities = {
  supportsFocus: true,
  supportsCursor: true,
  supportsInputPassthrough: true,
  supportsBidirectionalMessaging: true,
  supportsExecute: true,
  supportsHeadless: true,
  supportsChatMode: true,
}

function js(value: unknown): string {
  return JSON.stringify(value)
}

@injectable()
export class RageMPClientWebViewBridge extends IClientWebViewBridge {
  private readonly views = new Map<string, BrowserMp>()
  private readonly browserViewIds = new Map<BrowserMp, string>()
  private readonly chatModeViews = new Set<string>()
  private readonly handlers = new Set<(message: WebViewMessage) => void | Promise<void>>()
  private eventRegistered = false
  private domReadyRegistered = false

  getCapabilities(): WebViewCapabilities { return RAGEMP_WEBVIEW_CAPABILITIES }

  create(definition: WebViewDefinition): void {
    const existing = this.views.get(definition.id)
    if (existing) {
      this.chatModeViews.delete(definition.id)
      releaseRageMPNativeChat(definition.id)
      this.browserViewIds.delete(existing)
      existing.destroy()
    }

    if (definition.chatMode) {
      try {
        mp.gui.chat.activate(false)
        mp.gui.chat.show(false)
      } catch {
        // Ignore if native chat is not ready yet.
      }
    }

    const browser = mp.browsers.new(definition.url)
    browser.active = definition.visible ?? false
    browser.inputEnabled = definition.focused ?? false
    browser.mouseInputEnabled = definition.cursor ?? false
    this.views.set(definition.id, browser)
    this.browserViewIds.set(browser, definition.id)
    this.ensureEventsRegistered()
    this.ensureBrowserReadyRegistered()

    if (definition.chatMode) {
      this.chatModeViews.add(definition.id)
      suppressRageMPNativeChat(definition.id)
      browser.markAsChat()
    }
  }

  destroy(viewId: string): void {
    const browser = this.views.get(viewId)
    if (!browser) return
    browser.destroy()
    this.chatModeViews.delete(viewId)
    releaseRageMPNativeChat(viewId)
    this.browserViewIds.delete(browser)
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
    const browser = this.views.get(viewId)
    if (!browser) return

    this.chatModeViews.add(viewId)
    suppressRageMPNativeChat(viewId)
    browser.markAsChat()
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

  private ensureBrowserReadyRegistered(): void {
    if (this.domReadyRegistered) return
    this.domReadyRegistered = true

    mp.events.add('browserDomReady', (browser: BrowserMp) => {
      const viewId = this.browserViewIds.get(browser)
      if (!viewId) return

      this.injectBridge(browser, viewId)
    })
  }

  private injectBridge(browser: BrowserMp, viewId: string): void {
    browser.execute(`window.__OpenCoreWebView = {
      emit: function(event, payload) {
        if (typeof mp !== 'undefined' && typeof mp.trigger === 'function') {
          mp.trigger(${js(RAGEMP_WEBVIEW_EVENT)}, ${js(viewId)}, event, JSON.stringify(payload ?? null));
        }
      }
    };`)
  }
}
