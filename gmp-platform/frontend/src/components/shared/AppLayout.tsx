import { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem as MuiMenuItem,
  List, ListItemButton, ListItemIcon, ListItemText, Collapse,
  Box, Divider, Badge, Tooltip,
} from '@mui/material';
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
  primary: '#1565C0',
  primaryLight: 'rgba(21, 101, 192, 0.08)',
  primaryHover: 'rgba(21, 101, 192, 0.12)',
  secondary: '#00897B',
  error: '#C62828',
  errorBg: 'rgba(198, 40, 40, 0.06)',
  textPrimary: '#1A2332',
  textSecondary: '#5A6878',
  textDisabled: '#8E9BAF',
  divider: '#E2E6EC',
  sidebarDark: '#121C2D',
  sidebarActiveBg: 'rgba(21, 101, 192, 0.18)',
  sidebarActiveHover: 'rgba(21, 101, 192, 0.26)',
  funcMenuBg: '#F5F7FA',
};

const MODULE_BAR_WIDTH = 72;
const FUNC_MENU_WIDTH = 220;
const HEADER_HEIGHT = 56;

/** Map icon name strings to MUI icon components. */
const ICON_MAP: Record<string, React.ReactNode> = {
  Home: <Home />,
  Dashboard: <Dashboard />,
  Storage: <Storage />,
  AccountTree: <AccountTree />,
  PrecisionManufacturing: <PrecisionManufacturing />,
  Settings: <Settings />,
};

// ============================================================
// Helper functions
// ============================================================

function getModuleIdByPath(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/master-data')) return 'data';
  if (pathname.startsWith('/workflow')) return 'production';
  if (pathname.startsWith('/system')) return 'system';
  return 'home';
}

function isMenuActive(menu: SidebarMenu, pathname: string): boolean {
  if (menu.path === pathname) return true;
  if (menu.children?.some((child) => matchPath(child.path, pathname))) return true;
  return false;
}

function matchPath(menuPath: string, pathname: string): boolean {
  if (menuPath === '/') return pathname === '/';
  return pathname.startsWith(menuPath);
}

function getInitialExpandedMenus(moduleId: string, pathname: string): Set<string> {
  const expanded = new Set<string>();
  const module = SIDEBAR_MODULES.find((m) => m.id === moduleId);
  if (module) {
    module.menus.forEach((menu) => {
      if (menu.children && isMenuActive(menu, pathname)) {
        expanded.add(menu.label);
      }
    });
  }
  return expanded;
}

// ============================================================
// Main Layout Component
// ============================================================

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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
            next.add(menu.label);
          }
        });
        return next;
      });
    }
  }, [autoModuleId, location.pathname]);

  const handleModuleClick = useCallback((moduleId: string) => {
    setActiveModuleId(moduleId);
    setFuncMenuOpen(true);
  }, []);

  const handleToggleMenu = useCallback((menuLabel: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuLabel)) next.delete(menuLabel);
      else next.add(menuLabel);
      return next;
    });
  }, []);

  const handleSubMenuClick = useCallback(
    (path: string) => navigate(path),
    [navigate],
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
  const sidebarTotalWidth = MODULE_BAR_WIDTH + (funcMenuOpen ? FUNC_MENU_WIDTH : 0);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ==================== Header ==================== */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ minHeight: `${HEADER_HEIGHT}px !important` }}>
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
            <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.secondary }}>
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

      {/* ==================== Module Bar ==================== */}
      <Box
        sx={{
          width: MODULE_BAR_WIDTH,
          flexShrink: 0,
          bgcolor: COLORS.sidebarDark,
          position: 'fixed',
          top: HEADER_HEIGHT,
          left: 0,
          bottom: 0,
          zIndex: 1200,
          display: 'flex',
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
                  color: isActive ? '#FFFFFF' : COLORS.textDisabled,
                  bgcolor: isActive ? COLORS.sidebarActiveBg : 'transparent',
                  '&:hover': {
                    bgcolor: isActive
                      ? COLORS.sidebarActiveHover
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
                        bgcolor: COLORS.primary,
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
                  {ICON_MAP[module.icon] || <Settings />}
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
          top: HEADER_HEIGHT,
          left: MODULE_BAR_WIDTH,
          bottom: 0,
          zIndex: 1199,
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
          <Typography
            sx={{
              fontSize: 12,
              color: COLORS.textDisabled,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              px: '20px',
              pt: '12px',
              pb: '8px',
            }}
          >
            {activeModule.label}
          </Typography>
          <List
            disablePadding
            key={activeModule.id}
            sx={{ animation: 'fadeIn 180ms ease-out' }}
          >
            {activeModule.menus.map((menu) => {
              const menuExpanded = expandedMenus.has(menu.label);
              const menuActive = isMenuActive(menu, location.pathname);

              return (
                <Box key={menu.label}>
                  <ListItemButton
                    onClick={() => {
                      if (menu.children) {
                        handleToggleMenu(menu.label);
                      } else if (menu.path) {
                        navigate(menu.path);
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
                        {ICON_MAP[menu.icon] || <Settings />}
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
          p: 3,
          mt: `${HEADER_HEIGHT}px`,
          ml: `${sidebarTotalWidth}px`,
          transition: 'margin-left 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          bgcolor: 'background.default',
          maxWidth: '100vw',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
