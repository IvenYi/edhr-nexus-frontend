import { defineComponent, computed, toRefs } from 'vue';
import { SearchComponents, useNamespace } from '@gct-paas/core';
import { SearchRenderRangeField } from '../search-render-range-field/search-render-range-field';
import { dataTimePickerInstance } from '@mobile/InstanceComponent/date-time-picker';
import { SearchDateTime } from '/@/projects/page-designer/src/types/pad';
import { GctSvgIcon } from '/@/projects/page-designer/src/components/common/svg-icon/svg-icon';
import './search-render-date.scss';
import dayjs from 'dayjs';
import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

// 选择框位置
type SelectPos = 'single' | 'start' | 'end';

/**
 * 搜索日期范围选择组件
 * 基于 dataTimePickerInstance 实现的移动端日期范围选择器
 * 支持开始时间和结束时间的独立选择
 */
export const SearchRenderDate = defineComponent({
  name: 'SearchRenderDate',
  props: {
    modelValue: {
      type: Object as PropType<string | string[]>,
    },
    widget: {
      type: Object as PropType<SearchDateTime>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const ns = useNamespace('search-render-date');
    const { displayValue: emptyDisplayValue } = useGlobalSetting();

    const { type } = props.widget;

    const { placeholder, dateType, isRang, isShowTime } = props.widget.props;

    const { readonly, disabled } = toRefs(props.widget.props);
    const __TITLE_LABEL_MAP = {
      [SearchComponents.SearchDateTime]: '日期时间',
      [SearchComponents.SearchTime]: '时间',
      [SearchComponents.SearchDate]: '日期',
      start: '开始',
      end: '结束',
      single: '',
    };

    // 是否日期选择
    // const isDate: boolean = type === SearchComponents.SearchDate;
    // 是否日期时间选择
    const isDateTime: boolean = type === SearchComponents.SearchDateTime;
    // 是否时间选择
    const isTime: boolean = type === SearchComponents.SearchTime;
    // 显示格式
    const format = computed(() => {
      if (isTime) {
        return 'HH:mm:ss';
      }
      return dateType;
    });

    /**动态title */
    function getTitleByPos(pos) {
      return `选择${__TITLE_LABEL_MAP[pos]}${__TITLE_LABEL_MAP[type]}`;
    }
    /**
     * 需要根据实际的字段类型，以及编辑器类型，编辑器配置进行实际的显示值格式化
     *
     * @author chitanda
     * @date 2025-10-21 11:10:02
     * @param {(string | string[])} value
     * @returns {*}  {(string | string[])}
     */
    function showFormatValue(value: string | string[]): string | string[] {
      if (isRang && Array.isArray(value)) {
        let val = value[0];
        let val2 = value[1];
        if (!isTime) {
          if (val) {
            val = dayjs(val).format(format.value);
          }
          if (val2) {
            val2 = dayjs(val2).format(format.value);
          }
        }
        return [val, val2];
      }
      return value;
    }

    /**
     * 需要根据实际的字段类型，以及编辑器类型，编辑器配置进行实际的返回值格式化
     *
     * @author chitanda
     * @date 2025-10-21 11:10:54
     * @param {(string | (string | null)[])} [value]
     * @returns {*}  {(string | (string | null)[] | undefined)}
     */
    function returnFormatValue(
      value?: string | (string | null)[],
    ): string | (string | null)[] | undefined {
      if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
        return undefined;
      }
      if (isRang && Array.isArray(value)) {
        let val = value[0] || null;
        let val2 = value[1] || null;
        if (isDateTime) {
          if (val) {
            val = dayjs(val).format('YYYY-MM-DD HH:mm:ss');
          }
          if (val2) {
            val2 = dayjs(val2).format('YYYY-MM-DD HH:mm:ss');
          }
        }
        if (val || val2) {
          value = [val, val2];
        } else {
          return undefined;
        }
      }
      if (!isRang && isDateTime) {
        if (value) {
          value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
        }
      }
      return value;
    }

    const val = computed<string | string[]>({
      get() {
        const val = showFormatValue(props.modelValue as string | string[]);
        if (val) {
          return val;
        }
        return isRang ? ['', ''] : '';
      },
      set(value?: string | string[]) {
        emit('update:modelValue', returnFormatValue(value));
      },
    });

    // 创建开始时间选择器实例
    const { openPicker } = dataTimePickerInstance({
      displayFormat: format.value,
      valueFormat: format.value,
    });

    // 开始时间显示值
    const startVal = computed({
      get() {
        return val.value[0];
      },
      set(value: string) {
        val.value = [value, val.value[1]];
      },
    });

    // 结束时间显示值
    const endVal = computed({
      set(value: string) {
        val.value = [val.value[0], value];
      },
      get() {
        return val.value[1];
      },
    });

    /**
     * 打开开始时间选择器
     */
    const handleTimeClick = async (e: MouseEvent, pos: SelectPos): Promise<void> => {
      if (readonly.value || disabled.value) return;

      let _val: string = '';
      let _min: any = undefined;
      let _max: any = undefined;
      if (pos === 'start') {
        _val = startVal.value;
        _min = undefined;
        _max = endVal.value ? (isTime ? endVal.value : new Date(endVal.value)) : undefined;
      } else if (pos === 'end') {
        _val = endVal.value;
        _min = startVal.value ? (isTime ? startVal.value : new Date(startVal.value)) : undefined;
        _max = undefined;
      } else {
        _val = val.value as string;
      }

      try {
        const result: string = await openPicker({
          value: _val,
          title: getTitleByPos(pos),
          minDate: _min,
          maxDate: _max,
        });
        if (pos === 'start') {
          startVal.value = result;
        } else if (pos === 'end') {
          endVal.value = result;
        } else {
          val.value = result;
        }
      } catch (error) {
        // 用户取消选择，不做处理
        console.debug('用户取消选择开始时间');
      }
    };

    /**
     * 清空选中的值
     *
     * @author chitanda
     * @date 2025-10-11 17:10:36
     * @param {MouseEvent} e
     * @param {SelectPos} pos
     * @returns {*}  {void}
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

    function renderTimeIcon(pos: SelectPos, displayVal?: string) {
      if (displayVal && !readonly.value && !disabled.value) {
        return (
          <span
            class={[ns.em('date-select', 'icon'), ns.em('date-select', 'clear-icon')]}
            onClick={(e) => clearValue(e, pos)}
          >
            <GctSvgIcon src="/assets/pad/public/delete_input.svg" />
          </span>
        );
      }
      // 默认日期
      let icon = 'icon-chaxun-riqi';
      if (isTime) {
        icon = 'icon-chaxun-shijian';
      } else if (isDateTime) {
        icon = 'icon-chaxun-riqishijian';
      }
      return (
        <span class={ns.em('date-select', 'icon')}>
          <i class={['gct-iconfont', icon]} />
        </span>
      );
    }

    /**
     * 绘制单一日期选择框
     *
     * @author chitanda
     * @date 2025-10-11 15:10:40
     * @param {SelectPos} pos
     * @param {string} [displayVal]
     * @returns {*}
     */
    function renderTimeItem(pos: SelectPos, displayVal?: string) {
      return (
        <div
          class={['pad-search-editor', ns.e('date-select'), ns.is('disabled', disabled.value)]}
          onClick={(e) => handleTimeClick(e, pos)}
        >
          <span
            class={[
              ns.em('date-select', 'label'),
              ns.is('placeholder', !displayVal && !!placeholder),
            ]}
          >
            {(isDateTime && displayVal ? dayjs(displayVal).format('YYYY-MM-DD HH:mm') : displayVal) || placeholder || ''}
          </span>
          {renderTimeIcon(pos, displayVal)}
        </div>
      );
    }

    return () => {
      return (
        <div class={ns.b()}>
          <SearchRenderRangeField
            readonly={readonly.value}
            disabled={disabled.value}
            startValue={startVal.value}
            endValue={endVal.value}
            singleValue={val.value as string}
            isRange={isRang}
            emptyLabel={emptyDisplayValue.value}
          >
            {{
              start: () => renderTimeItem('start', startVal.value),
              end: () => renderTimeItem('end', endVal.value),
              single: () => renderTimeItem('single', val.value as string),
            }}
          </SearchRenderRangeField>
        </div>
      );
    };
  },
});

export default SearchRenderDate;
