import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PanelType } from '/@online-form/views/designer/enums';
import { PaperWidgeType, TimeDiffFormat } from '@gct/nocode-base';
import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.TimeDiff> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-wenben1',
  type: PaperWidgeType.TimeDiff,
  name: $t('sys.onlineForm.timeDiff'),
  sort: 1200,
  dragToPos: [PanelType.Cell],
  format: TimeDiffFormat.D_H_MIN_S,
  startDefault: false,
  startField: {},
  endDefault: false,
  endField: {},
};
