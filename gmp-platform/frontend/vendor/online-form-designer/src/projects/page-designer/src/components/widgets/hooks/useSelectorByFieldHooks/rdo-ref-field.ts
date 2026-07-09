import { SearchData, Option } from '../../../drawerSelector';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getQueryDateByKeyWord } from '/@page-designer/components/widgets/hooks/listhook';
import { FieldConfigType, ReturnData } from './types';
import { merge } from 'lodash-es';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';

/**RDO模型关联 */
export async function getRdoList(
  fieldConfig: FieldConfigType,
  queryData: SearchData,
  config: any,
): Promise<ReturnData> {
  const { searchField } = config;
  const { modelKey, fieldKey, customApi } = fieldConfig;
  const { searchValue, pageNumber, pageSize, query = {} } = queryData;
  const _API = customApi?.value || postModelDataQueryRefData;
  const { data = [], totalCount } =
    (await _API(
      merge(
        {},
        {
          fieldKey: fieldKey,
          modelKey,
          keyword: searchValue,
          pageSize: pageSize || 30,
          pageNo: pageNumber || 1,
          ...query,
        },
        { query: getQueryDateByKeyWord({ searchField, keyword: searchValue }) },
      ),
    )) || {};
  const fieldInfo = await FieldSchema.getConfigByField(modelKey, fieldKey);
  const isDisplayRule =
    fieldInfo?.specificConfig?.displayRule && fieldInfo?.specificConfig?.displayRule?.exp;
  // 转换RDO数据结构
  const valueList: Option[] = [];

  data?.forEach((i: any) => {
    const rdoLabel = i.__LABEL__ || i.name_;
    const defaultRow = i?.__CHILDREN__.find((k) => k.default_);

    const baseOption: Option = {
      label: rdoLabel,
      value: i.id_,
      _protoValue: i,
      __LABEL__: (isDisplayRule && defaultRow?.__SHOW_LABEL__) || i.__SHOW_LABEL__ || rdoLabel,
    };

    // 处理版本数据，添加到 children 中
    if (i.__CHILDREN__?.length) {
      baseOption.children = i.__CHILDREN__.map((j: any) => {
        const versionName = j.__LABEL__ || j.version_;
        return {
          label: versionName,
          value: `${i.id_}:${j.id_}`,
          _protoValue: { ...j, parentName: rdoLabel },
          leaf: true, // 标记为叶子节点
          __LABEL__: j.__SHOW_LABEL__ || `${rdoLabel}:${versionName}`,
        };
      });
    } else {
      baseOption.leaf = true; // 如果没有子版本，则标记为叶子节点
    }

    valueList.push(baseOption);
  });
  return { options: valueList, total: totalCount };
}
/**RDO模型关联 */
export async function getRdoSearchList(
  fieldConfig: FieldConfigType,
  queryData: SearchData,
  config: any,
): Promise<ReturnData> {
  const { searchField } = config;
  const { modelKey, fieldKey, customApi } = fieldConfig;
  const { searchValue, pageNumber, pageSize, query = {} } = queryData;
  const _API = customApi?.value || postModelDataQueryRefData;

  const { data = [], totalCount } =
    (await _API(
      merge(
        {},
        {
          fieldKey: fieldKey,
          modelKey,
          keyword: searchValue,
          pageSize: pageSize || 30,
          pageNo: pageNumber || 1,
          ...query,
        },
        { query: getQueryDateByKeyWord({ searchField, keyword: searchValue }) },
      ),
    )) || {};
  const fieldInfo = await FieldSchema.getConfigByField(modelKey, fieldKey);
  const isDisplayRule =
    fieldInfo?.specificConfig?.displayRule && fieldInfo?.specificConfig?.displayRule?.exp;
  // 转换RDO数据结构
  const valueList: Option[] = [];

  data?.forEach((i: any) => {
    const rdoLabel = i.__LABEL__ || i.name_;
    const defaultVersion = i.__CHILDREN__?.filter((p) => p.default_)[0];
    const baseOption: Option = {
      label: rdoLabel,
      value: i.id + ':' + defaultVersion.id_,
      _protoValue: i,
      __LABEL__: (isDisplayRule && defaultVersion?.__SHOW_LABEL__) || i.__SHOW_LABEL__ || rdoLabel,
    };

    // 处理版本数据，添加到 children 中
    if (i.__CHILDREN__?.length) {
      baseOption.children = i.__CHILDREN__.map((j: any) => {
        const versionName = j.__LABEL__ || j.version_;
        return {
          label: versionName,
          value: j.id_,
          _protoValue: { ...j, parentName: rdoLabel },
          leaf: true, // 标记为叶子节点
          __LABEL__: j.__SHOW_LABEL__ || `${rdoLabel}:${versionName}`,
        };
      });
    } else {
      baseOption.leaf = true; // 如果没有子版本，则标记为叶子节点
    }

    valueList.push(baseOption);
  });
  return { options: valueList, total: totalCount };
}

/**根据ids查询RDO数据列表 */
export async function getRdoListByIds(
  _fieldConfig: FieldConfigType,
  _ids: string[],
): Promise<Option[]> {
  const { modelKey, fieldKey, refModelKey, modelCategory } = _fieldConfig;

  const fieldInfo = await FieldSchema.getConfigByField(modelKey, fieldKey);
  const isDisplayRule =
    fieldInfo?.specificConfig?.displayRule && fieldInfo?.specificConfig?.displayRule?.exp;
  const res =
    (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'rdoListVersionByRefIdsWithParent',
        modelKey: refModelKey,
        originalFieldKey: fieldKey,
        originalModelKey: modelKey,
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      { foreignFields: [] },
      {
        refIds: _ids.join(','),
        includeDeleted: 1,
        originalFieldKey: fieldKey,
        originalModelKey: modelKey,
      },
    )) || {};
  const optionsMap = res.data.reduce((current, total) => {
    const version_id = total.__CHILDREN__[0].id_;
    current[`${total.id_}:${version_id}`] = total;
    current[`${total.id_}`] = total;
    return current;
  }, {});
  const checkedData = _ids.map((id_) => {
    const [_fId, _cId] = id_?.split(':');
    const data = optionsMap[_cId ? id_ : _fId];
    const defaultRow = data?.__CHILDREN__.find((k) => k.default_);

    const rdoLabel = data?.__LABEL__ || data.name_;
    const children = data?.__CHILDREN__.map((j: any) => {
      const versionName = j.__LABEL__ || j.version_;
      return {
        label: versionName,
        value: `${data.id_}:${j.id_}`,
        _protoValue: { ...j, parentName: rdoLabel },
        leaf: true, // 标记为叶子节点
        __LABEL__: j.__SHOW_LABEL__ || `${rdoLabel}:${versionName}`,
      };
    });
    if (!_cId) {
      return {
        label: rdoLabel,
        value: _fId,
        children,
        _protoValue: { ...data },
        __LABEL__: (isDisplayRule && defaultRow?.__SHOW_LABEL__) || data.__SHOW_LABEL__ || rdoLabel,
      };
    } else {
      return children[0];
    }
  });
  return checkedData;
}
