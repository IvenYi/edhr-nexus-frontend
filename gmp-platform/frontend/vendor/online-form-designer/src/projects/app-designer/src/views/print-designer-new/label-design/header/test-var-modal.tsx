import { defineComponent, PropType } from 'vue';
import { IEditForm, useNamespace, IModal, IFormEditItem } from '@gct/runtime';
import './test-var-modal.scss';

/**
 * 属性项配置
 *
 * @author zhanghanrui
 * @date 2024-09-23 16:09:37
 * @export
 * @interface IFieldCOnfig
 */
export interface IFieldCOnfig {
  /**
   * 唯一标识
   *
   * @author zhanghanrui
   * @date 2024-09-23 16:09:53
   * @type {string}
   */
  key: string;
  /**
   * 文本
   *
   * @author zhanghanrui
   * @date 2024-09-23 16:09:58
   * @type {string}
   */
  label: string;
  /**
   * 项类型
   *
   * @author zhanghanrui
   * @date 2024-10-11 11:10:52
   * @type {string}
   */
  valType: string;
  /**
   * 默认值
   *
   * @author zhanghanrui
   * @date 2024-10-11 11:10:42
   * @type {string}
   */
  defaultVal?: string;
}

export const TestVarModal = defineComponent({
  name: 'TestVarModal',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    fieldConfig: {
      type: Object as PropType<IFieldCOnfig[]>,
    },
  },
  setup(props) {
    const ns = useNamespace('test-var-modal');

    const editors: IFormEditItem[] = [];

    if (props.fieldConfig) {
      props.fieldConfig.forEach((_) => {
        if (_.valType === 'FIXED') {
          editors.push({
            type: 'hidden',
            label: _.label,
            name: _.key,
            defaultValue: _.defaultVal,
            editor: {
              type: 'span',
            },
          });
        } else {
          editors.push({
            type: 'item',
            label: _.label,
            name: _.key,
            editor: {
              type: 'text',
              placeholder: window.$t('sys.inputText'),
            },
            rules: [
              {
                required: true,
                message: window.$t('sys.appDesigner.printDesign.pleaseInputContent'),
              },
            ],
          });
        }
      });
    }

    const model: IEditForm = {
      type: 'edit',
      children: [
        {
          name: 'group',
          type: 'container',
          layout: 'grid',
          children: editors,
        },
      ],
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
