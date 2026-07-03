import { defineComponent, PropType, ref } from 'vue';
import { useNamespace, IEditForm, IFormEditItem } from '@gct-paas/core';
import { EditorType, IModal, useModal } from '@gct/runtime';
import './datav-change-name.scss';

export const DatavChangeName = defineComponent({
  name: 'DatavChangeName',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    list: {
      type: Array,
      default: () => ([]),
    },
  },
  setup(props) {
    const ns = useNamespace('datav-change-name');

    useModal(async () => {
      const d = {
        field: formData.value.fieldName,
        colName: formData.value.colName,
        aliasI18n: formData.value.i18nConfig,
      };
      return { ok: true, data: [d] };
    });

    const formData = ref({
      fieldName: props.data.fieldName,
      colName: props.data.colName,
      i18nConfig: props.data.aliasI18n,
    });

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
              type: 'item',
              label: '字段名',
              name: 'colName',
              defaultValue: formData.value.fieldName,
              rules: [
                {
                  required: true,
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback('请输入字段名称');
                      return;
                    }
                    if (value && value.trim().length > 100) {
                      callback('最大100字');
                      return;
                    }
                    const arr = props.list.filter(i => i.fieldName !== props.data.fieldName).filter(v => v.colName == value)||[]
                    if (arr.length > 0) {
                      callback('字段名有重复');
                      return;
                    }
                    callback();
                  },
                },
              ],
              editor: {
                type: EditorType.I18N,
                placeholder: '请输入字段名',
                max: -1,
                cfgKey: 'aliasI18n',
              },
            },
            {
              name: 'fieldName',
              type: 'item',
              label: '物理字段名',
              editor: {
                type: EditorType.INFO,
              },
            },
            {
              type: 'hidden',
              name: 'aliasI18n',
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
