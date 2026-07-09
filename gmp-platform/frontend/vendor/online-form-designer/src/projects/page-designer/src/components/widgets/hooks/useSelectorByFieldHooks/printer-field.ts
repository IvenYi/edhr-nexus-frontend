import { SearchData, Option } from '../../../drawerSelector';
import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';

import { FieldConfigType, ReturnData } from './types';
import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';

/**RDO模型关联 */
export async function getPrinterList(
  fieldConfig: FieldConfigType,
  queryData: SearchData,
  config: any,
): Promise<ReturnData> {
  // const { searchField } = config;
  // const { customApi } = fieldConfig;
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
      isInterParent:
        (i.parentId === 'ROOT' || !i.parentId) && i.type === PrintResourceEnum.INTERNET_PRINT,
      dftPrintInfo:
        i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo
          ? { ...dftInfo, value: dftInfo.printKey, label: dftInfo.name }
          : undefined,
    };

    if (i.printChildNode) {
      obj.children = i.printChildNode.map((e) => {
        const obj = {
          ...e,
          label: e.name,
          value: e.printKey,
          parentId: i.printKey,
          leaf: true, // 标记为叶子节点
        };
        return {
          ...obj,
        };
      });
    }
    valueList.push(obj);
  });
  return { options: valueList };
}

/**根据ids查询RDO数据列表 */
export async function getPrinterByIds(
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
