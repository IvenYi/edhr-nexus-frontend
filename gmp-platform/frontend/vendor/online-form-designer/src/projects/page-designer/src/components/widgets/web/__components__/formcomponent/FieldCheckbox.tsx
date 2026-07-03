import { defineComponent, ref, computed } from 'vue';
import { CheckboxGroup, Checkbox } from 'ant-design-vue';
import type { CheckboxGroupProps } from 'ant-design-vue';
import { FIELD_TYPE } from '/@/enums/appEnum';
import type { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import FieldReadonly from './field-readonly.vue';
import './index.less';
import { truncateText, measureText } from '@gct/runtime';

export default defineComponent({
  name: 'FieldCheckbox',
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
    options: Array as PropType<CheckboxGroupProps['options']>,
    value: [String, Number],
    checkboxWidth: {
      type: Number,
      default: 1400,
    },
  },
  setup(props, { emit }) {
    const isBool = props.fieldType === FIELD_TYPE.BOOLEAN;

    const currentValue = computed({
      get() {
        if (isBool) {
          return [props.value];
        }
        return Array.isArray(props.value)
          ? props.value
          : props.value
            ? props.value.split(',')
            : undefined;
      },
      set(value) {
        if (isBool) {
          const bool = value?.[0];
          if (bool === undefined || bool === null || typeof bool !== 'boolean') {
            emit('update:value', Boolean(bool));
          } else {
            emit('update:value', !!bool);
          }
        } else {
          emit('update:value', value);
        }
      },
    });

    const options = computed<CheckboxGroupProps['options']>(() => {
      if (isBool) {
        return (props.options ?? []).filter((item: any) => item.value);
      }
      return props.options ?? [];
    });

    return () => {
      return (
        <CheckboxGroup
          v-model:value={currentValue.value}
          disabled={props.disabled}
          class={['field-checkbox-group', props.readonly ? 'field-checkbox-group--readonly' : '']}
        >
          {options.value?.map((option: any) => {
            const { icon, iconColor, textColor } = option?._item || {};
            console.log(
              'measureText(option.label)',
              measureText(option.label),
              props.checkboxWidth,
            );
            return (
              <span title={measureText(option.label) > props.checkboxWidth ? option.label : ''}>
                <Checkbox key={option.value} value={option.value}>
                  <div
                    class="ell"
                    style={{
                      width: measureText(truncateText(option.label, props.checkboxWidth)) + 'px',
                    }}
                  >
                    <FieldReadonly
                      tagWidgetStyle={props.tagStyle}
                      type={props.fieldType}
                      label={option.label}
                      disabled={props.disabled}
                      title={measureText(option.label) > props.checkboxWidth ? option.label : ''}
                      iconExtraProps={{ [option.label]: { icon, iconColor, textColor } }}
                    />
                  </div>
                </Checkbox>
              </span>
            );
          })}
        </CheckboxGroup>
      );
    };
  },
});
