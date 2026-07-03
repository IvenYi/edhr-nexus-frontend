import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';
import { PlatformEnum } from './interface';
import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { computed } from 'vue';
import { DhrPermissionEnum } from '/@/perms/index';

const { t } = useI18n();
const appInfoStore = useAppInfoStore();
const inEDHRApp = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');

export enum TypeEnum {
  /** 集团 */
  Bloc = 'bloc',
  /** 公司 */
  Company = 'company',
  /** 部门组织 */
  Department = 'department',
}

export enum ModalTypeEnum {
  /** 新建 */
  Create = 'create',
  /** 编辑 */
  Edit = 'edit',
}

/** 接口层的组织类型 */
export enum TypeReqEnum {
  /** 集团 */
  GROUP = 'GROUP',
  /** 公司 */
  COMPANY = 'COMPANY',
  /** 部门组织 */
  DEPARTMENT = 'DEPARTMENT',
}

export const TypeNameMap = {
  [TypeEnum.Bloc]: t('sys.modalBloc'),
  [TypeEnum.Company]: t('sys.modalCompany'),
  [TypeEnum.Department]: t('sys.org.dept'),
};

export const ModalTypeNameMap = {
  [ModalTypeEnum.Create]: t('sys.new'),
  [ModalTypeEnum.Edit]: t('sys.edit'),
};

export const TypeReqMap = {
  [TypeEnum.Bloc]: TypeReqEnum.GROUP,
  [TypeEnum.Company]: TypeReqEnum.COMPANY,
  [TypeEnum.Department]: TypeReqEnum.DEPARTMENT,
};

export const TreeMenuBtnTypeEnum = {
  /** 创建集团 */
  AddBloc: 'addBloc',
  /** 创建公司 */
  AddCompany: 'addCompany',
  /** 添加下级组织 */
  AddDepartment: 'addDepartment',
  /** 编辑 */
  Edit: 'edit',
  /** 删除 */
  Delete: 'delete',
};

export const treeMenuConfig = {
  [TreeMenuBtnTypeEnum.AddBloc]: {
    key: TreeMenuBtnTypeEnum.AddBloc,
    name: `${t('sys.new')}${t('sys.modalBloc')}`,
  },
  [TreeMenuBtnTypeEnum.AddCompany]: {
    key: TreeMenuBtnTypeEnum.AddCompany,
    name: `${t('sys.new')}${t('sys.modalCompany')}`,
  },
  [TreeMenuBtnTypeEnum.AddDepartment]: {
    key: TreeMenuBtnTypeEnum.AddDepartment,
    name: t('sys.org.addChildDept'),
  },
  [TreeMenuBtnTypeEnum.Edit]: {
    key: TreeMenuBtnTypeEnum.Edit,
    name: t('sys.edit'),
  },
  [TreeMenuBtnTypeEnum.Delete]: {
    key: TreeMenuBtnTypeEnum.Delete,
    name: t('sys.delete'),
    style: {
      class: 'delete-style',
    },
  },
};

export const getTreeMenuBtn = (platformType: PlatformEnum) => {
  let menuType;
  if (platformType === PlatformEnum.PLATFORM_MANAGE_ORG_USER) {
    menuType = [
      {
        key: 'HEAD',
        contain: [TreeMenuBtnTypeEnum.AddBloc, TreeMenuBtnTypeEnum.AddCompany],
      },
      {
        key: TypeReqEnum.GROUP,
        exclude: [TreeMenuBtnTypeEnum.AddBloc],
      },
      {
        key: TypeReqEnum.COMPANY,
        exclude: [TreeMenuBtnTypeEnum.AddBloc, TreeMenuBtnTypeEnum.AddCompany],
      },
      {
        key: TypeReqEnum.DEPARTMENT,
        exclude: [TreeMenuBtnTypeEnum.AddBloc, TreeMenuBtnTypeEnum.AddCompany],
      },
    ];
  } else if ((platformType = PlatformEnum.TENANT_MANAGE_ORG_USER)) {
    menuType = [
      {
        key: TypeReqEnum.GROUP,
        contain: [TreeMenuBtnTypeEnum.AddDepartment, TreeMenuBtnTypeEnum.Edit],
      },
      {
        key: TypeReqEnum.COMPANY,
        contain: [TreeMenuBtnTypeEnum.AddDepartment, TreeMenuBtnTypeEnum.Edit],
      },
      {
        key: TypeReqEnum.DEPARTMENT,
        exclude: [TreeMenuBtnTypeEnum.AddBloc, TreeMenuBtnTypeEnum.AddCompany],
      },
    ];
  }

  const menuBtn = [
    TreeMenuBtnTypeEnum.AddBloc,
    TreeMenuBtnTypeEnum.AddCompany,
    TreeMenuBtnTypeEnum.AddDepartment,
    TreeMenuBtnTypeEnum.Edit,
    TreeMenuBtnTypeEnum.Delete,
  ];

  return menuType.reduce((prev, current) => {
    prev[current.key] = menuBtn
      .filter((btn) => {
        if (current.contain) {
          return current.contain.includes(btn);
        }
        if (current.exclude) {
          return !current.exclude.includes(btn);
        }
      })
      .map((key) => treeMenuConfig[key])
      .filter((item) => {
        if (!inEDHRApp.value) return true;
        if (
          [
            TreeMenuBtnTypeEnum.AddBloc,
            TreeMenuBtnTypeEnum.AddCompany,
            TreeMenuBtnTypeEnum.AddDepartment,
          ].includes(item.key)
        )
          return getPermissionByKey('organization-member', DhrPermissionEnum.InsertOrg);
        if (item.key === TreeMenuBtnTypeEnum.Edit)
          return getPermissionByKey('organization-member', DhrPermissionEnum.UpdateOrg);
        if (item.key === TreeMenuBtnTypeEnum.Delete)
          return getPermissionByKey('organization-member', DhrPermissionEnum.DeleteOrg);
        return false;
      });
    return prev;
  }, {});
};

export const transformType = (type) => {
  if (type === TypeReqEnum.GROUP) {
    return TypeEnum.Bloc;
  } else if (type === TypeReqEnum.COMPANY) {
    return TypeEnum.Company;
  } else if (type === TypeReqEnum.DEPARTMENT) {
    return TypeEnum.Department;
  }
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

  const params = {
    id: dragNodeProps.id, // 源节点id
  };
  console.log(dropPosition, 'dropPosition', dragNodeProps, nodeProps);

  // 拖拽到目录里
  if (dropPosition === 0) {
    console.log('拖拽到目录里');
    if (dragNodeProps.type === TypeReqEnum.GROUP) {
      return {
        type: 'error',
        msg: '集团只能在第一层',
      };
    }

    if (dragNodeProps.type === TypeReqEnum.COMPANY && nodeProps.type !== TypeReqEnum.GROUP) {
      return {
        type: 'error',
        msg: '公司只能在第一层或者在集团的下一层',
      };
    }

    if (
      !(nodeProps.type === TypeReqEnum.GROUP && dragNodeProps.type === TypeReqEnum.COMPANY) &&
      dragNodeProps.tenantId !== nodeProps.tenantId
    ) {
      return {
        type: 'error',
        msg: '不能跨租户拖拽',
      };
    }
    if (nodeProps.indexDeep >= 14) {
      return {
        type: 'error',
        msg: '最多15层',
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
    const dragMenuNode = findTreePathById(nodeProps.parentId, treeList); // 拖拽到的位置对象元数据
    if (dragNodeProps.type === TypeReqEnum.DEPARTMENT && !dragMenuNode) {
      return {
        type: 'error',
        msg: '组织不能单独存在',
      };
    }
    if (dragNodeProps.type === TypeReqEnum.GROUP && dragMenuNode) {
      return {
        type: 'error',
        msg: '集团只能在第一层',
      };
    }

    if (
      dragNodeProps.type === TypeReqEnum.COMPANY &&
      !(!dragMenuNode || (dragMenuNode && dragMenuNode.type === TypeReqEnum.GROUP))
    ) {
      return {
        type: 'error',
        msg: '公司只能在第一层或者在集团的下一层',
      };
    }

    // 不能跨租户
    if (
      dragMenuNode &&
      !(dragMenuNode.type === TypeReqEnum.GROUP && dragNodeProps.type === TypeReqEnum.COMPANY) &&
      dragNodeProps.tenantId !== dragMenuNode.tenantId
    ) {
      return {
        type: 'error',
        msg: '不能跨租户拖拽',
      };
    }

    Object.assign(params, {
      targetParentId: nodeProps.parentId,
      targetSortNum: dropPosition < 0 ? nodeProps.sortNum : nodeProps.sortNum + 1,
    });
  }

  return params;
};
