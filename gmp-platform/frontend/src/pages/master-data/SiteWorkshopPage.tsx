import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box, Typography, Button, List, ListItem, ListItemText, Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
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
    },
  });

  const toggleSite = (id: number) => {
    setExpandedSites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleWorkshop = (id: number) => {
    setExpandedWorkshops(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  if (isLoading) return <Box sx={{ p: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h5">工厂/车间/产线管理</Typography>
          <Typography variant="body2" color="text.secondary">Site → Workshop → Production Line 三级结构</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => {
          setDialogTitle('新增工厂'); setForm({ code: '', name: '' });
          setCreateBody({ type: 'site' }); setOpen(true);
        }}>新增工厂</Button>
      </Box>

      <List>
        {sites?.map(site => (
          <Box key={site.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1, overflow: 'hidden' }}>
            <ListItem sx={{ bgcolor: '#f5f5f5' }}
              secondaryAction={
                <Box>
                  <IconButton size="small" onClick={() => {
                    setDialogTitle('新增车间'); setForm({ code: '', name: '' });
                    setCreateBody({ type: 'workshop', siteId: site.id }); setOpen(true);
                  }}><Add fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => { if (window.confirm('删除工厂及下属？')) deleteMutation.mutate({ type: 'site', id: site.id }); }}>
                    <Delete fontSize="small" /></IconButton>
                </Box>
              }>
              <IconButton size="small" onClick={() => toggleSite(site.id)}>
                {expandedSites.has(site.id) ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <ListItemText primary={site.name} secondary={site.code} />
            </ListItem>
            <Collapse in={expandedSites.has(site.id)}>
              {workshops?.filter(w => w.siteId === site.id).map(ws => (
                <Box key={ws.id} sx={{ borderTop: '1px solid #f0f0f0' }}>
                  <ListItem sx={{ pl: 6, bgcolor: '#fafafa' }}
                    secondaryAction={
                      <Box>
                        <IconButton size="small" onClick={() => {
                          setDialogTitle('新增产线'); setForm({ code: '', name: '' });
                          setCreateBody({ type: 'line', workshopId: ws.id }); setOpen(true);
                        }}><Add fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => { if (window.confirm('删除车间及下属？')) deleteMutation.mutate({ type: 'workshop', id: ws.id }); }}>
                          <Delete fontSize="small" /></IconButton>
                      </Box>
                    }>
                    <IconButton size="small" onClick={() => toggleWorkshop(ws.id)}>
                      {expandedWorkshops.has(ws.id) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <ListItemText primary={ws.name} secondary={ws.code} />
                  </ListItem>
                  <Collapse in={expandedWorkshops.has(ws.id)}>
                    {lines?.filter(l => l.workshopId === ws.id).map(line => (
                      <ListItem key={line.id} sx={{ pl: 10 }}>
                        <ListItemText primary={line.name} secondary={line.code} />
                        <IconButton size="small" onClick={() => { if (window.confirm('删除？')) deleteMutation.mutate({ type: 'line', id: line.id }); }}>
                          <Delete fontSize="small" /></IconButton>
                      </ListItem>
                    ))}
                  </Collapse>
                </Box>
              ))}
            </Collapse>
          </Box>
        ))}
      </List>

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
          <Button variant="contained" onClick={() => createMutation.mutate({ ...createBody, ...form })}>创建</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
