import { injectable } from 'tsyringe'
import {
  IClientNotificationBridge,
  type ClientNotificationDefinition,
} from '@open-core/framework/contracts/client'

const ICON_MAP: Record<NonNullable<ClientNotificationDefinition['type']>, number> = {
  info: 1,
  success: 2,
  warning: 3,
  error: 4,
}

@injectable()
export class RageMPClientNotificationBridge extends IClientNotificationBridge {
  show(definition: ClientNotificationDefinition): void {
    switch (definition.kind) {
      case 'feed':
        mp.game.ui.setNotificationTextEntry('STRING')
        mp.game.ui.addTextComponentSubstringPlayerName(definition.message)
        mp.game.ui.drawNotification(definition.blink ?? false, definition.saveToBrief ?? true)
        return
      case 'typed':
        mp.game.ui.beginTextCommandThefeedPost('STRING')
        mp.game.ui.addTextComponentSubstringPlayerName(definition.message)
        mp.game.ui.endTextCommandThefeedPostMessagetext(
          'CHAR_SOCIAL_CLUB',
          'CHAR_SOCIAL_CLUB',
          true,
          ICON_MAP[definition.type ?? 'info'],
          '',
          definition.message,
        )
        return
      case 'advanced':
        mp.game.ui.setNotificationTextEntry('STRING')
        mp.game.ui.addTextComponentSubstringPlayerName(definition.message)
        mp.game.ui.setNotificationMessage(
          'CHAR_HUMANDEFAULT',
          'CHAR_HUMANDEFAULT',
          definition.flash ?? false,
          ICON_MAP[definition.type ?? 'info'],
          definition.title ?? '',
          definition.subtitle ?? '',
        )
        mp.game.ui.drawNotification(definition.flash ?? false, definition.saveToBrief ?? true)
        return
      case 'help':
        mp.game.ui.beginTextCommandDisplayHelp('STRING')
        mp.game.ui.addTextComponentSubstringPlayerName(definition.message)
        mp.game.ui.endTextCommandDisplayHelp(
          0,
          definition.looped ?? false,
          definition.beep ?? true,
          definition.duration ?? 5000,
        )
        return
      case 'subtitle':
        mp.game.ui.beginTextCommandPrint('STRING')
        mp.game.ui.addTextComponentSubstringPlayerName(definition.message)
        mp.game.ui.endTextCommandPrint(definition.duration ?? 2500, true)
        return
      case 'floating':
        if (!definition.worldPosition) return
        mp.game.ui.setFloatingHelpTextWorldPosition(1, definition.worldPosition.x, definition.worldPosition.y, definition.worldPosition.z)
        mp.game.ui.setFloatingHelpTextStyle(1, 1, 2, -1, 3, 0)
        mp.game.ui.beginTextCommandDisplayHelp('STRING')
        mp.game.ui.addTextComponentSubstringPlayerName(definition.message)
        mp.game.ui.endTextCommandDisplayHelp(2, false, false, -1)
        return
    }
  }

  clear(scope?: 'help' | 'subtitle' | 'all'): void {
    if (!scope || scope === 'all' || scope === 'help') {
      mp.game.ui.clearAllHelpMessages()
    }
    if (!scope || scope === 'all' || scope === 'subtitle') {
      mp.game.ui.clearPrints()
    }
  }
}
