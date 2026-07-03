import { defineComponent, PropType } from 'vue';
import { useNamespace, useGctFormValueByText, ITextEditor, EditorController } from '@gct/runtime';
import './gct-form-text.scss';

/**
 * 文本编辑器
 */
export const GctFormText = defineComponent({
  name: 'GctFormText',
  props: {
    model: {
      type: Object as PropType<ITextEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    size: {
      type: String,
    }
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('gct-form-text');

    const c = new EditorController(props.model);

    const val = useGctFormValueByText(
      props.model.prefix || props.model.addonBefore,
      props.model.suffix || props.model.addonAfter,
    );

    const handleBlur = (): void => {
      if (typeof val.value === 'string') {
        val.value = val.value.trim();
      }
    };

    return { ns, c, val, handleBlur };
  },
  render() {
    return (
      <a-input
        v-model:value={this.val}
        size={this.size}
        {...(this.model.props || {})}
        class={this.ns.b()}
        prefix={this.model.prefix}
        suffix={this.model.suffix}
        addonBefore={this.model.addonBefore}
        addonAfter={this.model.addonAfter}
        placeholder={this.model.placeholder}
        show-count={this.model.max != null}
        maxlength={this.model.max}
        onBlur={this.handleBlur}
      />
    );
  },
});
