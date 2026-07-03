import { defineComponent, inject, ref } from 'vue';
import { IEditForm, IFormItem, useNamespace } from '@gct/runtime';
import { postMobileHomepage } from '/@/apis/gct-apaas/MobileHomepageController';
import './custom-app-home-create-modal.scss';

export const CustomAppHomeCreateModal = defineComponent({
  name: 'CustomAppHomeCreateModal',
  setup() {
    const ns = useNamespace('custom-app-home-create-modal');

    const model: IEditForm = {
      type: 'edit',
      children: [
        {
          type: 'container',
          name: 'group1',
          layout: 'grid',
          children: [
            {
              name: 'name',
              type: 'item',
              label: window.$t('sys.appDesigner.customAppHome.form.viewName'),
              labelWidth: '162px',
              gridItem: {
                span: 21,
              },
              rules: [
                {
                  required: true,
                  message: window.$t('sys.appDesigner.customAppHome.form.ruleMsg.1'),
                },
                {
                  message: window.$t('sys.appDesigner.customAppHome.form.ruleMsg.2'),
                  max: 100,
                },
              ],
              editor: {
                type: 'text',
                label: window.$t('sys.appDesigner.customAppHome.form.viewName'),
                placeholder: window.$t('sys.inputText'),
              },
            } as IFormItem,
          ],
        },
      ],
      loadRequest: async (_params) => {
        return {};
      },
      newRequest: async (data) => {
        const res = await postMobileHomepage(data);
        return { id: res };
      },
      updateRequest: async (_params, _data) => {
        return {};
      },
    };

    const modal = inject<any>('modal');
    const formRef = ref<any>(null);

    modal.ok = async () => {
      console.log('[ formRef ] >', formRef);
      try {
        return {
          ok: true,
          data: formRef.value.getData(),
        };
      } catch (err) {
        console.warn(err);
      }
    };

    return { ns, model, formRef };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <gct-edit-form ref="formRef" model={this.model} />
      </div>
    );
  },
});
