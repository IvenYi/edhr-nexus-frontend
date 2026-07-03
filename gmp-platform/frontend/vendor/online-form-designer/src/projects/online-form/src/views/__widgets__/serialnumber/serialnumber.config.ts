import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PanelType } from '/@online-form/views/designer/enums';
import { PaperWidgeType } from '@gct/nocode-base';
import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.Serialnumber> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-xuhao',
  type: PaperWidgeType.Serialnumber,
  name: $t('sys.index'),
  sort: 1000,

  initialValue: 1,
  autoAddValue: 1,
  dragToPos: [PanelType.Cell],
};
