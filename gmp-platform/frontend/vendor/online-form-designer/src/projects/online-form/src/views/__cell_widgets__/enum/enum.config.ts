import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import { CellWidgetRenderComp, CellWidgetCategory } from '/@online-form/views/designer/enums';
import { LabelPosition, Orientation } from '@gct/nocode-base';

export const config: CellWidget.Enum = {
  category: CellWidgetCategory.Enum,
  renderComp: CellWidgetRenderComp.Select,
  options: [],
  fontSize: 12,
  letterSpace: 0,
  iconLabelSpace: 8,
  direction: Orientation.Landscape,
  labelPosition: LabelPosition.After,
};
