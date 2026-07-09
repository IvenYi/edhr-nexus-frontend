import { computed, defineComponent, PropType } from 'vue';
import { useGctFormValue, useNamespace } from '@gct-paas/core';
import { ITextEditor } from '@gct/runtime';
import './gct-form-pixel-config.scss';

export const GctFormPixelConfig = defineComponent({
  name: 'GctFormPixelConfig',
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
    },
  },
  setup() {
    const ns = useNamespace('form-pixel-config');

    const mode = useGctFormValue('label_mode');

    const val = useGctFormValue();

    const options = [
      {
        label: '百分比',
        value: 'percent',
      },
      {
        label: '固定',
        value: 'fixed',
      },
    ];

    const addonAfter = computed(() => {
      return mode.value === 'fixed' ? 'px' : '%';
    });

    function onSelectChange(_val: string) {
      mode.value = _val;
      if (_val === 'fixed') {
        val.value = 100;
      } else {
        val.value = 30;
      }
    }

    return () => {
      return (
        <a-input-group compact class={ns.b()}>
          <a-select
            class={ns.e('select')}
            v-model:value={mode.value}
            options={options}
            onChange={onSelectChange}
          />
          <a-input-number
            class={ns.e('input')}
            v-model:value={val.value}
            min={0}
            placeholder="请输入"
            size="small"
            max={mode.value === 'fixed' ? 500 : 100}
            addonAfter={addonAfter.value}
          />
        </a-input-group>
      );
    };
  },
});
