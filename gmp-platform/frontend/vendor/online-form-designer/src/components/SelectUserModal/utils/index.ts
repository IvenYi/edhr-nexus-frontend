import { cloneDeep } from 'lodash-es';
import { FIELD_TYPE } from '/@/enums/appEnum';

/** 动态类型 */
export enum DYN_FORMAT_TYPE_ENUM {
  /** 申请人直属上级 */
  DYN_SUBMITTER_MANAGER = 'DYN_SUBMITTER_MANAGER',
  /** 申请人部门负责人 */
  DYN_SUBMITTER_DEPT_PRINCIPAL = 'DYN_SUBMITTER_DEPT_PRINCIPAL',
  /** 指定人员字段 */
  DYN_MODEL_USERS = 'DYN_MODEL_USERS',
  /** 指定人员字段直属上级 */
  DYN_MODEL_USER_MANAGER = 'DYN_MODEL_USER_MANAGER',
  /** 指定部门负责人 */
  DYN_DEPT_PRINCIPAL = 'DYN_DEPT_PRINCIPAL',
  /** 指定部门字段 */
  DYN_MODEL_ORG = 'DYN_MODEL_ORG',
  /** 指定部门字段负责人 */
  DYN_MODEL_DEPT_PRINCIPAL = 'DYN_MODEL_DEPT_PRINCIPAL',
}

export const DynFormatTypes = Object.values(DYN_FORMAT_TYPE_ENUM);

export const filterDynFormatTypes = Object.values(DYN_FORMAT_TYPE_ENUM)
  .filter(
    (item) =>
      ![
        DYN_FORMAT_TYPE_ENUM.DYN_SUBMITTER_MANAGER,
        DYN_FORMAT_TYPE_ENUM.DYN_SUBMITTER_DEPT_PRINCIPAL,
      ].includes(item),
  )
  .map((type) => `${type}:current`);

// i18n sys.bpmn.dynamicUser.xxx
export const dynamicData = [
  {
    id: 'currentDs',
    formatId: DYN_FORMAT_TYPE_ENUM.DYN_SUBMITTER_MANAGER,
    name: '申请人直属上级',
    desc: '可将申请人直属上级设为节点处理人',
  },
  {
    id: 'currentDeptDs',
    formatId: DYN_FORMAT_TYPE_ENUM.DYN_SUBMITTER_DEPT_PRINCIPAL,
    name: '申请人部门负责人',
    desc: '可将申请人所在部门负责人设为节点处理人',
  },
  {
    id: 'userField',
    formatId: DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USERS,
    name: '指定人员字段',
    desc: '字段所选用户作为节点处理人',
    showPanel: true,
    panelType: 'area',
    panelKey: [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI],
  },
  {
    id: 'userFieldDs',
    formatId: DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USER_MANAGER,
    name: '指定人员字段直属上级',
    desc: '字段所选用户的直属上级为节点处理人',
    showPanel: true,
    panelType: 'area',
    panelKey: [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI],
  },
  {
    id: 'orgDs',
    formatId: DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL,
    name: '指定部门负责人',
    desc: '所选部门负责人作为节点处理人',
    showPanel: true,
    panelType: 'select',
  },
  // {
  //   id: 'orgField',
  //   formatId: DYN_FORMAT_TYPE_ENUM.DYN_MODEL_ORG,
  //   name: '指定部门字段',
  //   desc: '字段所选部门的所有成员作为节点处理人',
  //   showPanel: true,
  //   panelType: 'area',
  //   panelKey: FIELD_TYPE.ORG,
  // },
  {
    id: 'orgFieldDs',
    formatId: DYN_FORMAT_TYPE_ENUM.DYN_MODEL_DEPT_PRINCIPAL,
    name: '指定部门字段负责人',
    desc: '字段所选部门负责人作为节点处理人',
    showPanel: true,
    panelType: 'area',
    panelKey: [FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI],
  },
];

export function list2Tree(list) {
  const treeOptions: Array<any> = [];
  const arrClone: any = cloneDeep(list);
  const mapInfo = arrClone.reduce((obj: any, item: any) => {
    item.children = [];
    obj[item.id] = item;
    return obj;
  }, {});
  // 转树
  arrClone.forEach((i: any) => {
    const parent = mapInfo[i.parentId];
    // 如果父节点存在，push到父级的children数组中
    // 如果父级不存在，直接push到treeData数组
    parent ? parent.children.push(i) : treeOptions.push(i);
  });
  return treeOptions;
}

// 内容高亮处理，名称被searchkey 匹配不到时，返回 null
export function highlightName(str, searchValue = '') {
  const displayName = str;
  const rDisplayName = displayName?.replace(
    new RegExp(searchValue?.replace(new RegExp(/(?=[$.?+\[\]\*^|\\(){}/])/g), '\\'), 'g'),
    (s) => `<span class="is-highlight">${s}</span>`,
  );
  if (rDisplayName === displayName) return null;

  return rDisplayName;
}

// 过滤树
export const filterTree = (tree, searchValue) => {
  return tree
    .map((node) => {
      if (node.children) {
        const filteredChildren = filterTree(node.children, searchValue);
        if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
      }

      const hlName = highlightName(node.name, searchValue);

      if (hlName) {
        return { ...node, highlightName: hlName };
      }
      return null;
    })
    .filter((node) => node !== null);
};

export const findUniqueNode = (tree, tid) => {
  for (const node of tree) {
    if (node.id === tid) {
      return node;
    }

    // 如果当前节点有子节点，则递归查找
    if (node.children) {
      const foundNode = findUniqueNode(node.children, tid);
      if (foundNode) {
        return foundNode;
      }
    }
  }
  return null;
};


export function showDynamicTitle(id, name) {
  if (id.includes(DYN_FORMAT_TYPE_ENUM.DYN_MODEL_USER_MANAGER)) {
    return `${name}:直属上级`
  }
  if (id.includes(DYN_FORMAT_TYPE_ENUM.DYN_DEPT_PRINCIPAL)) {
    return `${name}:负责人`
  }
  if (id.includes(DYN_FORMAT_TYPE_ENUM.DYN_MODEL_DEPT_PRINCIPAL)) {
    return `${name}:负责人`
  }
  return name
}