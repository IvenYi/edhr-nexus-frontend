import { ReportDataSetDesign } from './views/report-data-set-design';

export type * from './interface';

export { openReportDataSetPreviewModal } from './views/modal/report-data-set-preview-modal';
export { ReportDataSetPreview } from './views/report-data-set-preview';
export { DataResourceBI } from './components/data-resource-BI';
export { ModelConfig } from './widgets/model-config';
export { FieldsConfig } from './widgets/fields-config';
export { ReportDataSetStepBI } from './enums';
export { useReportDataSetDesignStore } from './store';

export const openReportDataSetDesign = async (id?: string) => {
  const res = await gct.openUtil.fullScreen(ReportDataSetDesign, { id });
  return res;
};
