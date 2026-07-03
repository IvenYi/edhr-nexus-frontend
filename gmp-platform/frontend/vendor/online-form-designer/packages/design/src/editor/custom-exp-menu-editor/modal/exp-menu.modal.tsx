import { defineComponent, PropType, reactive } from 'vue';
import {
  IEditForm,
  IFormEditItem,
  useNamespace,
  IModal,
  IFormContainer,
  IIconSelectEditor,
} from '@gct/runtime';
import { getNavPageList } from '/@/apis/gct-platform/NavPageController';
import { IMobileHomeMenuItem } from '@gct/base';
import './exp-menu-modal.scss';

export const ExpMenuModal = defineComponent({
  name: 'ExpMenuModal',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    data: {
      type: Object as PropType<IMobileHomeMenuItem>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('exp-menu-modal');

    const form = reactive(props.data);

    const t = window.$t;

    const model: IEditForm = {
      type: 'edit',
      labelWidth: '150px',
      children: [
        {
          type: 'container',
          name: 'group',
          layout: 'grid',
          children: [
            {
              label: t('sys.developer.designView.form.menuContent'),
              type: 'item',
              name: 'menuMode',
              defaultValue: 'system',
              dictionary: {
                mode: 'static',
                tag: 'exp-menu-mode',
                items: [
                  {
                    label: t('sys.developer.designView.form.systemPage'),
                    value: 'system',
                  },
                  {
                    label: t('sys.developer.designView.form.customExpView'),
                    value: 'custom',
                  },
                ],
              },
              editor: {
                type: 'radio',
              },
            },
            {
              name: 'presetType',
              type: 'item',
              width: '505px',
              style: {
                'margin-left': '75px',
              },
              editor: {
                type: 'system-page-select',
              },
              hidden(form, item, data) {
                if (data.menuMode === 'system') {
                  return false;
                }
                return true;
              },
            },
            {
              type: 'hidden',
              name: 'customExpViewName',
            },
            {
              label: t('sys.developer.designView.form.selectPage'),
              name: 'customExpView',
              type: 'item',
              rules: [{ required: true, message: t('sys.developer.designView.form.chosePage') }],
              dictionary: {
                mode: 'dynamic',
                fetch: async () => {
                  const pages = await getNavPageList();
                  if (pages) {
                    return pages;
                  }
                  return [];
                },
              },
              editor: {
                type: 'picker',
                nameField: 'customExpViewName',
                placeholder: t('sys.chooseText'),
                style: {
                  width: '430px',
                },
              },
              hidden(form, item, data) {
                return data.menuMode !== 'custom';
              },
            },
            {
              label: t('sys.developer.designView.form.menuName'),
              name: 'label',
              type: 'item',
              rules: [
                { required: true, message: t('sys.developer.designView.form.inputMenuName') },
                { max: 100, message: t('sys.developer.designView.err.info3') },
              ],
              editor: {
                type: 'text',
                placeholder: t('sys.inputText'),
                style: {
                  width: '430px',
                },
              },
            },
            {
              name: 'group1',
              type: 'container',
              layout: 'grid',
              children: [
                {
                  label: t('sys.developer.designView.form.icon'),
                  name: 'icon',
                  type: 'item',
                  gridItem: {
                    span: 9,
                  },
                  editor: {
                    type: 'icon-select',
                    showColor: false,
                    size: 56,
                    style: {
                      width: '56px',
                      height: '56px',
                    },
                    label: '未选中',
                  } as IIconSelectEditor,
                  hidden(form, item, data) {
                    return data.isSystem;
                  },
                },
                {
                  name: 'selectIcon',
                  type: 'item',
                  gridItem: {
                    span: 12,
                  },
                  editor: {
                    type: 'icon-select',
                    showColor: false,
                    size: 56,
                    style: {
                      width: '56px',
                      height: '56px',
                    },
                    label: '已选中',
                  } as IIconSelectEditor,
                  hidden(form, item, data) {
                    return data.isSystem;
                  },
                },
              ] as IFormEditItem[],
            } as IFormContainer,
          ] as IFormEditItem[],
        },
      ],
    };

    return { ns, model, form };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <gct-edit-form data={this.form} model={this.model} />
      </div>
    );
  },
});
