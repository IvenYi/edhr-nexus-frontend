import { useI18n } from '/@/hooks/web/useI18n';
import { ColumnsType } from 'ant-design-vue/es/table/Table.d';

const { t } = useI18n();

/**
 * @description 平台参数枚举
 * @alias PLATFORM_MANAGE_USER:      平台管理-用户管理
 * @alias PLATFORM_MANAGE_ORG_USER:  平台管理-组织成员
 * @alias TENANT_MANAGE_USER:        租户管理-用户管理
 * @alias TENANT_MANAGE_ORG_USER:    租户管理-组织成员
 */
export enum PlatformEnum {
  /** 平台管理-用户管理 */
  PLATFORM_MANAGE_USER = 'PLATFORM_MANAGE_USER',
  /** 平台管理-组织成员 */
  PLATFORM_MANAGE_ORG_USER = 'PLATFORM_MANAGE_ORG_USER',
  /** 租户管理-用户管理 */
  TENANT_MANAGE_USER = 'TENANT_MANAGE_USER',
  /** 租户管理-组织成员 */
  TENANT_MANAGE_ORG_USER = 'TENANT_MANAGE_ORG_USER',
}

/**
 * 用户状态
 * @alias ENABLE    启用
 * @alias UN_ENABLE 禁用
 * @alias ALL       全部
 */
export enum UserEnabledEnum {
  /** 1：启用 */
  ENABLE = 1,
  /** 0：禁用 */
  UN_ENABLE = 0,
  /** -1：全部 */
  ALL = -1,
  /** 未激活 */
  UN_ACTIVE = 2,
}

/**
 * 按钮位置
 * @alias ListHeadButton   列表页头部按钮
 * @alias ListRowButton    列表页单行按钮
 * @alias ListBatchButton  列表页批量按钮
 */
export enum ButtonLocationTypeEnum {
  /** 列表页头部按钮 */
  ListHeadButton = 'list_page_head_button',
  /** 列表页单行按钮 */
  ListRowButton = 'list_page_row_button',
  /** 列表页批量按钮 */
  ListBatchButton = 'list_page_batch_button',
}

/**
 * 按钮key枚举
 * @alias Create   新建
 * @alias Add      添加
 * @alias Import   导入
 * @alias Export   导出
 * @alias Edit     编辑
 * @alias ResetPwd 重置密码
 * @alias Delete   删除
 * @alias Enable   启用
 * @alias Disable  禁用
 * @alias Detach   移除用户
 * @alias Move     移动部门
 */
export enum ButtonTypeEnum {
  /** 新建 */
  Create = 'create',
  /** 添加 */
  Add = 'add',
  /** 导入 */
  Import = 'import',
  /** 导出 */
  Export = 'export',
  /** 编辑 */
  Edit = 'edit',
  /** 重置密码 */
  ResetPwd = 'resetPwd',
  /** 删除 */
  Delete = 'delete',
  /** 启用 */
  Enable = 'enable',
  /** 禁用 */
  Disable = 'disable',
  /** 移除用户 */
  Detach = 'detach',
  /** 移动部门 */
  Move = 'move',
  /** 建模追溯 */
  Trace = 'trace',
  /** 重置签名密码 */
  ResetSignPwd = 'resetSignsPwd',
}

export const userOrgColumns: ColumnsType<any> = [
  {
    title: t('sys.Dept'),
    dataIndex: 'orgId',
  },

  {
    title: t('sys.org.dept') + t('sys.principal'),
    dataIndex: 'principal',
    width: 150,
  },
  {
    title: '',
    dataIndex: 'action',
    width: 200,
    fixed: 'right',
  },
];
