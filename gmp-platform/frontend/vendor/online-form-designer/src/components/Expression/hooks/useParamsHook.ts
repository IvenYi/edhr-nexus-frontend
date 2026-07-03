import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { ExpressionTabEnum } from '../types/index';

export function useParamsHook({ exprOptions }) {
  async function initParamsList({ modelKey }) {
    const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'listAll',
        modelKey,
        modelCategory: 'entity',
      },
      {},
      {
        sorts: [
          {
            sortField: 'create_time_',
            sortType: 'desc',
          },
        ],
      },
    );

    const data = (res?.data || []).map((item) => ({
      value: item.id_,
      label: item.name_,
      _item: item,
      id: item.id_,
      name: item.name_,
      type: item.type_,
    }));
    exprOptions.value.identifiers[ExpressionTabEnum.PARAMS] = data;
  }
  return {
    initParamsList,
  };
}
