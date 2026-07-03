import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PanelType } from '/@online-form/views/designer/enums';
import { PaperWidgeType } from '@gct/nocode-base';
import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.Power> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-jiaobiao-shang',
  type: PaperWidgeType.Power,
  name: $t('sys.onlineForm.power'),
  sort: 800,
  dragToPos: [PanelType.Cell],
};
