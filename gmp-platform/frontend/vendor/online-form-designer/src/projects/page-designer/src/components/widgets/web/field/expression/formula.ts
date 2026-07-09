/**初始化公式监听 */
import { useExpression } from '@/components/Expression/hooks/useExpressionCalc';
import { computed, reactive, ref, nextTick } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { message } from 'ant-design-vue';
import { EntityFormulaReturnTypeEnum } from '/@/components/Expression/types';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import BigNumber from 'bignumber.js';
import { postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { cacheAdapter } from '/@page-designer/components/widgets/hooks/cacheAdapter';
const Expression = useExpression();
const identify = Expression.identify;
const calculate = Expression.calculate;

export const useFormulaByExpress = async (
  { isLinkageMode, ruleConfig, modelKey, field, formulaLabel },
  props,
) => {
  const formState = reactive({
    mappingType: EntityFormulaReturnTypeEnum.Text,
    truelabel: '',
    falselabel: '',
    digits: 0,
  });
  const expression = ref();
  const identifyArgs = computed(() => (expression.value ? identify(expression.value) : []));
  const cacheFormFileds = computed(() => {
    return identifyArgs.value.reduce((pre, curr) => {
      pre[curr] = props.formData[curr] ?? '';
      return pre;
    }, {});
  });
  const refFieldValue = computed(() => props.formData[ruleConfig.nodes[0]?.fieldKey]);
  nextTick().then(async () => {
    const fieldValue = props.formData[field];
    if (isLinkageMode && fieldValue !== undefined && fieldValue !== null && refFieldValue.value) {
      getFormula(refFieldValue.value);
    }
  });
  watchDebounced(cacheFormFileds, () => {
    if (!expression.value) {
      props.formData[field] = null;
      formulaLabel.value = null;
      return;
    }
    calculate(expression.value, cacheFormFileds.value).then((res) => {
      setExpressValue(res);
    });
  });
  /**設置值 */
  function setExpressValue(res) {
    const value = getValueByType(res);
    props.formData[field] = value;
    if (formState.mappingType === EntityFormulaReturnTypeEnum.Boolen) {
      formulaLabel.value = value ? formState.truelabel : formState.falselabel;
    } else {
      formulaLabel.value = value;
    }
  }

  if (isLinkageMode) {
    watchDebounced(
      refFieldValue,
      () => {
        getFormula(refFieldValue.value).catch((err) => {
          expression.value = '';
          err && message.error(err);
        });
      },
      { debounce: 200 },
    );
  } else {
    expression.value = ruleConfig.exp;
  }

  /**远程获取数据 */
  async function getFormula(refFieldValue) {
    if (!refFieldValue) return Promise.reject();
    if (refFieldValue?.split(',').length > 1) {
      return Promise.reject(
        $t('sys.expression.expMultErrTips', {
          sth: props.widget.alias || props.widget.props.label,
        }),
      );
    }
    const res = await cacheAdapter(refFieldValue, getExpressByHttp);
    const expJson = JSON.parse(res || '');
    if (expJson.modelKey && expJson.modelKey !== modelKey) {
      return Promise.reject(
        $t('sys.expression.exprTips', { sth: props.widget.alias || props.widget.props.label }),
      );
    }
    formState.truelabel = expJson?.specificConfig?.true;
    formState.falselabel = expJson?.specificConfig?.false;
    formState.mappingType = expJson.mappingType;
    formState.digits = expJson?.specificConfig?.digits;
    expression.value = expJson?.specificConfig?.formulaConfig?.exp;
  }
  function getExpressByHttp(refFieldValue) {
    return postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory(
      { modelCategory: EntityModelCategoryEnum.ENTITY },
      {
        fieldKey: ruleConfig.fieldKey,
        modelKey,
        queryParams: { [ruleConfig.nodes[0]?.fieldKey]: refFieldValue },
        refModelChain: ruleConfig.nodes,
      },
    );
  }
  function getValueByType(value) {
    if (isLinkageMode) {
      if (formState.mappingType === EntityFormulaReturnTypeEnum.Double) {
        return new BigNumber(value || 0).toFixed(formState.digits, 1);
      }
    }
    return value;
  }
};
