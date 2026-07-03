import { computed, defineComponent, ref, nextTick, watch, toRefs } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import { useNamespace } from '@gct-paas/core';
import { FIELD_TYPE, measureTexts, SEARCH_SEVICE } from '@gct/runtime';
import { intersection, isEmpty, isNil } from 'lodash-es';
import { GctSvgIcon } from '/@/projects/page-designer/src/components/common/svg-icon/svg-icon';
import {
  getParameterByField,
  useSelectByField,
  useLinkageFieldByRule,
} from '/@page-designer/components/widgets/hooks/useSelectorByFieldHooks';
import { FieldConfigType } from '/@/projects/page-designer/src/components/widgets/hooks/useSelectorByFieldHooks/types';
import {
  useQueryfilter,
  // getQueryDateByKeyWord,
  getIKeywordFieldKeys,
  getIExp,
} from '/@/projects/page-designer/src/components/widgets/hooks/listhook';
import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';
import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import './search-render-select.scss';
import { showNotify, Tag } from 'vant';
import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
import { useI18n } from '@mobile/utils/useI18n';

export const SearchRenderSelect = defineComponent({
  name: 'SearchRenderSelect',
  props: {
    modelValue: {
      type: Object as PropType<string | string[]>,
    },
    widget: {
      type: Object as PropType<IObject>,
      required: true,
    },
    formData: {
      type: Object as PropType<IObject>,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const ns = useNamespace('search-render-select');
    const { displayValue: emptyDisplayValue } = useGlobalSetting();

    // 双向绑定
    const val = computed({
      get: () => props.modelValue,
      set: (v) => {
        if (Array.isArray(v)) {
          v = v.filter((item) => item !== undefined && item !== null && item !== '');
          if (v.length === 0) {
            v = undefined;
          }
        } else {
          if (v === undefined || v === null || v === '') {
            v = undefined;
          }
        }
        emit('update:modelValue', v);
      },
    });
    // 可选项
    const opts = ref<IObject[]>([]);

    const { disabled, readonly } = toRefs(props);
    const {
      ope,
      fieldType,
      field,
      label,
      fieldName,
      modelKey,
      bindModelKey,
      searchField,
      // exp,
      showSearch,
      modeldata,
      datafilter,
      placeholder,
      customdataSource,
      datasourceConfig,
      linkageField,
      ruleConfig,
      customMenu,
      customMenuFilter,
      displayFields,
      rdoVersion,
      ignoreOptions,
    } = props.widget.props;
    const { useMore } = toRefs(props.widget.props);
    //父表单获取模型大类型
    const modelCategory = modeldata?.modelCategory || 'entity';
    const queryfilter = useQueryfilter(datafilter);
    const Event = getPageEvent();
    // 数据连接模式检测
    const { isLinkageMode, getLinkageFieldByRuleApi } = useLinkageFieldByRule(
      props,
      props.formData,
    );
    // 读取字段配置的字符显示个数(codeVisibleNum)
    const { getmaxTagLength, attrObj } = useAsyncFileAttrs();
    const keywordFieldKeys = getIKeywordFieldKeys(searchField, ignoreOptions);
    const exp = getIExp(props.widget.props?.exp, ignoreOptions);
    const maxDisplayChars = computed(() => {
      const n = attrObj.value?.maxTagTextLength;
      return typeof n === 'number' && n > 0 ? n : 12; // 默认回落到旧值 12
    });

    const ignoreCase = computed(() => {
      return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
    });

    const truncateText = (text?: string) => {
      if (!text) return '';
      const limit = maxDisplayChars.value;
      return text.length > limit ? text.slice(0, limit) + '...' : text;
    };

    // 多选算子
    const multipleOperator = [
      SEARCH_SEVICE.IN,
      SEARCH_SEVICE.NOTIN,
      SEARCH_SEVICE.CONTAINANY,
      SEARCH_SEVICE.CONTAINALL,
      SEARCH_SEVICE.VERSIONIN,
      SEARCH_SEVICE.VERSIONNOTIN,
    ];

    // 是否为多选模式
    const isMultiple = computed(() => {
      // 计算多选算子交集
      const items = intersection(ope, multipleOperator) as string[];
      // 给入算子全是多选算子，返回 true
      if (items.length > 0 && items.length === ope.length) {
        return true;
      }
      return false;
    });

    // 组件显示值
    const displayVal = computed(() => {
      if (isNil(val.value) || isEmpty(val.value)) {
        if (isMultiple.value) {
          return [];
        }
        return '';
      }
      if (isMultiple.value) {
        return opts.value
          .filter((item) => {
            return (val.value as string[]).includes(item.value);
          })
          .map((item) => item.__LABEL__ || item.label);
      }
      const item = opts.value.find((item) => item.value === val.value);
      return item?.__LABEL__ || item?.label || (val.value as string[])[0] || '';
    });

    function onClear(e: MouseEvent): void {
      e.stopPropagation();
      if (readonly.value || disabled.value) {
        return;
      }
      val.value = '';
    }

    /**
     * 构建自定义 API 函数
     * 当配置了自定义数据源时，使用导出函数调用自定义数据源
     *
     * @author chitanda
     * @date 2025-10-20 10:00:00
     * @returns {*} 自定义 API 函数或 undefined
     */
    const customApi = computed(() => {
      if (customdataSource && datasourceConfig?.name && Event) {
        return (queryData) =>
          Event.runExportByName(
            datasourceConfig?.name,
            queryData,
            props.formData,
            datasourceConfig?.extraParams,
          );
      }
      return '';
    });

    const fieldConfig: FieldConfigType = {
      modelKey,
      fieldKey: field,
      modelCategory,
      fieldType,
      isSearch: true,
      refModelKey: bindModelKey,
      customApi: customApi.value || getLinkageFieldByRuleApi,
      customMenuFilter: customMenu && customMenuFilter.length ? customMenuFilter : undefined,
    };

    const paged = computed(() => {
      switch (fieldType) {
        case FIELD_TYPE.ENUM:
        case FIELD_TYPE.ENUM_MULTI:
        // 事务字段，打印机，标签模板为前端筛选
        case FIELD_TYPE.TRANSACTION:
        case FIELD_TYPE.PRINTER:
        case FIELD_TYPE.LABEL_TEMPLATE_REF:
          return false;
        case FIELD_TYPE.USER:
        case FIELD_TYPE.USER_MULTI:
        case FIELD_TYPE.ORG:
        case FIELD_TYPE.ORG_MULTI:
        case FIELD_TYPE.REF:
        case FIELD_TYPE.REF_MULTI:
        default:
          return true;
      }
    });

    /**
     * refModelKey fieldKey=ref_master_id_时，refModelKey值必传
     */
    const { openSelect } = useSelectByField(fieldConfig, {
      title: label || fieldName,
      paged: paged.value,
      multiple: isMultiple.value,
      queryData: {
        query: queryfilter.query,
        exp: queryfilter.getExp(exp),
      },
      searchable: showSearch,
      config: { searchField: keywordFieldKeys },
      displayFields,
      ignoreCase: ignoreCase.value,
    } as IObject);

    const { getOptions, getOptionsByIds } = getParameterByField(fieldConfig);

    /**
     * 监控关联字段值变化
     * 当父字段值改变时，清空当前字段的值
     *
     * @author chitanda
     * @date 2025-10-20 10:00:00
     */
    if (isLinkageMode.value || (ruleConfig && ruleConfig.strongDependence === false)) {
      const linkageKey = ruleConfig ? ruleConfig.fieldId : linkageField?.[0].value;
      let prevVal = props.formData[linkageKey];

      watch(
        () => props.formData,
        () => {
          const currentVal = props.formData[linkageKey];
          if (prevVal !== currentVal) {
            prevVal = currentVal;
            val.value = '';
            opts.value = [];
          }
        },
        { deep: true },
      );
    }

    /**
     * 打开选择器界面
     *
     * @author chitanda
     * @date 2025-10-14 14:10:10
     * @returns {*}  {Promise<void>}
     */
    async function onSelect(): Promise<void> {
      if (readonly.value || disabled.value) {
        return;
      }

      // 数据连接模式验证
      if (isLinkageMode.value) {
        let linkageValue = '';
        let linkageLabel = '';

        if (ruleConfig) {
          linkageValue = props.formData[ruleConfig.fieldId];
          linkageLabel = ruleConfig.fieldLabel;
        } else if (linkageField && linkageField.length > 0) {
          const first = linkageField[0];
          linkageValue = props.formData[first.value];
          linkageLabel = first.label;
        }

        if (!linkageValue) {
          showNotify({ type: 'danger', message: `请先选择：${linkageLabel}` });
          return;
        }
      }

      const { options, values } = await openSelect({
        value: val.value,
        multiple: isMultiple.value,
        refVersion: rdoVersion,
      });
      val.value = values;
      opts.value = isMultiple.value ? (options as IObject[]) : [options as IObject];
    }

    async function onInit(): Promise<void> {
      // 获取字段层面的字符显示个数配置
      try {
        await getmaxTagLength({ modelKey, fieldKey: field });
      } catch (e) {
        // 忽略配置读取失败，使用默认值
      }
      if (val.value) {
        if (getOptionsByIds) {
          const options = await getOptionsByIds?.(
            Array.isArray(val.value) ? val.value : [val.value],
          );
          opts.value = options || [];
        } else if (getOptions) {
          const { options } = await getOptions({} as any);
          opts.value = options;
        }
      }
    }

    onInit();

    // 多选容器 ref
    const multiSelectRef = ref<HTMLDivElement>();
    // 容器宽度
    const containerWidth = ref(0);

    /**
     * 更新容器宽度
     */
    const updateContainerWidth = () => {
      if (multiSelectRef.value) {
        containerWidth.value = multiSelectRef.value.offsetWidth;
      }
    };

    /**
     * 使用 VueUse 的 useResizeObserver 监听容器尺寸变化
     */
    useResizeObserver(multiSelectRef, () => {
      updateContainerWidth();
    });

    /**
     * 监听显示值变化，并在下次 DOM 更新后获取容器宽度
     */
    watch(
      displayVal,
      async () => {
        await nextTick();
        updateContainerWidth();
      },
      { immediate: true },
    );

    /**
     * 计算在一行内可显示的项目和超出数量
     * 通过容器宽度和项目宽度动态计算
     *
     * @author chitanda
     * @date 2025-10-20 10:00:00
     * @returns {*} { visibleItems: string[], overflowCount: number }
     */
    const visibleItemsData = computed(() => {
      if (!isMultiple.value || isEmpty(displayVal.value)) {
        return { visibleItems: [], overflowCount: 0 };
      }

      const items = displayVal.value as string[];

      // 使用 measureTexts 计算单个项的实际宽度
      const estimateItemWidth = (text: string): number => {
        const results = measureTexts([text], {
          fontSize: 14,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        });
        const width = results[0]?.width || 0;
        return width + 14; // 文本宽度 + 14px(padding/margin)
      };

      // 使用容器实际宽度
      const actualContainerWidth = containerWidth.value || 300;
      const countBadgeWidth = 35; // "+N" 徽章宽度估算

      let totalWidth = 0;
      let visibleCount = 0;

      for (let i = 0; i < items.length; i++) {
        const itemWidth = estimateItemWidth(truncateText(items[i]));
        const projectedWidth = totalWidth + itemWidth;

        // 如果添加当前项会超出，且还有后续项，则为计数项预留空间
        if (projectedWidth + (i < items.length - 1 ? countBadgeWidth : 0) > actualContainerWidth) {
          break;
        }

        totalWidth = projectedWidth;
        visibleCount++;
      }

      // 至少显示一项
      if (visibleCount === 0) {
        visibleCount = 1;
      }

      return {
        visibleItems: items.slice(0, visibleCount),
        overflowCount: Math.max(0, items.length - visibleCount),
      };
    });

    /**
     * 单选模式绘制
     *
     * @author chitanda
     * @date 2025-10-13 17:10:01
     * @returns {*}
     */
    function renderSingleSelect() {
      return (
        <div class={ns.e('single-select')}>
          <div class={ns.e('single-label')}>{displayVal.value}</div>
          {(fieldType === FIELD_TYPE.RDO_REF && !opts.value[0].value.includes(':')) ||
          ((fieldType === FIELD_TYPE.LABEL_TEMPLATE_REF || fieldType === FIELD_TYPE.PRINTER) &&
            opts.value[0]?.children?.length) ? (
            <Tag color="#E0E3EB" plain class="ml6px">
              <span class="text-[#5A5F6B] p2px text-12px"> 默认 </span>
            </Tag>
          ) : null}
        </div>
      );
    }

    /**
     * 多选项绘制
     *
     * @author chitanda
     * @date 2025-10-13 17:10:57
     * @param {string} item
     * @param {boolean} isSingleVisible 是否是唯一可见项（后面还有超出项）
     * @returns {*}
     */
    function renderMultiSelectItem(item: string, isSingleVisible = false, index) {
      return (
        <span class={[ns.e('multi-select-item'), ns.is('single-visible', isSingleVisible)]}>
          {truncateText(item)}
          {(fieldType === FIELD_TYPE.RDO_REF && !opts.value[index].value.includes(':')) ||
          ((fieldType === FIELD_TYPE.LABEL_TEMPLATE_REF || fieldType === FIELD_TYPE.PRINTER) &&
            opts.value[index]?.children?.length) ? (
            <Tag color="#E0E3EB" plain class="ml6px">
              <span class="text-[#5A5F6B] p2px text-12px"> 默认 </span>
            </Tag>
          ) : null}
        </span>
      );
    }

    /**
     * 多选模式绘制 - 仅显示一行，超出部分用计数徽章表示
     *
     * @author chitanda
     * @date 2025-10-13 17:10:14
     * @returns {*}
     */
    function renderMultiSelect() {
      const { visibleItems, overflowCount } = visibleItemsData.value;
      const isSingleVisible = visibleItems.length === 1 && overflowCount > 0;
      return (
        <div class={ns.e('multi-select')} ref={multiSelectRef}>
          {visibleItems.map((str, index) => renderMultiSelectItem(str, isSingleVisible, index))}
          {overflowCount > 0 && <span class={ns.e('multi-select-badge')}>+{overflowCount}...</span>}
        </div>
      );
    }

    function renderPlaceholder() {
      if (useMore?.value) {
        return <span class={ns.e('placeholder')}>{t(`sys.model.${useMore.value}`)}</span>;
      }
      return <span class={ns.e('placeholder')}>{placeholder || '请选择'}</span>;
    }

    function renderReadonlySelect() {
      if (!displayVal.value) {
        return <div class={[ns.e('readonly-value')]}>{emptyDisplayValue.value}</div>;
      }
      if (isMultiple.value) {
        return (
          <div class={[ns.e('readonly-value'), ns.is('multiple', isMultiple.value)]}>
            {(displayVal.value as string[]).map((s) => s).join(', ') || emptyDisplayValue.value}
          </div>
        );
      }
      return (
        <div class={[ns.e('readonly-value'), ns.is('single', !isMultiple.value)]}>
          {(displayVal.value as string) || emptyDisplayValue.value}
        </div>
      );
    }

    return () => {
      const isClear = !!val.value && val.value.length > 0;

      // 只读模式下的渲染
      if (readonly.value) {
        return (
          <div class={[ns.b(), ns.m('readonly')]}>
            <div class={ns.e('content')}>{renderReadonlySelect()}</div>
          </div>
        );
      }

      // 正常交互模式
      return (
        <div
          class={[
            'pad-search-editor',
            ns.b(),
            ns.is('select', isClear),
            ns.is('disabled', disabled.value),
            { [ns.m('multiple')]: isMultiple.value },
          ]}
          onClick={onSelect}
        >
          <div class={ns.e('content')}>
            {val.value && val.value.length > 0
              ? isMultiple.value
                ? renderMultiSelect()
                : renderSingleSelect()
              : renderPlaceholder()}
          </div>
          <span class={[ns.e('icon'), ns.is('clear', isClear)]}>
            {isClear && !disabled.value ? (
              <GctSvgIcon src="/assets/pad/public/delete_input.svg" onClick={onClear} />
            ) : (
              <i class="gct-iconfont icon-zujianziduan-xiajiantou" />
            )}
          </span>
        </div>
      );
    };
  },
});

export default SearchRenderSelect;
