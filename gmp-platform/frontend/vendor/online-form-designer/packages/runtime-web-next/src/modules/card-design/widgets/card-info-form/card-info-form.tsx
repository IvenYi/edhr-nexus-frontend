import { computed, defineComponent, nextTick, PropType, ref, watch } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { EditorType, IEditForm, IFormEditItem, ITextareaEditor } from '@gct/runtime';
import { useDesignViewController } from '@gct/runtime-design';
// import { CARD_MODE } from '../../enum';
import { useCardViewStore } from '../../store';
import './card-info-form.scss';

export const CardInfoForm = defineComponent({
  name: 'CardInfoForm',
  props: {
    context: {
      type: Object as PropType<IContext>,
      default: () => ({}),
    },
  },
  setup(props) {
    const t = (window as any).$t;
    const ns = useNamespace('card-info-form');
    // 设计界面通用控制器
    const c = useDesignViewController();
    const store = useCardViewStore();

    const formRef = ref();

    const formData = computed({
      get: () => store.json,
      set: (value) => {
        store.enableDirtyCheck();
        store.json = value;
        if (c.store.pageNode) {
          c.store.pageNode.data.modelKey = store.json.modelKey;
        }
      },
    });

    watch(
      () => store.json.name,
      () => {
        nextTick(() => {
          setTimeout(() => {
            formRef.value?.c.validateItem('name');
          });
        });
      },
    );

    const formModel: IEditForm = {
      type: 'edit',
      children: [
        {
          type: 'container',
          layout: 'grid',
          name: 'group1',
          children: [
            {
              name: 'name',
              type: 'item',
              label: t('sys.cardDesign.form.name'),
              labelPosition: 'top',
              rules: [
                {
                  required: true,
                  validator(rule, value) {
                    return new Promise((resolve, reject) => {
                      if (!value || value.trim() === '') {
                        reject(t('sys.cardDesign.form.placeholder'));
                      }
                      if (value.length > 100) {
                        reject(t('sys.max100'));
                      } else {
                        resolve();
                      }
                    });
                  },
                  trigger: 'change',
                },
              ],
              editor: {
                type: EditorType.TEXT,
                placeholder: t('sys.inputText'),
              },
            },
            // {
            //   name: 'mode',
            //   type: 'item',
            //   label: t('sys.cardDesign.form.mode'),
            //   labelPosition: 'top',
            //   defaultValue: CARD_MODE.SIMPLE,
            //   class: ns.e('mode-select'),
            //   dictionary: {
            //     mode: 'static',
            //     tag: 'cardMode',
            //     items: [
            //       {
            //         value: CARD_MODE.SIMPLE,
            //         label: t('sys.cardDesign.form.mode_type.simple'),
            //         icon: '/assets/card-design/pic_easy_rest.svg',
            //       },
            //       {
            //         value: CARD_MODE.ADVANCED,
            //         label: t('sys.cardDesign.form.mode_type.advanced'),
            //         disabled: true,
            //         icon: '/assets/card-design/pic_gaoji_rest.svg',
            //       },
            //     ],
            //   },
            //   editor: {
            //     type: EditorType.RADIO,
            //   },
            // },
            {
              type: 'hidden',
              name: 'category',
              defaultValue: 'entity',
            },
            {
              type: 'hidden',
              name: 'categorySelect',
              defaultValue: 'entity',
            },
            {
              type: 'hidden',
              name: 'modelName',
            },
            {
              name: 'modelKey',
              type: 'item',
              label: t('sys.cardDesign.form.model'),
              class: ns.e('model-select'),
              labelPosition: 'top',
              rules: [
                {
                  required: true,
                  message: t('sys.cardDesign.form.modelRequired'),
                },
              ],
              editor: {
                type: EditorType.MODEL_SELECT,
                disabled: !!formData.value.modelKey && props.context.id,
                props: {
                  exclude: ['form', 'system'],
                  modelTypes: 'NDO,BASE,TREE,TRANSACTION,SIGN,RDO',
                },
              },
            },
            {
              name: 'description',
              type: 'item',
              label: t('sys.cardDesign.form.description'),
              labelPosition: 'top',
              rules: [
                {
                  validator(rule, value) {
                    return new Promise((resolve, reject) => {
                      if (value && value.trim().length > 1000) {
                        reject(t('sys.max1000'));
                      } else {
                        resolve();
                      }
                    });
                  },
                },
              ],
              editor: {
                type: EditorType.TEXTAREA,
                placeholder: t('sys.inputText'),
              } as ITextareaEditor,
            },
          ] as IFormEditItem[],
        },
      ],
    };

    async function validate(): Promise<boolean> {
      try {
        const res = await formRef.value?.c.validate();
        return res;
      } catch (error) {
        console.error('Form validation failed:', error);
        return false;
      }
    }

    return { ns, formRef, formModel, formData, validate };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('form')}>
          <gct-edit-form
            ref="formRef"
            class={this.ns.e('edit-form')}
            model={this.formModel}
            v-model:data={this.formData}
            embed
            adaptModal={false}
          />
        </div>
      </div>
    );
  },
});
