import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

/**
 * 搜索类型
 * @alias USER_GROUP  用户组
 * @alias MEMBER      成员
 * @alias ROLE        角色
 * @alias MODEL       模型
 */
export enum SearchTypeEnum {
  /** 用户组 */
  USER_GROUP = 'USER_GROUP',
  /** 成员 */
  MEMBER = 'MEMBER',
  /** 角色 */
  ROLE = 'ROLE',
  /** 模型 */
  MODEL = 'MODEL',
}

export enum ModalTypeEnum {
  /** 新建 */
  Create = 'create',
  /** 编辑 */
  Edit = 'edit',
  /** 删除 */
  Delete = 'delete',
}

/** 用户组关联关系 */
export enum RelationTypeEnum {
  /** 部门 */
  ORG = 'ORG',
  /** 人员 */
  USER = 'USER',
  /** 角色 */
  ROLE = 'ROLE',
  /** 实体数据模型  */
  ENTITY_MODEL_DATA = 'ENTITY_MODEL_DATA',
  /** 内置条件模型 */
  BUILT_CONDITION_MODEL = 'BUILT_CONDITION_MODEL',
  /** 权限作用域 */
  PERMISSION_SCOPE = 'PERMISSION_SCOPE',
}

export const DataTypeOptions = [
  { label: t('sys.appDesigner.physicalBusinessModel'), value: RelationTypeEnum.ENTITY_MODEL_DATA },
  { label: t('sys.appDesigner.builtinConditionalModel'), value: RelationTypeEnum.BUILT_CONDITION_MODEL },
  { label: t('sys.appDesigner.permissionScope'), value: RelationTypeEnum.PERMISSION_SCOPE },  
]

/**
 * 数据权限设置模态框tab枚举
 * @alias TAB_DATA_RULES 数据规则
 * @alias TAB_FIELD_ROLE 字段权限
 * @alias TAB_BUILT_PREM 内置权限
 * @alias TAB_PERM_SCOPE 权限作用域
 */
export enum DataRoleSetTabsEnum {
  /** 数据规则 */
  TAB_DATA_RULES = 'tab_data_rules',
  /** 字段权限 */
  TAB_FIELD_ROLE = 'tab_field_role',
  /** 内置权限 */
  TAB_BUILT_PREM = 'tab_built_prem',
  /**  */
  TAB_PERM_SCOPE = 'tab_perm_scope',  
}

export enum OperatorTypeEnum {
  /** 与 */
  AND = 'AND',
  /** 或 */
  OR = 'OR',
}

export const Ch_Operator = {
  [OperatorTypeEnum.AND]: t('sys.webRender.and'),
  [OperatorTypeEnum.OR]: t('sys.webRender.or'),
};

export const Ch_Perm_Operator = {
  [OperatorTypeEnum.AND]: t('sys.webRender.allCondition'),
  [OperatorTypeEnum.OR]: t('sys.webRender.anyCondition'),
};

/** 获取tree层级 */
export const calcTreeChildLevel = (nodeData) => {
  if (!nodeData || (Array.isArray(nodeData) && nodeData.length === 0)) {
    return 0;
  }
  const res = new Array(nodeData.length).fill(0);
  nodeData.forEach((v, i) => {
    res[i]++;
    if (Array.isArray(v.children)) {
      res[i] += v.children.length ? calcTreeChildLevel(v.children) : 1;
    }
  });
  return Math.max(...res);
};

/** 递归查找是否存在树结构中的值 */
export const findTreePathById = (leafId: string, nodes: any[]) => {
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < nodes.length; i++) {
    if (leafId === nodes[i].id) {
      return nodes[i];
    }
    if (nodes[i].children) {
      const findResult = findTreePathById(leafId, nodes[i].children);
      if (findResult) {
        return findResult;
      }
    }
  }
};

export const dropNode = (info, treeList) => {
  const {
    dragNode, // 拖拽对象
    node, // 拖拽到的位置对象
  } = info;

  const dragNodeProps = dragNode.dataRef;
  const nodeProps = node.dataRef;

  const dropPos = info.node.pos.split('-');
  const dropLength = Number(dropPos[dropPos.length - 1]); // 终点位置的length
  const dropPosition = info.dropPosition - dropLength; // 用来判断拖拽到元素的上中下
  const nodeLevel = nodeProps.fullPath.split('/').length - 1; // 拖拽到的节点的层级

  const dragMenuNode = findTreePathById(dragNodeProps.id, treeList); // 拖拽节点元数据
  // 最大只能5层
  const nodeMenuChildNum = calcTreeChildLevel(dragMenuNode.children);

  const maxLevel = 5;

  const params = {
    id: dragNodeProps.id, // 源节点id
  };

  // 拖拽到目录里
  if (dropPosition === 0) {
    console.log('拖拽到目录里');

    if (nodeLevel + nodeMenuChildNum > maxLevel - 1) {
      return {
        type: 'error',
        msg: t('sys.webRender.dragError'),
      };
    }

    Object.assign(params, {
      targetParentId: nodeProps.id,
      targetSortNum: 0,
    });
  }
  // 拖拽到目录平级
  else if (dropPosition !== 0) {
    console.log('拖拽到目录平级');

    if (nodeLevel + nodeMenuChildNum > maxLevel) {
      return {
        type: 'error',
        msg: t('sys.webRender.dragError'),
      };
    }

    Object.assign(params, {
      targetParentId: nodeProps.parentId,
      targetSortNum: nodeProps.sortNum + 1,
    });
  }

  return params;
};
