import { defineComponent, ref, computed } from 'vue';
import { RadioGroup, Radio } from 'vant';
import { FIELD_TYPE } from '/@/enums/appEnum';
import Taglabel from './taglabel.vue';
import type { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import 'vant/lib/radio-group/style';
import 'vant/lib/radio/style';
import './index.less';

export default defineComponent({
  name: 'FieldRadio',
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
    value: [String, Number, Boolean],
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
          v-model={currentValue.value}
          disabled={props.disabled}
          direction="horizontal"
          shape="dot"
          class={[
            'mobile-field-radio-group',
            props.readonly ? 'mobile-field-radio-group--readonly' : '',
          ]}
        >
          {(props.options ?? []).map((option: any) => {
            const { iconColor, icon, textColor } = option._item || {};
            const iconExtraProps = { [option.label]: { icon, iconColor, textColor } };
            return (
              // todo tangjian 移动端主题色
              <Radio key={option.value} name={option.value} icon-size="16px">
                <Taglabel
                  multiple={true}
                  maxTagTextLength={12}
                  tagWidgetStyle={props.tagStyle}
                  type={props.fieldType}
                  label={option.label}
                  disabled={props.disabled}
                  iconExtraProps={iconExtraProps}
                />
              </Radio>
            );
          })}
        </RadioGroup>
      );
    };
  },
});
