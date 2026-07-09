import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IActionEditor, IFormItemController, useForm } from '@gct/runtime';

export const GctFormAction = defineComponent({
  name: 'GctFormAction',
  props: {
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    data: {
      type: Object as PropType<IObject>,
      required: true,
    },
    model: {
      type: Object as PropType<IActionEditor>,
      required: true,
    },
    size: {
      type: String,
    },
  },
  setup(props) {
    const ns = useNamespace('gct-form-action');

    const form = useForm();

    function onClick(e: MouseEvent) {
      e.stopPropagation();
      if (props.model.click) {
        props.model.click(e, form, props.c, props.data);
      }
    }

    return { ns, onClick };
  },
  render() {
    return (
      <a-button
        class={this.ns.b()}
        onClick={this.onClick}
        size={this.size}
        type='link'
        {...(this.model.props || {})}
      >
        {this.model.label}
      </a-button>
    );
  },
});

export default GctFormAction;
