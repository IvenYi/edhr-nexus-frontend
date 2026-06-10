import { useEffect, useState } from 'react';
import { SIDEBAR_MODULES, type SidebarMenu, type SidebarModule, type SidebarSubMenu } from '@/utils/constants';

export const MENU_MANAGEMENT_STORAGE_KEY = 'edhr:managed-sidebar-modules';
export const MENU_MANAGEMENT_EVENT = 'edhr:managed-sidebar-modules-change';
export const MAX_MENU_CHILDREN_DEPTH = 2;

function cloneSidebarModules(modules: SidebarModule[]): SidebarModule[] {
  return JSON.parse(JSON.stringify(modules)) as SidebarModule[];
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeSidebarSubMenu(item: Partial<SidebarSubMenu>): SidebarSubMenu | null {
  const label = normalizeText(item.label);
  const path = normalizeText(item.path);
  if (!label || !path) return null;
  return { label, path };
}

function normalizeSidebarMenu(menu: Partial<SidebarMenu>): SidebarMenu | null {
  const label = normalizeText(menu.label);
  const icon = normalizeText(menu.icon) || undefined;
  const children = (Array.isArray(menu.children) ? menu.children : [])
    .map((child) => normalizeSidebarSubMenu(child))
    .filter((child): child is SidebarSubMenu => child !== null);
  const path = normalizeText(menu.path);

  if (!label) return null;
  if (children.length > 0) return { label, icon, children };
  if (!path) return null;
  return { label, icon, path };
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

  return normalized.length > 0 ? normalized : cloneSidebarModules(SIDEBAR_MODULES);
}

export function loadManagedSidebarModules(): SidebarModule[] {
  if (typeof window === 'undefined') return cloneSidebarModules(SIDEBAR_MODULES);

  try {
    const raw = window.localStorage.getItem(MENU_MANAGEMENT_STORAGE_KEY);
    if (!raw) return cloneSidebarModules(SIDEBAR_MODULES);
    const parsed = JSON.parse(raw) as SidebarModule[];
    return normalizeManagedSidebarModules(parsed);
  } catch {
    return cloneSidebarModules(SIDEBAR_MODULES);
  }
}

export function saveManagedSidebarModules(modules: SidebarModule[]): SidebarModule[] {
  const normalized = normalizeManagedSidebarModules(modules);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MENU_MANAGEMENT_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(MENU_MANAGEMENT_EVENT));
  }
  return normalized;
}

export function resetManagedSidebarModules(): SidebarModule[] {
  const defaults = cloneSidebarModules(SIDEBAR_MODULES);
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
