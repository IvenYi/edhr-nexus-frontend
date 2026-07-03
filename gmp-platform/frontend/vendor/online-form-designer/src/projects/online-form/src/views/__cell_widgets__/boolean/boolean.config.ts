import { CellWidgetRenderComp, CellWidgetCategory } from '/@online-form/views/designer/enums';
import { LabelPosition, Orientation, BooleanShowMode } from '@gct/nocode-base';
import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';

export const config: CellWidget.Boolean = {
  category: CellWidgetCategory.Boolean,
  renderComp: CellWidgetRenderComp.Checkbox,
  defaultValue: null,
  fontSize: 12,
  letterSpace: 0,
  iconLabelSpace: 8,
  showMode: BooleanShowMode.Both,
  direction: Orientation.Landscape,
  labelPosition: LabelPosition.After,
  trueAttachFields: undefined,
  falseAttachFields: undefined,
};
