import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PanelType } from '/@online-form/views/designer/enums';
import { PaperWidgeType, DiagonalDirection } from '@gct/nocode-base';
import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.Diagonal> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-wenben1',
  type: PaperWidgeType.Diagonal,
  name: $t('sys.onlineForm.headerSubtable'),
  sort: 700,
  size: 2,
  names: ['', '', ''],
  bindFields: [undefined, undefined, undefined],
  enableFields: [false, false, false],
  direction: DiagonalDirection.Forward,
  dragToPos: [PanelType.Cell],
};
