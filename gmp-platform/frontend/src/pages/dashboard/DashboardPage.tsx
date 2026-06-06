import { Box, Grid, Card, CardContent, Typography, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Assignment, CheckCircle, AccountTree, Storage } from '@mui/icons-material';
import TodoList from './TodoList';
import DoneList from './DoneList';

const quickEntries = [
  { label: '流程中心', icon: <AccountTree fontSize="large" />, path: '/workflow/review-templates', color: '#1976d2' },
  { label: '流程实例', icon: <Assignment fontSize="large" />, path: '/workflow/instances', color: '#388e3c' },
  { label: '主数据', icon: <Storage fontSize="large" />, path: '/master-data/product-families', color: '#f57c00' },
  { label: '我的已办', icon: <CheckCircle fontSize="large" />, path: '/workflow/instances', color: '#7b1fa2' },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>首页工作台</Typography>
      <Grid container spacing={3}>
        {quickEntries.map((entry) => (
          <Grid item xs={6} sm={3} key={entry.label}>
            <Card>
              <CardActionArea onClick={() => navigate(entry.path)}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Box sx={{ color: entry.color, mb: 1 }}>{entry.icon}</Box>
                  <Typography variant="body1">{entry.label}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <TodoList />
      </Box>
      <Box sx={{ mt: 4 }}>
        <DoneList />
      </Box>
    </Box>
  );
}
