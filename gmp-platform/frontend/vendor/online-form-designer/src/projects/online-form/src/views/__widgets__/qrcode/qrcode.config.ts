import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PanelType } from '/@online-form/views/designer/enums';
import { PaperWidgeType, PaperWidgeValueType, BwipCodeType } from '@gct/nocode-base';
import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.Qrcode> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-erweima1',
  type: PaperWidgeType.Qrcode,
  name: $t('sys.onlineForm.qrCode'),
  sort: 500,
  value: '',
  valueType: PaperWidgeValueType.Fixed,
  layout: {
    height: 48,
    width: 48,
    left: 0,
    top: 0,
  },
  codeType: BwipCodeType.QRCode,
  dragToPos: BaseConfig.dragToPos?.concat(PanelType.Cell),
};
