import { defineComponent } from 'vue';
import { IEditForm, IFormItem, useNamespace } from '@gct/runtime';
import { getMobileHomepageList } from '/@/apis/gct-apaas/MobileHomepageController';
import { useI18n } from 'vue-i18n';
import './assign-nav-page-modal.scss';
import { getNavPageList } from '/@/apis/gct-platform/NavPageController';

export const AssignNavPageModal = defineComponent({
  name: 'AssignNavPageModal',
  props: {
    selectedId: { type: String },
  },
  setup(props) {
    const ns = useNamespace('assign-nav-page-modal');

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
              name: 'id',
              type: 'item',
              label: '目标页面',
              labelWidth: '162px',
              gridItem: {
                span: 21,
              },
              dictionary: {
                tag: 'receipt_classification',
                mode: 'async',
                fetch(_params) {
                  return getNavPageList().then((items) => {
                    return items || [];
                  });
                },
              },
              defaultValue: props.selectedId,
              editor: {
                type: 'picker',
                placeholder: t('sys.appDesigner.pleaseSelect'),
                props: {
                  allowClear: true,
                },
              },
            } as IFormItem,
          ],
        },
      ],
      loadRequest: async (_params) => {
        return {};
      },
      newRequest: async (data) => {
        return data;
      },
      updateRequest: async (_params, data) => {
        return data;
      },
    };

    return { ns, model };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <gct-edit-form model={this.model} />
      </div>
    );
  },
});
