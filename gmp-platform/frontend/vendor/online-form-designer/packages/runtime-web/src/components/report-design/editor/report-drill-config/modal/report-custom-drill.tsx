import { defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IModal, IEditForm, EditorType, IFormItem, FieldIconMap, useModal } from '@gct/runtime';
import { IReportField, ITableReportSchema } from '../../../interface';
import { getReportListModelReport } from '/@/apis/gct-apaas/ReportController';
import './report-custom-drill.scss';

/**
 * 自定义钻取配置模态
 */
export const ReportCustomDrill = defineComponent({
  name: 'ReportCustomDrill',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    selectReport: {
      type: String,
      default: undefined,
    },
    selectReportName: {
      type: String,
      default: undefined,
    },
    selectReportType: {
      type: String,
      default: undefined,
    },
    field: {
      type: Object as PropType<IReportField>,
      required: true,
    },
    schema: {
      type: Object as PropType<ITableReportSchema>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('report-custom-drill');

    const formRef = ref<any>(null);

    // Form model definition based on the screenshot
    const formModel: IEditForm = {
      type: 'edit',
      info: true,
      children: [
        {
          type: 'container',
          name: 'group1',
          layout: 'grid',
          children: [
            {
              name: 'field',
              type: 'item',
              label: '当前字段',
              gridItem: {
                span: 24,
              },
              editor: {
                type: EditorType.INFO,
                icon: FieldIconMap[props.field.fieldType] || 'icon-zidingyi',
              },
            },
            {
              name: 'modelName',
              type: 'item',
              label: '所属模型',
              gridItem: {
                span: 24,
              },
              editor: {
                type: EditorType.INFO,
              },
            },
            {
              type: 'hidden',
              name: 'targetReportName',
            },
            {
              type: 'hidden',
              name: 'targetReportType',
            },
            {
              name: 'targetReport',
              type: 'item',
              label: '目标报表',
              gridItem: {
                span: 24,
              },
              rules: [{ required: true, message: '请选择报表' }],
              dictionary: {
                type: 'report_custom_drill',
                mode: 'async',
                fetch: async function (params) {
                  const data = await getReportListModelReport({ modelKey: props.schema.modelKey });
                  if (data && data.length > 0) {
                    const items: IObject[] = data[0].reports || [];
                    return items;
                  }
                  return [];
                },
              },
              editor: {
                type: EditorType.PICKER,
                placeholder: '请选择报表',
                nameField: 'targetReportName',
                fieldMap: ['reportType:targetReportType'],
              },
            },
          ] as IFormItem[],
        },
      ],
    };

    // Form data - can be populated from props if provided
    const formData = ref<IData>({
      field: props.field.fieldName,
      modelName: props.schema.modelName,
      targetReport: props.selectReport,
      targetReportName: props.selectReportName,
      targetReportType: props.selectReportType,
    });

    useModal(async () => {
      if (formRef.value) {
        const isValid = await formRef.value.c.validate();
        if (!isValid) {
          return { ok: false };
        }
      }
      return {
        ok: true,
        data: [
          {
            reportId: formData.value.targetReport,
            reportName: formData.value.targetReportName,
            reportType: formData.value.targetReportType,
          },
        ],
      };
    });

    return { ns, formRef, formModel, formData };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <gct-edit-form
          ref="formRef"
          model={this.formModel}
          v-model:data={this.formData}
          embed
          adaptModal={false}
        />
      </div>
    );
  },
});
