import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, TextField, Button, Typography, Alert, Divider,
} from '@mui/material';
import {
  Visibility, LockOutlined, PersonOutline,
} from '@mui/icons-material';
import client from '@/api/client';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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
        bgcolor: '#F0F2F5',
      }}
    >
      {/* Left: Branding Panel */}
      <Box
        sx={{
          flex: '0 0 480px',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#0D233A',
          color: '#FFFFFF',
          p: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background geometric decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(21,101,192,0.3) 0%, transparent 70%)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,137,123,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Brand content */}
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 360 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              mx: 'auto',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Visibility sx={{ fontSize: 36, color: '#64B5F6' }} />
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5, color: '#FFFFFF' }}>
            eDHR 系统
          </Typography>
          <Typography variant="body1" sx={{ mb: 1, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            电子设备历史记录平台
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            面向医疗器械生产的 GMP 合规数字化解决方案，确保每一批次全程可追溯、可审计。
          </Typography>

          <Divider sx={{ my: 5, borderColor: 'rgba(255,255,255,0.1)' }} />

          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            {[
              { num: '21 CFR Part 11', label: '合规标准' },
              { num: 'ISO 13485', label: '质量体系' },
              { num: 'GAMP 5', label: '验证框架' },
            ].map((item) => (
              <Box key={item.label} sx={{ textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {item.num}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right: Login Form */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Card
          sx={{
            width: 400,
            maxWidth: '100%',
            boxSizing: 'border-box',
            p: { xs: 3, sm: 4 },
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 1.5 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              登录 eDHR
            </Typography>
            <Typography variant="body2" color="text.secondary">
              请输入您的账号和密码
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="用户名"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              InputProps={{
                startAdornment: <PersonOutline sx={{ mr: 1, color: 'text.disabled' }} />,
              }}
            />
            <TextField
              label="密码"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: <LockOutlined sx={{ mr: 1, color: 'text.disabled' }} />,
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3, py: 1.5, fontWeight: 600, fontSize: 15 }}
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
