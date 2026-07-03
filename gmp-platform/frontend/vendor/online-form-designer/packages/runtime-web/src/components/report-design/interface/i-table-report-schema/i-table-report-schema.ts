import { REPORT_TABLE_PAGE_TYPE } from "../../constants";
import { Calculation, sortTypeEnum } from "../../schema";
import { IReportSchema } from "../i-report-schema/i-report-schema";
import { ITableReportField } from "../i-table-report-field/i-table-report-field";

/**
 * 表格报表配置
 *
 * @export
 * @interface ITableReportSchema
 * @extends {IReportSchema}
 */
export interface ITableReportSchema extends IReportSchema {
  /**
   * 表格报表数据列配置
   *
   * @type {string[]}
   */
  dataColumn: string[];
  /**
   * 行维度
   *
   * @type {string[]}
   */
  rowDimension: string[];
  /**
   * 列维度
   *
   * @type {string[]}
   */
  columnDimension: string[];
  /**
   * 指标
   *
   * @type {string[]}
   */
  indicatorDimension: string[];
  /**
   * 行列转置
   *
   * @type {boolean}
   */
  rowColumnTransposition: boolean;
  /**
   * 表头排序
   *
   * @default true
   */
  headerSorting: boolean;
  /**
   * 报表字段集合
   *
   * @type {{[key: string]: ITableReportField}}
   */
  fieldMap: { [key: string]: ITableReportField };
  /**
   * 钻取层级属性 map 合集
   */
  drillMap: { [key: string]: ITableReportField };
  /**列总计 */
  calculationMethod: Calculation;
  /**行总计 */
  row_calculationMethod: Calculation;
  /**
   * 列小计
   *
   * @default false
   * @type {boolean}
   */
  subtotalMethod: boolean;
  /**
   * 列小计配置
   *
   * @type {Calculation[]}
   */
  column_subtotals?: Calculation[];
  /**
   * 行小计
   *
   * @default false
   * @type {boolean}
   */
  row_subtotalMethod: boolean;
  /**
   * 行小计配置
   *
   * @type {Calculation[]}
   */
  row_subtotals?: Calculation[];
  /**
   * 合并单元格
   *
   * @type {boolean}
   */
  mergeCell?: boolean;
  /**使用分页 */
  /**
   * 是否启用分页
   *
   * @default true
   * @type {boolean}
   */
  pager: boolean;
  /**
   * 分页类型
   *
   * @default REPORT_TABLE_PAGE_TYPE.FIRST_DIMENSION
   * @type {REPORT_TABLE_PAGE_TYPE}
   */
  pageType: REPORT_TABLE_PAGE_TYPE;
  /**
   * 每页条数
   *
   * @default 20
   * @type {number}
   */
  pageSize: number;
  /**
   * 是否显示序号
   *
   * @default true
   * @type {boolean}
   */
  serialNumber: boolean;
  /**
   * 是否全屏
   *
   * @default false
   * @type {boolean}
   */
  fullScreen: boolean;
  /**
   * 数据筛选
   *
   * @type {{ dataRule: string; dataRuleConfig: string }}
   */
  dataFilter: { dataRule: string; dataRuleConfig: string };
  /**
   * 排序字段
   *
   * @type {{ id: string; sortField: string; sortType: sortTypeEnum }[]}
   */
  sorts: { id: string; sortField: string; sortType: sortTypeEnum }[];
}
