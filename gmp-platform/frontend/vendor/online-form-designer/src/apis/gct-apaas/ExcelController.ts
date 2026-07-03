import { defHttp } from '@/utils/http/axios';
import { ResponseEntityobject, ResponseEntityImportModelData, ResponseEntity, ResponseEntityExcelValidateResponse } from './model/index';

/**
 * 导入数据
 * import { getExcelDataDoImport } from "/@/apis/gct-apaas/ExcelController"
 */
export interface getExcelDataDoImportQueryInterface {
  duplicateKeyUpdate: number; // 数据重复时的导入策略 1 新增及更新/0 忽略重复数据/2仅更新数据
  fileId: string; // 文件id
  importInvalidate?: number; // 数据校验不通过时是否导入 1：导入；0：不导入; 2 错误即停止
  ref_field_key_?: string; // 引用主模型数据的字段KEY(仅子表导入需要传)
  ref_master_id_?: string; // 引用主模型数据的id_(仅子表导入需要传)
  updateStrategy?: boolean; // 空值是否更新
}
export async function getExcelDataDoImport(params: getExcelDataDoImportQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel/data/doImport`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * excel数据导出
 * import { getExcelDataExport } from "/@/apis/gct-apaas/ExcelController"
 */
export interface getExcelDataExportQueryInterface {
  modelKey: string; // 模型key
  tmplKey: string; // 模板key
}
export async function getExcelDataExport(params: getExcelDataExportQueryInterface = {}, config = {}): Promise<any> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel/data/export`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * excel数据导入
 * import { postExcelDataImport } from "/@/apis/gct-apaas/ExcelController"
 */
export interface postExcelDataImportQueryInterface {
  duplicateKeyUpdate?: number; // 数据重复时的导入策略 1 新增及更新/0 忽略重复数据
  headerRowNo?: number; // 标题行号
  importInvalidate?: number; // 数据校验不通过时是否导入
  modelKey: string; // 模型key
  startRowNo?: number; // 数据起始行号
  tmplKey: string; // 模板key
}
export async function postExcelDataImport(data: any, params: postExcelDataImportQueryInterface = {}, config = {}): Promise<ResponseEntityobject['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/excel/data/import`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * excel数据导入数据预览
 * import { getExcelDataPreview } from "/@/apis/gct-apaas/ExcelController"
 */
export interface getExcelDataPreviewQueryInterface {
  fileId: string; // 文件id
}
export async function getExcelDataPreview(params: getExcelDataPreviewQueryInterface = {}, config = {}): Promise<ResponseEntityImportModelData['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel/data/preview`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * 下载错误报告
 * import { getExcelDataReport } from "/@/apis/gct-apaas/ExcelController"
 */
export interface getExcelDataReportQueryInterface {
  fileId: string; // 文件id
}
export async function getExcelDataReport(params: getExcelDataReportQueryInterface = {}, config = {}): Promise<ResponseEntity['data']> {
  return defHttp.get(
    {
      url: `/gct-apaas/api/excel/data/report`,
      params,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}

/**
 * excel数据导入数据校验
 * import { postExcelDataValidate } from "/@/apis/gct-apaas/ExcelController"
 */
export interface postExcelDataValidateQueryInterface {
  headerRowNo?: number; // 标题行号
  importType?: number; // 导入类型 1：普通导入，2：主子同时导
  modelKey: string; // 模型key
  startRowNo?: number; // 数据起始行号
  tmplKey: string; // 模板key
}
export async function postExcelDataValidate(data: any, params: postExcelDataValidateQueryInterface = {}, config = {}): Promise<ResponseEntityExcelValidateResponse['data']> {
  return defHttp.post(
    {
      url: `/gct-apaas/api/excel/data/validate`,
      params,
      data,
    },
    {
      joinTenantIdToHeader: true,
      ...config,
    },
  );
}