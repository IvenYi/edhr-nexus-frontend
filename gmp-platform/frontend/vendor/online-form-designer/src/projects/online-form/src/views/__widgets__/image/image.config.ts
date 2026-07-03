import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PanelType } from '/@online-form/views/designer/enums';
import { PaperWidgeType, WidgetImageSizeMode } from '@gct/nocode-base';
import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.Image> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-tupian_wudaima',
  type: PaperWidgeType.Image,
  name: $t('sys.appDesigner.appLogoImage'),
  sort: 200,
  value: undefined,
  layout: {
    height: 48,
    width: 48,
    left: 0,
    top: 0,
  },
  dragToPos: BaseConfig.dragToPos?.concat(PanelType.Cell),
  sizeMode: WidgetImageSizeMode.RESPONSIVE,
};
