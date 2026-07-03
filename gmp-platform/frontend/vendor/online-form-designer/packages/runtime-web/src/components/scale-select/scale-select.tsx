import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons-vue';
import './scale-select.scss';

export const ScaleSelect = defineComponent({
  name: 'ScaleSelect',
  props: {
    value: {
      type: Number,
      default: 100,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 10,
    },
    options: {
      type: Array<{ label: string; value: number }>,
      default: () => [
        {
          label: '25%',
          value: 25,
        },
        {
          label: '50%',
          value: 50,
        },
        {
          label: '75%',
          value: 75,
        },
        {
          label: '100%',
          value: 100,
        },
        {
          label: '自适应',
          value: 0,
        },
      ],
    },
    size: {
      type: String,
      default: 'small',
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('scale-select');

    const visible = ref(false);

    const val = computed({
      get: () => props.value,
      set: (value) => {
        if (value < props.min) {
          value = props.min;
        } else if (value > props.max) {
          value = props.max;
        }
        emit('update:value', value);
      },
    });

    const zoom = (e: MouseEvent) => {
      e.stopPropagation();
      let newValue = val.value + props.step;
      if (newValue > props.max) {
        newValue = props.max;
      }
      val.value = newValue;
    };

    const out = (e: MouseEvent) => {
      e.stopPropagation();
      let newValue = val.value - props.step;
      if (newValue < props.min) {
        newValue = props.min;
      }
      val.value = newValue;
    };

    const handleScaleOptionClick = (e: MouseEvent, optionValue: number) => {
      visible.value = false; // Close the tooltip after selecting an option
      e.stopPropagation();
      if (optionValue < props.min || optionValue > props.max) {
        return;
      }
      val.value = optionValue;
    };

    return () => {
      return (
        <div class={ns.b()}>
          <div class={[ns.e('before'), ns.e('action')]} onClick={out}>
            <MinusOutlined />
          </div>
          <div class={ns.e('content')}>
            <a-tooltip
              v-model:visible={visible.value}
              overlayClassName={ns.e('scale-options-tooltip')}
              placement="bottomLeft"
              color="#fff"
              title={
                <div class={ns.e('scale-options')}>
                  {props.options.map((option) => {
                    return (
                      <div
                        class={[ns.e('scale-option-item'), ns.is('active', val.value === option.value)]}
                        key={option.value}
                        onClick={(e) => handleScaleOptionClick(e, option.value)}
                      >
                        {option.label}
                      </div>
                    );
                  })}
                </div>
              }
            >
              <div class={ns.e('content_info')}>{val.value === 0 ? '自适应' : `${val.value}%`}</div>
            </a-tooltip>
          </div>
          <div class={[ns.e('after'), ns.e('action')]} onClick={zoom}>
            <PlusOutlined />
          </div>
        </div>
      );
    };
  },
});
