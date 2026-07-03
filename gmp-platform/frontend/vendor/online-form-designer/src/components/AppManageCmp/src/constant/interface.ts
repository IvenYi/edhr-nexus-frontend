import { useI18n } from '/@/hooks/web/useI18n';
import { BasicColumn } from '/@/components/Table/src/types/table';
import type { ICreateAppMenuOptions, ICreateAppTabsMenuOptions } from '../types/index.d';
import { ColumnsType } from 'ant-design-vue/es/table/Table.d';

const { t } = useI18n();

/**
 * @description 平台参数枚举
 * @alias PLATFORM_DEVELOPER_CENTER:  平台管理-开发者中心
 * @alias PLATFORM_TENANT_CENTER:    平台管理-租户管理后台
 */
export enum PlatformEnum {
  /** 平台管理-开发者中心 */
  PLATFORM_DEVELOPER_CENTER = 'PLATFORM_DEVELOPER_CENTER',
  /** 平台管理-租户管理后台 */
  PLATFORM_TENANT_CENTER = 'PLATFORM_TENANT_CENTER',
}

/**
 * 接口所需的人员权限枚举
 * @alias MAINTAINER 维护人员
 * @alias DEVELOPER  开发人员（协作）
 * @alias TESTER     测试人员
 * @alias VIEWER     查看人员
 */
export enum UserRoleReqEnum {
  /** 维护人员 */
  MAINTAINER = 'MAINTAINER',
  /** 开发人员（协作） */
  DEVELOPER = 'DEVELOPER',
  /** 测试人员 */
  TESTER = 'TESTER',
  /** 查看人员 */
  VIEWER = 'VIEWER',
}

/**
 * logo类型枚举
 * @alias Icon    图标
 * @alias Image   图片
 */
export enum LogoTypeEnum {
  /** 图标 */
  Icon = 'ICON',
  /** 图片 */
  Image = 'IMAGE',
}

/** 应用创建状态 */
export const applicationStatusOptions = {
  /** 初始化中 */
  initializing: 'INITIALIZING',
  /** 成功 */
  success: 'SUCCESS',
  /** 失败 */
  fail: 'FAIL',
};

/**
 * 应用分类枚举
 * @alias Major    专业应用
 * @alias Micro    微应用
 * @alias Bulletin 看板应用
 */
export enum AppClassifyEnum {
  /** 专业应用 */
  Pro = 'PRO',
  /** 微应用 */
  Micro = 'MICRO',
  /** 看板应用 */
  Bi = 'BI',
}

/** 应用分类中文枚举 */
export const Ch_AppClassify = {
  [AppClassifyEnum.Pro]: t('sys.developer.appCenter.major'),
  [AppClassifyEnum.Micro]: t('sys.app.micro'),
  [AppClassifyEnum.Bi]: t('sys.app.bi'),
};

export const createAppMenuOptions: ICreateAppMenuOptions[] = [
  {
    id: AppClassifyEnum.Pro,
    icon: 'MajorIcon',
    title: t('sys.developer.appCenter.createMajor'),
  },
  {
    id: AppClassifyEnum.Micro,
    icon: 'MicroIcon',
    title: t('sys.developer.appCenter.createMicro'),
  },
  {
    id: AppClassifyEnum.Bi,
    icon: 'BulletinIcon',
    title: t('sys.developer.appCenter.createBulletin'),
  },
];

/**
 * 应用tab菜单枚举
 * @alias MineCreate      我创建的
 * @alias MineCollaborate 我协作的
 * @alias AllApp          全部应用
 * @alias RecycleBin      回收站
 */
export enum AppTabsMenuEnum {
  /** 我创建的 */
  MineCreate = 'mineCreate',
  /** 我协作的 */
  MineCollaborate = 'mineCollaborate',
  /** 全部应用 */
  AllApp = 'allApp',
  /** 回收站 */
  RecycleBin = 'recycleBin',
}

// export type AppTabsMenuEnumType = keyof typeof AppTabsMenuEnum;

/** 应用tab菜单 */
export const createAppTabsMenuOptions: ICreateAppTabsMenuOptions[] = [
  {
    id: AppTabsMenuEnum.AllApp,
    title: t('sys.developer.appCenter.tabAllApp'),
    total: 0,
  },
  {
    id: AppTabsMenuEnum.MineCreate,
    title: t('sys.developer.appCenter.tabMineCreate'),
    total: 0,
  },
  {
    id: AppTabsMenuEnum.MineCollaborate,
    title: t('sys.developer.appCenter.tabMineCollaborate'),
    total: 0,
  },
  {
    id: AppTabsMenuEnum.RecycleBin,
    title: t('sys.developer.appCenter.tabRecycleBin'),
    total: 0,
  },
];

/** tab菜单key转成接口需要的人员类型 */
export const transformUserRole2TabType = (tabType: AppTabsMenuEnum) => {
  if (tabType === AppTabsMenuEnum.MineCreate) {
    return UserRoleReqEnum.MAINTAINER;
  }
  if (tabType === AppTabsMenuEnum.MineCollaborate) {
    return `${UserRoleReqEnum.DEVELOPER},${UserRoleReqEnum.VIEWER}`;
  }
  return '';
};

/**
 * 按钮位置
 * @alias CardTileButton   卡片平铺按钮
 * @alias CardDropButton   卡片下拉菜单按钮
 */
export enum ButtonLocationTypeEnum {
  /** 卡片平铺按钮 */
  CardTileButton = 'card_tile_button',
  /** 卡片下拉菜单按钮 */
  CardDropButton = 'card_drop_button',
}

/**
 * 按钮key枚举
 * @alias Design   设计
 * @alias Preview  预览
 * @alias Lock     锁定
 * @alias Unlock   解锁
 * @alias Detail   详情
 * @alias Delete   删除
 * @alias Rest     还原
 * @alias Clear    清除
 */
export enum ButtonTypeEnum {
  /** 设计 */
  Design = 'design',
  /** 预览 */
  Preview = 'preview',
  /** 锁定 */
  Lock = 'lock',
  /** 解锁 */
  Unlock = 'unlock',
  /** 详情 */
  Detail = 'detail',
  /** 删除 */
  Delete = 'delete',
  /** 还原 */
  Rest = 'rest',
  /** 清除 */
  Clear = 'clear',
  /** 添加 */
  Add = 'add',
  /** 移交 */
  Transfer = 'transfer',
  /** 移除 */
  Detach = 'detach',
  /** 激活 */
  Activate = 'activate',
  /** 编辑 */
  Edit = 'edit',
}

export enum AppDetailTabEnum {
  /** 应用信息 */
  AppInfo = 'appInfo',
  /** 成员列表 */
  MemberList = 'memberList',
  /** 部署日志 */
  DeploymentLog = 'deploymentLog',
  /** 操作日志 */
  OperationLog = 'operationLog',
  /** 应用版本 */
  AppVersion = 'appVersion',
  /** 授权信息 */
  License = 'license',
}

export const memberListColumns: BasicColumn[] = [
  {
    title: t('sys.fullname'),
    dataIndex: 'fullname',
    fixed: 'left',
  },
  {
    title: t('sys.userName'),
    dataIndex: 'username',
  },
  {
    title: t('sys.developer.appCenter.affOrg'),
    dataIndex: 'orgName',
  },
  {
    title: t('sys.developer.appCenter.addTime'),
    dataIndex: 'createTime',
    width: 170,
  },
  {
    title: t('sys.developer.appCenter.roleTitle'),
    dataIndex: 'role',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 200,
    align: 'center',
    fixed: 'right',
  },
];

export const bIMemberListColumns: BasicColumn[] = [
  {
    title: t('sys.fullname'),
    dataIndex: 'fullname',
    fixed: 'left',
  },
  {
    title: t('sys.userName'),
    dataIndex: 'username',
  },
  {
    title: t('sys.developer.appCenter.affDept'),
    dataIndex: 'orgName',
  },
  {
    title: t('sys.developer.appCenter.roleName'),
    dataIndex: 'role',
  },
  {
    title: t('sys.developer.appCenter.admissionTime'),
    dataIndex: 'createTime',
    width: 170,
  },

  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 200,
    align: 'center',
    fixed: 'right',
  },
];

/** 人员角色中文枚举 */
export const Ch_UserRole = {
  [UserRoleReqEnum.MAINTAINER]: t('sys.developer.appCenter.maintainerUser'),
  [UserRoleReqEnum.DEVELOPER]: t('sys.developer.appCenter.developerUser'),
  [UserRoleReqEnum.TESTER]: t('sys.developer.appCenter.testerUser'),
  [UserRoleReqEnum.VIEWER]: t('sys.developer.appCenter.viewerUser'),
};

export const UserRoleOptions = [
  {
    id: UserRoleReqEnum.DEVELOPER,
    label: Ch_UserRole[UserRoleReqEnum.DEVELOPER],
    value: UserRoleReqEnum.DEVELOPER,
  },
  {
    id: UserRoleReqEnum.TESTER,
    label: Ch_UserRole[UserRoleReqEnum.TESTER],
    value: UserRoleReqEnum.TESTER,
  },
  {
    id: UserRoleReqEnum.VIEWER,
    label: Ch_UserRole[UserRoleReqEnum.VIEWER],
    value: UserRoleReqEnum.VIEWER,
  },
];

export const enum DeployStateEnum {
  /** 准备中 */
  PREPARING = 'PREPARING',
  /** 部署中 */
  DEPLOYING = 'DEPLOYING',
  /** 发布成功 */
  SUCCESS = 'SUCCESS',
  /** 发布失败 */
  FAILURE = 'FAILURE',
}

export const logoTypeOptions = [
  { label: t('sys.developer.appCenter.appIcon'), value: LogoTypeEnum.Icon },
  { label: t('sys.developer.appCenter.appImage'), value: LogoTypeEnum.Image },
];

export const appCenterColumns: ColumnsType<any> = [
  {
    key: 'appName',
    dataIndex: 'appName',
    title: t('sys.developer.appCenter.appName'),
    width: 260,
    fixed: 'left',
  },
  {
    key: 'id',
    dataIndex: 'id',
    title: t('sys.developer.appCenter.appIdent'),
    width: 200,
  },
  {
    key: 'client',
    dataIndex: 'client',
    title: t('sys.developer.appCenter.client'),
    width: 200,
  },
  {
    key: 'appStatus',
    dataIndex: 'appStatus',
    title: t('sys.developer.appCenter.appStatus'),
    width: 200,
    // @ts-ignore
    isShow(opts) {
      const { appActiveKey } = opts || {};
      return appActiveKey !== 'BI';
    },
  },
  {
    key: 'expiration',
    dataIndex: 'expiration',
    title: t('sys.developer.appCenter.expiration'),
    width: 200,
    // @ts-ignore
    isShow(opts) {
      const { tabActiveKey } = opts || {};
      return tabActiveKey === AppTabsMenuEnum.RecycleBin;
    },
  },
  {
    key: 'createUserName',
    dataIndex: 'createUserName',
    title: t('sys.developer.appCenter.createUserName'),
    width: 200,
    ellipsis: true,
    // @ts-ignore
    // isShow(opts) {
    //   const { tabActiveKey } = opts || {};
    //   return tabActiveKey !== AppTabsMenuEnum.RecycleBin;
    // },
  },
  {
    key: 'createTime',
    dataIndex: 'createTime',
    title: t('sys.developer.appCenter.createTime'),
    minWidth: 170,
    width: 170,
    // @ts-ignore
    // isShow(opts) {
    //   const { tabActiveKey } = opts || {};
    //   return tabActiveKey !== AppTabsMenuEnum.RecycleBin;
    // },
  },
  {
    key: 'modifyUserName',
    dataIndex: 'modifyUserName',
    title: t('sys.appDesigner.modifier'),
    width: 200,
    ellipsis: true,
    // @ts-ignore
    isShow(opts) {
      const { tabActiveKey } = opts || {};
      return tabActiveKey !== AppTabsMenuEnum.RecycleBin;
    },
  },
  {
    key: 'modifyTime',
    dataIndex: 'modifyTime',
    title: t('sys.appDesigner.modificationTime'),
    minWidth: 170,
    width: 170,
    // @ts-ignore
    isShow(opts) {
      const { tabActiveKey } = opts || {};
      return tabActiveKey !== AppTabsMenuEnum.RecycleBin;
    },
  },
  {
    key: 'modifyUserName',
    dataIndex: 'modifyUserName',
    title: t('sys.developer.appCenter.deleteUserName'),
    // @ts-ignore
    isShow(opts) {
      const { tabActiveKey } = opts || {};
      return tabActiveKey === AppTabsMenuEnum.RecycleBin;
    },
  },
  {
    key: 'modifyTime',
    dataIndex: 'modifyTime',
    title: t('sys.developer.appCenter.deleteTime'),
    minWidth: 170,
    width: 170,
    // @ts-ignore
    isShow(opts) {
      const { tabActiveKey } = opts || {};
      return tabActiveKey === AppTabsMenuEnum.RecycleBin;
    },
  },
  {
    key: 'action',
    dataIndex: 'action',
    title: t('sys.operation'),
    width: 280,
    align: 'left',
    fixed: 'right',
  },
];

export enum SourceTypeEnum {
  SELF_BUILT = 'SELF_BUILT',
  IMPORT = 'IMPORT',
}

export enum AppStatusEnum {
  /** 健康状态 */
  HEALTHY = 'HEALTHY',
  /** 手动锁定 */
  MANUAL_LOCKED = 'MANUAL_LOCKED',
  /** 程序锁定 */
  PROGRAM_LOCKED = 'PROGRAM_LOCKED',
  /** 非健康状态 */
  UNHEALTHY = 'UNHEALTHY',
  /** 未激活状态--仅套件应用 */
  INACTIVE = 'INACTIVE',
}

export const AppStatusOption = {
  [AppStatusEnum.HEALTHY]: {
    tag: 'success',
  },
  [AppStatusEnum.MANUAL_LOCKED]: {
    tag: 'default',
  },
  [AppStatusEnum.PROGRAM_LOCKED]: {
    tag: 'processing',
  },
  [AppStatusEnum.UNHEALTHY]: {
    tag: 'error',
  },
  [AppStatusEnum.INACTIVE]: {
    tag: 'grey',
  },
};

export enum MergeDiffReusltEnum {
  SOURCE = 'SOURCE',
  TARGET = 'TARGET',
}

export enum EnvEnum {
  Test = 'test',
  Prod = 'prod',
}
