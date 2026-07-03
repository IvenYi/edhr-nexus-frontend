import { PageSizeEnum, ParamModelTypeEnum } from '../../constant';

import type {
  BaseCoreComponent,
  ISubTable2DInfo,
  ICheckTable2DInfo,
  IToFieldItem,
  IMaterialConsumeTableInfo,
} from '../common/base';

export interface IPaperProps {
  /** 纸张类型 */
  pageSize: PageSizeEnum;
  /** 纸张宽度 */
  pageWidth: number;
  /** 纸张高度 */
  pageHeight: number;
  /** 纸张边距 */
  pageMargins: string;
  /** 包含的子表字段key */
  subTableFieldMap: string[];
  /** url参数对应字段【用于把url参数的值设置到字段上（页面没选的话保存的时候也要带上）】 */
  globalParams: Record<string, string | Record<string, string>>;
  /** 参数映射数组 */
  paramsMapList: Array<
    IToFieldItem & {
      /** 参数key */
      formKey: string;
      /** 参数映射类型 */
      paramMapType: ParamModelTypeEnum;
      /** 模型key */
      modelKey: string | undefined;
      /** 是否是子表 */
      subModel: number | undefined;
      /** 子表字段key */
      subFieldKey: string | undefined;
    }
  >;
  /** 数据源 */
  customDataSource: Array<any>;
  /** table 单元格宽度 */
  colsWidth: number[];
  /**表头 ids */
  theadIds: [];
  /** 老固定表 包含的固定子表信息Map */
  fixedTableInfoMap: Array<{
    field: string;
    /** 渲染固定表数据行数 */
    renderDataRowsLen: number;
  }>;
  /** 固定表字段信息 */
  fixedTableFieldMap: Record<string, any>;
  /** 新固定表初始行数信息 */
  fixedTableLenMap: Record<string, number>;
  /** 二维表关联信息列表 */
  subTable2DList: Array<ISubTable2DInfo>;
  /** 检验二维表关联信息列表 */
  checkTable2DList: Array<ICheckTable2DInfo>;
  /** 物料消耗表信息列表 */
  materialConsumeTableList: Array<IMaterialConsumeTableInfo>;
  /** 物料平衡表信息列表 */
  materialBalanceTableList: Array<IMaterialConsumeTableInfo>;
  /** 脚本内容 */
  javascript: string;
}

export interface IPaper extends BaseCoreComponent.BasicSchema {
  /** 页眉 */
  headerWidgets?: any[];
  /** 页脚 */
  footerWidgets?: any[];
  /** 水印图片 */
  watermarks?: any[];
  props: IPaperProps;
}
