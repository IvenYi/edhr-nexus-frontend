import request from '@mobile/utils/request';
import type { ExportFormRequest, Resource, ResponseEntityImportResponse } from './model/index';

import type { AxiosRequestConfig } from 'axios';

/**
 * 导出表单模板
 * import { postOnlineFormTmplExportExport } from "/@/apis/gct-apaas/FormExportController"
 */
export async function postOnlineFormTmplExportExport(data: ExportFormRequest, config:AxiosRequestConfig = {}): Promise<Resource['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl-export/export`,
      method: 'post',
      data,
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
export async function postOnlineFormTmplExportImportJsonl(data: undefined, params: postOnlineFormTmplExportImportJsonlQueryInterface = {}, config:AxiosRequestConfig = {}): Promise<ResponseEntityImportResponse['data']> {
  return request(
    {
      url: `/gct-apaas/api/online-form-tmpl-export/importJsonl`,
      method: 'post',
      params,
      data,
      ...config,
    },
  );
}