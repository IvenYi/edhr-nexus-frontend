import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, TextField, Button, Typography, Alert,
} from '@mui/material';
import {
  LockOutlined, PersonOutline,
} from '@mui/icons-material';
import client from '@/api/client';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await client.post('/auth/login', { username, password });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: { xs: 'center', md: 'flex-start' },
        px: { xs: 2, md: 7, lg: 10 },
        py: { xs: 3, md: 0 },
        position: 'relative',
        overflow: 'auto',
        bgcolor: '#dceff5',
        backgroundImage: [
          'linear-gradient(112deg, #14507f 0%, #2a80b8 45%, #e2f2f6 100%)',
          'linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: 'cover, 44px 44px, 44px 44px',
        backgroundPosition: 'center, center, center',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: [
            'linear-gradient(135deg, transparent 0 56%, rgba(255,255,255,0.18) 56% 57%, transparent 57% 100%)',
            'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 38%)',
          ].join(', '),
          opacity: 0.8,
        },
      }}
    >
      <Box
        sx={{
          width: 349,
          maxWidth: 'calc(100vw - 32px)',
          minHeight: 583,
          mt: { xs: 0, md: 'calc(50vh - 277.5px)' },
          ml: 'auto',
          mr: { xs: 'auto', md: 0 },
          p: '4.5vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ mb: 3.5 }}>
          <Typography
            component="h1"
            sx={{
              color: '#fff',
              fontSize: { xs: 46, md: 54 },
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: 0,
              textShadow: '0 1px 2px rgba(12,45,80,0.18)',
            }}
          >
            eDHR
          </Typography>
          <Typography
            sx={{
              mt: 1.25,
              color: 'rgba(255,255,255,0.94)',
              fontSize: { xs: 22, md: 26 },
              fontWeight: 500,
              lineHeight: 1.25,
              letterSpacing: 0,
            }}
          >
            电子批记录平台
          </Typography>
        </Box>

        <Card
          sx={{
            width: '100%',
            p: 2.5,
            border: '1px solid rgba(255,255,255,0.68)',
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.86)',
            boxShadow: '0 4px 12px rgba(14,55,94,0.10)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2.5 }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: '#1f2d3d', lineHeight: 1.35 }}>
              账号登录
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b778c', mt: 0.5 }}>
              请输入您的账号和密码
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1, fontSize: 13 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="用户名"
              fullWidth
              margin="none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              InputProps={{
                startAdornment: <PersonOutline sx={{ mr: 1, color: '#9aa6b2' }} />,
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  height: 50,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.96)',
                },
              }}
            />
            <TextField
              label="密码"
              type="password"
              fullWidth
              margin="none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: <LockOutlined sx={{ mr: 1, color: '#9aa6b2' }} />,
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  height: 50,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.96)',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                width: 220,
                height: 50,
                mx: 'auto',
                display: 'flex',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
            >
              {loading ? '登录中...' : '登 录'}
            </Button>
          </form>

          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            v2.1.0 · Zencas eDHR Platform
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}
