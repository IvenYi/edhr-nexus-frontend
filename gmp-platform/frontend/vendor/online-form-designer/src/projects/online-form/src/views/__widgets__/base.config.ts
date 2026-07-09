import { PanelType } from '/@online-form/views/designer/enums';

import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';

export const BaseConfig: Partial<PaperWidget.BasicSchema> = {
  resizable: true,
  dragToPos: [PanelType.Paper, PanelType.PaperHeader, PanelType.PaperFooter],
};
