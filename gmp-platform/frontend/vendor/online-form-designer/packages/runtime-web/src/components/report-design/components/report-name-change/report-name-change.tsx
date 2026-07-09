import { defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IEditForm, IFormEditItem } from '@gct-paas/core';
import { EditorType, IModal, useModal } from '@gct/runtime';
import './report-name-change.scss';

export const ReportNameChange = defineComponent({
  name: 'ReportNameChange',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('report-name-change');

    useModal(async () => {
      const d = {
        field: formData.value.fieldName,
        alias: formData.value.alias,
        aliasI18n: formData.value.i18nConfig,
      };
      return { ok: true, data: [d] };
    });

    const formData = ref({
      fieldName: props.data.fieldName,
      alias: props.data.alias,
      i18nConfig: props.data.aliasI18n,
    })

    const formModel: IEditForm = {
      type: 'edit',
      children: [
        {
          type: 'container',
          container: true,
          layout: 'grid',
          name: 'group1',
          children: [
            {
              name: 'fieldName',
              type: 'item',
              label: '字段原名',
              editor: {
                type: EditorType.INFO,
              },
            },
            {
              type: 'hidden',
              name: 'aliasI18n',
            },
            {
              type: 'item',
              label: '显示名称',
              name: 'alias',
              defaultValue: formData.value.fieldName,
              rules: [
                {
                  required: true,
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback('请输入显示名称');
                      return;
                    }
                    if (value && value.trim().length > 100) {
                      callback('最大100字');
                      return;
                    }
                    callback();
                  },
                },
              ],
              editor: {
                type: EditorType.I18N,
                placeholder: '请输入显示名称',
                max: -1,
                cfgKey: 'aliasI18n',
              },
            },
          ] as IFormEditItem[],
        },
      ],
    };
    return { ns, formData, formModel };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <gct-edit-form v-model:data={this.formData} model={this.formModel} embed />
      </div>
    );
  },
});
