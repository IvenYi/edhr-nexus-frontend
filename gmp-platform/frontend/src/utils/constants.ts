// ============================================================
// Status Enum Maps (label + MUI color)
// ============================================================

export const WORKFLOW_STATUS_MAP = {
  DRAFT: { label: '草稿', color: 'default' as const },
  PUBLISHED: { label: '已发布', color: 'success' as const },
  IN_REVIEW: { label: '审批中', color: 'warning' as const },
  EFFECTIVE: { label: '已生效', color: 'success' as const },
  OBSOLETE: { label: '已作废', color: 'error' as const },
} as const;

export const INSTANCE_STATUS_MAP = {
  RUNNING: { label: '运行中', color: 'info' as const },
  COMPLETED: { label: '已完成', color: 'success' as const },
  TERMINATED: { label: '已终止', color: 'error' as const },
} as const;

export const TASK_STATUS_MAP = {
  PENDING: { label: '待处理', color: 'warning' as const },
  PROCESSING: { label: '处理中', color: 'info' as const },
  COMPLETED: { label: '已完成', color: 'success' as const },
  REJECTED: { label: '已退回', color: 'error' as const },
  TRANSFERRED: { label: '已转办', color: 'secondary' as const },
} as const;

export const NODE_TYPE_MAP = {
  START: { label: '开始', color: '#4caf50' },
  APPROVAL: { label: '审批', color: '#1976d2' },
  PARALLEL_GATEWAY: { label: '并行网关', color: '#ff9800' },
  END: { label: '结束', color: '#f44336' },
  FORM: { label: '表单', color: '#9c27b0' },
  CONDITION: { label: '条件分支', color: '#00bcd4' },
} as const;

export const AUDIT_ACTION_MAP = {
  CREATE: { label: '创建', color: 'success' as const },
  UPDATE: { label: '更新', color: 'info' as const },
  DELETE: { label: '删除', color: 'error' as const },
  STATUS_CHANGE: { label: '状态变更', color: 'warning' as const },
  SIGN: { label: '签名', color: 'primary' as const },
  EXPORT: { label: '导出', color: 'secondary' as const },
  API_CALL: { label: '接口调用', color: 'default' as const },
  WORKFLOW_INTERVENE: { label: '流程干预', color: 'error' as const },
} as const;

export const USER_STATUS_MAP = {
  ACTIVE: { label: '正常', color: 'success' as const },
  DISABLED: { label: '禁用', color: 'error' as const },
} as const;

// ============================================================
// Business types for workflow binding
// ============================================================

export const BUSINESS_TYPES = [
  { label: 'DHR', value: 'DHR' },
  { label: '变更', value: 'CHANGE' },
  { label: '作废', value: 'OBSOLETE' },
  { label: '放行', value: 'RELEASE' },
] as const;

// ============================================================
// Workflow node types (for ReactFlow)
// ============================================================

export const FLOW_NODE_TYPES = {
  START: 'start',
  END: 'end',
  APPROVAL: 'approval',
  PARALLEL_GATEWAY: 'parallelGateway',
  FORM: 'form',
  CONDITION: 'condition',
} as const;

// ============================================================
// Form field types
// ============================================================

export const FIELD_TYPES = [
  { label: '文本', value: 'TEXT' },
  { label: '数字', value: 'NUMBER' },
  { label: '日期', value: 'DATE' },
  { label: '下拉选择', value: 'SELECT' },
  { label: '复选框', value: 'CHECKBOX' },
  { label: '表格', value: 'TABLE' },
] as const;

// ============================================================
// Sidebar menu configuration (dual-column layout)
// ============================================================

/** First level: module (shown in the narrow left bar) */
export interface SidebarModule {
  id: string;
  label: string;
  icon: string;
  menus: SidebarMenu[];
}

/** Second level: menu (shown in the wide function bar) */
export interface SidebarMenu {
  label: string;
  icon?: string;
  path?: string;
  children?: SidebarSubMenu[];
}

/** Third level: sub-menu (nested under a menu) */
export interface SidebarSubMenu {
  label: string;
  path: string;
}

export const SIDEBAR_MODULES: SidebarModule[] = [
  {
    id: 'home',
    label: '首页',
    icon: 'Home',
    menus: [
      { label: '首页工作台', icon: 'Dashboard', path: '/' },
    ],
  },
  {
    id: 'data',
    label: '数据',
    icon: 'Storage',
    menus: [
      {
        label: '工艺建模',
        icon: 'AccountTree',
        children: [
          { label: '物料管理', path: '/master-data/materials' },
          { label: '工序管理', path: '/master-data/operations' },
          { label: '工艺路线', path: '/master-data/routes' },
          { label: '产品管理', path: '/master-data/products' },
          { label: '产品簇', path: '/master-data/product-families' },
          { label: '文档管理', path: '/master-data/documents' },
        ],
      },
      {
        label: '模板建模',
        icon: 'Article',
        children: [
          { label: '表单模板', path: '/master-data/form-templates' },
          { label: '批记录模板', path: '/master-data/batch-record-templates' },
        ],
      },
      {
        label: '工厂建模',
        icon: 'Factory',
        children: [
          { label: '车间管理', path: '/master-data/workshops' },
        ],
      },
      {
        label: '设备建模',
        icon: 'PrecisionManufacturing',
        children: [
          { label: '设备类型', path: '/master-data/equipment-types' },
          { label: '设备列表', path: '/master-data/equipment' },
        ],
      },
    ],
  },
  {
    id: 'production',
    label: '生产',
    icon: 'PrecisionManufacturing',
    menus: [
      {
        label: '生产准备',
        icon: 'Assignment',
        children: [
          { label: '工单管理', path: '/production/work-orders' },
          { label: '批次管理', path: '/production/batches' },
        ],
      },
      {
        label: '生产执行',
        icon: 'PrecisionManufacturing',
        children: [
          { label: '生产工作台', path: '/production/execution' },
        ],
      },
      {
        label: '流程中心',
        icon: 'AccountTree',
        children: [
          { label: '审批流程', path: '/workflow/review-templates' },
          { label: '表单流程', path: '/workflow/form-processes' },
          { label: '流程实例', path: '/workflow/instances' },
        ],
      },
      {
        label: '生产配置',
        icon: 'Tune',
        children: [
          { label: '作业模板', path: '/production/work-templates' },
        ],
      },
    ],
  },
  {
    id: 'records',
    label: '记录',
    icon: 'FactCheck',
    menus: [
      {
        label: '表单管理',
        icon: 'FactCheck',
        children: [
          { label: '表单列表', path: '/form-management/list' },
          { label: '表单填报', path: '/form-management/filling' },
          { label: '表单审批', path: '/form-management/review' },
        ],
      },
      {
        label: 'DHR管理',
        icon: 'AssignmentTurnedIn',
        children: [
          { label: 'DHR列表', path: '/dhr-management/list' },
          { label: 'DHR填报', path: '/dhr-management/filling' },
          { label: 'DHR汇总', path: '/dhr-management/summary' },
          { label: 'DHR审批', path: '/dhr-management/review' },
        ],
      },
    ],
  },
  {
    id: 'system',
    label: '系统',
    icon: 'Settings',
    menus: [
      {
        label: '组织管理',
        icon: 'AccountTree',
        children: [
          { label: '组织架构', path: '/system/organization' },
          { label: '岗位角色', path: '/system/roles' },
          { label: '用户管理', path: '/system/users' },
        ],
      },
      {
        label: '系统管理',
        icon: 'Settings',
        children: [
          { label: '菜单管理', path: '/system/menu-management' },
          { label: '业务字典', path: '/system/dictionaries' },
          { label: '图标管理', path: '/system/icons' },
          { label: '系统设置', path: '/system/settings' },
        ],
      },
      {
        label: '安全管理',
        icon: 'LockOutlined',
        children: [
          { label: '登录日志', path: '/system/login-logs' },
          { label: '审计日志', path: '/system/audit-logs' },
          { label: '签名记录', path: '/system/signatures' },
        ],
      },
    ],
  },
];
