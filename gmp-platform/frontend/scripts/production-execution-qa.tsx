import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';
import ProductionExecutionPage from '../src/pages/production/ProductionExecutionPage';

const withShell = new URLSearchParams(window.location.search).has('shell');
const executionPage = withShell
  ? <div style={{ padding: '122px 20px 20px 286px' }}><ProductionExecutionPage /></div>
  : <ProductionExecutionPage />;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter><ThemeProvider theme={createTheme({ palette: { primary: { main: '#1677c8' } } })}>
    <CssBaseline />
    <Link to="/execution-away" style={{ position: 'fixed', right: 130, top: 0, zIndex: 2, fontSize: 10 }}>验收：离开工作台</Link>
    <Routes>
      <Route path="/execution-qa" element={executionPage} />
      <Route path="/execution-away" element={<Link to="/execution-qa">返回工作台</Link>} />
    </Routes>
  </ThemeProvider></BrowserRouter>,
);
