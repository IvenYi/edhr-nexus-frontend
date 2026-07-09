import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import './search-render-range-field.scss';

/**
 * 范围选择布局容器组件的属性接口
 */
export interface SearchRenderRangeFieldProps {
  /** 非范围时的值 */
  singleValue?: string | number;
  /** 起始值 */
  startValue?: string | number;
  /** 结束值 */
  endValue?: string | number;
  /** 是否只读模式 */
  readonly?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为范围选择 */
  isRange?: boolean;
  // 默认空值
  emptyLabel?: string;
}

/**
 * 范围选择布局容器组件
 * 用于做范围选择呈现的布局容器，支持只读和编辑模式
 * 在编辑模式下提供开始和结束两个插槽位置
 * 在只读模式下直接显示起始和结束值
 *
 * @example
 * // 编辑模式
 * <SearchRenderRangeField>
 *   <template #start>
 *     <input placeholder="开始时间" />
 *   </template>
 *   <template #end>
 *     <input placeholder="结束时间" />
 *   </template>
 * </SearchRenderRangeField>
 *
 * // 只读模式
 * <SearchRenderRangeField
 *   readonly
 *   startValue="2023-01-01"
 *   endValue="2023-12-31"
 * />
 */
export const SearchRenderRangeField = defineComponent({
  name: 'SearchRenderRangeField',
  props: {
    singleValue: {
      type: [String, Number] as PropType<string | number>,
    },
    startValue: {
      type: [String, Number] as PropType<string | number>,
    },
    endValue: {
      type: [String, Number] as PropType<string | number>,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isRange: {
      type: Boolean,
      default: true,
    },
    emptyLabel: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const ns = useNamespace('search-render-range-field');

    /**
     * 格式化显示值
     * @param value - 要格式化的值
     * @returns 格式化后的字符串
     */
    const formatValue = (value: string | number | undefined): string => {
      if (!value && value !== 0) {
        return props.emptyLabel;
      }
      return String(value);
    };

    function renderReadonlyValue(val: string | number | undefined) {
      return <span class={ns.e('readonly-value')}>{formatValue(val)}</span>;
    }

    return () => {
      const { readonly, singleValue, startValue, endValue, isRange } = props;

      if (readonly && !startValue && !endValue) {
        return <span class={ns.e('readonly-value')}>{props.emptyLabel}</span>;
      }

      return (
        <div class={[ns.b(), ns.is('readonly', readonly), ns.is('single', !isRange)]}>
          {!isRange ? (
            readonly ? (
              renderReadonlyValue(singleValue)
            ) : (
              slots.single?.()
            )
          ) : (
            <>
              <div class={ns.e('start')}>
                {readonly ? renderReadonlyValue(startValue) : slots.start?.()}
              </div>
              <div class={ns.e('separator')}>
                <span class={ns.e('separator-text')}>-</span>
              </div>
              <div class={ns.e('end')}>
                {readonly ? renderReadonlyValue(endValue) : slots.end?.()}
              </div>
            </>
          )}
        </div>
      );
    };
  },
});
