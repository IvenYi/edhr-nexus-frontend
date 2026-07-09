import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import { CellWidgetRenderComp, CellWidgetCategory } from '/@online-form/views/designer/enums';

export const config: CellWidget.Decimal = {
  category: CellWidgetCategory.Decimal,
  renderComp: CellWidgetRenderComp.Decimal,
  isSuperScript: true,
  enableRangeValidate: false,
};
