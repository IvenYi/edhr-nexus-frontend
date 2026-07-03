import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PaperWidgeType, LineType, LineDirection } from '@gct/nocode-base';
import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.Line> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-xiantiao',
  type: PaperWidgeType.Line,
  name: $t('sys.pageDesigner.line'),
  sort: 900,
  layout: {
    height: 30,
    width: 75,
    left: 0,
    top: 0,
  },
  direction: LineDirection.horizontal,
  lineStyle: {
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: LineType.Solid,
  },

  resizable: true,
  styles: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragToPos: BaseConfig.dragToPos,
};
