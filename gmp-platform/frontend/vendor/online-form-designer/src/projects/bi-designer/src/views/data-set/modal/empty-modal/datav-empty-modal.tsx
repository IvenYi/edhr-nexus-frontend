import { defineComponent, PropType, ref } from 'vue';
import { useNamespace, IEditForm, IFormEditItem } from '@gct-paas/core';
import { EditorType, IModal, useModal } from '@gct/runtime';
import './datav-empty-modal.scss';

export const DatavEmptyModal = defineComponent({
  name: 'DatavEmptyModal',
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
    const ns = useNamespace('datav-empty-modal');

    useModal(async () => {
      const d = {
        emptyStr: formData.value.emptyStr,
      };
      return { ok: true, data: [d] };
    });

    const formData = ref({
      emptyStr: props.data.emptyStr,
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
              label: '样式展示为',
              name: 'emptyStr',
              defaultValue: formData.value.emptyStr,
              rules: [
                {
                  required: true,
                  validator: (rule, value, callback) => {
                    if (!value) {
                      callback('请输入自定义展示样式');
                      return;
                    }
                    const regex = /^[\u4E00-\u9FFFA-Za-z0-9_/\\|()[\]]{1,32}$/;
                    if (!regex.test(value)) {
                      callback(
                        '支持由中英文、数字、下划线、斜线、反斜线、竖线、小括号和中括号组成，且长度不超过32个字符',
                      );
                      return;
                    }
                    callback();
                  },
                },
              ],
              editor: {
                type: EditorType.TEXT,
                placeholder: '请输入自定义展示样式',
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
