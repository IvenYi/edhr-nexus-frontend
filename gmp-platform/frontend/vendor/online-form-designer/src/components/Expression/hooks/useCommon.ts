import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
import { reactive } from 'vue';
import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { ExpressionTabEnum } from '../types/index';
import { formulaFilter } from '@gct/runtime';

/**公式条件 */
export function useRunFormula({ exprOptions, iframeRef }) {
  /**公式條件节点相关数据 */
  const formulaConditionsFormState = <{ modelKey?: string; modelData: any[] }>reactive({
    //模型key
    modelKey: undefined,
    /**模型列表 */
    modelData: [],
  });
  async function changeModel(modelKey) {
    await getFieldListByid(modelKey);
    const expressionIframeRef = iframeRef.value!.contentWindow!;
    if (expressionIframeRef!.GCT_EXPRESSION_WINDOW) {
      exprOptions.value.expr = '';
      expressionIframeRef!.GCT_EXPRESSION_WINDOW.openIframe(exprOptions.value);
    }
  }
  async function getFieldListByid(modelKey) {
    const data = await getModelMetaDetail({ modelKey });
    const children =
      data?.fieldMetaList?.filter(formulaFilter).map((i) => {
        const name = `${data.name}.${i.name}`;
        const id = i.key;
        return {
          name,
          id,
          valueType: i.type,
          alias: i.name,
        };
      }) || [];
    exprOptions.value.identifiers[ExpressionTabEnum.FIELD] = children;
  }
  async function initFields(modelKey) {
    const res = (await getCategoryListComplete({ module: ModelTypeEnum.ENTITY as string })) || [];
    formulaConditionsFormState.modelData =
      res
        .map((i) => {
          const options =
            i.children?.map((j) => {
              return { label: j.name, value: j.id };
            }) || [];
          return { label: i.name, options };
        })
        ?.filter((c) => c.options.length) ?? [];
    formulaConditionsFormState.modelKey =
      modelKey || formulaConditionsFormState.modelData[0].options[0].value;
    getFieldListByid(formulaConditionsFormState.modelKey);
  }

  return {
    formulaConditionsFormState,
    initFields,
    changeModel,
  };
}
