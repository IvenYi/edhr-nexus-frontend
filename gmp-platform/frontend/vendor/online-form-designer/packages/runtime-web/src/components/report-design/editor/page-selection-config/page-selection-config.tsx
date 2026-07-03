import { defineComponent, PropType, ref } from 'vue';
import { useGctFormValue, useNamespace } from '@gct-paas/core';
import { ISelectEditor } from '@gct/runtime';
import './page-selection-config.scss';

export const PageSelectionConfig = defineComponent({
  name: 'PageSelectionConfig',
  props: {
    model: {
      type: Object as PropType<ISelectEditor>,
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
  setup() {
    const ns = useNamespace('page-selection-config');

    const rootRef = ref();

    const val = useGctFormValue();

    const options = [
      {
        label: '5',
        value: '5',
      },
      {
        label: '10',
        value: '10',
      },
      {
        label: '20',
        value: '20',
      },
      {
        label: '30',
        value: '30',
      },
      {
        label: '40',
        value: '40',
      },
      {
        label: '50',
        value: '50',
      },
    ];

    return { ns, rootRef, val, options };
  },
  render() {
    return (
      <div ref="rootRef" class={this.ns.b()}>
        <div class={this.ns.e('left')}>单页显示数据</div>
        <div class={this.ns.e('select')}>
          <a-select
            v-model:value={this.val}
            size={this.size}
            options={this.options}
            getPopupContainer={() => this.rootRef}
          />
        </div>
        <div class={this.ns.e('right')}>条/页</div>
      </div>
    );
  },
});
