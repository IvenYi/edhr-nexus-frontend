import { drawerSelectorInstance, openPopupType } from '../../../drawerSelector';
import { FIELD_MAP } from './fieldMap';
import { FieldConfigType } from './types';
import { cacheAdapter } from '/@page-designer/components/widgets/hooks/cacheAdapter';

export { useLinkageFieldByRule } from './useLinkageFieldByRule';
export const useSelectByField = (
  fieldConfig: FieldConfigType,
  drawerConfig: Partial<openPopupType>,
) => {
  const { openPicker } = drawerSelectorInstance(drawerConfig);
  const parameter = getParameterByField(fieldConfig);
  async function openSelect(openConfig?: Partial<openPopupType>) {
    const res = await openPicker({ ...parameter, ...(openConfig || {}) });
    return res;
  }
  return { openSelect, ...parameter };
};

/**根据字段类型获取抽屉对应的入参 获取一些通用函数*/
export function getParameterByField(fieldConfig: FieldConfigType): openPopupType {
  const { fieldType, customMenuFilter, displayFields, isSearch } = fieldConfig;
  console.log('fieldType', fieldType, FIELD_MAP);
  const options = FIELD_MAP[fieldType];
  if (!options) return;
  const {
    getSource,
    multiple,
    paged,
    searchable,
    title,
    getOptionsByIds,
    listType,
    getSearchSource,
  } = options;

  return {
    ...options,
    getOptions:
      isSearch && getSearchSource
        ? getSearchSource.bind(null, fieldConfig)
        : getSource.bind(null, fieldConfig),
    getOptionsUseCache: cacheAdapter.bind(null, fieldConfig, getSource, false),
    multiple,
    paged,
    searchable,
    title,
    getOptionsByIds: getOptionsByIds?.bind(null, fieldConfig),
    listType,
    customMenuFilter,
    displayFields,
  };
}
