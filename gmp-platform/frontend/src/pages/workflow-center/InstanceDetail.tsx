import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import WorkflowInstancePanel from './WorkflowInstancePanel';
export default function InstanceDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState(0);
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Tabs value={tab} onChange={(_, value: number) => setTab(value)}><Tab label="流程信息" /><Tab label="处理记录" /></Tabs>
    {id && <WorkflowInstancePanel id={id} audit={tab === 1} />}
  </Box>;
}
