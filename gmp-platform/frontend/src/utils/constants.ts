// ============================================================
// Status Enum Maps (label + MUI color)
// ============================================================

export const WORKFLOW_STATUS_MAP = {
  DRAFT: { label: '草稿', color: 'default' as const },
  IN_REVIEW: { label: '审核中', color: 'warning' as const },
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
  DISABLED: { label: '已禁用', color: 'error' as const },
  LOCKED: { label: '已锁定', color: 'warning' as const },
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
        label: '基础主数据',
        icon: 'Storage',
        children: [
          { label: '产品家族', path: '/master-data/product-families' },
          { label: '计量单位', path: '/master-data/units' },
          { label: '设备管理', path: '/master-data/equipment' },
          { label: 'SOP文档', path: '/master-data/sop-documents' },
          { label: '工序管理', path: '/master-data/operations' },
          { label: '工艺路线', path: '/master-data/routes' },
          { label: '工厂/车间/产线', path: '/master-data/sites' },
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
        label: '流程中心',
        icon: 'AccountTree',
        children: [
          { label: '审核流程模板', path: '/workflow/review-templates' },
          { label: '事务流程模板', path: '/workflow/txn-templates' },
          { label: '流程绑定配置', path: '/workflow/binding-rules' },
          { label: '流程实例', path: '/workflow/instances' },
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
        label: '系统管理',
        icon: 'Settings',
        children: [
          { label: '租户设置', path: '/system/tenant' },
          { label: '组织管理', path: '/system/organization' },
          { label: '用户管理', path: '/system/users' },
          { label: '角色管理', path: '/system/roles' },
          { label: '权限配置', path: '/system/permissions' },
          { label: '编码规则', path: '/system/numbering-rules' },
          { label: '表单模板', path: '/system/form-templates' },
          { label: '审计日志', path: '/system/audit-logs' },
          { label: '签名记录', path: '/system/signatures' },
        ],
      },
    ],
  },
];
