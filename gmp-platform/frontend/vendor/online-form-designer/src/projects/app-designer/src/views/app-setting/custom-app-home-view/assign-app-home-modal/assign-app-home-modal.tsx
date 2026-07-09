import { defineComponent } from 'vue';
import { IEditForm, IFormItem, useNamespace } from '@gct/runtime';
import { getMobileHomepageList } from '/@/apis/gct-apaas/MobileHomepageController';
import { useI18n } from 'vue-i18n';
import './assign-app-home-modal.scss';

export const AssignAppHomeModal = defineComponent({
  name: 'AssignAppHomeModal',
  props: {
    selectedId: { type: String },
    isDeleted: { type: Boolean },
    selectedTitle: { type: String },
  },
  setup(props) {
    const ns = useNamespace('assign-app-home-modal');

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
              label: window.$t('sys.appDesigner.customAppHome.form.targetPage'),
              labelWidth: '162px',
              gridItem: {
                span: 21,
              },
              dictionary: {
                tag: 'receipt_classification',
                mode: 'async',
                fetch(_params) {
                  return getMobileHomepageList().then((items) => {
                    return items || [];
                  });
                },
              },
              defaultValue: props.isDeleted ? props.selectedTitle : props.selectedId,
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
