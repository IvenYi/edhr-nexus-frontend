import { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem as MuiMenuItem,
  List, ListItemButton, ListItemIcon, ListItemText, Collapse,
  Box, Divider, Badge, Tooltip, Chip, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Dashboard, AccountTree, Storage, Settings,
  ExpandLess, ExpandMore, Notifications, Logout,
  Home, PrecisionManufacturing,
  LocalHospitalRounded, MenuRounded, ChevronLeftRounded,
} from '@mui/icons-material';
import { SIDEBAR_MODULES, type SidebarModule, type SidebarMenu } from '@/utils/constants';

// ============================================================
// Design Tokens (synced with MUI theme)
// ============================================================

const COLORS = {
  primary: '#1890ff',
  primaryLight: '#e8f4ff',
  primaryHover: '#d1e9ff',
  success: '#13ce66',
  warning: '#ffba00',
  error: '#ff4d4f',
  errorBg: '#fff1f0',
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
const FUNC_MENU_WIDTH = 202;
const TOP_NAV_HEIGHT = 60;
const TABS_BAR_HEIGHT = 50;
const HEADER_TOTAL_HEIGHT = TOP_NAV_HEIGHT + TABS_BAR_HEIGHT;

/** Map icon name strings to MUI icon components. */
const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home />,
  Dashboard: <Dashboard />,
  Storage: <Storage />,
  AccountTree: <AccountTree />,
  PrecisionManufacturing: <PrecisionManufacturing />,
  Settings: <Settings />,
};

const FALLBACK_ICON = <Settings />;

function getIcon(iconName?: string): React.ReactNode {
  return iconName ? ICON_MAP[iconName] || FALLBACK_ICON : FALLBACK_ICON;
}

// ============================================================
// Helper functions
// ============================================================

function isPathSegmentMatch(pathname: string, prefix: string): boolean {
  if (prefix === '/') return pathname === '/';
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function getModuleIdByPath(pathname: string): string {
  if (pathname === '/') return 'home';
  if (isPathSegmentMatch(pathname, '/master-data')) return 'data';
  if (isPathSegmentMatch(pathname, '/workflow')) return 'production';
  if (isPathSegmentMatch(pathname, '/system')) return 'system';
  if (isPathSegmentMatch(pathname, '/gct-edhr')) return 'gct-edhr';
  return 'home';
}

function getMenuExpansionKey(moduleId: string, menuLabel: string): string {
  return `${moduleId}::${menuLabel}`;
}

function isMenuActive(menu: SidebarMenu, pathname: string): boolean {
  if (menu.path === pathname) return true;
  if (menu.children?.some((child) => matchPath(child.path, pathname))) return true;
  return false;
}

function matchPath(menuPath: string, pathname: string): boolean {
  return isPathSegmentMatch(pathname, menuPath);
}

function getInitialExpandedMenus(moduleId: string, pathname: string): Set<string> {
  const expanded = new Set<string>();
  const module = SIDEBAR_MODULES.find((m) => m.id === moduleId);
  if (module) {
    module.menus.forEach((menu) => {
      if (menu.children && isMenuActive(menu, pathname)) {
        expanded.add(getMenuExpansionKey(moduleId, menu.label));
      }
    });
  }
  return expanded;
}

function getCurrentPageTitle(module: SidebarModule, pathname: string): string {
  for (const menu of module.menus) {
    if (menu.path && matchPath(menu.path, pathname)) return menu.label;

    const child = menu.children?.find((subMenu) => matchPath(subMenu.path, pathname));
    if (child) return child.label;
  }

  return module.label;
}

// ============================================================
// Main Layout Component
// ============================================================

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const autoModuleId = useMemo(() => getModuleIdByPath(location.pathname), [location.pathname]);

  const [activeModuleId, setActiveModuleId] = useState<string>(autoModuleId);
  const [funcMenuOpen, setFuncMenuOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    () => getInitialExpandedMenus(autoModuleId, location.pathname),
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    setActiveModuleId(autoModuleId);
    const module = SIDEBAR_MODULES.find((m) => m.id === autoModuleId);
    if (module) {
      setExpandedMenus((prev) => {
        const next = new Set(prev);
        module.menus.forEach((menu) => {
          if (menu.children && isMenuActive(menu, location.pathname)) {
            next.add(getMenuExpansionKey(autoModuleId, menu.label));
          }
        });
        return next;
      });
    }
  }, [autoModuleId, location.pathname]);

  useEffect(() => {
    setFuncMenuOpen(!isMobile);
  }, [isMobile]);

  const handleModuleClick = useCallback((moduleId: string) => {
    setActiveModuleId(moduleId);
    setFuncMenuOpen(true);
  }, []);

  const handleToggleMenu = useCallback((menuKey: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuKey)) next.delete(menuKey);
      else next.add(menuKey);
      return next;
    });
  }, []);

  const handleSubMenuClick = useCallback(
    (path: string) => {
      navigate(path);
      if (isMobile) setFuncMenuOpen(false);
    },
    [isMobile, navigate],
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : { displayName: '管理员' };

  const activeModule: SidebarModule =
    SIDEBAR_MODULES.find((m) => m.id === activeModuleId) || SIDEBAR_MODULES[0];
  const currentModuleForPath: SidebarModule =
    SIDEBAR_MODULES.find((m) => m.id === autoModuleId) || SIDEBAR_MODULES[0];
  const sidebarTotalWidth = MODULE_BAR_WIDTH + (funcMenuOpen ? FUNC_MENU_WIDTH : 0);
  const effectiveSidebarWidth = isMobile ? 0 : sidebarTotalWidth;
  const currentPageTitle = getCurrentPageTitle(currentModuleForPath, location.pathname);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ==================== Header ==================== */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          left: `${effectiveSidebarWidth}px`,
          right: 0,
          width: `calc(100% - ${effectiveSidebarWidth}px)`,
          height: TOP_NAV_HEIGHT,
          bgcolor: COLORS.funcMenuBg,
          color: COLORS.textPrimary,
          boxShadow: COLORS.shadow,
          transition: 'left 280ms cubic-bezier(0.4, 0, 0.2, 1), width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: `${TOP_NAV_HEIGHT}px !important`,
            height: TOP_NAV_HEIGHT,
            px: '20px !important',
          }}
        >
          <IconButton
            edge="start"
            onClick={() => setFuncMenuOpen((prev) => !prev)}
            sx={{
              mr: 1,
              color: COLORS.textSecondary,
              borderRadius: '8px',
              transition: 'all 150ms ease-out',
              '&:hover': {
                color: COLORS.primary,
                bgcolor: COLORS.primaryLight,
              },
            }}
          >
            {funcMenuOpen ? <ChevronLeftRounded /> : <MenuRounded />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <LocalHospitalRounded sx={{ fontSize: 28, color: COLORS.primary, mr: '10px' }} />
            <Typography variant="h6" noWrap>
              <Box component="span" sx={{ color: COLORS.primary, fontWeight: 700 }}>eDHR</Box>
              {' '}
              <Box component="span" sx={{ color: COLORS.textPrimary, fontWeight: 400 }}>系统</Box>
            </Typography>
          </Box>
          <IconButton
            sx={{
              mr: 1,
              color: COLORS.textSecondary,
              transition: 'color 150ms ease-out',
              '&:hover': { color: COLORS.primary },
            }}
          >
            <Badge
              badgeContent={0}
              sx={{ '& .MuiBadge-badge': { bgcolor: COLORS.error } }}
            >
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              '&:hover .MuiAvatar-root': {
                boxShadow: `0 0 0 2px ${COLORS.primaryLight}`,
              },
              transition: 'all 150ms ease-out',
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.success }}>
              {user.displayName?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                boxShadow: '0 4px 16px rgba(18, 28, 45, 0.12)',
                borderRadius: '10px',
                '& .MuiMenuItem-root': {
                  minHeight: 40,
                },
                '& .MuiDivider-root': {
                  borderColor: COLORS.divider,
                },
              },
            }}
          >
            <MuiMenuItem disabled>
              <Typography variant="body2">{user.displayName}</Typography>
            </MuiMenuItem>
            <Divider />
            <MuiMenuItem
              onClick={handleLogout}
              sx={{
                color: COLORS.error,
                '&:hover': {
                  bgcolor: COLORS.errorBg,
                },
              }}
            >
              <Logout fontSize="small" sx={{ mr: 1 }} />
              退出登录
            </MuiMenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ==================== Tabs Bar ==================== */}
      <Box
        sx={{
          position: 'fixed',
          top: TOP_NAV_HEIGHT,
          left: `${effectiveSidebarWidth}px`,
          right: 0,
          height: TABS_BAR_HEIGHT,
          zIndex: (theme) => theme.zIndex.drawer,
          bgcolor: COLORS.funcMenuBg,
          boxShadow: COLORS.shadow,
          px: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          transition: 'left 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Chip
          label="首页"
          onClick={() => navigate('/')}
          sx={{
            height: 32,
            borderRadius: '5px',
            bgcolor: COLORS.funcMenuBg,
            color: COLORS.textSecondary,
            border: `1px solid ${COLORS.divider}`,
            '&:hover': {
              bgcolor: COLORS.primaryLight,
              color: COLORS.primary,
            },
          }}
        />
        <Chip
          label={currentPageTitle}
          sx={{
            height: 32,
            borderRadius: '5px',
            bgcolor: COLORS.primaryLight,
            color: COLORS.primary,
            fontWeight: 500,
            border: `1px solid ${COLORS.primaryLight}`,
            '& .MuiChip-label': {
              px: '12px',
            },
          }}
        />
      </Box>

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

      {/* ==================== Module Bar ==================== */}
      <Box
        sx={{
          width: MODULE_BAR_WIDTH,
          flexShrink: 0,
          bgcolor: COLORS.sidebarDark,
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: (theme) => (isMobile ? theme.zIndex.drawer + 3 : theme.zIndex.drawer),
          display: isMobile && !funcMenuOpen ? 'none' : 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        }}
      >
        {SIDEBAR_MODULES.map((module) => {
          const isActive = activeModuleId === module.id;
          return (
            <Tooltip key={module.id} title={module.label} placement="right" arrow>
              <ListItemButton
                onClick={() => handleModuleClick(module.id)}
                sx={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 64,
                  width: '100%',
                  borderRadius: 0,
                  position: 'relative',
                  color: isActive ? COLORS.sidebarDarkText : 'hsla(0,0%,100%,.65)',
                  bgcolor: isActive ? COLORS.primary : 'transparent',
                  '&:hover': {
                    bgcolor: isActive
                      ? COLORS.primary
                      : 'rgba(255, 255, 255, 0.06)',
                    '& .MuiSvgIcon-root': {
                      transform: 'scale(1.08)',
                    },
                  },
                  '&::before': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: 32,
                        width: 3,
                        bgcolor: COLORS.sidebarDarkText,
                        borderRadius: '0 2px 2px 0',
                      }
                    : {},
                  transition: 'all 150ms ease-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    color: 'inherit',
                    mb: 0.5,
                    '& .MuiSvgIcon-root': {
                      fontSize: 22,
                      transition: 'transform 150ms ease-out',
                    },
                  }}
                >
                  {getIcon(module.icon)}
                </ListItemIcon>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    lineHeight: 1.2,
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
        <Typography
          sx={{
            color: COLORS.textDisabled,
            fontSize: 10,
            textAlign: 'center',
            mb: '12px',
          }}
        >
          v2.1
        </Typography>
      </Box>

      {/* ==================== Function Menu Bar ==================== */}
      <Box
        sx={{
          width: funcMenuOpen ? FUNC_MENU_WIDTH : 0,
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: MODULE_BAR_WIDTH,
          bottom: 0,
          zIndex: (theme) => (isMobile ? theme.zIndex.drawer + 3 : theme.zIndex.drawer - 1),
          display: isMobile && !funcMenuOpen ? 'none' : 'block',
          overflow: 'hidden',
          transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: COLORS.funcMenuBg,
          borderRight: funcMenuOpen ? `1px solid ${COLORS.divider}` : 'none',
        }}
      >
        <Box
          sx={{
            width: FUNC_MENU_WIDTH,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            pt: 0,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(0,0,0,0.12)',
              borderRadius: 2,
            },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          }}
        >
          {/* Module name label */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: '20px',
              pt: '12px',
              pb: '8px',
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: COLORS.textDisabled,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              {activeModule.label}
            </Typography>
            {isMobile && (
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
            )}
          </Box>
          <List
            disablePadding
            key={activeModule.id}
            sx={{ animation: 'fadeIn 180ms ease-out' }}
          >
            {activeModule.menus.map((menu) => {
              const menuKey = getMenuExpansionKey(activeModule.id, menu.label);
              const menuExpanded = expandedMenus.has(menuKey);
              const menuActive = isMenuActive(menu, location.pathname);

              return (
                <Box key={menu.label}>
                  <ListItemButton
                    onClick={() => {
                      if (menu.children) {
                        handleToggleMenu(menuKey);
                      } else if (menu.path) {
                        handleSubMenuClick(menu.path);
                      }
                    }}
                    sx={{
                      pl: 3,
                      pr: 2,
                      color: menuActive ? COLORS.primary : COLORS.textPrimary,
                      '&:hover': {
                        bgcolor: COLORS.primaryLight,
                      },
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    {menu.icon && (
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: 'inherit',
                          '& .MuiSvgIcon-root': { fontSize: 20 },
                        }}
                      >
                        {getIcon(menu.icon)}
                      </ListItemIcon>
                    )}
                    <ListItemText
                      primary={menu.label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: menuActive ? 600 : 400,
                      }}
                    />
                    {menu.children &&
                      (menuExpanded ? (
                        <ExpandLess sx={{ fontSize: 18 }} />
                      ) : (
                        <ExpandMore sx={{ fontSize: 18 }} />
                      ))}
                  </ListItemButton>

                  {menu.children && (
                    <Collapse in={menuExpanded} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {menu.children.map((subMenu, index) => {
                          const subActive = matchPath(subMenu.path, location.pathname);
                          return (
                            <ListItemButton
                              key={subMenu.path}
                              selected={subActive}
                              onClick={() => handleSubMenuClick(subMenu.path)}
                              sx={{
                                pl: 4,
                                pr: 2,
                                position: 'relative',
                                color: subActive ? COLORS.primary : COLORS.textSecondary,
                                bgcolor: subActive
                                  ? COLORS.primaryLight
                                  : 'transparent',
                                '&:hover': {
                                  bgcolor: subActive
                                    ? COLORS.primaryHover
                                    : COLORS.primaryLight,
                                },
                                '&.Mui-selected': {
                                  bgcolor: COLORS.primaryLight,
                                  '&:hover': {
                                    bgcolor: COLORS.primaryHover,
                                  },
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 3,
                                    height: 24,
                                    bgcolor: COLORS.primary,
                                    borderRadius: '2px',
                                  },
                                },
                                transition: 'all 150ms ease-out',
                              }}
                              style={{
                                animation: 'staggerIn 150ms ease-out both',
                                animationDelay: `${(index % 5) * 30}ms`,
                              }}
                            >
                              <ListItemText
                                primary={subMenu.label}
                                primaryTypographyProps={{
                                  fontSize: 13,
                                  fontWeight: subActive ? 500 : 400,
                                }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </List>
        </Box>
      </Box>

      {/* ==================== Main Content ==================== */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: '20px',
          mt: `${HEADER_TOTAL_HEIGHT}px`,
          ml: `${effectiveSidebarWidth}px`,
          transition: 'margin-left 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: `calc(100vh - ${HEADER_TOTAL_HEIGHT}px)`,
          bgcolor: COLORS.pageBg,
          maxWidth: '100vw',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
