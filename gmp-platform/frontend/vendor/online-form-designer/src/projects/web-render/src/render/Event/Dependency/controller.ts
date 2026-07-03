import { useExpression } from '@/components/Expression/hooks/useExpressionCalc';
import { computed } from 'vue';
import { formMap, pageGlobaVariables, globalVarCaches } from '../utils/runGlobalByPage';
import { watchDebounced } from '@vueuse/core';

const Expression = useExpression();
const identify = Expression.identify;
const calculate = Expression.calculate;

/**组件依赖触发器 */
export function insetDep({ expression = '', rowData = null ,immediate=true}: any, callback) {
  if (!expression || expression === 'true') {
    callback(true);
    return;
  }
  const identifyArgs = identify(expression);
  //表达式临时数据缓存
  const formCacheMap = identifyArgs.reduce((total, i) => {
    const arg = i.split('.');
    total[i] = { formKey: arg[0], itemKey: arg[1] };
    return total;
  }, {});
  /**收集依赖 函数显隐控制 关联组件字段收集 */
  const cacheFormFileds = computed(() => {
    return identifyArgs.reduce((total, i) => {
      const arg = i.split('.');
      const formKey = arg[0];
      const filedKey = arg[1];
      if (filedKey) {
        const value = (rowData ? rowData[filedKey] : formMap.value[formKey]?.[filedKey]) ?? '';
        if (total[formKey]) {
          total[formKey][filedKey] = value;
        } else {
          total[formKey] = { [filedKey]: value };
        }
      } else if (formKey.startsWith('$VAR_') || formKey.startsWith('$IVAR_')) {
        //filedKey 不存在走的全局常量逻辑
        total[formKey] = globalVarCaches.value[formKey]?.value ?? '';
      } else if (formKey.startsWith('$PAGERVAR_') || formKey.startsWith('$IPAGERVAR_')) {
        //filedKey 不存在走的就是页面常量的逻辑
        total[formKey] = pageGlobaVariables.value[formKey]?.value ?? '';
      }
      return total;
    }, {});
  });

  function playValueByRule(form) {
    const cache = {};
    Object.keys(formCacheMap).forEach((k) => {
      const { formKey, itemKey } = formCacheMap[k];
      const value = itemKey ? form[formKey]?.[itemKey] : form[formKey];
      cache[k] = value;
    });
    calculate(expression, cache).then(callback);
  }

  /**当处于行内场景的时候需要立即执行 快速响应 */
  rowData && playValueByRule(cacheFormFileds.value);
  /**
   * 监听收集的依赖
   */
  watchDebounced(
    cacheFormFileds,
    () => {
      playValueByRule(cacheFormFileds.value);
    },
    {
      debounce: 200,
      immediate: !rowData,
    },
  );
}

/**
 * 直接计算表达式结果，不进行依赖监控
 * 用于一次性计算场景，快速获取表达式判断结果
 */
export async function calculateDepResult({ expression = '', rowData = null }: any): Promise<any> {
  if (!expression || expression === 'true') {
    return true;
  }
  const identifyArgs = identify(expression);
  //表达式临时数据缓存
  const formCacheMap = identifyArgs.reduce((total, i) => {
    const arg = i.split('.');
    total[i] = { formKey: arg[0], itemKey: arg[1] };
    return total;
  }, {});

  const cache: Record<string, any> = {};
  Object.keys(formCacheMap).forEach((k) => {
    const { formKey, itemKey } = formCacheMap[k];
    let value: any = '';
    if (formKey.startsWith('$VAR_')) {
      value = globalVarCaches.value[formKey]?.value ?? '';
    } else if (formKey.startsWith('$PAGERVAR_')) {
      value = pageGlobaVariables.value[formKey]?.value ?? '';
    } else if (itemKey) {
      value = (rowData ? rowData[itemKey] : formMap.value[formKey]?.[itemKey]) ?? '';
    } else {
      value = (rowData ? rowData[formKey] : formMap.value[formKey]) ?? '';
    }
    cache[k] = value;
  });

  return calculate(expression, cache);
}
