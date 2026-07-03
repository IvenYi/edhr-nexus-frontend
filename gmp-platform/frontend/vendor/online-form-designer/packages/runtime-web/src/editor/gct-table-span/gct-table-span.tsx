import { defineComponent, PropType } from 'vue';
import { ISpanEditor, ITableEditItemController, useNamespace } from '@gct/runtime';
import './gct-table-span.scss';

export const GctTableSpan = defineComponent({
  name: 'GctTableSpan',
  props: {
    c: {
      type: Object as PropType<ITableEditItemController>,
      required: true,
    },
    model: {
      type: Object as PropType<ISpanEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
  },
  setup() {
    const ns = useNamespace('table-span');

    return { ns };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.model.icon ? (
          <span class={this.ns.e('icon')}>
            <i
              class={`iconfont ${
                typeof this.model.icon === 'string'
                  ? this.model.icon
                  : this.model.icon(this.c.row.data)
              }`}
            />
          </span>
        ) : null}
        <span class={this.ns.e('text')}>{this.value}</span>
      </div>
    );
  },
});
