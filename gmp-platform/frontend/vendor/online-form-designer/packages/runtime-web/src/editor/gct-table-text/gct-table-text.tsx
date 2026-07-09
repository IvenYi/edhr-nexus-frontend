import { defineComponent, PropType } from 'vue';
import {
  useNamespace,
  useGctFormValueByText,
  ITableEditItemController,
  ITextEditor,
} from '@gct/runtime';
import './gct-table-text.scss';

/**
 * 文本编辑器
 */
export const GctTableText = defineComponent({
  name: 'GctTableText',
  props: {
    c: {
      type: Object as PropType<ITableEditItemController>,
      required: true,
    },
    model: {
      type: Object as PropType<ITextEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('table-text');

    const val = useGctFormValueByText(
      props.model.prefix || props.model.addonBefore,
      props.model.suffix || props.model.addonAfter,
    );

    const handleBlur = (): void => {
      if (typeof val.value === 'string') {
        val.value = val.value.trim();
      }
    };

    return { ns, val, handleBlur };
  },
  render() {
    if (this.isEdit === false) {
      return <div class={[this.ns.b(), this.ns.e('info')]}>{this.c.value}</div>;
    }
    return (
      <a-input
        v-model:value={this.val}
        {...(this.model.props || {})}
        class={[this.ns.b(), this.ns.is('error', this.c.state.error)]}
        prefix={this.model.prefix}
        suffix={this.model.suffix}
        addonBefore={this.model.addonBefore}
        addonAfter={this.model.addonAfter}
        placeholder={this.model.placeholder}
        show-count={this.model.max != null}
        maxlength={this.model.max}
        autocomplete="off"
        onBlur={this.handleBlur}
      />
    );
  },
});
