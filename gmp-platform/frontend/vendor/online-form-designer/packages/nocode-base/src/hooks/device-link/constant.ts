import { computed } from 'vue';
import { DeviceLink } from './types';

export const AITooltips = computed(() => {
  return {
    /** 降噪 */
    denoise: {
      title: $t('sys.onlineForm.AITooltips.denoise.title'),
      content: $t('sys.onlineForm.AITooltips.denoise.content'),
    },
    /** 对比度 */
    contrast: {
      title: $t('sys.onlineForm.AITooltips.contrast.title'),
      content: $t('sys.onlineForm.AITooltips.contrast.content'),
    },
    /** 二值化 */
    binarize: {
      title: $t('sys.onlineForm.AITooltips.binarize.title'),
      content: $t('sys.onlineForm.AITooltips.binarize.content'),
    },
    /** 识别参数提示词 */
    identifyParam: {
      content: $t('sys.onlineForm.AITooltips.identifyParam.content'),
    },
  };
});

/** 降噪方法选项集合 */
export const DenoiseMethodOptions = computed(() => {
  return Object.values(DeviceLink.DenoiseMethodEnum).map((item) => {
    return {
      label: $t(`sys.edhr.DenoiseMethodEnum.${item}`),
      value: item,
    };
  });
});

/** 二值化方法选项集合 */

export const BinarizeMethodOptions = computed(() => {
  return Object.values(DeviceLink.BinarizeMethodEnum).map((item) => {
    return {
      label: $t(`sys.edhr.BinarizeMethodEnum.${item}`),
      value: item,
    };
  });
});

/** 设备参数的类型对应的翻译 */
export const DeviceParamsTypeTitle = {
  String: 'sys.text',
  Integer: 'sys.component.dataConnection.modelField.integer',
  Long: 'sys.component.dataConnection.modelField.long',
  Float: 'sys.component.dataConnection.modelField.double',
  Boolean: 'sys.component.dataConnection.modelField.boolean',
  Date: 'sys.component.dataConnection.modelField.date',
  Array: 'sys.developer.devive.arrayMapping',
};
