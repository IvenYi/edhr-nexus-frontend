import { ReportDesignView } from './report-design-view/report-design-view';

export { ReportData as ReportTable } from './report-table/report-table';
export { transformSchemaByData } from './schema/const';
export { ReportConfig } from './report-config/report-config';

export const ReportPage = () => import('./report-table/report-page.vue');

export const openReportDesign = async (id?: string, type?: string, categoryId?: string) => {
  const res = await gct.openUtil.fullScreen(ReportDesignView, { id, reportType: type, categoryId });
  return res;
};
