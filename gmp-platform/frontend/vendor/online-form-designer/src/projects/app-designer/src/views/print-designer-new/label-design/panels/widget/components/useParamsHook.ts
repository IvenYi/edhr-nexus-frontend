import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

export async function getParamsList() {
  const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    {
      bsKey: 'listAll',
      modelKey: 'em_label_param',
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
  return data;
}
