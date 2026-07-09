import {
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';

export function useAsyncOptions({ bindModelKey, modelCategory, code }) {
  async function getRefList(arg: IParams = {}) {
    const res: any =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        { bsKey: 'listByPage', modelKey: bindModelKey, modelCategory },
        {
          query: arg.queryData,
          pageSize: arg.pageSize,
          pageNo: 1,
          keyword: arg.keyword,
        },
      )) || {};

    const { data = [], totalPage } = res || {};

    return {
      options: data?.map((i: any) => {
        return { disabled: !!i.deleted_, label: i[code], value: i.id_ || i.id, _item: i };
      }),
      finished: totalPage && totalPage === 1,
    };
  }

  async function getOptionByIds(ids) {
    const { data = [] } =
      (await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'listByIds',
          modelKey: bindModelKey,
          modelCategory: modelCategory,
        },
        {
          ids: ids,
        },
      )) || ({} as any);
    //deleted_ 表示被软删除的数据
    return (
      data?.map((i) => {
        return { disabled: !!i.deleted_, label: i[code], value: i.id_ || i.id, _item: i };
      }) ?? []
    );
  }

  return { getRefList, getOptionByIds };
}
