import { SearchData, Option } from '../../../drawerSelector';
import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';
import { FieldConfigType, ReturnData } from './types';
import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
import { getLabelLabelCategoryTree } from '/@/apis/gct-apaas/LabelController';

/**RDO模型关联 */
export async function getLabelRefList(
  fieldConfig: FieldConfigType,
  queryData: SearchData,
  config: any,
): Promise<ReturnData> {
  const _API = getLabelLabelCategoryTree;
  const data =
    (await _API({
      moduleVal: 'label_module',
    })) || {};
  // 转换RDO数据结构
  const valueList: Option[] = [];

  data?.forEach((i: any) => {
    const baseOption: Option = {
      label: i.name,
      value: i.id,
      _protoValue: i,
      category: true,
      __LABEL__: i.name,
    };

    // 处理版本数据，添加到 children 中
    if (i.child?.length) {
      baseOption.children = i.child.map((j: any) => {
        const rdoLabel = j.name;
        // if (j.child?.length) {
        //   j.children = formatData(j.child, j.id);
        // }
        return {
          label: rdoLabel,
          value: j.id,
          _protoValue: j,
          __LABEL__: rdoLabel,
          children: j.child?.length ? formatData(j.child, j.id, rdoLabel) : null,
        };
      });
      // baseOption.children = baseOption.children?.forEach((j: any) => {
      //   if (j.child?.length) {
      //     j.children = formatData(j.child, j.id);
      //   }
      // });
    } else {
      baseOption.leaf = true; // 如果没有子版本，则标记为叶子节点
    }

    valueList.push(baseOption);
  });
  return { options: valueList.filter((i) => i.children && i.children.length) };
}
function formatData(data, parentId, rdoLabel) {
  const list: Array<any> = [];
  data?.forEach((i) => {
    const obj = {
      ...i,
      label: i.version || i.name,
      value: i.baseId ? i.baseId + ':' + i.id : i.id,
      parentId,
      __LABEL__: `${rdoLabel}:${i.version}`,
      _protoValue: i,
    };
    list.push({ ...obj });
  });
  return list;
}
/**根据ids查询RDO数据列表 */
export async function getLabelRefByIds(
  _fieldConfig: FieldConfigType,
  _ids: string[],
): Promise<Option[]> {
  const _API = getPrintPrintDropdownList;
  const data = (await _API()) || {};
  // 转换打印机数据结构
  const valueList: Option[] = [];
  data?.forEach((i) => {
    const dftInfo =
      (i.printChildNode && i.printChildNode.filter((e) => e.defaultPrint === '是')[0]) || undefined;
    const obj = {
      ...i,
      label: i.name,
      value: i.printKey,
      parentId: i.parentId || 'ROOT',
      dftPrintInfo:
        i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo
          ? { ...dftInfo, value: dftInfo.printKey, label: dftInfo.name }
          : undefined,
    };
    valueList.push({ ...obj });
    if (i.printChildNode) {
      valueList.push(
        ...i.printChildNode.map((e) => {
          const obj = {
            ...e,
            label: e.name,
            value: e.printKey,
            parentId: i.printKey,
          };
          return {
            ...obj,
          };
        }),
      );
    }
  });

  console.log(_ids, 'ids', valueList);
  // 按照 _ids 的顺序返回完全匹配的元素
  const result: Option[] = [];

  _ids.forEach((id) => {
    const found = valueList.find((item) => item.value === id);
    if (found) {
      result.push(found);
    }
  });
  return result;
}
