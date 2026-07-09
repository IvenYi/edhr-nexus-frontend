import { defineComponent, inject, ref } from 'vue';
import { IEditForm, IFormItem, useNamespace } from '@gct/runtime';
import './custom-nav-page-create-modal.scss';
import { postNavPage } from '/@/apis/gct-platform/NavPageController';
import { useI18n } from 'vue-i18n';

export const CustomNavPageCreateModal = defineComponent({
  name: 'CustomNavPageCreateModal',
  setup() {
    const ns = useNamespace('custom-nav-page-create-modal');
    const { t } = useI18n() as any;

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
              label: t('sys.pageDesigner.pageName'),
              labelWidth: '162px',
              gridItem: {
                span: 21,
              },
              rules: [
                {
                  required: true,
                  message: '请输入页面名称',
                },
                {
                  message: '最大100字',
                  max: 100,
                },
              ],
              editor: {
                type: 'text',
                label: t('sys.menu.navPageName'),
                placeholder: '请输入',
              },
            } as IFormItem,
          ],
        },
      ],
      loadRequest: async (_params) => {
        return {};
      },
      newRequest: async (data) => {
        const res = await postNavPage(data);
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
