import { type MouseEvent as ReactMouseEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem as MuiMenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  AccountTree,
  AppsRounded,
  ChevronLeftRounded,
  CloseRounded,
  ColorLensOutlined,
  Dashboard,
  FullscreenRounded,
  Home,
  KeyboardArrowDownRounded,
  LocalHospitalRounded,
  LockOutlined,
  Logout,
  MenuRounded,
  NavigateNextRounded,
  Notifications,
  PersonOutlineRounded,
  PrecisionManufacturing,
  RefreshRounded,
  SearchRounded,
  Settings,
  Storage,
  TranslateRounded,
} from '@mui/icons-material';
import { type SidebarMenu, type SidebarModule } from '@/utils/constants';
import { useManagedSidebarModules } from '@/utils/menuManagement';

const COLORS = {
  primary: '#1890ff',
  primaryLight: '#e8f4ff',
  primaryHover: '#d1e9ff',
  error: '#ff4d4f',
  textPrimary: '#303133',
  textSecondary: '#606266',
  textDisabled: '#909399',
  divider: '#e4e7ed',
  sidebarDark: '#282c34',
  sidebarDarkText: 'hsla(0,0%,100%,.95)',
  funcMenuBg: '#ffffff',
  pageBg: '#f6f8f9',
  shadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
};

const MODULE_BAR_WIDTH = 64;
const MODULE_ITEM_HEIGHT = 64;
const FUNC_MENU_WIDTH = 202;
const TOP_NAV_HEIGHT = 52;
const TABS_BAR_HEIGHT = 50;
const HEADER_TOTAL_HEIGHT = TOP_NAV_HEIGHT + TABS_BAR_HEIGHT;

const ICON_MAP: Record<string, ReactNode> = {
  Home: <Home />,
  Dashboard: <Dashboard />,
  Storage: <Storage />,
  AccountTree: <AccountTree />,
  PrecisionManufacturing: <PrecisionManufacturing />,
  Settings: <Settings />,
};

const FALLBACK_ICON = <Settings />;

interface StoredUser {
  displayName?: string;
  username?: string;
  permissions?: string[];
}

interface BreadcrumbItem {
  label: string;
  iconName?: string;
}

interface RenderedMenu {
  label: string;
  path?: string;
  icon?: string;
  parentLabel?: string;
  type: 'group' | 'item';
  depth: 1 | 2;
}

interface AppTab {
  label: string;
  path: string;
  iconName?: string;
  closable: boolean;
}

interface TabContextMenuState {
  mouseX: number;
  mouseY: number;
  tab: AppTab;
}

const HOME_TAB: AppTab = {
  label: '首页',
  path: '/',
  iconName: 'Home',
  closable: false,
};

const initialTabs: AppTab[] = [HOME_TAB];

function getIcon(iconName?: string): ReactNode {
  return iconName ? ICON_MAP[iconName] || FALLBACK_ICON : FALLBACK_ICON;
}

function isPathSegmentMatch(pathname: string, prefix: string): boolean {
  if (prefix === '/') return pathname === '/';
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function matchPath(menuPath: string, pathname: string): boolean {
  return isPathSegmentMatch(pathname, menuPath);
}

function getModuleIdByPath(pathname: string): string {
  if (pathname === '/') return 'home';
  if (isPathSegmentMatch(pathname, '/master-data')) return 'data';
  if (isPathSegmentMatch(pathname, '/workflow')) return 'production';
  if (isPathSegmentMatch(pathname, '/system')) return 'system';
  if (isPathSegmentMatch(pathname, '/gct-edhr')) return 'gct-edhr';
  return 'home';
}

function readStoredUser(): StoredUser {
  const userJson = localStorage.getItem('user');
  if (!userJson) return { displayName: '管理员' };
  try {
    return JSON.parse(userJson) as StoredUser;
  } catch {
    return { displayName: '管理员' };
  }
}

function inferPermissionCode(path: string): string | undefined {
  if (path === '/') return 'dashboard';
  if (path.startsWith('/gct-edhr')) return undefined;
  if (path === '/system/menu-management') return 'system.permissions';
  return path.replace(/^\//, '').replace(/\//g, '.');
}

function canAccessPath(path: string, permissionSet: Set<string>): boolean {
  if (permissionSet.size === 0) return true;
  const permissionCode = inferPermissionCode(path);
  return !permissionCode || permissionSet.has(permissionCode);
}

function filterModulesByPermissions(
  modules: SidebarModule[],
  permissionSet: Set<string>,
): SidebarModule[] {
  if (permissionSet.size === 0) return modules;

  return modules
    .map((module) => ({
      ...module,
      menus: module.menus
        .map((menu) => {
          if (menu.children) {
            const children = menu.children.filter((child) => canAccessPath(child.path, permissionSet));
            return children.length > 0 ? { ...menu, children } : null;
          }
          return menu.path && canAccessPath(menu.path, permissionSet) ? menu : null;
        })
        .filter((menu): menu is SidebarMenu => menu !== null),
    }))
    .filter((module) => module.menus.length > 0);
}

function flattenModuleMenus(menus: SidebarMenu[]): RenderedMenu[] {
  return menus.flatMap((menu) => {
    if (menu.children?.length) {
      const group: RenderedMenu = {
        label: menu.label,
        icon: menu.icon,
        type: 'group',
        depth: 1,
      };
      const children = menu.children.map(
        (child): RenderedMenu => ({
          label: child.label,
          path: child.path,
          icon: menu.icon,
          parentLabel: menu.label,
          type: 'item',
          depth: 2,
        }),
      );
      return [group, ...children];
    }

    if (menu.path) {
      return [{
        label: menu.label,
        path: menu.path,
        icon: menu.icon,
        type: 'item',
        depth: 1,
      }];
    }

    return [];
  });
}

function findRouteModule(modules: SidebarModule[], pathname: string): SidebarModule | undefined {
  return modules.find((module) => module.menus.some((menu) => {
    if (menu.path && matchPath(menu.path, pathname)) return true;
    return menu.children?.some((child) => matchPath(child.path, pathname));
  }));
}

function getBreadcrumbItems(module: SidebarModule, pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: module.label, iconName: module.icon }];

  for (const menu of module.menus) {
    if (menu.path && matchPath(menu.path, pathname)) {
      if (menu.label !== module.label) {
        items.push({ label: menu.label, iconName: menu.icon });
      }
      return items;
    }

    const child = menu.children?.find((subMenu) => matchPath(subMenu.path, pathname));
    if (child) {
      items.push({ label: menu.label, iconName: menu.icon });
      items.push({ label: child.label, iconName: menu.icon });
      return items;
    }
  }

  return items;
}

function getRouteTab(module: SidebarModule, pathname: string): AppTab {
  if (pathname === '/') return HOME_TAB;

  for (const menu of module.menus) {
    if (menu.path && matchPath(menu.path, pathname)) {
      return {
        label: menu.label,
        path: menu.path,
        iconName: menu.icon,
        closable: true,
      };
    }

    const child = menu.children?.find((subMenu) => matchPath(subMenu.path, pathname));
    if (child) {
      return {
        label: child.label,
        path: child.path,
        iconName: menu.icon,
        closable: true,
      };
    }
  }

  return {
    label: module.label,
    path: pathname,
    iconName: module.icon,
    closable: pathname !== '/',
  };
}

function getNextPathAfterClose(tabs: AppTab[], closingPath: string): string {
  const closingIndex = tabs.findIndex((tab) => tab.path === closingPath);
  const nextTabs = tabs.filter((tab) => tab.path !== closingPath || !tab.closable);
  return nextTabs[closingIndex]?.path ?? nextTabs[closingIndex - 1]?.path ?? HOME_TAB.path;
}

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const user = useMemo(() => readStoredUser(), []);
  const permissionSet = useMemo(() => new Set(user.permissions ?? []), [user.permissions]);
  const sidebarModules = useManagedSidebarModules();
  const visibleModules = useMemo(
    () => filterModulesByPermissions(sidebarModules, permissionSet),
    [permissionSet, sidebarModules],
  );
  const autoModuleId = useMemo(() => getModuleIdByPath(location.pathname), [location.pathname]);
  const [activeModuleId, setActiveModuleId] = useState(autoModuleId);
  const [funcMenuOpen, setFuncMenuOpen] = useState(true);
  const [openTabs, setOpenTabs] = useState<AppTab[]>(initialTabs);
  const [tabContextMenu, setTabContextMenu] = useState<TabContextMenuState | null>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (visibleModules.some((module) => module.id === autoModuleId)) {
      setActiveModuleId(autoModuleId);
    }
  }, [autoModuleId, visibleModules]);

  useEffect(() => {
    setFuncMenuOpen(!isMobile);
  }, [isMobile]);

  const activeModule: SidebarModule =
    visibleModules.find((module) => module.id === activeModuleId) || visibleModules[0] || sidebarModules[0];
  const currentModuleForPath: SidebarModule =
    findRouteModule(visibleModules, location.pathname) ||
    visibleModules.find((module) => module.id === autoModuleId) ||
    activeModule;
  const renderedMenus = useMemo(() => flattenModuleMenus(activeModule.menus), [activeModule]);
  const breadcrumbItems = useMemo(
    () => getBreadcrumbItems(currentModuleForPath, location.pathname),
    [currentModuleForPath, location.pathname],
  );
  const currentRouteTab = useMemo(
    () => getRouteTab(currentModuleForPath, location.pathname),
    [currentModuleForPath, location.pathname],
  );
  const sidebarTotalWidth = MODULE_BAR_WIDTH + (funcMenuOpen ? FUNC_MENU_WIDTH : 0);
  const effectiveSidebarWidth = isMobile ? 0 : sidebarTotalWidth;
  const userDisplayName = user.username || user.displayName || 'admin';

  useEffect(() => {
    setOpenTabs((prev) => {
      if (prev.some((tab) => tab.path === currentRouteTab.path)) return prev;
      return [...prev, currentRouteTab];
    });
  }, [currentRouteTab]);

  const handleModuleClick = useCallback((moduleId: string) => {
    setActiveModuleId(moduleId);
    setFuncMenuOpen(true);
  }, []);

  const handleMenuClick = useCallback(
    (path: string) => {
      navigate(path);
      if (isMobile) setFuncMenuOpen(false);
    },
    [isMobile, navigate],
  );

  const handleTabClick = useCallback(
    (tab: AppTab) => {
      navigate(tab.path);
    },
    [navigate],
  );

  const handleCloseTab = useCallback(
    (tab: AppTab, event?: ReactMouseEvent) => {
      event?.stopPropagation();
      if (!tab.closable) return;
      const nextPath = getNextPathAfterClose(openTabs, tab.path);
      setOpenTabs((prev) => prev.filter((item) => item.path !== tab.path));
      if (location.pathname === tab.path) navigate(nextPath);
    },
    [location.pathname, navigate, openTabs],
  );

  const handleTabContextMenu = useCallback((tab: AppTab, event: ReactMouseEvent<HTMLElement>) => {
    event.preventDefault();
    setTabContextMenu({ mouseX: event.clientX + 2, mouseY: event.clientY - 6, tab });
  }, []);

  const closeContextMenu = useCallback(() => {
    setTabContextMenu(null);
  }, []);

  const handleCloseOtherTabs = useCallback(() => {
    if (!tabContextMenu) return;
    const keep = tabContextMenu.tab.path === HOME_TAB.path ? [HOME_TAB] : [HOME_TAB, tabContextMenu.tab];
    setOpenTabs(keep);
    if (!keep.some((tab) => tab.path === location.pathname)) navigate(tabContextMenu.tab.path);
    closeContextMenu();
  }, [closeContextMenu, location.pathname, navigate, tabContextMenu]);

  const handleCloseLeftTabs = useCallback(() => {
    if (!tabContextMenu) return;
    const index = openTabs.findIndex((tab) => tab.path === tabContextMenu.tab.path);
    const nextTabs = openTabs.filter((tab, tabIndex) => !tab.closable || tabIndex >= index);
    setOpenTabs(nextTabs);
    if (!nextTabs.some((tab) => tab.path === location.pathname)) navigate(tabContextMenu.tab.path);
    closeContextMenu();
  }, [closeContextMenu, location.pathname, navigate, openTabs, tabContextMenu]);

  const handleCloseRightTabs = useCallback(() => {
    if (!tabContextMenu) return;
    const index = openTabs.findIndex((tab) => tab.path === tabContextMenu.tab.path);
    const nextTabs = openTabs.filter((tab, tabIndex) => !tab.closable || tabIndex <= index);
    setOpenTabs(nextTabs);
    if (!nextTabs.some((tab) => tab.path === location.pathname)) navigate(tabContextMenu.tab.path);
    closeContextMenu();
  }, [closeContextMenu, location.pathname, navigate, openTabs, tabContextMenu]);

  const handleCloseAllTabs = useCallback(() => {
    setOpenTabs([HOME_TAB]);
    navigate(HOME_TAB.path);
    closeContextMenu();
  }, [closeContextMenu, navigate]);

  const handleRefreshCurrentTab = useCallback(() => {
    window.location.reload();
  }, []);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void document.documentElement.requestFullscreen?.();
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  const headerIconButtonSx = {
    width: 28,
    height: 28,
    color: '#666',
    borderRadius: '5px',
    '& .MuiSvgIcon-root': { fontSize: 18 },
    '&:hover': {
      color: COLORS.primary,
      bgcolor: COLORS.primaryLight,
    },
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.pageBg }}>
      <Box
        data-app-shell-header="true"
        sx={{
          position: 'fixed',
          top: 0,
          left: `${effectiveSidebarWidth}px`,
          right: 0,
          width: `calc(100vw - ${effectiveSidebarWidth}px)`,
          height: HEADER_TOTAL_HEIGHT,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: COLORS.funcMenuBg,
          boxShadow: COLORS.shadow,
          overflow: 'hidden',
          transition: 'left 220ms cubic-bezier(0.4, 0, 0.2, 1), width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          data-app-top-breadcrumb-bar="true"
          sx={{
            height: TOP_NAV_HEIGHT,
            px: '16px',
            bgcolor: COLORS.funcMenuBg,
            borderBottom: `1px solid ${COLORS.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <Tooltip title={funcMenuOpen ? '收起菜单' : '展开菜单'} arrow>
              <IconButton
                aria-label={funcMenuOpen ? '收起菜单' : '展开菜单'}
                onClick={() => setFuncMenuOpen((prev) => !prev)}
                sx={{ ...headerIconButtonSx, mr: '14px' }}
              >
                {funcMenuOpen ? <ChevronLeftRounded /> : <MenuRounded />}
              </IconButton>
            </Tooltip>
            <Box aria-label="当前位置" sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return (
                  <Box key={`${item.label}-${index}`} sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: isLast ? COLORS.textSecondary : COLORS.textDisabled,
                        fontWeight: isLast ? 500 : 400,
                        minWidth: 0,
                      }}
                    >
                      <Box component="span" sx={{ display: 'inline-flex', '& .MuiSvgIcon-root': { fontSize: 16 } }}>
                        {getIcon(item.iconName)}
                      </Box>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: 13,
                          color: 'inherit',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: { xs: 96, md: 180 },
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                    {!isLast && <NavigateNextRounded sx={{ mx: '8px', color: COLORS.textDisabled, fontSize: 16 }} />}
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <Tooltip title="锁屏" arrow><IconButton sx={headerIconButtonSx}><LockOutlined /></IconButton></Tooltip>
            <Tooltip title="搜索" arrow><IconButton sx={headerIconButtonSx}><SearchRounded /></IconButton></Tooltip>
            <Tooltip title="通知" arrow>
              <IconButton sx={headerIconButtonSx}>
                <Badge
                  badgeContent={4}
                  sx={{
                    '& .MuiBadge-badge': {
                      minWidth: 16,
                      height: 16,
                      fontSize: 10,
                      bgcolor: COLORS.error,
                      color: '#fff',
                    },
                  }}
                >
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="全屏" arrow><IconButton onClick={handleFullscreen} sx={headerIconButtonSx}><FullscreenRounded /></IconButton></Tooltip>
            <Tooltip title="语言" arrow><IconButton sx={headerIconButtonSx}><TranslateRounded /></IconButton></Tooltip>
            <Tooltip title="主题" arrow><IconButton sx={headerIconButtonSx}><ColorLensOutlined /></IconButton></Tooltip>
            <Tooltip title="刷新" arrow><IconButton onClick={handleRefreshCurrentTab} sx={headerIconButtonSx}><RefreshRounded /></IconButton></Tooltip>
            <Box
              component="button"
              type="button"
              onClick={(event) => setUserAnchorEl(event.currentTarget)}
              sx={{
                ml: '4px',
                p: 0,
                border: 0,
                bgcolor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: 40,
                cursor: 'pointer',
                color: COLORS.textSecondary,
                font: 'inherit',
                '&:hover': { color: COLORS.primary },
              }}
            >
              <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: '#c9a24f', color: '#fff', border: '2px solid #f3dfaa' }}>
                {(user.displayName || user.username || 'A').charAt(0)}
              </Avatar>
              <Typography component="span" sx={{ fontSize: 13, color: 'inherit' }}>{userDisplayName}</Typography>
              <KeyboardArrowDownRounded sx={{ fontSize: 16, color: 'inherit' }} />
            </Box>
            <Menu anchorEl={userAnchorEl} open={Boolean(userAnchorEl)} onClose={() => setUserAnchorEl(null)}>
              <MuiMenuItem disabled><Typography variant="body2">{user.displayName || userDisplayName}</Typography></MuiMenuItem>
              <Divider />
              <MuiMenuItem onClick={handleLogout} sx={{ color: COLORS.error }}><Logout fontSize="small" sx={{ mr: 1 }} />退出登录</MuiMenuItem>
            </Menu>
          </Box>
        </Box>

        <Box
          data-app-tabs-bar="true"
          sx={{
            height: TABS_BAR_HEIGHT,
            px: '20px',
            bgcolor: COLORS.funcMenuBg,
            borderBottom: `1px solid ${COLORS.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', minWidth: 0, overflowX: 'auto', overflowY: 'hidden', '&::-webkit-scrollbar': { height: 0 } }}>
            {openTabs.map((tab) => {
              const isActive = tab.path === location.pathname;
              return (
                <Box
                  key={tab.path}
                  role="button"
                  onClick={() => handleTabClick(tab)}
                  onContextMenu={(event) => handleTabContextMenu(tab, event)}
                  data-app-tab-path={tab.path}
                  sx={{
                    height: isActive ? 40 : 34,
                    px: isActive ? '20px' : '16px',
                    mr: isActive ? '-2px' : '10px',
                    borderRadius: '5px 5px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    flexShrink: 0,
                    color: isActive ? COLORS.primary : COLORS.textPrimary,
                    bgcolor: isActive ? COLORS.primaryLight : 'transparent',
                    fontSize: 14,
                    fontWeight: isActive ? 500 : 400,
                    cursor: 'pointer',
                    '& .MuiSvgIcon-root': { fontSize: 16 },
                    '&:hover': { color: COLORS.primary, bgcolor: COLORS.primaryLight },
                  }}
                >
                  {getIcon(tab.iconName)}
                  <Typography component="span" sx={{ fontSize: 14, color: 'inherit', whiteSpace: 'nowrap' }}>{tab.label}</Typography>
                  {tab.closable && (
                    <IconButton
                      aria-label="关闭当前标签"
                      size="small"
                      onClick={(event) => handleCloseTab(tab, event)}
                      sx={{ ml: '2px', width: 18, height: 18, color: 'inherit', '& .MuiSvgIcon-root': { fontSize: 14 } }}
                    >
                      <CloseRounded />
                    </IconButton>
                  )}
                </Box>
              );
            })}
          </Box>
          <Tooltip title="标签操作" arrow>
            <IconButton
              sx={{ ...headerIconButtonSx, color: COLORS.textDisabled }}
              onClick={(event) => setTabContextMenu({ mouseX: event.clientX, mouseY: event.clientY, tab: currentRouteTab })}
            >
              <AppsRounded />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Menu
        open={Boolean(tabContextMenu)}
        onClose={closeContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          tabContextMenu
            ? { top: tabContextMenu.mouseY, left: tabContextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            minWidth: 150,
            borderRadius: '5px',
            boxShadow: '0 6px 18px rgba(18, 28, 45, 0.16)',
            border: `1px solid ${COLORS.divider}`,
          },
        }}
      >
        <MuiMenuItem onClick={handleRefreshCurrentTab}><RefreshRounded fontSize="small" sx={{ mr: 1 }} />刷新</MuiMenuItem>
        <MuiMenuItem onClick={handleCloseOtherTabs}><CloseRounded fontSize="small" sx={{ mr: 1 }} />关闭其他</MuiMenuItem>
        <MuiMenuItem onClick={handleCloseLeftTabs}><ChevronLeftRounded fontSize="small" sx={{ mr: 1 }} />关闭左侧</MuiMenuItem>
        <MuiMenuItem onClick={handleCloseRightTabs}><NavigateNextRounded fontSize="small" sx={{ mr: 1 }} />关闭右侧</MuiMenuItem>
        <MuiMenuItem onClick={handleCloseAllTabs}><CloseRounded fontSize="small" sx={{ mr: 1 }} />关闭全部</MuiMenuItem>
      </Menu>

      {isMobile && funcMenuOpen && (
        <Box
          data-mobile-sidebar-backdrop="true"
          onClick={() => setFuncMenuOpen(false)}
          sx={{
            position: 'fixed',
            top: 0,
            left: `${sidebarTotalWidth}px`,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.drawer + 2,
            bgcolor: 'rgba(0, 0, 0, 0.24)',
          }}
        />
      )}

      <Box
        data-app-module-rail="true"
        sx={{
          width: MODULE_BAR_WIDTH,
          flexShrink: 0,
          bgcolor: COLORS.sidebarDark,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          height: '100vh',
          zIndex: (theme) => (isMobile ? theme.zIndex.drawer + 3 : theme.zIndex.drawer),
          display: isMobile && !funcMenuOpen ? 'none' : 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.06)',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.sidebarDarkText,
          }}
        >
          <LocalHospitalRounded sx={{ fontSize: 30 }} />
        </Box>

        {visibleModules.map((module) => {
          const isActive = activeModule.id === module.id;
          return (
            <Tooltip key={module.id} title={module.label} placement="right" arrow>
              <ListItemButton
                onClick={() => handleModuleClick(module.id)}
                sx={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 54,
                  height: MODULE_ITEM_HEIGHT,
                  minHeight: MODULE_ITEM_HEIGHT,
                  flex: '0 0 auto',
                  mx: '5px',
                  mb: '8px',
                  p: 0,
                  borderRadius: '4px',
                  color: isActive ? COLORS.sidebarDarkText : 'hsla(0,0%,100%,.78)',
                  bgcolor: isActive ? COLORS.primary : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? COLORS.primary : 'rgba(255, 255, 255, 0.08)',
                  },
                  transition: 'background-color 150ms ease-out, color 150ms ease-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    color: 'inherit',
                    mb: '4px',
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                  }}
                >
                  {getIcon(module.icon)}
                </ListItemIcon>
                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.15,
                    fontWeight: isActive ? 600 : 500,
                    textAlign: 'center',
                    color: 'inherit',
                  }}
                >
                  {module.label}
                </Typography>
              </ListItemButton>
            </Tooltip>
          );
        })}

        <Box sx={{ flexGrow: 1 }} />
        <Typography sx={{ color: COLORS.textDisabled, fontSize: 10, textAlign: 'center', mb: '12px' }}>v2.1</Typography>
      </Box>

      <Box
        data-app-function-menu="true"
        sx={{
          width: funcMenuOpen ? FUNC_MENU_WIDTH : 0,
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: MODULE_BAR_WIDTH,
          bottom: 0,
          height: '100vh',
          zIndex: (theme) => (isMobile ? theme.zIndex.drawer + 3 : theme.zIndex.drawer - 1),
          display: isMobile && !funcMenuOpen ? 'none' : 'block',
          overflow: 'hidden',
          transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: COLORS.funcMenuBg,
          borderRight: funcMenuOpen ? `1px solid ${COLORS.divider}` : 'none',
          boxShadow: funcMenuOpen ? '2px 0 8px rgba(0, 0, 0, 0.04)' : 'none',
        }}
      >
        <Box
          sx={{
            width: FUNC_MENU_WIDTH,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            bgcolor: COLORS.funcMenuBg,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(0,0,0,0.12)',
              borderRadius: 2,
            },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          }}
        >
          <Box
            sx={{
              height: 58,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: '12px',
              color: '#515a6e',
              fontSize: 20,
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            eDHR 系统
          </Box>

          <Box
            sx={{
              mx: '14px',
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: `1px solid ${COLORS.divider}`,
              borderBottom: `1px solid ${COLORS.divider}`,
            }}
          >
            <Typography sx={{ color: COLORS.textPrimary, fontSize: 15, fontWeight: 500 }}>{activeModule.label}</Typography>
          </Box>

          {isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pt: 1 }}>
              <IconButton
                data-mobile-sidebar-close="true"
                size="small"
                aria-label="关闭侧栏"
                onClick={() => setFuncMenuOpen(false)}
                sx={{
                  color: COLORS.textSecondary,
                  '&:hover': {
                    color: COLORS.primary,
                    bgcolor: COLORS.primaryLight,
                  },
                }}
              >
                <ChevronLeftRounded fontSize="small" />
              </IconButton>
            </Box>
          )}

          <List disablePadding key={activeModule.id} sx={{ py: '12px', px: '10px' }}>
            {renderedMenus.map((menu) => {
              if (menu.type === 'group') {
                return (
                  <Box
                    key={`group-${menu.label}`}
                    data-sidebar-menu-level={menu.depth}
                    sx={{
                      minHeight: 36,
                      mt: 1,
                      px: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: COLORS.textDisabled,
                    }}
                  >
                    <Box sx={{ display: 'inline-flex', '& .MuiSvgIcon-root': { fontSize: 16 } }}>
                      {getIcon(menu.icon)}
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {menu.label}
                    </Typography>
                  </Box>
                );
              }

              const menuPath = menu.path;
              if (!menuPath) return null;

              const menuActive = matchPath(menuPath, location.pathname);
              return (
                <ListItemButton
                  key={menuPath}
                  data-sidebar-menu-level={menu.depth}
                  selected={menuActive}
                  onClick={() => handleMenuClick(menuPath)}
                  sx={{
                    minHeight: menu.depth === 2 ? 38 : 50,
                    mb: '4px',
                    pl: menu.depth === 2 ? '34px' : '18px',
                    pr: '18px',
                    borderRadius: '4px',
                    color: menuActive ? COLORS.primary : COLORS.textPrimary,
                    bgcolor: menuActive ? COLORS.primaryLight : 'transparent',
                    '&:hover': {
                      bgcolor: menuActive ? COLORS.primaryHover : COLORS.primaryLight,
                      color: COLORS.primary,
                    },
                    '&.Mui-selected': {
                      bgcolor: COLORS.primaryLight,
                      color: COLORS.primary,
                      '&:hover': {
                        bgcolor: COLORS.primaryHover,
                      },
                    },
                  }}
                >
                  {menu.depth === 1 ? (
                    <ListItemIcon
                      sx={{
                        minWidth: 28,
                        color: 'inherit',
                        '& .MuiSvgIcon-root': { fontSize: 17 },
                      }}
                    >
                      {getIcon(menu.icon)}
                    </ListItemIcon>
                  ) : (
                    <Box
                      aria-hidden
                      sx={{
                        width: 6,
                        height: 6,
                        mr: '12px',
                        borderRadius: '50%',
                        bgcolor: menuActive ? COLORS.primary : '#c0c4cc',
                        flex: '0 0 auto',
                      }}
                    />
                  )}
                  <ListItemText
                    primary={menu.label}
                    primaryTypographyProps={{
                      noWrap: true,
                      title: menu.parentLabel ? `${menu.parentLabel} / ${menu.label}` : menu.label,
                      fontSize: menu.depth === 2 ? 13 : 14,
                      fontWeight: menuActive ? 500 : 400,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100vw - ${effectiveSidebarWidth}px)`,
          maxWidth: `calc(100vw - ${effectiveSidebarWidth}px)`,
          minWidth: 0,
          padding: '20px',
          mt: `${HEADER_TOTAL_HEIGHT}px`,
          ml: `${effectiveSidebarWidth}px`,
          transition: 'margin-left 220ms cubic-bezier(0.4, 0, 0.2, 1), width 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: `calc(100vh - ${HEADER_TOTAL_HEIGHT}px)`,
          bgcolor: COLORS.pageBg,
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
