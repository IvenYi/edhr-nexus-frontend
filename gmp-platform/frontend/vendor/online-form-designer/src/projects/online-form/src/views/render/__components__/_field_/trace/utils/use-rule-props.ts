import { reactive, computed, watch, onMounted, ref } from 'vue';
import {
  getParseRuleInfo,
  getParseRuleValue,
  renderUtils,
  type ITrace,
  IRuleParseData,
} from '@gct/nocode-base';
import { FIELD_TYPE } from '@gct/runtime';
import { message } from 'ant-design-vue';

export function useRuleProps({
  props,
  selectByCode,
}: {
  props: { widget: ITrace; formData: Object };
  /** 根据编码查询对象，并设置选中，有匹配的项则返回true */
  selectByCode: (code: string) => Promise<boolean>;
}) {
  const parseProps = computed(() => {
    return props?.widget?.props?.parseRuleProps;
  });

  /** 是否允许切换 */
  const allowSwitch = computed(() => {
    return !!parseProps.value?.parsingRuleId;
  });

  /** 当前模式（扫码或者下拉） */
  const mode = ref<'scan' | 'dropdown'>(allowSwitch.value ? 'scan' : 'dropdown');

  const ruleInfo = ref<any>();

  onMounted(async () => {
    if (parseProps.value?.parsingRuleId) {
      ruleInfo.value = await getParseRuleInfo({ id: parseProps.value.parsingRuleId });
    }
  });

  /**
   * 根据映射填充扫描数据
   * @param data
   */
  function fillScanData(data: IRuleParseData) {
    if (parseProps.value?.fillMapArr?.length) {
      parseProps.value.fillMapArr.forEach((i) => {
        const fromKey = i.barcodeField;
        if (fromKey && fromKey in data) {
          const val = data[fromKey];
          i.formFields?.forEach((key) => {
            const toKey = key.split('.')[1];
            props.formData[toKey] = val;
          });
        }
      });
    }
  }

  /** 执行扫描 */
  const doScan = async (str: string) => {
    const data = getParseRuleValue(str, ruleInfo.value.rules_);
    console.log('parseScanStr', data);
    const type = props.widget.props.fieldType;
    let code: string | undefined;
    switch (type) {
      case FIELD_TYPE.DEVICE:
        code = data.deviceCode;
        break;
      case FIELD_TYPE.PRODUCT:
        code = data.materialCode;
    }
    if (!code) {
      message.error($t('sys.onlineForm.noCorrespondingCodeInScannedData'));
      return;
    }
    const isFill = await selectByCode(code);
    if (isFill) {
      fillScanData(data);
    }
  };

  const handleEnter = (val) => {
    console.log('handleEnter:', val);
    if (val) {
      doScan(val);
    }
  };

  return {
    mode,
    allowSwitch,
    handleEnter,
  };
}
