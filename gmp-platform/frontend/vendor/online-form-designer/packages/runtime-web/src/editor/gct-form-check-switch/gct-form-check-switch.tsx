import { defineComponent, PropType } from 'vue';
import {
  useNamespace,
  useGctFormValue,
  IFormItem,
  ICheckSwitchEditor,
  EditorController,
} from '@gct/runtime';
import './gct-form-check-switch.scss';

/**
 * 文本编辑器
 */
export const GctFormCheckSwitch = defineComponent({
  name: 'GctFormCheckSwitch',
  props: {
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<ICheckSwitchEditor>,
      required: true,
    },
    value: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('gct-form-check-switch');

    const c = new EditorController(props.model);

    const val = useGctFormValue();

    return { ns, c, val };
  },
  render() {
    if (this.model.isSwitch) {
      return (
        <div
          class={[
            this.ns.b(),
            this.ns.m('switch'),
            this.ns.is('readonly', this.model.readonly),
            this.size ? this.ns.m(this.size) : null,
          ]}
        >
          <a-switch v-model:checked={this.val} size={this.size} {...(this.model.props || {})} />
        </div>
      );
    }
    return (
      <a-checkbox
        v-model:checked={this.val}
        size={this.size}
        {...(this.model.props || {})}
        class={[
          this.ns.b(),
          this.ns.m('checkbox'),
          this.ns.is('readonly', this.model.readonly),
          this.size ? this.ns.m(this.size) : null,
        ]}
      >
        {this.model.label}
      </a-checkbox>
    );
  },
});
