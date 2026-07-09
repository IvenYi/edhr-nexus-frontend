import { Option } from '../../../drawerSelector';
import { list_to_tree } from '@mobile/utils/treeHelper';
import { getDesignerCommonGetCanBeUsedOrg } from '/@/apis/gct-apaas/DesignerCommonController';
import { ReturnData } from './types';

async function getDeptList(API): Promise<IObject[]> {
  const data = (await API()) || [];
  data?.forEach((i) => {
    const isRoot = !data.find((o) => o.id === i.parentId);
    isRoot && (i.parentId = 'ROOT');
  });
  const labelList =
    data?.map((i) => {
      return { label: i.name!, value: i.id!, _item: i };
    }) || [];

  return labelList;
}

/**
 * 获取部门列表
 */
export async function getOrgList(): Promise<ReturnData> {
  const data = (await getDeptList(getDesignerCommonGetCanBeUsedOrg)) || [];
  const options = list_to_tree(data.map((_) => _._item), (i) => {
    return { label: i.name, value: i.id, _protoValue: i, children: i.children };
  });
  return { options, total: options.length };
}

/**根据ids 查询部门列表 */
export async function getOrgListByIds(_, ids: string[] = []): Promise<Option[]> {
  const data = await getDesignerCommonGetCanBeUsedOrg();
  return data
    .filter((i) => ids.includes(i.id))
    .map((i) => {
      return { label: i.name!, value: i.id!, _protoValue: i };
    });
}
