import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PaperWidgeType, PaperWidgeValueType } from '@gct/nocode-base';
import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.Text> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-wenben1',
  type: PaperWidgeType.Text,
  name: $t('sys.text'),
  value: $t('sys.appDesigner.designView.components.select.sampleText'),
  sort: 100,
  valueType: PaperWidgeValueType.Fixed,
  layout: {
    height: 28,
    width: 120,
    left: 0,
    top: 0,
  },
  styles: {
    fontFamily: '',
    fontSize: 14,
    color: '#000000',
    fontStyle: undefined,
    fontWeight: undefined,
    textDecoration: undefined,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
};
