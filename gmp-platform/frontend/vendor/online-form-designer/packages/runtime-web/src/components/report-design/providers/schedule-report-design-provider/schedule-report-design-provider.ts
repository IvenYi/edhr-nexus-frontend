import { IFormItem } from '@gct-paas/core';
import { EditorType, IActionEditor, IFormEditItemController } from '@gct/runtime';
import { REPORT_EDITOR_TYPE, REPORT_TYPE } from '../../constants';
import { TableReportDesignProvider } from '../table-report-design-provider/table-report-design-provider';
import { dimensionEnum } from '../../schema';
import { IReportFieldConfig } from '../../interface';

/**
 * 明细表
 *
 * @export
 * @class ScheduleReportDesignProvider
 * @implements {IReportDesignProvider}
 */
export class ScheduleReportDesignProvider extends TableReportDesignProvider {
  override type: string = REPORT_TYPE.SCHEDULE_TABLE;
  constructor(data) {
    super(data);
    this.c.hooks.save.before.tap(() => {
      if (!this.c.state.schema.multiLevelHeader) {
        this.c.state.schema.headerGrouping = []
      }
    })
  }
  protected override dimensionMeasurement: IFormItem[] = [
    {
      type: 'item',
      name: 'rowColumnTransposition',
      field: 'rowColumnTransposition',
      label: '数据列（维度或度量）',
      labelWidth: '120px',
      editor: {
        type: EditorType.ACTION,
        // label: '行列转置',
        click(e, form, item, data) {
          const _item = form.item.rowColumnTransposition as IFormEditItemController;
          _item.editorValue = !data.rowColumnTransposition;
        },
      } as IActionEditor,
      hidden(form, item, data) {
        return data.rowColumnTransposition === true;
      },
    },
    {
      type: 'item',
      name: 'rowColumnTransposition2',
      field: 'rowColumnTransposition',
      label: '数据行（维度或度量）',
      labelWidth: '120px',
      editor: {
        type: EditorType.ACTION,
        // label: '行列转置',
        click(e, form, item, data) {
          const _item = form.item.rowColumnTransposition as IFormEditItemController;
          _item.editorValue = !data.rowColumnTransposition;
        },
      } as IActionEditor,
      hidden(form, item, data) {
        return data.rowColumnTransposition !== true;
      },
    },
    {
      type: 'item',
      name: 'dataColumn',
      field: 'dataColumn',
      editor: {
        type: REPORT_EDITOR_TYPE.REPORT_FIELD_CONFIG,
        dimension: dimensionEnum.ROW,
        group: 'dataColumn',
        btnText: '添加列',
      } as IReportFieldConfig,
      hidden(form, item, data) {
        return data.rowColumnTransposition === true;
      },
    },
    {
      type: 'item',
      name: 'dataColumn2',
      field: 'dataColumn',
      editor: {
        type: REPORT_EDITOR_TYPE.REPORT_FIELD_CONFIG,
        dimension: dimensionEnum.ROW,
        group: 'dataColumn',
        btnText: '添加行',
      } as IReportFieldConfig,
      hidden(form, item, data) {
        return data.rowColumnTransposition !== true;
      },
    },
  ];

}
