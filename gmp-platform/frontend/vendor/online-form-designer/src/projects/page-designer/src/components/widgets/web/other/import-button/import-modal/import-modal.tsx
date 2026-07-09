import { defineComponent } from 'vue';
import {
  IEditForm,
  IFormEditItemController,
  IFormGroup,
  IFormItem,
  IInfoEditor,
  useNamespace,
} from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import './import-modal.scss';

export const ImportModal = defineComponent({
  name: 'ImportModal',
  setup() {
    const ns = useNamespace('import-modal');

    const { t } = useI18n();

    const form: IEditForm = {
      type: 'edit',
      loadRequest: async (_params) => {
        return {};
      },
      newRequest: async (data) => {
        return data;
      },
      updateRequest: async (_params, data) => {
        return data;
      },
      children: [
        {
          type: 'container',
          name: 'group',
          layout: 'grid',
          title: t('sys.pageDesigner.importMode'),
          children: [
            {
              type: 'item',
              label: t('sys.pageDesigner.importPolicy'),
              name: 'mode',
              margin: '0',
              defaultValue: 1,
              dictionary: {
                mode: 'static',
                tag: 'import_radio_mode',
                items: [
                  { label: t('sys.pageDesigner.allUnsuccessful'), value: 0 },
                  { label: t('sys.pageDesigner.stopUponError'), value: 2 },
                  { label: t('sys.pageDesigner.ignoringErrorsContinuing'), value: 1 },
                ],
              },
              editor: { type: 'radio' },
            } as IFormItem,
            {
              type: 'container',
              layout: 'flex',
              name: 'group_1',
              children: [
                {
                  type: 'container',
                  layout: 'grid',
                  name: 'group_1_1',
                  width: '100px',
                  flexItem: {
                    flexShrink: 0,
                  },
                },
                {
                  type: 'container',
                  layout: 'grid',
                  name: 'group_1_2',
                  flexItem: {
                    flexGrow: 1,
                  },
                  children: [
                    {
                      type: 'item',
                      name: 'info',
                      defaultValue: t('sys.pageDesigner.importDesc.three'),
                      editor: {
                        type: 'info',
                        icon: 'icon-guanyu',
                        content: '',
                      } as IInfoEditor,
                    } as IFormItem,
                  ],
                },
              ] as IFormGroup[],
            } as IFormGroup,
          ],
        },
      ] as IFormGroup[],
      watch: {
        mode: (form, val, _oldVal) => {
          let content = '';
          switch (val) {
            case 1:
              content = t('sys.pageDesigner.importDesc.three');
              break;
            case 2:
              content = t('sys.pageDesigner.importDesc.two');
              break;
            default:
              content = t('sys.pageDesigner.importDesc.one');
          }
          (form.item.info as IFormEditItemController).value = content;
        },
      },
    };

    return { ns, form };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <gct-edit-form model={this.form}></gct-edit-form>
      </div>
    );
  },
});
