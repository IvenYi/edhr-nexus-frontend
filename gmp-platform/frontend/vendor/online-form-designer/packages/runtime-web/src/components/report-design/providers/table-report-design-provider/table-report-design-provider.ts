import { Component } from 'vue';
import {
  IEditForm,
  IFormCollapse,
  IFormCollapsePane,
  IFormItem,
  IFormItemBasic,
  IFormTab,
  IFormTabPane,
} from '@gct-paas/core';
import {
  EditorType,
  sortTypeEnum,
  FIELD_TYPE,
  INumberEditor,
  Namespace,
  IFormEditItem,
  IFormEditItemController,
} from '@gct/runtime';
import {
  IReportDesignProvider,
  ITableReportSchema,
  ITableReportField,
  IFieldContextItem,
  IReportField,
} from '../../interface';
import { ReportData } from '../../report-table/report-table';
import { calculationMethodDictionary } from '../../dictionary';
import {
  MENU_ACTION,
  REPORT_EDITOR_TYPE,
  REPORT_TABLE_PAGE_TYPE,
  REPORT_TYPE,
} from '../../constants';
import {
  Calculation,
  DateTimeTypeFormattingEnum,
  DateTimeValueEnum,
  dimensionEnum,
  emptyValueEnum,
  horizontalEnum,
  SummaryCalculationMethod,
  type2formatMapping,
  verticalEnum,
  RowHeightSettingEnum,
  DrillTypeEnum,
  TimeValueEnum,
} from '../../schema';
import { ReportViewController } from '../../controller';
import { createUUID } from 'qx-util';
import {
  getFieldTypeFormatMenus,
  getFieldTypeFormatMenusBySchedule,
  getNumberDisplayFormat,
  getPolymerizationMethodDefValue,
  getPolymerizationMethodMenus,
  getPolymerizationMethodByFieldType,
} from '../../utils';
import './table-report-design-provider.scss';
import { SEARCH_TYPE } from '/@page-designer/schema/common';
import { SignatureTypeEnum, SignatureStyleEnum } from '/@/projects/page-designer/src/enum';
import { DataSetReturnTypeEnum } from '/@/components/Expression';

export class TableReportDesignProvider implements IReportDesignProvider {
  type: string = '';

  ns = new Namespace('table-report-design-provider');

  previewComponent: Component = ReportData;

  schema: ITableReportSchema = {
    reportType: '',
    dataColumn: [],
    rowDimension: [],
    columnDimension: [],
    indicatorDimension: [],
    rowColumnTransposition: false,
    fieldMap: {},
    fullScreen: false,
    headerSorting: true,
    pager: true,
    pageType: REPORT_TABLE_PAGE_TYPE.FIRST_DIMENSION,
    pageSize: 20,
    serialNumber: true,
    mergeCell: true,
    export: true,
    dataFilter: { dataRule: '', dataRuleConfig: '' },
    sorts: [
      {
        id: createUUID(),
        sortField: null,
        sortType: sortTypeEnum.DESC,
      },
    ],
    row_subtotalMethod: false,
    row_subtotals: [new Calculation()],
    subtotalMethod: false,
    column_subtotals: [new Calculation()],
    calculationMethod: new Calculation(),
    row_calculationMethod: new Calculation(),
    _key: createUUID(),
  };

  constructor(protected c: ReportViewController) {}

  resetSchema(data: IObject): IObject {
    return {
      ...data,
      dataColumn: [],
      rowDimension: [],
      columnDimension: [],
      indicatorDimension: [],
      row_subtotals: [],
      column_subtotals: [],
      sorts: [
        {
          id: createUUID(),
          sortField:
            data.modelCategory === 'view' || data.modelCategory === 'dataSet' ? '' : 'create_time_',
          sortType: sortTypeEnum.DESC,
        },
      ],
      fieldMap: {},
      drillMap: {},
      dataFilter: { dataRule: '', dataRuleConfig: '' },
    };
  }

  createField(data: IObject): ITableReportField {
    const item = {
      ...data,
      horizontal: horizontalEnum.CENTER,
      vertical: verticalEnum.MIDDLE,
      emptyValue: emptyValueEnum.A,
      drillMode: DrillTypeEnum.DEFAULT,
    } as ITableReportField;
    if (item.inDimension === dimensionEnum.INDICATOR) {
      const val = getPolymerizationMethodDefValue(data as IReportField);
      if (val) {
        item.polymerization_function = val;
      }
    }
    if (
      data.fieldType === FIELD_TYPE.DATE_TIME ||
      (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE_TIME)
    ) {
      item.dateTimeTypeFormatting = DateTimeTypeFormattingEnum.YEAR_MONTH_DAY_HH_SS;
      item.format = DateTimeValueEnum.YEAR_MONTH_DAY_HH_SS;
    }
    if (
      data.fieldType === FIELD_TYPE.DATE ||
      (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE)
    ) {
      item.dateTimeTypeFormatting = DateTimeTypeFormattingEnum.YEAR_MONTH_DAY;
      item.format = DateTimeValueEnum.YEAR_MONTH_DAY;
    }
    if (
      data.fieldType === FIELD_TYPE.TIME ||
      (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.TIME)
    ) {
      item.format = TimeValueEnum.D3;
    }
    if (data.fieldType === FIELD_TYPE.SIGNATURE) {
      item.signatureType = SignatureTypeEnum.SIGNATURE_ONLY;
      item.displayStyle = SignatureStyleEnum.VERTICAL;
    }
    return item;
  }

  getFieldMenus(data: IReportField): IFieldContextItem[] {
    const items: IFieldContextItem[] = [
      {
        mode: 'action',
        label: '修改显示名称',
        name: MENU_ACTION.CHANGE_NAME,
      },
      {
        mode: 'group',
        label: '对齐方式',
        name: 'Alignment',
        children: [
          {
            mode: 'select',
            label: '水平对齐',
            name: 'horizontal',
            fieldKey: 'horizontal',
            children: [
              {
                mode: 'select-item',
                label: '左对齐',
                name: 'left',
                value: horizontalEnum.LEFT,
              },
              {
                mode: 'select-item',
                label: '居中对齐',
                name: 'center',
                value: horizontalEnum.CENTER,
              },
              {
                mode: 'select-item',
                label: '右对齐',
                name: 'right',
                value: horizontalEnum.RIGHT,
              },
            ],
          },
          {
            mode: 'select',
            label: '垂直对齐',
            name: 'vertical',
            fieldKey: 'vertical',
            children: [
              {
                mode: 'select-item',
                label: '顶对齐',
                name: 'top',
                value: verticalEnum.TOP,
              },
              {
                mode: 'select-item',
                label: '垂直居中',
                name: 'middle',
                value: verticalEnum.MIDDLE,
              },
              {
                mode: 'select-item',
                label: '底对齐',
                name: 'bottom',
                value: verticalEnum.BOTTOM,
              },
            ],
          },
        ],
      },
    ];

    // 指标特殊右键菜单
    if (data.inDimension === dimensionEnum.INDICATOR) {
      const item = getPolymerizationMethodMenus(data);
      if (item) {
        items.push(item);
      }
    }
    items.push({
      mode: 'select',
      label: '空值显示样式',
      name: 'EmptyValueDisplayStyle',
      fieldKey: 'emptyValue',
      children: [
        {
          mode: 'select-item',
          label: '显示为"--"',
          name: 'a',
          value: emptyValueEnum.A,
        },
        {
          mode: 'select-item',
          label: '显示为"(空)"',
          name: 'b',
          value: emptyValueEnum.B,
        },
        {
          mode: 'select-item',
          label: '显示为"null"',
          name: 'c',
          value: emptyValueEnum.C,
        },
        {
          mode: 'select-item',
          label: '显示为"N/A"',
          name: 'e',
          value: emptyValueEnum.E,
        },
        {
          mode: 'select-item',
          label: '不显示',
          name: 'd',
          value: emptyValueEnum.D,
        },
      ],
    });
    if (
      this.c.state.schema?.reportType === REPORT_TYPE.CROSS_TABLE &&
      (data.fieldType === FIELD_TYPE.DATE ||
        data.fieldType === FIELD_TYPE.DATE_TIME ||
        (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE) ||
        (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE_TIME))
    ) {
      const children: IFieldContextItem[] = [
        {
          mode: 'select-item',
          label: '年',
          name: DateTimeTypeFormattingEnum.YEAR,
          value: DateTimeTypeFormattingEnum.YEAR,
        },
        {
          mode: 'select-item',
          label: '年-季度',
          name: DateTimeTypeFormattingEnum.YEAR_QUARTER,
          value: DateTimeTypeFormattingEnum.YEAR_QUARTER,
        },
        {
          mode: 'select-item',
          label: '年-月',
          name: DateTimeTypeFormattingEnum.YEAR_MONTH,
          value: DateTimeTypeFormattingEnum.YEAR_MONTH,
        },
        {
          mode: 'select-item',
          label: '年-月-日',
          name: DateTimeTypeFormattingEnum.YEAR_MONTH_DAY,
          value: DateTimeTypeFormattingEnum.YEAR_MONTH_DAY,
        },
      ];
      if (
        data.fieldType === FIELD_TYPE.DATE_TIME ||
        (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE_TIME)
      ) {
        children.push({
          mode: 'select-item',
          label: '年-月-日-时-分',
          name: DateTimeTypeFormattingEnum.YEAR_MONTH_DAY_HH_MM,
          value: DateTimeTypeFormattingEnum.YEAR_MONTH_DAY_HH_MM,
        });
        children.push({
          mode: 'select-item',
          label: '年-月-日-时-分-秒',
          name: DateTimeTypeFormattingEnum.YEAR_MONTH_DAY_HH_SS,
          value: DateTimeTypeFormattingEnum.YEAR_MONTH_DAY_HH_SS,
        });
      }
      children.push({
        mode: 'select-item',
        label: '季度',
        name: DateTimeTypeFormattingEnum.QUARTER,
        value: DateTimeTypeFormattingEnum.QUARTER,
      });
      children.push({
        mode: 'select-item',
        label: '月',
        name: DateTimeTypeFormattingEnum.MONTH,
        value: DateTimeTypeFormattingEnum.MONTH,
      });
      children.push({
        mode: 'select-item',
        label: '日',
        name: DateTimeTypeFormattingEnum.DAY,
        value: DateTimeTypeFormattingEnum.DAY,
      });
      items.push({
        mode: 'select',
        label:
          data.fieldType == FIELD_TYPE.DATE_TIME ||
          (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE_TIME)
            ? '日期时间类型格式'
            : '日期类型格式',
        name: 'dateTimeTypeFormatting',
        fieldKey: 'dateTimeTypeFormatting',
        click: (action, data) => {
          if (action.value && type2formatMapping[action.value]) {
            data.format = type2formatMapping[action.value];
            this.c.updateSchema();
          }
        },
        children,
      });
    }
    if (this.c.state.schema?.reportType === REPORT_TYPE.CROSS_TABLE) {
      const menuItem: IFieldContextItem | null = getFieldTypeFormatMenus(data);
      if (menuItem) {
        items.push(menuItem);
      }
    }
    if (this.c.state.schema?.reportType === REPORT_TYPE.SCHEDULE_TABLE) {
      const menuItem: IFieldContextItem | null = getFieldTypeFormatMenusBySchedule(data);
      if (menuItem) {
        items.push(menuItem);
      }
    }
    const menuItem2: IFieldContextItem | null = getNumberDisplayFormat(this.c, data);
    if (menuItem2) {
      items.push(menuItem2);
    }
    // 签名字段支持签名格式
    if (
      [FIELD_TYPE.SIGNATURE].includes(data.fieldType) &&
      data.inDimension !== dimensionEnum.INDICATOR
    ) {
      items.push({
        mode: 'action',
        label: '签名格式',
        name: MENU_ACTION.CHANGE_SIGNATURE,
      });
    }
    items.push({
      mode: 'action',
      label: '删除',
      name: MENU_ACTION.DELETE,
    });
    return items;
  }

  transformRuntime = (widget) => transformRuntimeTable(widget);

  /**
   * 维度度量分组子项
   *
   * @protected
   * @type {IFormItemBasic[]}
   */
  protected dimensionMeasurement: IFormItemBasic[] = [] as IFormItem[];

  /**
   * 表格属性分组子项
   *
   * @protected
   * @type {IFormItemBasic[]}
   */
  protected tableProperties: IFormItemBasic[] = [
    {
      type: 'item',
      name: 'calculationMethod.open',
      label: '整体汇总（行/列总计）',
      labelWidth: '120px',
      editor: {
        type: EditorType.SWITCH,
      },
    },
    {
      type: 'item',
      name: 'calculationMethod.totalAlias',
      label: '总计别名',
      labelPosition: 'top',
      defaultValue: '总计',
      rules: [
        {
          validator: (rule, value, callback) => {
            if (value && value.trim().length > 100) {
              callback('最大100字');
            } else {
              callback();
            }
          },
        },
      ],
      editor: {
        type: EditorType.TEXT,
        placeholder: '请输入',
      },
      hidden(form, item, data) {
        return !data?.calculationMethod?.open;
      },
    },
    {
      type: 'item',
      name: 'calculationMethod.includeNull',
      label: '计算方式',
      labelTooltip: '这里为所有字段统一的总计聚合方式，可选择“自定义”对单个字段设置聚合方式',
      defaultValue: true,
      editor: {
        type: EditorType.CHECK_SWITCH,
        label: '空值参与计算',
      },
      dictionary: calculationMethodDictionary,
      hidden(form, item, data) {
        return !data?.calculationMethod?.open;
      },
    },
    {
      type: 'item',
      name: 'calculationMethod.function',
      defaultValue: SummaryCalculationMethod.SUM,
      editor: {
        type: EditorType.SELECT,
        props: {
          allowClear: false,
        },
      },
      dictionary: calculationMethodDictionary,
      hidden(form, item, data) {
        return !data?.calculationMethod?.open;
      },
      watch: (form, item, val, oldVal) => {
        const formItem = form.item['calculationMethod.function'] as IFormEditItemController;
        if (formItem?.editorValue === SummaryCalculationMethod.CUSTOM) {
          const keys = Object.keys(this.c.state.schema.fieldMap);
          keys.forEach((key) => {
            const field = this.c.state.schema.fieldMap[key] as ITableReportField;
            const types = getPolymerizationMethodByFieldType(field);
            const bol = types.includes(oldVal);
            if (bol) {
              field.col_function = oldVal;
            } else {
              field.col_function = SummaryCalculationMethod.NONE;
            }
          });
        } else {
          const keys = Object.keys(this.c.state.schema.fieldMap);
          keys.forEach((key) => {
            const field = this.c.state.schema.fieldMap[key] as ITableReportField;
            field.col_function = undefined;
          });
        }
        this.c.updateSchema();
        this.c.force();
      },
    },
    {
      type: 'item',
      name: 'custom-calc-method',
      label: '自定义计算',
      labelPosition: 'top',
      editor: {
        type: REPORT_EDITOR_TYPE.CUSTOM_CALC_METHOD,
      },
      hidden(form, item, data) {
        return (
          data.calculationMethod?.function !== SummaryCalculationMethod.CUSTOM ||
          !data.calculationMethod?.open
        );
      },
    },
    {
      type: 'item',
      name: 'multiLevelHeader',
      label: '多级表头',
      editor: {
        type: EditorType.SWITCH,
      },
      hidden(form, item, data) {
        return data.reportType === REPORT_TYPE.CROSS_TABLE;
      },
    },
    {
      type: 'item',
      name: 'headerGrouping',
      editor: {
        type: REPORT_EDITOR_TYPE.REPORT_LEVEL_HEADER,
      },
      hidden(form, item, data) {
        return !data.multiLevelHeader;
      },
    },
    {
      type: 'item',
      name: 'mergeCell',
      label: '合并同类单元格',
      editor: {
        type: EditorType.SWITCH,
      },
    },
    {
      type: 'item',
      name: 'export',
      label: '允许导出',
      defaultValue: true,
      editor: {
        type: EditorType.SWITCH,
      },
    },
  ] as IFormItem[];

  /**
   * 显示分组子项
   *
   * @protected
   * @type {IFormItemBasic[]}
   */
  protected display: IFormItemBasic[] = [
    {
      type: 'item',
      name: 'pager',
      label: '使用分页',
      editor: {
        type: EditorType.SWITCH,
      },
    },
    {
      type: 'item',
      name: 'pageType',
      label: '分页类型',
      labelPosition: 'top',
      editor: {
        type: EditorType.RADIO,
      },
      dictionary: {
        tag: 'pageType',
        mode: 'static',
        items: [
          {
            label: '首行维度',
            value: REPORT_TABLE_PAGE_TYPE.FIRST_DIMENSION,
          },
          {
            label: '所有维度',
            value: REPORT_TABLE_PAGE_TYPE.ALL_DIMENSION,
          },
        ],
      },
      hidden(form, item, data) {
        return data.reportType !== REPORT_TYPE.CROSS_TABLE || data.pager !== true;
      },
    },
    {
      type: 'item',
      name: 'pageSize',
      editor: {
        type: REPORT_EDITOR_TYPE.PAGE_SELECTION_CONFIG,
      },
      hidden(form, item, data) {
        return data.pager !== true;
      },
    },
    {
      type: 'item',
      name: 'serialNumber',
      label: '显示表格序号',
      editor: {
        type: EditorType.SWITCH,
      },
    },
    {
      type: 'item',
      name: 'fullScreen',
      label: '全屏',
      editor: {
        type: EditorType.SWITCH,
      },
    },
    {
      type: 'item',
      name: 'customHeader',
      label: '自定义表头显示字段',
      labelWidth: '120px',
      editor: {
        type: EditorType.SWITCH,
      },
    },
    {
      type: 'item',
      name: 'headerSorting',
      label: '表头排序功能',
      editor: {
        type: EditorType.SWITCH,
      },
    },
    {
      type: 'item',
      name: 'filter',
      label: '快捷过滤功能',
      editor: {
        type: EditorType.SWITCH,
      },
    },
    {
      type: 'item',
      name: 'rowHeightSetting',
      label: '行高设置',
      labelPosition: 'top',
      editor: {
        type: REPORT_EDITOR_TYPE.ROW_HEIGHT_CONFIG,
      },
    },
    {
      type: 'item',
      name: 'djl',
      label: '冻结列',
      class: [this.ns.e('margin-bottom-0')],
      editor: {
        type: EditorType.EMPTY,
      },
    },
    {
      type: 'item',
      name: 'leftFixed',
      class: [this.ns.e('table-fixed'), this.ns.e('margin-bottom-4')],
      defaultValue: 0,
      editor: {
        type: EditorType.NUMBER,
        addonBefore: '左边冻结至第',
        addonAfter: '列',
        min: 0,
        max: 100,
      } as INumberEditor,
    },
    {
      type: 'item',
      name: 'rightFixed',
      class: [this.ns.e('table-fixed'), this.ns.e('margin-bottom-0')],
      defaultValue: 0,
      editor: {
        type: EditorType.NUMBER,
        addonBefore: '右边冻结至第',
        addonAfter: '列',
        min: 0,
        max: 100,
      },
    },
  ] as IFormItem[];

  /**
   * 列表数据分组子项
   *
   * @protected
   * @type {IFormItemBasic[]}
   */
  protected listData: IFormItemBasic[] = [
    {
      type: 'item',
      name: 'dataFilter',
      editor: {
        type: REPORT_EDITOR_TYPE.DATA_RULES_CONFIG,
      },
    },
    {
      type: 'item',
      name: 'sorts',
      editor: {
        type: REPORT_EDITOR_TYPE.REPORT_SORTS_EDITOR,
      },
    },
  ] as IFormItem[];

  get formModel(): IEditForm {
    return {
      type: 'edit',
      size: 'small',
      noColon: true,
      children: [
        {
          type: 'tab',
          name: 'tab1',
          layout: 'grid',
          container: true,
          children: [
            {
              type: 'tab-pane',
              name: 'tab-pane1',
              title: '字段',
              layout: 'grid',
              container: true,
              children: [
                {
                  type: 'collapse',
                  container: true,
                  layout: 'grid',
                  name: 'collapse1',
                  expandIconPosition: 'right',
                  children: [
                    {
                      type: 'collapse-pane',
                      container: true,
                      name: 'collapsePane',
                      layout: 'grid',
                      title: '维度度量',
                      children: this.dimensionMeasurement,
                    },
                    {
                      type: 'collapse-pane',
                      container: true,
                      name: 'collapsePane2',
                      layout: 'grid',
                      title: '表格属性',
                      children: this.tableProperties,
                    },
                    {
                      type: 'collapse-pane',
                      container: true,
                      name: 'collapsePane3',
                      layout: 'grid',
                      title: '显示',
                      isCollapse: true,
                      children: this.display,
                    },
                    {
                      type: 'collapse-pane',
                      container: true,
                      name: 'collapsePane4',
                      layout: 'grid',
                      title: '列表数据',
                      isCollapse: true,
                      children: this.listData,
                    },
                  ] as IFormCollapsePane[],
                } as IFormCollapse,
              ],
            },
            {
              type: 'tab-pane',
              name: 'tab-pane2',
              title: '交互',
              layout: 'grid',
              container: true,
              children: [
                {
                  type: 'collapse',
                  container: true,
                  layout: 'grid',
                  name: 'collapse2',
                  expandIconPosition: 'right',
                  children: [
                    {
                      type: 'collapse-pane',
                      container: true,
                      name: 'collapsePane5',
                      layout: 'grid',
                      title: '钻取',
                      children: [
                        {
                          type: 'item',
                          name: 'drills',
                          editor: {
                            type: REPORT_EDITOR_TYPE.REPORT_DRILL_CONFIG,
                          },
                        },
                      ] as IFormEditItem[],
                    },
                    {
                      type: 'collapse-pane',
                      container: true,
                      name: 'collapsePane6',
                      layout: 'grid',
                      title: '跳转',
                      children: [
                        {
                          type: 'item',
                          name: 'links',
                          editor: {
                            type: REPORT_EDITOR_TYPE.REPORT_JUMP_CONFIG,
                          },
                        },
                        {
                          type: 'item',
                          name: 'linkStyle',
                          editor: {
                            type: REPORT_EDITOR_TYPE.REPORT_JUMP_STYLE_CONFIG,
                          },
                          hidden(form, item, data) {
                            return !data.links || data.links.length === 0;
                          },
                        },
                      ] as IFormEditItem[],
                    },
                  ] as IFormCollapsePane[],
                } as IFormCollapse,
              ],
            },
          ] as IFormTabPane[],
        } as IFormTab,
      ],
    };
  }
}

/**运行时格式化 */
function transformRuntimeTable(widget: ITableReportSchema): any {
  const {
    drillMap = {},
    fieldMap = {},
    calculationMethod,
    row_calculationMethod,
    subtotalMethod,
    column_subtotals,
    row_subtotalMethod,
    row_subtotals,
    _key,
  } = widget;
  for (const k in fieldMap) {
    const row = fieldMap[k];
    fieldMap[k].visible = true;
    /**行列总计逻辑处理 */
    if (calculationMethod?.open && calculationMethod.function !== SummaryCalculationMethod.CUSTOM) {
      fieldMap[k].col_function = getFunctionByField(row, calculationMethod.function);
    }
    if (
      row_calculationMethod?.open &&
      row_calculationMethod.function !== SummaryCalculationMethod.CUSTOM
    ) {
      fieldMap[k].row_function = getFunctionByField(row, row_calculationMethod.function);
    }

    if (fieldMap[k].drillAttrs) {
      fieldMap[k].drillAttrs = fieldMap[k].drillAttrs.split(',');
    }
    if (fieldMap[k].col_function === SummaryCalculationMethod.NONE) {
      fieldMap[k].col_function = undefined;
    }
    if (fieldMap[k].row_function === SummaryCalculationMethod.NONE) {
      fieldMap[k].row_function = undefined;
    }
    fieldMap[k].expId = getExpById(row);
  }
  for (const k in drillMap) {
    drillMap[k].visible = true;
    const row = drillMap[k];
    drillMap[k].expId = getExpById(row);
  }

  /**行列小计逻辑处理*/
  const new_data = {
    column_subtotals: subtotalMethod ? transformTotal(column_subtotals, fieldMap) : [],
    row_subtotals: row_subtotalMethod ? transformTotal(row_subtotals, fieldMap) : [],
  };
  /**行高设置初始化 */
  if (!widget.rowHeightSetting) {
    widget.rowHeightSetting = {
      type: RowHeightSettingEnum.LINE,
    };
  }
  /**跳转样式初始化 */
  if (!widget.linkStyle) {
    widget.linkStyle = {
      theme: 1,
    };
  }
  /**跳转配置*/
  !!widget.links &&
    widget.links.forEach((row) => {
      const k = row.field;
      if (fieldMap[k]) fieldMap[k]['linkSetting'] = row;
    });

  return { ...widget, ...new_data, _field_proto_map: {}, exportTable: widget.export };
}

/**部分字段支持的函数 */
function getFunctionByField(
  fieldData,
  fun: SummaryCalculationMethod,
): SummaryCalculationMethod | undefined {
  const { fieldType, mappingType } = fieldData;
  const mappingField = [FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION, FIELD_TYPE.FUNCTION];
  const limitField = [
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.LONG,
    FIELD_TYPE.DECIMAL,
    DataSetReturnTypeEnum.Double,
  ];
  const limitFun = [SummaryCalculationMethod.COUNT, SummaryCalculationMethod.NO_REPEAT_COUNT];
  const flag = !limitField.includes(mappingField.includes(fieldType) ? mappingType : fieldType)
    ? limitFun.includes(fun)
    : true;
  return flag ? fun : undefined;
}

/**小计数据转化 */
function transformTotal(column_subtotals: any[] = [], fieldMap) {
  return column_subtotals
    .map((i) => {
      return (
        i.summaryFields?.map((j) => {
          return {
            distinct: i.function === SummaryCalculationMethod.NO_REPEAT_COUNT,
            fieldKey: j.split(':')[1],
            function:
              i.function === SummaryCalculationMethod.NO_REPEAT_COUNT
                ? SummaryCalculationMethod.COUNT
                : i.function,
            includeNull: i.includeNull,
            totalAlias: i.totalAlias,
            format: i.format,
            type: fieldMap[j]?.fieldType,
          };
        }) || []
      );
    })
    .flat()
    .filter((i) => i.fieldKey && i.function);
}
function getExpById(widget): string {
  let { fieldType, mappingType } = widget;
  if ([FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(fieldType)) fieldType = mappingType;
  const expId = SEARCH_TYPE[fieldType]?.default?.[0] || 'eq';
  return expId;
}
