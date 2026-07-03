import { defineComponent } from 'vue';
import { IEditForm, IFormItem, useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import './assign-nav-menu-modal.scss';
import { getNavMenuList } from '/@/apis/gct-platform/NavMenuController';

export const AssignNavMenuModal = defineComponent({
  name: 'AssignNavMenuModal',
  props: {
    selectedId: { type: String },
    isDeleted: { type: Boolean },
    selectedTitle: { type: String },
  },
  setup(props) {
    const ns = useNamespace('assign-nav-menu-modal');

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
              label: t('sys.menu.targetNavigation'),
              labelWidth: '162px',
              gridItem: {
                span: 21,
              },
              dictionary: {
                tag: 'receipt_classification',
                mode: 'async',
                fetch(_params) {
                  return getNavMenuList().then((items) => {
                    return items?.filter((i) => !i.deleted!) || [];
                  });
                },
              },
              defaultValue: props.isDeleted ? props.selectedTitle : props.selectedId,
              editor: {
                type: 'picker',
                placeholder: t('sys.appDesigner.pleaseSelect'),
                props: {
                  allowClear: true,
                  showSearch: true,
                  filterOption: (val, item) => item.label.includes(val),
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
