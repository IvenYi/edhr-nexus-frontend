import {
  EditorType,
  IFormEditItem,
  IFormItem,
  IFormItemBasic,
  IFormTab,
  IFormTabPane,
} from '@gct-paas/core';
import { IFormEditItemController } from '@gct/runtime';
import { REPORT_EDITOR_TYPE, REPORT_TYPE } from '../../constants';
import { TableReportDesignProvider } from '../table-report-design-provider/table-report-design-provider';
import { calculationMethodDictionary } from '../../dictionary';
import { dimensionEnum, SummaryCalculationMethod } from '../../schema';
import { IReportFieldConfig, ITableReportField } from '../../interface';
import { getPolymerizationMethodByFieldType } from '../../utils';

/**
 * 明细表
 *
 * @export
 * @class CrossReportDesignProvider
 * @implements {IReportDesignProvider}
 */
export class CrossReportDesignProvider extends TableReportDesignProvider {
  override type: string = REPORT_TYPE.CROSS_TABLE;
  protected override dimensionMeasurement: IFormItem[] = [
    {
      type: 'item',
      name: 'rowDimension',
      label: '行（维度）',
      labelPosition: 'top',
      editor: {
        type: REPORT_EDITOR_TYPE.REPORT_FIELD_CONFIG,
        dimension: dimensionEnum.ROW,
        group: 'dimension',
        btnText: '添加行',
      } as IReportFieldConfig,
    },
    {
      type: 'item',
      name: 'rowColumnConversion',
      editor: {
        type: REPORT_EDITOR_TYPE.ROW_COLUMN_CONVERSION,
      },
    },
    {
      type: 'item',
      name: 'columnDimension',
      label: '列（维度）',
      labelPosition: 'top',
      editor: {
        type: REPORT_EDITOR_TYPE.REPORT_FIELD_CONFIG,
        dimension: dimensionEnum.COLUMN,
        group: 'dimension',
        btnText: '添加列',
      } as IReportFieldConfig,
    },
    {
      type: 'item',
      name: 'rowColumnConversion',
      editor: {
        type: REPORT_EDITOR_TYPE.ROW_COLUMN_CONVERSION,
        notAction: true,
      },
    },
    {
      type: 'item',
      name: 'indicatorDimension',
      label: '指标（度量）',
      labelPosition: 'top',
      editor: {
        type: REPORT_EDITOR_TYPE.REPORT_FIELD_CONFIG,
        dimension: dimensionEnum.INDICATOR,
        group: dimensionEnum.INDICATOR,
        btnText: '添加指标',
      } as IReportFieldConfig,
    },
  ];

  protected override tableProperties: IFormTab[] = [
    {
      type: 'tab',
      name: 'tab2',
      layout: 'grid',
      container: true,
      children: [
        {
          type: 'tab-pane',
          name: 'tab1-pane1',
          title: '列汇总',
          layout: 'grid',
          container: true,
          children: [
            {
              type: 'item',
              name: 'calculationMethod.open',
              label: '整体汇总（列总计）',
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
              labelTooltip:
                '这里为所有字段统一的总计聚合方式，可选择“自定义”对单个字段设置聚合方式',
              defaultValue: true,
              class: this.ns.e('total-alias'),
              editor: {
                type: EditorType.CHECK_SWITCH,
                label: '空值参与计算',
              },
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
                mode: 'column',
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
              name: 'subtotalMethod',
              label: '分类汇总（列小计）',
              editor: {
                type: EditorType.SWITCH,
              },
            },
            {
              type: 'item',
              name: 'column_subtotals',
              editor: {
                type: REPORT_EDITOR_TYPE.SUBTOTAL_CONFIG,
                props: {
                  mode: 'row',
                },
              },
              hidden(form, item, data) {
                return data.subtotalMethod !== true;
              },
            },
          ] as IFormEditItem[],
        },
        {
          type: 'tab-pane',
          name: 'tab1-pane2',
          title: '行汇总',
          layout: 'grid',
          container: true,
          children: [
            {
              type: 'item',
              name: 'row_calculationMethod.open',
              label: '整体汇总（行总计）',
              editor: {
                type: EditorType.SWITCH,
              },
            },
            {
              type: 'item',
              name: 'row_calculationMethod.totalAlias',
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
                return !data.row_calculationMethod?.open;
              },
            },
            {
              type: 'item',
              name: 'row_calculationMethod.includeNull',
              label: '计算方式',
              labelTooltip:
                '这里为所有字段统一的总计聚合方式，可选择“自定义”对单个字段设置聚合方式',
              defaultValue: true,
              class: this.ns.e('total-alias'),
              editor: {
                type: EditorType.CHECK_SWITCH,
                label: '空值参与计算',
              },
              hidden(form, item, data) {
                return !data.row_calculationMethod?.open;
              },
            },
            {
              type: 'item',
              name: 'row_calculationMethod.function',
              labelPosition: 'top',
              defaultValue: SummaryCalculationMethod.SUM,
              editor: {
                type: EditorType.SELECT,
                props: {
                  allowClear: false,
                },
              },
              dictionary: calculationMethodDictionary,
              hidden(form, item, data) {
                return !data.row_calculationMethod?.open;
              },
              watch: (form, item, val, oldVal) => {
                const formItem = form.item[
                  'row_calculationMethod.function'
                ] as IFormEditItemController;
                if (formItem?.editorValue === SummaryCalculationMethod.CUSTOM) {
                  const keys = Object.keys(this.c.state.schema.fieldMap);
                  keys.forEach((key) => {
                    const field = this.c.state.schema.fieldMap[key] as ITableReportField;
                    const types = getPolymerizationMethodByFieldType(field);
                    const bol = types.includes(oldVal);
                    if (bol) {
                      field.row_function = oldVal;
                    } else {
                      field.row_function = SummaryCalculationMethod.NONE;
                    }
                  });
                } else {
                  const keys = Object.keys(this.c.state.schema.fieldMap);
                  keys.forEach((key) => {
                    const field = this.c.state.schema.fieldMap[key] as ITableReportField;
                    field.row_function = undefined;
                  });
                }
                this.c.updateSchema();
                this.c.force();
              },
            },
            {
              type: 'item',
              name: 'custom-calc-method2',
              label: '自定义计算',
              labelPosition: 'top',
              editor: {
                type: REPORT_EDITOR_TYPE.CUSTOM_CALC_METHOD,
                mode: 'row',
              },
              hidden(form, item, data) {
                return (
                  data.row_calculationMethod?.function !== SummaryCalculationMethod.CUSTOM ||
                  !data.row_calculationMethod?.open
                );
              },
            },
            {
              type: 'item',
              name: 'row_subtotalMethod',
              label: '分类汇总（行小计）',
              editor: {
                type: EditorType.SWITCH,
              },
            },
            {
              type: 'item',
              name: 'row_subtotals',
              editor: {
                type: REPORT_EDITOR_TYPE.SUBTOTAL_CONFIG,
                props: {
                  mode: 'column',
                },
              },
              hidden(form, item, data) {
                return data.row_subtotalMethod !== true;
              },
            },
          ] as IFormEditItem[],
        },
      ] as IFormTabPane[],
    } as IFormTab,
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
  ];

  protected override listData: IFormItemBasic[] = [
    {
      type: 'item',
      name: 'dataFilter',
      editor: {
        type: REPORT_EDITOR_TYPE.DATA_RULES_CONFIG,
      },
    },
  ] as IFormItem[];
}
