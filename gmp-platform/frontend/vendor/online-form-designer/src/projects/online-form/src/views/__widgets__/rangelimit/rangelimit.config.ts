import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PanelType } from '/@online-form/views/designer/enums';
import { PaperWidgeType } from '@gct/nocode-base';
import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.RangeLimit> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-wenben1',
  type: PaperWidgeType.RangeLimit,
  name: $t('sys.onlineForm.upperLowerLimits'),
  sort: 800,
  dragToPos: [PanelType.Cell],
};
