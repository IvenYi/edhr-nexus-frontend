import { useEffect, useState } from 'react';
import { SIDEBAR_MODULES, type SidebarMenu, type SidebarModule, type SidebarSubMenu } from '@/utils/constants';

export const MENU_MANAGEMENT_STORAGE_KEY = 'edhr:managed-sidebar-modules';
export const MENU_MANAGEMENT_EVENT = 'edhr:managed-sidebar-modules-change';
export const MAX_MENU_CHILDREN_DEPTH = 2;

function cloneSidebarModules(modules: SidebarModule[]): SidebarModule[] {
  return JSON.parse(JSON.stringify(modules)) as SidebarModule[];
}

const REQUIRED_SYSTEM_MANAGEMENT_CHILDREN: SidebarSubMenu[] = [
  { label: '图标管理', path: '/system/icons' },
  { label: '系统设置', path: '/system/settings' },
];

const REQUIRED_SECURITY_MANAGEMENT_CHILDREN: SidebarSubMenu[] = [
  { label: '登录日志', path: '/system/login-logs' },
  { label: '审计日志', path: '/system/audit-logs' },
  { label: '签名记录', path: '/system/signatures' },
];

const SECURITY_MANAGEMENT_PATHS = new Set(REQUIRED_SECURITY_MANAGEMENT_CHILDREN.map((child) => child.path));

const REMOVED_SYSTEM_MENU_PATHS = new Set([
  '/system/tenant',
  '/system/permissions',
  '/system/form-templates',
  '/system/numbering-rules',
]);

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeSidebarSubMenu(item: Partial<SidebarSubMenu>): SidebarSubMenu | null {
  const label = normalizeText(item.label);
  const path = normalizeText(item.path);
  if (!label || !path) return null;
  if (REMOVED_SYSTEM_MENU_PATHS.has(path)) return null;
  return { label, path };
}

function normalizeSidebarMenu(menu: Partial<SidebarMenu>): SidebarMenu | null {
  const label = normalizeText(menu.label);
  const icon = normalizeText(menu.icon) || undefined;
  const children = (Array.isArray(menu.children) ? menu.children : [])
    .map((child) => normalizeSidebarSubMenu(child))
    .filter((child): child is SidebarSubMenu => child !== null)
    .filter((child) => !REMOVED_SYSTEM_MENU_PATHS.has(child.path));
  const path = normalizeText(menu.path);

  if (!label) return null;
  if (children.length > 0) return { label, icon, children };
  if (!path) return null;
  if (!REMOVED_SYSTEM_MENU_PATHS.has(path)) return { label, icon, path };
  return null;
}

export function normalizeManagedSidebarModules(modules: SidebarModule[]): SidebarModule[] {
  const normalized = modules
    .map((module) => {
      const id = normalizeText(module.id);
      const label = normalizeText(module.label);
      const icon = normalizeText(module.icon) || 'Settings';
      const menus = (Array.isArray(module.menus) ? module.menus : [])
        .map((menu) => normalizeSidebarMenu(menu))
        .filter((menu): menu is SidebarMenu => menu !== null);

      return id && label && menus.length > 0 ? { id, label, icon, menus } : null;
    })
    .filter((module): module is SidebarModule => module !== null);

  return ensureRequiredSystemMenus(normalized.length > 0 ? normalized : cloneSidebarModules(SIDEBAR_MODULES));
}

export function ensureRequiredSystemMenus(modules: SidebarModule[]): SidebarModule[] {
  const nextModules = cloneSidebarModules(modules);
  let systemModule = nextModules.find((module) => module.id === 'system');

  if (!systemModule) {
    systemModule = {
      id: 'system',
      label: '系统',
      icon: 'Settings',
      menus: [],
    };
    nextModules.push(systemModule);
  }

  let systemManagement = systemModule.menus.find((menu) => menu.label === '系统管理');
  if (!systemManagement) {
    systemManagement = {
      label: '系统管理',
      icon: 'Settings',
      children: [],
    };
    systemModule.menus.push(systemManagement);
  }

  const children = systemManagement.children ?? [];
  const existingPaths = new Set(children.map((child) => child.path));
  const requiredChildren = REQUIRED_SYSTEM_MANAGEMENT_CHILDREN.filter((child) => !existingPaths.has(child.path));

  if (requiredChildren.length > 0) {
    systemManagement.children = [...children, ...requiredChildren];
  }
  delete systemManagement.path;
  ensureRequiredSecurityManagement(systemModule);
  return nextModules;
}

function ensureRequiredSecurityManagement(systemModule: SidebarModule) {
  for (const menu of systemModule.menus) {
    if (menu.label === '安全管理') continue;
    if (menu.children) {
      menu.children = menu.children.filter((child) => !SECURITY_MANAGEMENT_PATHS.has(child.path));
    }
  }
  systemModule.menus = systemModule.menus.filter((menu) => menu.path ? !SECURITY_MANAGEMENT_PATHS.has(menu.path) : true);

  let securityManagement = systemModule.menus.find((menu) => menu.label === '安全管理');
  if (!securityManagement) {
    securityManagement = {
      label: '安全管理',
      icon: 'LockOutlined',
      children: [],
    };
    systemModule.menus.push(securityManagement);
  }

  const children = securityManagement.children ?? [];
  const existingPaths = new Set(children.map((child) => child.path));
  const requiredChildren = REQUIRED_SECURITY_MANAGEMENT_CHILDREN.filter((child) => !existingPaths.has(child.path));
  securityManagement.children = [...children, ...requiredChildren];
  delete securityManagement.path;
}

export function loadManagedSidebarModules(): SidebarModule[] {
  if (typeof window === 'undefined') return ensureRequiredSystemMenus(SIDEBAR_MODULES);

  try {
    const raw = window.localStorage.getItem(MENU_MANAGEMENT_STORAGE_KEY);
    if (!raw) return ensureRequiredSystemMenus(SIDEBAR_MODULES);
    const parsed = JSON.parse(raw) as SidebarModule[];
    return normalizeManagedSidebarModules(parsed);
  } catch {
    return ensureRequiredSystemMenus(SIDEBAR_MODULES);
  }
}

export function saveManagedSidebarModules(modules: SidebarModule[]): SidebarModule[] {
  const normalized = ensureRequiredSystemMenus(normalizeManagedSidebarModules(modules));
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MENU_MANAGEMENT_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(MENU_MANAGEMENT_EVENT));
  }
  return normalized;
}

export function resetManagedSidebarModules(): SidebarModule[] {
  const defaults = ensureRequiredSystemMenus(SIDEBAR_MODULES);
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(MENU_MANAGEMENT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(MENU_MANAGEMENT_EVENT));
  }
  return defaults;
}

export function useManagedSidebarModules(): SidebarModule[] {
  const [modules, setModules] = useState<SidebarModule[]>(() => loadManagedSidebarModules());

  useEffect(() => {
    const refreshModules = () => setModules(loadManagedSidebarModules());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === MENU_MANAGEMENT_STORAGE_KEY) refreshModules();
    };

    window.addEventListener(MENU_MANAGEMENT_EVENT, refreshModules);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(MENU_MANAGEMENT_EVENT, refreshModules);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return modules;
}

export function inferPermissionCode(path: string): string | undefined {
  if (path === '/') return 'dashboard';
  if (path === '/system/menu-management') return 'system.edit';
  if (path === '/system/icons') return 'system.icons';
  if (path === '/system/settings') return 'system.settings';
  if (path === '/system/login-logs') return 'system.login-logs';
  return path.replace(/^\//, '').replace(/\//g, '.');
}
