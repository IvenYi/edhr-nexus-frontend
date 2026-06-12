import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, RestartAlt, Save, SubdirectoryArrowRight } from '@mui/icons-material';
import type { SidebarMenu, SidebarModule, SidebarSubMenu } from '@/utils/constants';
import {
  MAX_MENU_CHILDREN_DEPTH,
  loadManagedSidebarModules,
  resetManagedSidebarModules,
  saveManagedSidebarModules,
} from '@/utils/menuManagement';

const fieldSx = {
  '& .MuiInputBase-root': {
    height: 40,
  },
};

function createModuleId(modules: SidebarModule[]): string {
  const usedIds = new Set(modules.map((module) => module.id));
  let index = modules.length + 1;
  let id = `custom-module-${index}`;
  while (usedIds.has(id)) {
    index += 1;
    id = `custom-module-${index}`;
  }
  return id;
}

function validateModules(modules: SidebarModule[]): string {
  if (modules.length === 0) return '至少保留一个系统模块';

  const moduleIds = new Set<string>();
  for (const module of modules) {
    if (!module.id.trim()) return '模块编码不能为空';
    if (!module.label.trim()) return '模块名称不能为空';
    if (moduleIds.has(module.id)) return `模块编码 ${module.id} 重复`;
    moduleIds.add(module.id);

    if (module.menus.length === 0) return `${module.label} 至少保留一个菜单`;
    for (const menu of module.menus) {
      if (!menu.label.trim()) return `${module.label} 下存在未填写名称的一级菜单`;
      const children = menu.children ?? [];
      if (children.length === 0 && !menu.path?.trim()) return `${menu.label} 需要填写路由地址`;
      for (const child of children) {
        if (!child.label.trim()) return `${menu.label} 下存在未填写名称的二级菜单`;
        if (!child.path.trim()) return `${child.label || '二级菜单'} 需要填写路由地址`;
      }
    }
  }

  return '';
}

export default function MenuManagementPage() {
  const [modules, setModules] = useState<SidebarModule[]>(() => loadManagedSidebarModules());
  const [selectedModuleId, setSelectedModuleId] = useState('system');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const selectedModule = useMemo(
    () => modules.find((module) => module.id === selectedModuleId) ?? modules[0],
    [modules, selectedModuleId],
  );

  useEffect(() => {
    if (!selectedModule && modules[0]) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModule]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const updateSelectedModule = (updater: (module: SidebarModule) => SidebarModule) => {
    if (!selectedModule) return;
    setModules((current) => current.map((module) => (module.id === selectedModule.id ? updater(module) : module)));
  };

  const addModule = () => {
    setModules((current) => {
      const id = createModuleId(current);
      const nextModule: SidebarModule = {
        id,
        label: '新模块',
        icon: 'Settings',
        menus: [{ label: '新菜单', icon: 'Settings', path: '/system/menu-management' }],
      };
      setSelectedModuleId(id);
      return [...current, nextModule];
    });
  };

  const updateModule = (fields: Partial<Pick<SidebarModule, 'label' | 'icon'>>) => {
    updateSelectedModule((module) => ({ ...module, ...fields }));
  };

  const deleteModule = () => {
    if (!selectedModule) return;
    if (modules.length <= 1) {
      showSnackbar('至少保留一个系统模块', 'error');
      return;
    }
    const nextModules = modules.filter((module) => module.id !== selectedModule.id);
    setModules(nextModules);
    setSelectedModuleId(nextModules[0]?.id ?? '');
  };

  const addRootMenu = () => {
    updateSelectedModule((module) => ({
      ...module,
      menus: [
        ...module.menus,
        { label: '新菜单', icon: 'Settings', path: '/system/menu-management' },
      ],
    }));
  };

  const updateRootMenu = (rootIndex: number, fields: Partial<SidebarMenu>) => {
    updateSelectedModule((module) => ({
      ...module,
      menus: module.menus.map((menu, index) => (index === rootIndex ? { ...menu, ...fields } : menu)),
    }));
  };

  const deleteRootMenu = (rootIndex: number) => {
    updateSelectedModule((module) => ({
      ...module,
      menus: module.menus.filter((_, index) => index !== rootIndex),
    }));
  };

  const addChildMenu = (rootIndex: number) => {
    updateSelectedModule((module) => ({
      ...module,
      menus: module.menus.map((menu, index) => {
        if (index !== rootIndex) return menu;
        const children = menu.children ?? [];
        return {
          label: menu.label,
          icon: menu.icon,
          children: [
            ...children,
            { label: '二级菜单', path: '/system/menu-management' },
          ],
        };
      }),
    }));
  };

  const updateChildMenu = (rootIndex: number, childIndex: number, fields: Partial<SidebarSubMenu>) => {
    updateSelectedModule((module) => ({
      ...module,
      menus: module.menus.map((menu, index) => {
        if (index !== rootIndex) return menu;
        const children = menu.children ?? [];
        return {
          ...menu,
          children: children.map((child, currentChildIndex) => (
            currentChildIndex === childIndex ? { ...child, ...fields } : child
          )),
        };
      }),
    }));
  };

  const deleteChildMenu = (rootIndex: number, childIndex: number) => {
    updateSelectedModule((module) => ({
      ...module,
      menus: module.menus.map((menu, index) => {
        if (index !== rootIndex) return menu;
        const children = (menu.children ?? []).filter((_, currentChildIndex) => currentChildIndex !== childIndex);
        return children.length > 0
          ? { ...menu, children }
          : { label: menu.label, icon: menu.icon, path: menu.path || '/system/menu-management' };
      }),
    }));
  };

  const handleSave = () => {
    const validationError = validateModules(modules);
    if (validationError) {
      showSnackbar(validationError, 'error');
      return;
    }

    const savedModules = saveManagedSidebarModules(modules);
    setModules(savedModules);
    showSnackbar('菜单配置已保存', 'success');
  };

  const handleReset = () => {
    const defaultModules = resetManagedSidebarModules();
    setModules(defaultModules);
    setSelectedModuleId(defaultModules.find((module) => module.id === 'system')?.id ?? defaultModules[0]?.id ?? '');
    showSnackbar('菜单配置已恢复默认', 'success');
  };

  return (
    <Box
      data-menu-management-page
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '260px minmax(0, 1fr)' },
        gridTemplateRows: { xs: '220px minmax(0, 1fr)', lg: 'minmax(0, 1fr)' },
        gap: 2,
        height: 'calc(100vh - 142px)',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 48, px: 2, borderBottom: '1px solid #e4e7ed' }}>
          <Typography sx={{ fontWeight: 600, color: '#303133' }}>系统模块</Typography>
          <Tooltip title="新增模块" arrow>
            <IconButton size="small" color="primary" onClick={addModule} aria-label="新增模块">
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack spacing={0.5} sx={{ p: 1, flex: 1, minHeight: 0, overflow: 'auto' }}>
          {modules.map((module) => {
            const selected = module.id === selectedModule?.id;
            return (
              <Button
                key={module.id}
                fullWidth
                variant={selected ? 'contained' : 'text'}
                onClick={() => setSelectedModuleId(module.id)}
                sx={{
                  justifyContent: 'flex-start',
                  minHeight: 38,
                  color: selected ? '#fff' : '#303133',
                }}
              >
                {module.label}
              </Button>
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 48, px: 2, borderBottom: '1px solid #e4e7ed' }}>
          <Typography sx={{ fontWeight: 600, color: '#303133' }}>菜单管理</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RestartAlt />} onClick={handleReset}>重置</Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave}>保存</Button>
          </Stack>
        </Stack>

        <Stack spacing={2} sx={{ p: 2, flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <Alert severity="info">
            模块下菜单支持 {MAX_MENU_CHILDREN_DEPTH} 级，不能超过 2 级。
          </Alert>

          {selectedModule ? (
            <>
              <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, p: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
                  <TextField label="模块名称" value={selectedModule.label} onChange={(event) => updateModule({ label: event.target.value })} sx={{ ...fieldSx, flex: 1 }} />
                  <TextField label="模块图标" value={selectedModule.icon} onChange={(event) => updateModule({ icon: event.target.value })} sx={{ ...fieldSx, flex: 1 }} />
                  <Button color="error" variant="outlined" startIcon={<Delete />} onClick={deleteModule}>删除模块</Button>
                </Stack>
              </Box>

              <Box sx={{ border: '1px solid #e4e7ed', borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ minHeight: 46, px: 2, bgcolor: '#f5f7fa', borderBottom: '1px solid #e4e7ed' }}>
                  <Typography sx={{ fontWeight: 600, color: '#303133' }}>模块菜单</Typography>
                  <Button size="small" variant="contained" startIcon={<Add />} onClick={addRootMenu}>新增一级菜单</Button>
                </Stack>

                <Stack data-menu-management-menu-scroll divider={<Divider />} sx={{ p: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
                  {selectedModule.menus.length === 0 ? (
                    <Box sx={{ py: 6, color: '#909399', textAlign: 'center' }}>暂无菜单</Box>
                  ) : selectedModule.menus.map((menu, rootIndex) => {
                    const children = menu.children ?? [];
                    return (
                      <Box key={`root-menu-${rootIndex}`} sx={{ py: 1.5 }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
                          <TextField label="一级菜单名称" value={menu.label} onChange={(event) => updateRootMenu(rootIndex, { label: event.target.value })} sx={{ ...fieldSx, flex: 1 }} />
                          <TextField label="图标" value={menu.icon ?? ''} onChange={(event) => updateRootMenu(rootIndex, { icon: event.target.value })} sx={{ ...fieldSx, flex: 1 }} />
                          <TextField
                            label="路由地址"
                            value={children.length > 0 ? '' : menu.path ?? ''}
                            disabled={children.length > 0}
                            placeholder={children.length > 0 ? '存在二级菜单时无需填写' : '/system/example'}
                            onChange={(event) => updateRootMenu(rootIndex, { path: event.target.value })}
                            sx={{ ...fieldSx, flex: 1.4 }}
                          />
                          <Button variant="outlined" startIcon={<SubdirectoryArrowRight />} onClick={() => addChildMenu(rootIndex)}>
                            添加二级菜单
                          </Button>
                          <IconButton color="error" onClick={() => deleteRootMenu(rootIndex)} aria-label="删除一级菜单">
                            <Delete />
                          </IconButton>
                        </Stack>

                        {children.length > 0 ? (
                          <Stack spacing={1} sx={{ mt: 1.5, ml: { xs: 0, md: 3 }, pl: { xs: 0, md: 2 }, borderLeft: { xs: 'none', md: '2px solid #e4e7ed' } }}>
                            {children.map((child, childIndex) => (
                              <Stack
                                key={`child-menu-${rootIndex}-${childIndex}`}
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={1.5}
                                alignItems={{ xs: 'stretch', md: 'center' }}
                              >
                                <TextField
                                  label="二级菜单"
                                  value={child.label}
                                  onChange={(event) => updateChildMenu(rootIndex, childIndex, { label: event.target.value })}
                                  sx={{ ...fieldSx, flex: 1 }}
                                />
                                <TextField
                                  label="路由地址"
                                  value={child.path}
                                  onChange={(event) => updateChildMenu(rootIndex, childIndex, { path: event.target.value })}
                                  sx={{ ...fieldSx, flex: 1.4 }}
                                />
                                <IconButton color="error" onClick={() => deleteChildMenu(rootIndex, childIndex)} aria-label="删除二级菜单">
                                  <Delete />
                                </IconButton>
                              </Stack>
                            ))}
                          </Stack>
                        ) : null}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </>
          ) : (
            <Box sx={{ py: 8, textAlign: 'center', color: '#909399' }}>暂无模块</Box>
          )}
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
