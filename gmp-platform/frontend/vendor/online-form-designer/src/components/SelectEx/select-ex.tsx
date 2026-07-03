import { useNamespace } from '@gct/runtime';
import { SlotsType, computed, defineComponent, ref, renderSlot, watch } from 'vue';
import CheckboxIcon from './checkbox-icon.vue';
import RadioIcon from './radio-icon.vue';
import './select-ex.scss';
import { isNil } from 'lodash-es';

type ShowMode = 'icon' | 'icon-label' | 'select';

type IconType = 'radio' | 'checkbox' | 'custom';

type StyleType = 'buttons';

type RawValue = string | number | boolean | undefined | null;

type Option = {
  label: string;
  value: RawValue;
  icon?: string;
};

export const SelectEx = defineComponent({
  name: 'SelectEx',
  props: {
    showMode: {
      type: String as PropType<ShowMode>,
      default: 'select',
    },
    styleType: {
      type: String as PropType<StyleType>,
    },
    iconType: {
      type: String as PropType<IconType>,
      default: 'radio',
    },
    options: {
      type: Array<Option>,
      required: true,
    },
    value: {
      type: Object as PropType<RawValue | RawValue[]>,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isMultiple: {
      type: Boolean,
      default: false,
    },
    /** 定义当只有一个选项时，不选时抛出的空值的值 */
    nullValue: {
      type: Object as PropType<RawValue>,
      default: undefined,
    },
    labelPosition: {
      type: String as PropType<'before' | 'after'>,
      default: 'after',
    },
    direction: {
      type: String as PropType<'portrait' | 'landscape'>,
      default: 'landscape',
    },
    size: {
      type: String as PropType<'small' | 'large' | 'middle'>,
    },
    onPrevCallback: {
      type: Function,
    },
  },
  emits: {
    'update:value': (_value: RawValue | RawValue[]) => true,
  },
  slots: Object as SlotsType<{
    suffix: { option: Option };
  }>,
  setup(props, { emit }) {
    const ns = useNamespace('select-ex');

    const selections = ref<RawValue[]>([]);

    // 监听值变更，维护selections
    watch(
      () => props.value,
      (val) => {
        if (props.isMultiple) {
          if (isNil(val)) {
            selections.value = [];
          } else {
            selections.value = val as RawValue[];
          }
        } else {
          selections.value = [val as RawValue];
        }
      },
      {
        immediate: true,
      },
    );

    const selectVal = computed({
      get() {
        if (props.isMultiple && !Array.isArray(props.value)) {
          throw new Error('Multiple selection mode requires an array value');
        }
        return props.value;
      },
      set(v) {
        if (props.isMultiple && !Array.isArray(v)) {
          throw new Error('Multiple selection mode requires an array value');
        } else {
          emit('update:value', v);
        }
      },
    });

    const handleOptionClick = (option: Option) => {
      // 禁用后禁止操作
      if (props.disabled || props?.onPrevCallback?.()) {
        return;
      }
      if (selections.value.includes(option.value)) {
        // 已选中的取消选中,多选抛数组，单选抛undefined
        if (props.isMultiple) {
          const newArr = selections.value.filter((item) => item !== option.value);
          emit('update:value', newArr);
        } else {
          if (props.options.length === 1) {
            // 只有一个选项的时候，取消选中是抛空值
            emit('update:value', props.nullValue);
          } else {
            // 多个选项，单选的时候没有取消选中，只能互相切换
            return;
          }
        }
      } else {
        // 未选中的选中,多选抛数组，单选抛value
        if (props.isMultiple) {
          const newArr = [...selections.value, option.value];
          emit('update:value', newArr);
        } else {
          emit('update:value', option.value);
        }
      }
    };

    /**
     * 绘制图标
     * @param option 选项
     * @returns
     */
    const renderIcon = (option: Option) => {
      const commonClass = [ns.be('option', 'icon'), ns.bem('option', 'icon', props.iconType)];
      if (props.iconType === 'custom') {
        if (option.icon) {
          return <i class={[...commonClass, 'iconfont', option.icon]} />;
        } else {
          return null;
        }
      } else if (props.iconType === 'radio') {
        return (
          <RadioIcon
            class={[...commonClass]}
            disabled={props.disabled}
            selected={selections.value.includes(option.value)}
          />
        );
      } else {
        return (
          <CheckboxIcon
            class={[...commonClass]}
            disabled={props.disabled}
            selected={selections.value.includes(option.value)}
          />
        );
      }
    };

    return { ns, selectVal, selections, renderIcon, handleOptionClick };
  },
  render() {
    const rootClass = [
      this.ns.b(),
      this.ns.m(this.showMode),
      this.styleType && this.ns.m(this.styleType),
      this.ns.is('disabled', this.disabled),
    ];
    if (this.showMode === 'select') {
      return (
        <a-select
          v-model:value={this.selectVal}
          class={rootClass}
          options={this.options}
          mode={this.isMultiple ? 'tags' : undefined}
          disabled={this.disabled}
          size={this.size}
        ></a-select>
      );
    } else {
      return (
        <div class={[...rootClass, this.ns.m(this.direction)]}>
          {this.options.map((item) => {
            const isSelected = this.selections.includes(item.value);
            return (
              <div
                class={[
                  this.ns.b('option'),
                  this.ns.bm('option', this.labelPosition),
                  this.ns.is('selected', isSelected),
                ]}
                title={item.label}
                onClick={() => this.handleOptionClick(item)}
              >
                {this.labelPosition === 'after' && this.renderIcon(item)}
                {this.showMode === 'icon-label' && (
                  <span class={[this.ns.be('option', 'label')]}>{item.label}</span>
                )}
                {this.labelPosition === 'before' && this.renderIcon(item)}
                {renderSlot(this.$slots, 'suffix', { option: item })}
              </div>
            );
          })}
        </div>
      );
    }
  },
});

export default SelectEx;
