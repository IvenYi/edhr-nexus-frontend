import { defineComponent, ref, computed } from 'vue';
import { Checkbox, CheckboxGroup } from 'vant';
import { FIELD_TYPE } from '/@/enums/appEnum';
import type { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import Taglabel from './taglabel.vue';
import './index.less';
import 'vant/lib/checkbox-group/style';
import 'vant/lib/checkbox/style';

export default defineComponent({
  name: 'FieldCheckbox',
  props: {
    design: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    fieldType: {
      type: String as PropType<FIELD_TYPE>,
      required: true,
    },
    tagStyle: {
      type: Object as PropType<LowCodeWidget.BasicStyle>,
      required: true,
    },
    options: Array,
    value: [String, Number],
  },
  setup(props, { emit }) {
    const isBool = props.fieldType === FIELD_TYPE.BOOLEAN;

    const options = computed<Array<any>>(() => {
      if (isBool) {
        return (props.options ?? []).filter((item: any) => item.value);
      }
      return props.options ?? [];
    });

    const currentValue = computed({
      get() {
        if (Array.isArray(props.value)) {
          return props.value;
        }
        if (options.value.some((item) => item.value === props.value)) {
          return [props.value];
        }
        return [];
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

    return () => {
      return (
        <CheckboxGroup
          v-model={currentValue.value}
          disabled={props.disabled}
          shape="square"
          class={[
            'flex',
            'mobile-field-checkbox-group',
            props.readonly ? 'mobile-field-checkbox-group--readonly' : '',
          ]}
        >
          {options.value?.map((option: any) => {
            return (
              // todo tangjian 移动端主题色
              <Checkbox key={option.value} name={option.value} icon-size="16px" class="mr-12px">
                <Taglabel
                  tagWidgetStyle={props.tagStyle}
                  type={props.fieldType}
                  label={option.label}
                  disabled={props.disabled}
                />
              </Checkbox>
            );
          })}
        </CheckboxGroup>
      );
    };
  },
});
