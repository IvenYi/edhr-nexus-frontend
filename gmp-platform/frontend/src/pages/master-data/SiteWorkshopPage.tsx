import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Button, List, ListItem, ListItemText, Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import client from '@/api/client';

interface Site { id: number; code: string; name: string; }
interface Workshop { id: number; code: string; name: string; siteId: number; type: string; }
interface ProductionLine { id: number; code: string; name: string; workshopId: number; type: string; }

export default function SiteWorkshopPage() {
  const queryClient = useQueryClient();
  const [expandedSites, setExpandedSites] = useState<Set<number>>(new Set());
  const [expandedWorkshops, setExpandedWorkshops] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '' });
  const [dialogTitle, setDialogTitle] = useState('');
  const [createBody, setCreateBody] = useState<Record<string, unknown>>({});
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: number; name?: string } | null>(null);

  const { data: sites, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => { const res = await client.get('/identity/sites', { params: { size: 100 } }); return res.data.data.content as Site[]; },
  });

  const { data: workshops } = useQuery({
    queryKey: ['workshops'],
    queryFn: async () => { const res = await client.get('/identity/departments', { params: { type: 'WORKSHOP', size: 100 } }); return res.data.data.content as Workshop[]; },
    enabled: !!sites?.length,
  });

  const { data: lines } = useQuery({
    queryKey: ['production-lines'],
    queryFn: async () => { const res = await client.get('/identity/departments', { params: { type: 'PRODUCTION_LINE', size: 100 } }); return res.data.data.content as ProductionLine[]; },
    enabled: !!workshops?.length,
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      if (body.type === 'site') return client.post('/identity/sites', body);
      return client.post('/identity/departments', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
      queryClient.invalidateQueries({ queryKey: ['production-lines'] });
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (info: { type: string; id: number }) => {
      if (info.type === 'site') return client.delete(`/identity/sites/${info.id}`);
      return client.delete(`/identity/departments/${info.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
      queryClient.invalidateQueries({ queryKey: ['production-lines'] });
      setDeleteTarget(null);
    },
  });

  const toggleSite = (id: number) => {
    setExpandedSites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleWorkshop = (id: number) => {
    setExpandedWorkshops(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const getDeleteMessage = () => {
    if (!deleteTarget) return '';
    switch (deleteTarget.type) {
      case 'site': return `确定删除工厂「${deleteTarget.name}」及其下属所有车间和产线吗？`;
      case 'workshop': return `确定删除车间「${deleteTarget.name}」及其下属产线吗？`;
      case 'line': return `确定删除产线「${deleteTarget.name}」吗？`;
      default: return '确定删除吗？';
    }
  };

  if (isLoading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  const sitesList = sites ?? [];

  return (
    <Box>
      <PageHeader
        title="工厂 / 车间 / 产线"
        subtitle="Site → Workshop → Production Line 三级生产组织架构"
        actions={
          <Button variant="contained" startIcon={<Add />} onClick={() => {
            setDialogTitle('新增工厂'); setForm({ code: '', name: '' });
            setCreateBody({ type: 'site' }); setOpen(true);
          }}>新增工厂</Button>
        }
      />

      {sitesList.length === 0 ? (
        <EmptyState
          title="暂无工厂数据"
          description="点击「新增工厂」创建第一个工厂，然后添加车间和产线"
          action={{ label: '新增工厂', onClick: () => { setDialogTitle('新增工厂'); setForm({ code: '', name: '' }); setCreateBody({ type: 'site' }); setOpen(true); } }}
        />
      ) : (
        <List>
          {sitesList.map(site => (
            <Box key={site.id} sx={{ border: '1px solid #E2E6EC', borderRadius: 2, mb: 1.5, overflow: 'hidden' }}>
              <ListItem
                sx={{
                  bgcolor: '#F8FAFB',
                  borderBottom: expandedSites.has(site.id) ? '1px solid #E2E6EC' : 'none',
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => {
                      setDialogTitle('新增车间'); setForm({ code: '', name: '' });
                      setCreateBody({ type: 'workshop', siteId: site.id }); setOpen(true);
                    }}><Add fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: 'site', id: site.id, name: site.name })}>
                      <Delete fontSize="small" /></IconButton>
                  </Box>
                }>
                <IconButton size="small" onClick={() => toggleSite(site.id)}>
                  {expandedSites.has(site.id) ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <ListItemText
                  primary={<Typography variant="body1" fontWeight={500}>{site.name}</Typography>}
                  secondary={site.code}
                />
              </ListItem>
              <Collapse in={expandedSites.has(site.id)}>
                {(workshops ?? []).filter(w => w.siteId === site.id).map(ws => (
                  <Box key={ws.id} sx={{ borderTop: '1px solid #EEF0F3' }}>
                    <ListItem
                      sx={{ pl: 6, bgcolor: expandedWorkshops.has(ws.id) ? '#F8FAFB' : '#FFFFFF' }}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => {
                            setDialogTitle('新增产线'); setForm({ code: '', name: '' });
                            setCreateBody({ type: 'line', workshopId: ws.id }); setOpen(true);
                          }}><Add fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: 'workshop', id: ws.id, name: ws.name })}>
                            <Delete fontSize="small" /></IconButton>
                        </Box>
                      }>
                      <IconButton size="small" onClick={() => toggleWorkshop(ws.id)}>
                        {expandedWorkshops.has(ws.id) ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <ListItemText
                        primary={ws.name}
                        secondary={ws.code}
                      />
                    </ListItem>
                    <Collapse in={expandedWorkshops.has(ws.id)}>
                      {(lines ?? []).filter(l => l.workshopId === ws.id).map(line => (
                        <ListItem key={line.id} sx={{ pl: 10 }}>
                          <ListItemText
                            primary={line.name}
                            secondary={line.code}
                          />
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: 'line', id: line.id, name: line.name })}>
                            <Delete fontSize="small" /></IconButton>
                        </ListItem>
                      ))}
                      {(lines ?? []).filter(l => l.workshopId === ws.id).length === 0 && (
                        <ListItem sx={{ pl: 10 }}>
                          <ListItemText secondary="暂无产线" />
                        </ListItem>
                      )}
                    </Collapse>
                  </Box>
                ))}
                {(workshops ?? []).filter(w => w.siteId === site.id).length === 0 && (
                  <ListItem sx={{ pl: 6 }}>
                    <ListItemText secondary="暂无车间" />
                  </ListItem>
                )}
              </Collapse>
            </Box>
          ))}
        </List>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <TextField label="编码" fullWidth margin="dense" value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })} />
          <TextField label="名称" fullWidth margin="dense" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={() => createMutation.mutate({ ...createBody, ...form })}>
            创建
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        message={getDeleteMessage()}
        confirmText="删除"
        onConfirm={() => deleteTarget && deleteMutation.mutate({ type: deleteTarget.type, id: deleteTarget.id })}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
        destructive
      />
    </Box>
  );
}
