import { defineComponent, computed, ref, onMounted } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { SearchRenderRangeField } from '../search-render-range-field/search-render-range-field';
import { SearchNumberInput } from '/@/projects/page-designer/src/types/pad';
import { GctSvgIcon } from '/@/projects/page-designer/src/components/common/svg-icon/svg-icon';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
import { toRefs } from '@vueuse/core';
import './search-render-numeric.scss';
import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

// 选择框位置
type SelectPos = 'single' | 'start' | 'end';

/**
 * 搜索数值范围输入组件
 * 基于原生输入框实现的移动端数值范围输入器
 * 支持开始数值和结束数值的独立输入，以及不同数值类型（整数、精度小数、小数、长整数）
 */
export const SearchRenderNumeric = defineComponent({
  name: 'SearchRenderNumeric',
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<string | number | (string | number)[]>,
    },
    widget: {
      type: Object as PropType<SearchNumberInput>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const ns = useNamespace('search-render-numeric');
    const { displayValue: emptyDisplayValue } = useGlobalSetting();

    const { placeholder, fieldType, maxValue, minValue, isRang, modelKey, field } =
      props.widget.props;

    const { readonly, disabled } = toRefs(props.widget.props);

    // 字段精度配置
    const fieldPrecision = ref<number | undefined>(undefined);

    // 获取字段精度配置
    const initFieldPrecision = async () => {
      if (fieldType === FIELD_TYPE.DECIMAL && modelKey && field) {
        try {
          const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
          if ((fieldInfo?.specificConfig as any)?.digits !== undefined) {
            fieldPrecision.value = (fieldInfo.specificConfig as any).digits;
          }
        } catch (error) {
          console.warn('获取字段精度配置失败:', error);
        }
      }
    };

    // 组件挂载时获取精度配置
    onMounted(() => {
      initFieldPrecision();
    });

    const val = computed<string | number | (string | number)[]>({
      get() {
        if (props.modelValue !== undefined && props.modelValue !== null) {
          return props.modelValue;
        }
        return isRang ? ['', ''] : '';
      },
      set(value?: string | number | (string | number)[]) {
        let _val: any = value;
        if (isRang && Array.isArray(value)) {
          if (value[0] || value[1] || value[0] === 0 || value[1] === 0) {
            _val = [value[0] ?? null, value[1] ?? null];
          }
          if ((_val[0] == null || _val[0] === '') && (_val[1] == null || _val[1] === '')) {
            _val = undefined;
          }
        } else {
          if (value === '' || value == null) {
            _val = undefined;
          }
        }
        emit('update:modelValue', _val);
      },
    });

    // 开始值显示
    const startVal = computed({
      get() {
        const arrayVal = val.value as (string | number)[];
        return arrayVal[0];
      },
      set(value: string | number) {
        const arrayVal = val.value as (string | number)[];
        val.value = [value, arrayVal[1]];
      },
    });

    // 结束值显示
    const endVal = computed({
      get() {
        const arrayVal = val.value as (string | number)[];
        return arrayVal[1];
      },
      set(value: string | number) {
        const arrayVal = val.value as (string | number)[];
        val.value = [arrayVal[0], value];
      },
    });

    /**
     * 根据字段类型获取输入框类型
     * @returns HTML input type
     */
    const getInputType = (): string => {
      if (fieldType === FIELD_TYPE.INTEGER || fieldType === FIELD_TYPE.LONG) {
        return 'number';
      } else if (fieldType === FIELD_TYPE.DECIMAL || fieldType === FIELD_TYPE.DOUBLE) {
        return 'number';
      }
      return 'number';
    };

    /**
     * 根据字段类型获取输入模式
     * @returns HTML inputmode
     */
    const getInputMode = (): 'numeric' | 'decimal' => {
      if (fieldType === FIELD_TYPE.INTEGER || fieldType === FIELD_TYPE.LONG) {
        return 'numeric';
      } else if (fieldType === FIELD_TYPE.DECIMAL || fieldType === FIELD_TYPE.DOUBLE) {
        return 'decimal';
      }
      return 'numeric';
    };

    /**
     * 验证输入的字符是否合法
     * @param value - 输入的值
     * @returns 是否合法
     */
    const isValidInput = (value: string): boolean => {
      if (!value) return true;

      // 根据字段类型验证输入格式
      if (fieldType === FIELD_TYPE.INTEGER || fieldType === FIELD_TYPE.LONG) {
        // 整数类型：只允许数字和负号
        return /^-?\d*$/.test(value);
      } else if (fieldType === FIELD_TYPE.DECIMAL || fieldType === FIELD_TYPE.DOUBLE) {
        // 小数类型：允许数字、小数点和负号
        return /^-?\d*\.?\d*$/.test(value);
      }
      // 默认支持正负数以及小数
      return /^-?\d*\.?\d*$/.test(value);
    };

    /**
     * 验证并格式化输入值
     * @param value - 输入的值
     * @param shouldApplyConstraints - 是否应用最大最小值约束
     * @returns 格式化后的值
     */
    const validateAndFormatValue = (
      value: string,
      shouldApplyConstraints: boolean = false,
    ): string | number => {
      if (!value || value.trim() === '') {
        return '';
      }

      // 验证输入格式
      if (!isValidInput(value)) {
        return '';
      }

      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return '';
      }

      let finalValue = numValue;

      // 在失焦时才应用最大最小值约束
      if (shouldApplyConstraints) {
        if (maxValue !== null && maxValue !== undefined && finalValue > maxValue) {
          finalValue = maxValue;
        }
        if (minValue !== null && minValue !== undefined && finalValue < minValue) {
          finalValue = minValue;
        }
      }

      // 根据字段类型格式化
      if (fieldType === FIELD_TYPE.INTEGER || fieldType === FIELD_TYPE.LONG) {
        return Math.round(finalValue);
      } else if (fieldType === FIELD_TYPE.DECIMAL) {
        // 对于DECIMAL类型，根据字段配置保留小数位数
        if (fieldPrecision.value !== undefined) {
          const multiplier = Math.pow(10, fieldPrecision.value);
          return Math.round(finalValue * multiplier) / multiplier;
        } else {
          // 如果没有配置精度，则不限制小数位数
          return finalValue;
        }
      }

      return finalValue;
    };

    /**
     * 处理输入值变化
     * @param value - 新输入的值
     * @param pos - 输入位置
     */
    const handleInputChange = (value: string, pos: SelectPos): void => {
      // 输入时不应用约束，只做基本格式验证
      const formattedValue = validateAndFormatValue(value, false);
      if (pos === 'start') {
        startVal.value = formattedValue;
      } else if (pos === 'end') {
        endVal.value = formattedValue;
      } else {
        val.value = formattedValue;
      }
    };

    /**
     * 清空选中的值
     * @param e - 鼠标事件
     * @param pos - 选择位置
     */
    function clearValue(e: MouseEvent, pos: SelectPos): void {
      e.stopPropagation();
      if (readonly.value || disabled.value) return;

      if (pos === 'start') {
        startVal.value = '';
      } else if (pos === 'end') {
        endVal.value = '';
      } else {
        val.value = '';
      }
    }

    /**
     * 渲染清除图标
     * @param pos - 输入位置
     * @param displayVal - 显示值
     * @returns 清除图标节点
     */
    function renderClearIcon(pos: SelectPos, displayVal?: string | number) {
      if (readonly.value || disabled.value || (!displayVal && displayVal !== 0)) {
        return null;
      }

      return (
        <span class={[ns.em('numeric-input', 'clear-icon')]} onClick={(e) => clearValue(e, pos)}>
          <GctSvgIcon src="/assets/pad/public/delete_input.svg" />
        </span>
      );
    }

    /**
     * 绘制单一数值输入框
     * @param pos - 输入位置
     * @param displayVal - 显示值
     * @returns 数值输入框节点
     */
    function renderNumericItem(pos: SelectPos, displayVal?: string | number) {
      const inputValue = displayVal !== undefined && displayVal !== null ? String(displayVal) : '';

      return (
        <div
          class={['pad-search-editor', ns.e('numeric-input'), ns.is('disabled', disabled.value)]}
        >
          <input
            type={getInputType()}
            inputmode={getInputMode()}
            value={inputValue}
            placeholder={placeholder}
            readonly={readonly.value}
            disabled={disabled.value}
            min={minValue !== undefined && minValue !== null ? minValue : undefined}
            max={maxValue !== undefined && maxValue !== null ? maxValue : undefined}
            class={ns.em('numeric-input', 'field')}
            onInput={(e: Event) => {
              const target = e.target as HTMLInputElement;
              handleInputChange(target.value, pos);
            }}
            onBlur={(e: Event) => {
              const target = e.target as HTMLInputElement;
              // 在失焦时进行最终的格式化和约束应用
              const formattedValue = validateAndFormatValue(target.value, true);
              const displayValue = formattedValue !== '' ? String(formattedValue) : '';
              target.value = displayValue;

              // 更新状态
              if (pos === 'start') {
                startVal.value = formattedValue;
              } else if (pos === 'end') {
                endVal.value = formattedValue;
              } else {
                val.value = formattedValue;
              }
            }}
          />
          {renderClearIcon(pos, displayVal)}
        </div>
      );
    }

    return () => {
      return (
        <div class={[ns.b(), ns.is('readonly', readonly.value), ns.is('disabled', disabled.value)]}>
          <SearchRenderRangeField
            readonly={readonly.value}
            startValue={startVal.value}
            endValue={endVal.value}
            singleValue={val.value as string | number}
            isRange={isRang}
            emptyLabel={emptyDisplayValue.value}
          >
            {{
              start: () => renderNumericItem('start', startVal.value),
              end: () => renderNumericItem('end', endVal.value),
              single: () => renderNumericItem('single', val.value as string | number),
            }}
          </SearchRenderRangeField>
        </div>
      );
    };
  },
});

export default SearchRenderNumeric;
