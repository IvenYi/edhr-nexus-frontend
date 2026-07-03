import { defineComponent, PropType, reactive } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { EditorType, IEditForm, IFormEditItem } from '@gct/runtime';
import './report-data-set-save.scss';

export const ReportDataSetSave = defineComponent({
  name: 'ReportDataSetSave',
  props: {
    data: {
      type: Object as PropType<IObject>,
      default: () => ({}),
    }
  },
  setup(props) {
    const ns = useNamespace('report-data-set-save');
    const t = (window as any).$t;

    const data = reactive(props.data);

    const formModel: IEditForm = {
      type: 'edit',
      children: [
        {
          name: 'group',
          type: 'container',
          layout: 'grid',
          children: [
            {
              name: 'name',
              type: 'item',
              label: t('sys.dataSet.dataSetName'),
              rules: [
                {
                  required: true,
                  validator(rule, value, callback) {
                    return new Promise((resolve, reject) => {
                      if (!value || value.trim().length === 0) {
                        reject(t('sys.dataSet.pleaseInputDataSetName'));
                      } else if (value?.trim().length > 100) {
                        reject(t('sys.dataSet.max100Char'));
                      } else {
                        resolve();
                      }
                    });
                  },
                },
              ],
              editor: {
                type: EditorType.TEXT,
                placeholder: t('sys.dataSet.pleaseInputTip'),
              },
            },
            {
              name: 'description',
              type: 'item',
              label: t('sys.dataSet.description'),
              rules: [
                {
                  validator(rule, value: string) {
                    return new Promise((resolve, reject) => {
                      if (value?.trim().length > 1000) {
                        reject(t('sys.dataSet.max1000Char'));
                      } else {
                        resolve();
                      }
                    });
                  },
                },
              ],
              editor: {
                type: EditorType.TEXTAREA,
                autoSize: { minRows: 4, maxRows: 4 },
                placeholder: t('sys.dataSet.pleaseInputTip'),
                props: {
                  rows: 4,
                },
              },
            },
          ] as IFormEditItem[],
        },
      ],
    };

    return { ns, data, formModel };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <gct-edit-form v-model:data={this.data} model={this.formModel} embed />
      </div>
    );
  },
});
