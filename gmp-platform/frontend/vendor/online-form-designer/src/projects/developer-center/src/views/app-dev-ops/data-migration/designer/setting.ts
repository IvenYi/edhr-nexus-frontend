import { SysPageEnum } from './const';
import { getRolePageList } from '/@/apis/gct-apaas/RoleController';
import { getMessageTmplPageList } from '/@/apis/gct-apaas/MessageTmplController';
import { getCategoryList } from '/@/apis/gct-apaas/CategoryController';
import { getUserGroupList, getUserGroupInfo } from '/@/apis/gct-apaas/UserGroupController';
import { cloneDeep } from 'lodash-es';
import { getInterfaceApi } from '@gct/runtime';
import { SearchComponents } from '/@page-designer/enum';
import { SEARCH_SEVICE } from '@/enums/designEnum';
import { cacheAdapter } from '/@page-designer/components/widgets/hooks/cacheAdapter';
import { listToTree } from '/@/utils/helper/treeHelper';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal } from '/@/apis/gct-apaas/ModelComprehensiveExternalController';
/**
 * 系统模块tree
 */
export const sysPageOptions = [
  {
    id: 1,
    name: '组织权限',
    selectable: false,
    children: [
      {
        id: SysPageEnum.USER_GROUP,
        name: '用户组',
      },
      {
        id: SysPageEnum.ROLE_MANAGE,
        name: '角色管理',
      },
    ],
  },
  {
    id: 2,
    name: '消息中心',
    selectable: false,
    children: [
      {
        id: SysPageEnum.MSG_TEMPLATE,
        name: '消息模板',
      },
    ],
  },
  {
    id: 3,
    name: '打印中心',
    selectable: false,
    children: [
      {
        id: SysPageEnum.LABEL_PRINT,
        name: '标签设计',
      },
      {
        id: SysPageEnum.DOC_PRINT,
        name: '单据设计',
      },
    ],
  },
  // {
  //   id: 4,
  //   name: '单据设计',
  //   selectable: false,
  //   children: [
  //     {
  //       id: SysPageEnum.FORM_DESIGN,
  //       name: '表单设计',
  //     },
  //     {
  //       id: SysPageEnum.EDHR_DESIGN,
  //       name: 'eDHR设计',
  //     },
  //   ],
  // },
];

const commonField = [
  {
    name: '创建人',
    key: 'createUserName',
  },
  {
    name: '创建时间',
    key: 'createTime',
  },
  {
    name: '修改人',
    key: 'modifyUserName',
    ellipsis: true,
  },
  {
    name: '修改时间',
    key: 'modifyTime',
  },
];

export const sysPageInfo = {
  [SysPageEnum.USER_GROUP]: {
    http: async ({ name } = {}, config) => {
      const item = (await getUserGroupList(config)) || [];
      const defaultExpandedRowKeys = [];
      const tree = listToTree(item, { pid: 'parentId' });
      const data = filterTree(
        tree,
        (node) => {
          return !name || node.name.includes(name);
        },
        'children',
      );
      dfsNonRecursive(data, 'children', (node: any) => {
        defaultExpandedRowKeys.push(node.id);
      });
      for (const row of data) {
        const { userGroupRelations = [] } = await cacheAdapter({ id: row.id }, (arg) =>
          getUserGroupInfo(arg, config),
        );
        // getUserGroupInfo(
        //   { id: row.id },
        //   config,
        // );
        row._user =
          userGroupRelations
            .filter((i) => ['USER', 'ORG'].includes(i.relationType))
            .map((i) => i.relationName) + '';
        row._role =
          userGroupRelations
            .filter((i) => ['ROLE'].includes(i.relationType))
            .map((i) => i.relationName) + '';
        row._model =
          userGroupRelations
            .filter((i) => ['ENTITY_MODEL_DATA'].includes(i.relationType))
            .map((i) => i.relationName) + '';
      }
      return {
        data,
        treeData: {
          key: 'children',
          defaultExpandedRowKeys,
        },
        allCount: item.length,
      };
    },
    search: [
      {
        name: '用户组',
        key: 'name',
        _searchCmpKey: SearchComponents.SearchInput,
      },
    ],
    tableColumns: [
      {
        name: '用户组',
        key: 'name',
        width: 200,
      },
      {
        name: '成员',
        key: '_user',
      },
      {
        name: '权限角色',
        key: '_role',
      },
      {
        name: '数据权限模型',
        key: '_model',
      },
      // {
      //   name: '所属用户组',
      //   key: 'parentName',
      // },
      ...commonField,
    ],
  },
  [SysPageEnum.ROLE_MANAGE]: {
    http: async (data, config) => {
      return getRolePageList(data, config);
    },
    search: [
      {
        name: '角色名',
        key: 'roleName',
        _searchCmpKey: SearchComponents.SearchInput,
      },
      {
        name: '状态',
        key: 'enabled',
        _searchCmpKey: 'searchCustomSelect',
        defaultValue: '',
        options: [
          {
            value: '',
            label: '全部',
          },
          {
            value: 1,
            label: '启用',
          },
          {
            value: 0,
            label: '禁用',
          },
        ],
      },
    ],
    tableColumns: [
      {
        name: '角色名称',
        key: 'name',
      },
      {
        name: '状态',
        key: 'enabled',
        isConvert: 'single',
        options: { 1: '启用', 0: '禁用' },
      },
      {
        name: '类型',
        key: 'type',
        isConvert: 'single',
        options: { BUILTIN: '内置', USER_DEFINED: '自定义' },
      },
      {
        name: '备注',
        key: 'description',
      },
      ...commonField,
    ],
  },
  [SysPageEnum.MSG_TEMPLATE]: {
    http: async (data, config) => {
      return getMessageTmplPageList(data, config);
    },
    search: [
      {
        name: '消息模板KEY',
        key: 'key',
        _searchCmpKey: SearchComponents.SearchInput,
      },
      {
        name: '消息模板名称',
        key: 'name',
        _searchCmpKey: SearchComponents.SearchInput,
      },
      {
        name: '关联模型',
        key: 'modelName',
        _searchCmpKey: SearchComponents.SearchInput,
      },
      {
        name: '类型',
        key: 'type',
        _searchCmpKey: 'searchCustomSelect',
        defaultValue: '',
        options: [
          {
            value: '',
            label: '全部',
          },
          {
            value: 'BUILTIN',
            label: '系统内置',
          },
          {
            value: 'USER_DEFINED',
            label: '自定义',
          },
        ],
      },
    ],
    tableColumns: [
      {
        name: '消息模板KEY',
        key: 'key',
      },
      {
        name: '消息模板名称',
        key: 'name',
      },
      {
        name: '关联模型',
        key: 'modelName',
      },
      {
        name: '推送方式',
        key: 'pushType',
        isConvert: 'multiple',
        options: {
          system: '系统',
          email: '邮箱',
          wecom: '企业微信',
          feishu: '飞书',
          dingtalk: '钉钉',
        },
      },
      {
        name: '类型',
        key: 'type',
        isConvert: 'single',
        options: { BUILTIN: '系统内置', USER_DEFINED: '自定义' },
      },
      ...commonField,
    ],
  },
  [SysPageEnum.LABEL_PRINT]: {
    http: async (data, config) => {
      const res = (await getCategoryList({ module: 'label_module', ...data }, config)) || [];
      return { data: res, allCount: res.length };
    },
    search: [
      {
        name: '分类名称',
        key: 'name',
        _searchCmpKey: SearchComponents.SearchInput,
      },
    ],
    tableColumns: [
      {
        name: '分类名称',
        key: 'name',
        details: true,
      },
      ...commonField,
    ],
  },
  [SysPageEnum.DOC_PRINT]: {
    http: async (data, config) => {
      const res = (await getCategoryList({ module: 'document_module', ...data }, config)) || [];
      return { data: res, allCount: res.length };
    },
    search: [
      {
        name: '分类名称',
        key: 'name',
        _searchCmpKey: SearchComponents.SearchInput,
      },
    ],
    tableColumns: [
      {
        name: '分类名称',
        key: 'name',
        details: true,
      },
      ...commonField,
    ],
  },
  [SysPageEnum.FORM_DESIGN]: {
    http: async ({ name } = {}, config) => {
      const res = await getInterfaceApi.getCategoryList(
        { moduleType: 'online_form_module' },
        config,
      );
      let allCount = 0;
      dfsNonRecursive(res, 'child', (node: any) => {
        allCount += 1;
      });
      const data = filterTree(
        res,
        (node) => {
          return !name || node.name.includes(name);
        },
        'child',
      );

      const defaultExpandedRowKeys = [];
      dfsNonRecursive(data, 'child', (node: any) => {
        defaultExpandedRowKeys.push(node.id);
      });
      return {
        data,
        treeData: {
          key: 'child',
          defaultExpandedRowKeys,
        },
        allCount,
      };
    },
    search: [
      {
        name: '分类名称',
        key: 'name',
        _searchCmpKey: SearchComponents.SearchInput,
      },
    ],
    tableColumns: [
      {
        name: '分类名称',
        key: 'name',
        details: true,
      },
      ...commonField,
    ],
  },
  [SysPageEnum.EDHR_DESIGN]: {
    http: async ({ name } = {}, config) => {
      const res = await getInterfaceApi.getCategoryList({ moduleType: 'edhr_module' }, config);
      let allCount = 0;
      dfsNonRecursive(res, 'child', (node: any) => {
        allCount += 1;
      });
      const data = filterTree(
        res,
        (node) => {
          return !name || node.name.includes(name);
        },
        'child',
      );
      const defaultExpandedRowKeys = [];
      dfsNonRecursive(data, 'child', (node: any) => {
        defaultExpandedRowKeys.push(node.id);
      });
      return {
        data,
        treeData: {
          key: 'child',
          defaultExpandedRowKeys,
        },
        allCount,
      };
    },
    search: [
      {
        name: '分类名称',
        key: 'name',
        _searchCmpKey: SearchComponents.SearchInput,
      },
    ],
    tableColumns: [
      {
        name: '分类名称',
        key: 'name',
        details: true,
      },
      ...commonField,
    ],
  },
  [SysPageEnum.basic_model]: {
    http: async (data, config) => {},
    api(modelKey, data, config) {
      return postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal(
        {
          bsKey: 'listByPage',
          modelKey,
          modelCategory: 'entity',
        },
        data,
        {},
        config,
      );
    },
    search: [],
    tableColumns: [],
    key: 'id_',
  },
  [SysPageEnum.ndo_model]: {
    http: async (data, config) => {},
    api(modelKey, data, config) {
      return postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal(
        {
          bsKey: 'listByPage',
          modelKey,
          modelCategory: 'entity',
        },
        data,
        {},
        config,
      );
    },
    search: [],
    tableColumns: [],
    key: 'id_',
  },
  [SysPageEnum.rdo_model]: {
    http: async (data, config) => {},
    api(modelKey, data, config) {
      return postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKeyExternal(
        {
          bsKey: 'rdoListByPage',
          modelKey,
          modelCategory: 'entity',
        },
        data,
        {},
        config,
      );
    },
    search: [],
    tableColumns: [],
    key: 'id_',
  },
};

/**
 * 非递归深度优先遍历
 * @param {Object} root - 树的根节点
 * @param {string} childrenKey - 子节点字段名（默认为 'children'）
 * @param {Function} callback - 对每个节点的处理函数 (node) => void
 */
export function dfsNonRecursive(root, childrenKey = 'children', callback) {
  if (!root) return;

  // 使用栈模拟递归
  const stack = cloneDeep(root);

  while (stack.length > 0) {
    const node = stack.pop(); // 取出栈顶节点
    callback(node); // 处理当前节点

    // 将子节点逆序压入栈中（保证顺序正确）
    if (Array.isArray(node[childrenKey])) {
      for (let i = node[childrenKey].length - 1; i >= 0; i--) {
        stack.push(node[childrenKey][i]);
      }
    }
  }
}

function filterTree(tree, filterFn, key = 'children') {
  // 如果当前节点不匹配，直接返回 null
  if (!tree) return null;
  // 遍历子节点并递归过滤
  return tree
    .map((i) => {
      const children = i[key] ? filterTree(i[key], filterFn, key) : undefined;
      return { ...i, [key]: children };
    })
    .filter((i) => {
      return !!i[key]?.length || filterFn(i);
    });
}
