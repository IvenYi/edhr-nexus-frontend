import FieldCascader from './components/Cascader/FieldCascader';
export { SCOPEINFO } from './utils/enum';
/**
 * 使用方法
 * @example
 * import { useFieldTransfer } from '/@/components/FieldTransfer';
 * const i18nInstance = useFieldTransfer();
 * i18nInstance.open({
 *   modelKey: '',
 *   modalTitle: '',
 *   isShowCascader: false,
 *   data: [],
 *   titles: ['aa', 'bb'],
 *   containFieldType: [FIELD_TYPE.DATE_TIME, FIELD_TYPE.TEXT],
 *   excludeFieldType: [FIELD_TYPE.DATE_TIME, FIELD_TYPE.TEXT],
 *   excludeFieldKey: ['f_xxx', 'f_aaa'],
 *   maxEnableCount: 5,
 *   saveCallback: (params) => {
 *      console.log('saveCallback', params);
 *   },
 *  });
 */
export { useFieldTransfer } from './useFieldTransfer';

export { FieldCascader };
