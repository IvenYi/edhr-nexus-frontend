import { DisplayType } from '/@page-designer/enum';
import { useExpression } from '@/components/Expression/hooks/useExpressionCalc';
import { ref, reactive, watch, computed, toRef, Ref } from 'vue';
import { getPremission, formMap } from './runGlobalByPage';
import { watchDebounced } from '@vueuse/core';
// import { isEqual } from 'lodash-es';
// import memoizeOne from 'memoize-one';

interface DisplayRule {
  hidden?: boolean;
  displayType?: DisplayType;
  displayRule?: string;
  tableForm?: object;
}
const Expression = useExpression();

export const identify = Expression.identify;
export const calculate = Expression.calculate;

/**单组件显隐控制 */
export function useVisibileByRuleHook(props: DisplayRule, id: string) {
  /**按钮权限 */
  if (!getPremission(id)) {
    return false;
  } else if (props.displayType === DisplayType.CONFIG) {
    // 显隐控制配置
    return toRef(() => !props.hidden);
  } else {
    return useDisplayRule(props);
  }
}

function useDisplayRule(rule: DisplayRule) {
  //异步显隐布尔值缓存
  const formCache = ref(false);
  getOptionsByDisplayRule(rule, (f) => {
    formCache.value = f;
  });
  return formCache;
}

/**组件显示规则 */
function getOptionsByDisplayRule(
  { displayRule, tableForm }: DisplayRule,
  callback: (value: boolean) => void,
) {
  if (!displayRule) {
    /**没有配置规则 */
    callback(true);
  } else {
    const identifyArgs = identify(displayRule);
    //表达式临时数据缓存
    const formCacheMap = identifyArgs.reduce((total, i) => {
      const arg = i.split('.');
      total[i] = { formKey: arg[0], itemKey: arg[1] };
      return total;
    }, {});

    /**收集依赖 函数显隐控制 关联组件字段收集 */
    const cacheFormFileds = toRef(() => {
      return identifyArgs.reduce((total, i) => {
        const arg = i.split('.');
        const formKey = arg[0],
          filedKey = arg[1];
        const value = tableForm?.[formKey]?.[filedKey] ?? formMap.value[formKey]?.[filedKey];
        if (total[formKey]) {
          total[formKey][filedKey] = value;
        } else {
          total[formKey] = { [filedKey]: value };
        }
        return total;
      }, {});
    });

    /**
     * 监听收集的依赖
     */
    watchDebounced(
      cacheFormFileds,
      () => {
        playValueByRule(cacheFormFileds.value, formCacheMap, displayRule, (flag) => {
          callback(flag);
        });
      },
      { immediate: true, debounce: 300 },
    );
  }
}
/**分析表达式调用api获取布尔值 */
function playValueByRule(form, formCacheMap, displayRule, callback) {
  const cache = {};
  Object.keys(formCacheMap).forEach((k) => {
    const { formKey, itemKey } = formCacheMap[k];
    const value = form?.[formKey]?.[itemKey];
    cache[k] = value;
  });
  calculate(displayRule, cache).then(callback);
}
/**
 * 需要做控制的数组组件
 * @param optopns 被控制的数组
 * @param tableForm 需要添加的额外的form {key:object }
 * @returns
 */
export function useDisplayRuleOptions(optopns, tableForm?: object) {
  const OptionsFlag = reactive({});
  return toRef(() => {
    if (!optopns) return [];
    const data = optopns.filter((i) => {
      const { displayRule, hidden, displayType } = i.props || i;
      /**按钮权限 */
      if (!getPremission(i.id)) {
        OptionsFlag[i.id] = false;
      } else if (displayType === DisplayType.CONFIG) {
        OptionsFlag[i.id] = !hidden;
      } else {
        getOptionsByDisplayRule({ displayRule, tableForm }, (f) => {
          OptionsFlag[i.id] = f;
        });
      }
      return OptionsFlag[i.id];
    });
    return data;
  });
}
// /**
//  * 需要做控制的table 样式
//  * @param optopns 被控制的columns
//  * @param tableForm 需要添加的额外的form {key:object }
//  * @returns
//  */
export function useDisplayRuleColumnByStyles(optopnslist, tableForm?: object) {
  if (!optopnslist?.length) return;
  const ColumnEmptyRule: DisplayRule[] = [];
  const ColumnRule: DisplayRule[] = [];
  optopnslist.forEach((i, index) => {
    if (i.displayRule) {
      ColumnRule.push({ ...i, id: index });
    } else {
      ColumnEmptyRule.push({ ...i, id: index });
    }
  });
  const tagWidgetStyle = useDisplayRuleOptionsBytable(ColumnRule, tableForm);
  const tagDefaultStyle = useDisplayRuleOptionsBytable(ColumnEmptyRule, tableForm);
  return toRef(() => tagWidgetStyle?.value || tagDefaultStyle?.value);
}

/**
 * 需要做控制的逻辑数组
 * @param optopns 被控制的数组
 * @param tableForm 需要添加的额外的form {key:object }
 * @returns
 */
function useDisplayRuleOptionsBytable(optopns, tableForm?: object) {
  const OptionsFlag = reactive({});
  if (!optopns) return;
  return toRef(() =>
    optopns.find((i) => {
      const { displayRule, hidden, displayType } = i.props || i;
      if (displayType === DisplayType.CONFIG) {
        OptionsFlag[i.id] = !hidden;
      } else {
        getOptionsByDisplayRule({ displayRule, tableForm }, (f) => {
          OptionsFlag[i.id] = f;
        });
      }

      return OptionsFlag[i.id];
    }),
  );
}
