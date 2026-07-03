import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';
import { PaginationFormatOptions } from '/@online-form/views/designer/enums';
import { PaperWidgeType, PaperWidgeValueType } from '@gct/nocode-base';
import { BaseConfig } from '../base.config';

export const widget: Partial<PaperWidget.Pagination> = {
  ...BaseConfig,
  id: undefined,
  icon: 'icon-yema',
  type: PaperWidgeType.Pagination,
  name: $t('sys.onlineForm.pageNumber'),
  sort: 300,
  layout: {
    height: 28,
    width: 120,
    left: 0,
    top: 0,
  },
  resizable: true,
  format: PaginationFormatOptions[0].exp,
  customFormat: undefined,
  styles: {
    fontFamily: '',
    fontSize: 14,
    color: '#000000',
    fontStyle: undefined,
    fontWeight: undefined,
    textDecoration: undefined,
    alignItems: 'center',
    justifyContent: 'center',
  },
};
