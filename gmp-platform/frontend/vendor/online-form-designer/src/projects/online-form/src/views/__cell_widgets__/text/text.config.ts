import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import { CellWidgetRenderComp, CellWidgetCategory } from '/@online-form/views/designer/enums';

export const config: CellWidget.Text = {
  category: CellWidgetCategory.Text,
  renderComp: CellWidgetRenderComp.Input,
};
