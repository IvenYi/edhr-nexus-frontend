import { ref, computed, toRefs, toRaw, nextTick, toRef, reactive, onMounted, watch } from 'vue';
import {
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveQueryRefChainDataByModelCategory,
  getModelComprehensiveEnumInfoByModelCategory,
  postModelComprehensiveQueryRefDataByIdsByModelCategory,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { QueryRefChainDataRequest } from '/@/apis/gct-apaas/model';
import { IRuleConfig } from '/@/components/relationship-diagram-config';

export function useLinkageFieldByRule(props, formData, { Event } = {}) {
  const hasError = ref<boolean>(false);

  const { field, modeldata, linkageField, ruleConfig, label, fieldName } = props.widget.props;
  const hasErrorTxt = ref($t('sys.pageDesigner.pleaseSelectFirstSth', { sth: label || fieldName }));
  //父表单获取模型大类型
  const modelCategory = modeldata?.modelCategory || 'entity';
  // 是否为数据连接模式
  const isLinkageMode = computed<boolean>(() => {
    const fieldKey = ruleConfig
      ? props.widget?.type.startsWith('Search')
        ? ruleConfig.fieldId
        : ruleConfig.fieldKey
      : '';
    if (ruleConfig && ruleConfig.strongDependence === false && !props.formData[fieldKey]) {
      return false;
    }
    if (linkageField && linkageField.length > 0) {
      return true;
    }
    if (ruleConfig) {
      return true;
    }
    return false;
  });

  /**根据链路搜索结果 */
  async function getLinkageFieldByRule(arg) {
    const { pageNo = 1 } = arg;
    const linkageData = calcLinkageData(field, formData, linkageField, ruleConfig);
    if (!linkageData.dataIds) {
      return { valueList: [] };
    }
    const resData =
      (await postModelComprehensiveQueryRefChainDataByModelCategory(
        { modelCategory },
        { ...linkageData, pageSize: 30, pageNo },
      )) || {};

    return resData;
  }

  /**验证关联数据 */
  async function checkedLinkRefData() {
    if (isLinkageMode.value) {
      let val = '';
      if (ruleConfig) {
        val = props.formData[ruleConfig.fieldKey];
        if (!val) {
          // hasErrorTxt.value = $t('sys.pageDesigner.pleaseSelectFirstSth', {
          //   sth: ruleConfig.fieldLabel,
          // });
          // hasError.value = true;
          Event && Event.context.$ref(ruleConfig.fieldId)?.setError();
          return Promise.reject();
        }
      } else {
        const first: any = linkageField?.[0];
        const val = props.formData[first.value];
        if (!val) {
          hasErrorTxt.value = $t('sys.pageDesigner.pleaseSelectFirstSth', {
            sth: linkageField?.[0].label,
          });
          hasError.value = true;
          return Promise.reject();
        }
      }
      hasError.value = false;
    }
  }
  const getLinkageFieldByRuleApi = computed(() => {
    return isLinkageMode.value ? getLinkageFieldByRule : undefined;
  });
  return {
    hasErrorTxt,
    checkedLinkRefData,
    hasError,
    isLinkageMode,
    getLinkageFieldByRuleApi,
  };
}
/**链路数据转化 */
function calcLinkageData(
  fieldKey: string,
  data: IData,
  linkageField: IData[],
  ruleConfig?: IRuleConfig,
): QueryRefChainDataRequest {
  if (!ruleConfig) {
    const first = linkageField[0];
    const last = linkageField[linkageField.length - 1];
    const val = data[first.value] || data[first.id];
    const refModelChain = linkageField.slice(1).map((item) => {
      const data: any = {
        fieldKey: item.value,
        modelKey: item.modelKey,
        modelCategory: item.modelCategory,
        direction: item.reverse === true ? 'backward' : 'forward',
      };
      return data;
    });
    if (first !== last) {
      refModelChain.push({
        fieldKey: 'id_',
        modelKey: last.refModelKey,
        modelCategory: last.refModelCategory,
        direction: last.reverse === true ? 'backward' : 'forward',
      });
    }
    return {
      dataIds: val,
      modelKey: first.modelKey,
      fieldKey,
      refModelChain,
    };
  }
  const first = ruleConfig.nodes[0];
  const last = ruleConfig.nodes[ruleConfig.nodes.length - 1];
  const val = data[ruleConfig.fieldId!] || data[ruleConfig.fieldKey!];
  if (first !== last && !last.fieldKey) {
    last.fieldKey = 'id_';
    last.modelCategory = 'entity';
  }
  return {
    dataIds: val,
    modelKey: ruleConfig.modelKey,
    fieldKey,
    refModelChain: ruleConfig.nodes,
  };
}
