export interface IImportFailData {
  /** 表单名称 */
  name: string;
  /** 版本 */
  version: string;
  /** 是否是默认版本 */
  default: number;
  /** 表单类型 */
  formType: string;
  /** 子版本数据 */
  children?: IImportFailData[];
  /** 所属分类名称 */
  categoryName: string;
  /** 失败原因 */
  reason: string;
}

export interface IImportResult {
  /** 导入总数 */
  total: number;
  /** 导入成功数 */
  success: number;
  /** 导入失败数 */
  fail: number;
  /** 失败的数据信息 */
  failList: IImportFailData[];
}

/** 导入策略 */
export enum ImportType {
  /** 跳过 */
  JUMP = 'jump',
  /** 更新对应版本 */
  UPDATE = 'update',
}
