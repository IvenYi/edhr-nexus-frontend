import { GctPopup } from '@mobile/utils/popup';
import Info from './info.vue';

export function openFormInfoPopup(info: any) {
  GctPopup.open(Info, {
    showFooter: false,
    context: {
      info,
    },
  });
}