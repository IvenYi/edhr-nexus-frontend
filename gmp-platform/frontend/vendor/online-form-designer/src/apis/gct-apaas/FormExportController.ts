import { defHttp } from '@/utils/http/axios';
import { ExportFormRequest, Resource, ResponseEntityImportResponse } from './model/index';

/**
 * 导出表单模板
 * import { postOnlineFormTmplExportExport } from "/@/apis/gct-apaas/FormExportController"
 */
export async function postOnlineFormTmplExportExport(data: ExportFormRequest, config = {}): Promise<Resource['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-tmpl-export/export`,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 表单模板导入
 * import { postOnlineFormTmplExportImportJsonl } from "/@/apis/gct-apaas/FormExportController"
 */
export interface postOnlineFormTmplExportImportJsonlQueryInterface {
  categoryId?: string; // categoryId
  importType: string; // importType
}
export async function postOnlineFormTmplExportImportJsonl(data: any, params: postOnlineFormTmplExportImportJsonlQueryInterface = {}, config = {}): Promise<ResponseEntityImportResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/online-form-tmpl-export/importJsonl`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}