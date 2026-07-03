import { SelectTreeNode, TreeSelectController } from '../../../_common_/tree-select';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { ref, watchEffect } from 'vue';
import { EntityModelCategoryEnum } from '@gct/runtime';

export class TraceRdoSelectController extends TreeSelectController {
  constructor(
    private fieldParams: {
      field: string;
      modelKey: string;
      refModelKey: string;
      queryName: string;
    },
  ) {
    super();
  }

  transferToTreeNodes(arr: any[]): SelectTreeNode[] {
    return arr.map((i) => {
      const isParent = !i.base_id_;
      const item: SelectTreeNode = {
        name: i.__LABEL__ || i.name_,
        id: isParent ? i.id_ : `${i.base_id_}:${i.id_}`,
        disabled: isParent,
        _item: i,
      };
      if (i.__CHILDREN__?.length) {
        item.children = this.transferToTreeNodes(i.__CHILDREN__);
      }
      return item;
    });
  }

  override async fetch(opts: {
    query?: string;
    pageSize: number;
    pageNo: number;
  }): Promise<{ totalPage: number; nodes: SelectTreeNode[] }> {
    console.log('请求数据', opts);
    const { query, pageNo, pageSize } = opts;
    const { field, modelKey, refModelKey, queryName } = this.fieldParams;

    const res = await postModelDataQueryRefData({
      fieldKey: field,
      modelKey,
      pageSize: pageSize,
      pageNo: pageNo,
      refModelKey,
      query: { [queryName]: query },
      exp: `OR(${queryName})`,
    });
    if (!res) {
      throw new Error('请求失败');
    }
    console.log('res dddd', res);
    const nodes = this.transferToTreeNodes(res.data ?? []);
    return {
      totalPage: res.totalPage!,
      nodes: nodes,
    };
  }

  override async getNodesByIds(ids: string[]): Promise<SelectTreeNode[]> {
    const { refModelKey } = this.fieldParams;
    let arr = await Promise.all(
      ids.map(async (id_) => {
        const [_fId, _cId] = id_.split(':');
        const { data } =
          (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
            {
              bsKey: 'rdoGetVersionByRefId',
              modelKey: refModelKey,
              modelCategory: EntityModelCategoryEnum.ENTITY,
            },
            { foreignFields: [] },
            {
              refId: id_,
              includeDeleted: 1,
            },
          )) || {};
        return data;
      }),
    );
    arr = arr.filter(Boolean);

    return this.transferToTreeNodes(arr);
  }
}
