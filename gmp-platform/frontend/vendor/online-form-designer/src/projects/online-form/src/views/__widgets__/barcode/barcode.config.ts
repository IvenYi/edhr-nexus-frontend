import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PanelType } from '/@online-form/views/designer/enums';
import { PaperWidgeType, PaperWidgeValueType, BwipCodeType } from '@gct/nocode-base';

import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.Barcode> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-tiaoma',
  type: PaperWidgeType.Barcode,
  name: $t('sys.onlineForm.barcode'),
  sort: 400,
  value: 'THIS IS CODE 39',
  valueType: PaperWidgeValueType.Fixed,
  layout: {
    height: 36,
    width: 80,
    left: 0,
    top: 0,
  },
  codeType: BwipCodeType.Code39,
  showValue: true,
  dragToPos: BaseConfig.dragToPos?.concat(PanelType.Cell),
  styles: {
    justifyContent: 'flex-start',
  },
};
