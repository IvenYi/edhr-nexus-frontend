import { CreateType, FieldMetaDTO } from '@gct-paas/core';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { FIELD_TYPE } from '/@/enums/appEnum';

export const MODEL_SEPARATOR = '..';
export const FIELD_SEPARATOR = '.';

/**
 * 示例：`(主)模型KEY .. (主)模型字段.(二级)模型字段ID.(二级)关联模型KEY .. (二级)模型字段.(三级)模型字段ID.(三级)关联模型KEY`
 * 模型KEY：用于查询字段列表
 * 模型字段：用于报表数据查询的前缀拼接
 * 模型字段ID：用于保证 option 唯一性，构成 -> `字段KEY $ 所属模型KEY`
 */

// 获取主模型KEY
export const getRootModelKeyFromJointKey = (key: string) => {
  return key.split(MODEL_SEPARATOR)[0]!;
};

// 获取末端模型KEY
export const getLeafModelKeyFromJointKey = (key: string) => {
  return key.split(MODEL_SEPARATOR).at(-1)!.split(FIELD_SEPARATOR).at(-1)!;
};

// 获取关联字段拼接前缀
export const getForeignKeyChainFromJointKey = (key: string) => {
  return key
    .split(MODEL_SEPARATOR)
    .filter((s) => s.includes(FIELD_SEPARATOR))
    .map((s) => s.split(FIELD_SEPARATOR)[0])
    .join(FIELD_SEPARATOR);
};

export interface IModelTreeNode {
  label: string;
  value: string;
  children: IModelTreeNode[];
}

export const getRecursiveModelTreeData = async (modelKey: string, depth: number, cache?: any) => {
  const treeOptions: IModelTreeNode[] = [];
  const treeNameMap: Record<string, string> = {};
  const listCache: Record<string, FieldMetaDTO[]> = { ...(cache || {}) };

  let refModelList: FieldMetaDTO[] = [];

  if (depth === 0) return { treeOptions, treeNameMap };

  if (listCache[modelKey]) {
    refModelList = listCache[modelKey];
  } else {
    const res = await getModelMetaDetail({ modelKey });
    refModelList = (res?.fieldMetaList || []).filter(
      (f) =>
        [FIELD_TYPE.REF, FIELD_TYPE.RDO_REF].includes(f.type as FIELD_TYPE) &&
        [CreateType.USER_DEFINED, CreateType.BUILTIN].includes(f.createType as CreateType),
    );
    listCache[modelKey] = refModelList;
  }

  // console.log('refModelList', refModelList);
  for (const refModel of refModelList) {
    const { id, key: relatedFieldKey, name, bindInfo, relationModelName } = refModel as any;
    const label = `${name}（${relationModelName!}）`;
    const value = [relatedFieldKey, id, bindInfo].filter(Boolean).join(FIELD_SEPARATOR);

    const { treeOptions: children, treeNameMap: subMap } = await getRecursiveModelTreeData(
      bindInfo!,
      depth - 1,
      listCache,
    );

    treeOptions.push({
      label,
      value,
      children,
    });

    Object.assign(treeNameMap, subMap);

    treeNameMap[value] = label;
  }
  return { treeOptions, treeNameMap };
};

export const renderColTitle = (label, value) => {
  return {
    label: (
      <div class="model-ops">
        <span class="model-ops-name">{label}</span>
      </div>
    ),
    value: value,
    isLeaf: true,
    disabled: true,
  };
};

export const renderOptionLabel = (node: IModelTreeNode) => {
  const arrowVisible = !!node.children?.length;

  return (
    <>
      <div class="model-ops w-52 truncate" title={node.label}>
        <span class="model-ops-name">{node.label}</span>
      </div>
      {arrowVisible && <i class="iconfont icon-a-Rightarrow"></i>}
    </>
  );
};
