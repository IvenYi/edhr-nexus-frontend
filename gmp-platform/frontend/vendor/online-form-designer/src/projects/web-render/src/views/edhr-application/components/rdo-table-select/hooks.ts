import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

import { transformUtils } from '@gct/nocode-base';
import { h } from 'vue';

export function useAsyncOptions({ bindModelKey, modelCategory, hideSingleVersion }) {
  const { businessSetting } = useBusinessSetting();

  const searchField = (businessSetting.productSearchFields || 'name_,code_')?.split(',') || [];

  const getQueryDateByKeyWord = (keyword): object => {
    return (
      searchField?.reduce((total, filedKey: string) => {
        const expkey = filedKey.split('.').length > 1 ? filedKey : filedKey + '.like';
        total[expkey] = keyword;
        return total;
      }, {}) || {}
    );
  };

  const getExp = () => {
    return `OR(${searchField.map((key) => `${key}.like`).join(',')})`;
  };

  const makeFullPath =
    (label, addDefaultTag = false) =>
    () =>
      h('div', [
        h('span', label),
        ...(addDefaultTag ? [h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default'))] : []),
      ]);

  async function getRdoAsyncOptions(arg: IParams = {}) {
    const queryData = arg.keyword ? getQueryDateByKeyWord(arg.keyword) : {};
    const queryExp = getExp();

    const res: any =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        { bsKey: 'rdoListByPage', modelKey: bindModelKey, modelCategory },
        {
          exp: queryExp,
          query: {
            ...queryData,
            operating_state_: true,
          },
          pageSize: arg.pageSize,
          pageNo: arg.pageNo,
        },
      )) || {};

    const { data = [], totalPage, dict, totalCount } = res || {};

    return {
      options: transformUtils.transformSourceData2SubTable(data || [], dict),
      finished: totalPage && totalPage === 1,
      totalCount,
    };
  }

  async function getChildrenByIds(id_: string) {
    if (!id_) return [];

    const [fId] = id_.split(':');

    const res: any =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'rdoListVersionByRefIdsWithParent',
          modelKey: bindModelKey,
          modelCategory,
        },
        { foreignFields: [] },
        {
          refIds: id_,
          includeDeleted: 1,
        },
      )) || {};

    const data = res?.data?.[0] || {};
    const rdoLabel = data?.__LABEL__ || data?.name_ || '';

    const childRes: any =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'rdoListVersionById',
          modelKey: bindModelKey,
          modelCategory,
        },
        { foreignFields: [] },
        { id: fId },
      )) || {};

    const childList = Array.isArray(childRes?.data) ? childRes.data : [];
    const hasOneChild = childList.length === 1;
    const shouldHideName = hideSingleVersion && hasOneChild;

    const children = childList.map((child: any) => {
      const label = shouldHideName
        ? rdoLabel
        : `${rdoLabel}:${child?.__LABEL__ || child?.version_}`;
      const value = `${fId}:${child?.id_}`;
      return {
        label,
        value,
        full_path: makeFullPath(label),
        __raw__: child,
      };
    });

    return [
      {
        label: rdoLabel,
        value: fId,
        full_path: makeFullPath(rdoLabel, true),
      },
    ].concat(children);
  }

  return {
    getChildrenByIds,
    getRdoAsyncOptions,
    makeFullPath,
  };
}
