import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import { CellWidgetRenderComp, CellWidgetCategory } from '/@online-form/views/designer/enums';

export const config: CellWidget.Integer = {
  category: CellWidgetCategory.Integer,
  renderComp: CellWidgetRenderComp.Integer,
  isSuperScript: true,
  enableRangeValidate: false,
  enableStepCounter: false,
  stepCounter: 1,
};
