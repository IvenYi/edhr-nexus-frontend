import { PropType, defineComponent } from 'vue';
import { IFormItemController, IRadioEditor, useNamespace, useGctFormValue } from '@gct/runtime';
import { Radio, RadioButton, RadioGroup } from 'ant-design-vue';
import './gct-form-radio.scss';

export const GctFormRadio = defineComponent({
  name: 'GctFormRadio',
  props: {
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    model: {
      type: Object as PropType<IRadioEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    size: {
      type: String,
    },
  },
  emits: ['update:value'],
  setup() {
    const ns = useNamespace('gct-form-radio');

    const val = useGctFormValue();

    return { ns, val };
  },
  render() {
    const attrs = {
      ...(this.model.props || {}),
      class: [this.ns.b()],
      allowClear: true,
      disabled: this.c.state.disabled,
    };
    if (this.model.buttonMode) {
      return (
        <RadioGroup
          class={this.ns.m('button')}
          v-model:value={this.val}
          size="small"
          button-style="solid"
          {...attrs}
        >
          {this.c.state.options.map((option) => {
            return (
              <RadioButton key={option.value} value={option.value}>
                {option.label}
              </RadioButton>
            );
          })}
        </RadioGroup>
      );
    }
    return (
      <RadioGroup class={[this.ns.m('radio')]} v-model:value={this.val} size={this.size} {...attrs}>
        {this.c.state.options.map((option) => {
          return (
            <Radio
              class={[
                this.ns.e('item'),
                this.ns.em('item', 'pos-' + (this.model.icon?.pos || 'left')),
              ]}
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.icon ? (
                <span
                  class={this.ns.e('item-icon')}
                  style={{
                    width: this.model.icon?.width,
                    height: this.model.icon?.height,
                    fontSize: this.model.icon?.fontSize,
                  }}
                >
                  {typeof option.icon === 'string' && option.icon.endsWith('.svg') ? (
                    <svg-icon src={option.icon} />
                  ) : (
                    option.icon
                  )}
                </span>
              ) : null}
              <span class={this.ns.e('item-label')}>{option.label}</span>
            </Radio>
          );
        })}
      </RadioGroup>
    );
  },
});

export default GctFormRadio;
