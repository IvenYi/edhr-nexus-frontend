import { defineComponent, ref, computed } from 'vue';
import { RadioGroup, Radio } from 'ant-design-vue';
import type { RadioGroupProps } from 'ant-design-vue';
import { FIELD_TYPE } from '/@/enums/appEnum';
import type { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import FieldReadonly from './field-readonly.vue';
import './index.less';

export default defineComponent({
  name: 'FieldRadio',
  props: {
    design: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    fieldType: {
      type: Object as PropType<FIELD_TYPE>,
      required: true,
    },
    tagStyle: {
      type: Object as PropType<LowCodeWidget.BasicStyle>,
      required: true,
    },
    options: Array as PropType<RadioGroupProps['options']>,
    value: [String, Number],
  },
  setup(props, { emit }) {
    const currentValue = computed({
      get() {
        return props.value;
      },
      set(value) {
        emit('update:value', value);
      },
    });

    return () => {
      return (
        <RadioGroup
          v-model:value={currentValue.value}
          disabled={props.disabled}
          class={['field-radio-group', props.readonly ? 'field-radio-group--readonly' : '']}
        >
          {(props.options ?? []).map((option: any) => {
            const { icon, iconColor, textColor } = option?._item || {};
            return (
              <Radio key={option.value} value={option.value}>
                <FieldReadonly
                  tagWidgetStyle={props.tagStyle}
                  type={props.fieldType}
                  label={option.label}
                  disabled={props.disabled}
                  iconExtraProps={{ [option.label]: { icon, iconColor, textColor } }}
                />
              </Radio>
            );
          })}
        </RadioGroup>
      );
    };
  },
});
