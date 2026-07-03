import { FIELD_TYPE, CreateType, FieldIconMap, EntityModelCategoryEnum } from '@gct/runtime';
import {
  ReportEnum,
  ExportType,
  RowHeightSettingEnum,
  sortTypeEnum,
  SummaryCalculationMethod,
} from './enum';
import { BaseField, Calculation } from './run_field';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import type { FieldMetaDTO } from '/@/apis/gct-apaas/model';
import { REPORT_TABLE_PAGE_TYPE } from '../constants';
import { IReportLinkStyle } from '../interface';
/**报表 */
export class ReportTable {
  /**唯一标识 不会变化 */
  _key: string = '';
  reportName: string = '报表名称';
  /**报表类型 */
  categorySelect: string = '';
  /**表格类型 */
  reportType: ReportEnum = ReportEnum.SCHEDULE_TABLE;
  //是否被限制查看
  isLimit?: boolean;
  /**是否被删除 */
  isDelete?: boolean;
  /**模型key */
  modelKey: string = '';
  /**模型大类 */
  modelCategory: EntityModelCategoryEnum = EntityModelCategoryEnum.ENTITY;
  /**字段对象池 */
  fieldMap: {
    [key: string]: BaseField;
  } = {};
  drillMap: {
    [key: string]: BaseField;
  } = {};
  /**行列转置 */
  rowColumnTransposition: boolean = false;
  /**数据列 */
  dataColumn: string[] = [];
  /**行维度 */
  rowDimension: string[] = [];
  /**列维度 */
  columnDimension: string[] = [];
  /**指标 */
  indicatorDimension: string[] = [];
  /**列总计计算方式 */
  calculationMethod?: Calculation;
  /**行总计计算方式 */
  row_calculationMethod?: Calculation;
  /**列小计 */
  subtotalMethod?: boolean = false;
  column_subtotals?: Calculation[];
  /**行小计 */
  row_subtotalMethod: boolean = false;
  row_subtotals?: Calculation[];
  /**多级表头 */
  multiLevelHeader: boolean = false;
  /**表头分组 */
  headerGrouping: HeaderGroupingType[] = [];
  /**合并同类单元格 */
  mergeCell: boolean = false;
  /**导出报表 */
  exportTable: boolean = false;
  /**导出类型 */
  exportType?: ExportType;
  /**使用分页 */
  pager: boolean = true;
  /**分页类型 */
  pageType: REPORT_TABLE_PAGE_TYPE = REPORT_TABLE_PAGE_TYPE.FIRST_DIMENSION;
  pageSize: number = 20;
  /**显示序号 */
  serialNumber: boolean = true;
  /**全屏 */
  fullScreen: boolean = false;
  /**自定义表头 */
  customHeader: boolean = false;
  /**表头排序 */
  headerSorting: boolean = false;
  /**快捷过滤 */
  filter: boolean = true;
  /**行高设置 */
  rowHeightSetting: RowHeightSetting;
  /**左边冻结列 */
  leftFixed: number = 0;
  /**右边冻结列 */
  rightFixed: number = 0;
  /**数据筛选 */
  dataFilter: { dataRule: string; dataRuleConfig: string } = { dataRule: '', dataRuleConfig: '' };
  /**排序字段 */
  sorts: { sortField: string; sortType: sortTypeEnum }[] = [];
  load: boolean = false;
  /**唯一标识 */
  _uuid: string = '';
  /**字段的模型属性 */
  _field_proto_map: {
    [key: string]: FieldMetaDTO;
  } = {};
  /**链接样式 */
  linkStyle?: IReportLinkStyle;
  /** 允许导出 */
  export?: boolean = true;
  constructor(data: any) {
    this.rowHeightSetting = new RowHeightSetting();
    this.calculationMethod = new Calculation();
    this.row_calculationMethod = new Calculation();
  }
  async run() {
    const { fieldMetaList = [] } = await getModelMetaDetail({
      modelKey: this.modelKey || 'em_qsvsqgiq_bdf7',
    });
    fieldMetaList.forEach((i) => {
      const { id, type, modelKey, modelCategory, key } = i;
      const field = new BaseField({ fieldType: type, id, modelCategory, modelKey, key });
      field.fieldName = i.name;
      this.fieldMap[id] = field;
      this.dataColumn = [];
      this.columnDimension = ['em_qsvsqgiq_bdf7$f_region_bdf7', 'em_qsvsqgiq_bdf7$f_province_bdf7'];
      this.rowDimension = ['em_qsvsqgiq_bdf7$f_ptype_bdf7', 'em_qsvsqgiq_bdf7$f_pbx_bdf7'];
      this.indicatorDimension = [
        'em_qsvsqgiq_bdf7$f_costprice_bdf7',
        'em_qsvsqgiq_bdf7$f_orderje_bdf7',
      ];
    });
    this.load = true;
  }
}

/**行高 */
class RowHeightSetting {
  type: RowHeightSettingEnum = RowHeightSettingEnum.LINE;
  /**最多显示多少行 */
  maxRow: number = 10;
}

/**表头分组 */
type HeaderGroupingType = {
  /**数据id 或者表头分组id*/
  id: string;
  /**是否是分组*/
  isGroup: boolean;
  /**表头分组名称 */
  title?: string;
  children?: HeaderGroupingType[];
};
