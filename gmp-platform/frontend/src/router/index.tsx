import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import LoginPage from '@/pages/LoginPage';
import AppLayout from '@/components/shared/AppLayout';
import NotFoundPage from '@/pages/NotFoundPage';

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const PersonalSettingsPage = lazy(() => import('@/pages/account/PersonalSettingsPage'));
const ReviewTemplateList = lazy(() => import('@/pages/workflow-center/ReviewTemplateList'));
const ReviewTemplateEditor = lazy(() => import('@/pages/workflow-center/ReviewTemplateEditor'));
const TxnTemplateList = lazy(() => import('@/pages/workflow-center/TxnTemplateList'));
const TxnTemplateEditor = lazy(() => import('@/pages/workflow-center/TxnTemplateEditor'));
const BindingRuleList = lazy(() => import('@/pages/workflow-center/BindingRuleList'));
const InstanceList = lazy(() => import('@/pages/workflow-center/InstanceList'));
const InstanceDetail = lazy(() => import('@/pages/workflow-center/InstanceDetail'));
const InstanceLogs = lazy(() => import('@/pages/workflow-center/InstanceLogs'));
const TaskDetail = lazy(() => import('@/pages/workflow-center/TaskDetail'));

const ProcessModelingPage = lazy(() => import('@/pages/master-data/ProcessModelingPage'));
const ProductModelingPage = lazy(() => import('@/pages/master-data/ProductModelingPage'));
const ProductModelingWorkspacePage = lazy(() => import('@/pages/master-data/ProductModelingWorkspacePage'));
const DocumentManagementPage = lazy(() => import('@/pages/master-data/DocumentManagementPage'));
const TemplateModelingPage = lazy(() => import('@/pages/master-data/TemplateModelingPage'));

const OrganizationPage = lazy(() => import('@/pages/system/OrganizationPage'));
const UserPage = lazy(() => import('@/pages/system/UserPage'));
const RolePage = lazy(() => import('@/pages/system/RolePage'));
const MenuManagementPage = lazy(() => import('@/pages/system/MenuManagementPage'));
const BusinessDictionaryPage = lazy(() => import('@/pages/system/BusinessDictionaryPage'));
const IconManagementPage = lazy(() => import('@/pages/system/IconManagementPage'));
const SystemSettingsPage = lazy(() => import('@/pages/system/SystemSettingsPage'));
const AuditLogPage = lazy(() => import('@/pages/system/AuditLogPage'));
const SignatureLogPage = lazy(() => import('@/pages/system/SignatureLogPage'));
const LoginLogPage = lazy(() => import('@/pages/system/LoginLogPage'));

const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', py: 8 }}>
    <CircularProgress />
  </Box>
);

/** Protected route wrapper. In Phase 0, checks localStorage token. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<Loading />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route path="account">
          <Route path="settings" element={<Suspense fallback={<Loading />}><PersonalSettingsPage /></Suspense>} />
        </Route>
        <Route path="workflow">
          <Route path="review-templates" element={<Suspense fallback={<Loading />}><ReviewTemplateList /></Suspense>} />
          <Route path="review-templates/:id" element={<Suspense fallback={<Loading />}><ReviewTemplateEditor /></Suspense>} />
          <Route path="txn-templates" element={<Suspense fallback={<Loading />}><TxnTemplateList /></Suspense>} />
          <Route path="txn-templates/:id" element={<Suspense fallback={<Loading />}><TxnTemplateEditor /></Suspense>} />
          <Route path="binding-rules" element={<Suspense fallback={<Loading />}><BindingRuleList /></Suspense>} />
          <Route path="instances" element={<Suspense fallback={<Loading />}><InstanceList /></Suspense>} />
          <Route path="instances/:id" element={<Suspense fallback={<Loading />}><InstanceDetail /></Suspense>} />
          <Route path="instances/:id/logs" element={<Suspense fallback={<Loading />}><InstanceLogs /></Suspense>} />
          <Route path="tasks/:id" element={<Suspense fallback={<Loading />}><TaskDetail /></Suspense>} />
        </Route>
        <Route path="master-data">
          <Route path="materials" element={<Suspense fallback={<Loading />}><ProcessModelingPage pageKey="materials" /></Suspense>} />
          <Route path="operations" element={<Suspense fallback={<Loading />}><ProcessModelingPage pageKey="operations" /></Suspense>} />
          <Route path="routes" element={<Suspense fallback={<Loading />}><ProcessModelingPage pageKey="routes" /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<Loading />}><ProductModelingPage /></Suspense>} />
          <Route path="products/:productVersionId/modeling" element={<Suspense fallback={<Loading />}><ProductModelingWorkspacePage /></Suspense>} />
          <Route path="product-families" element={<Suspense fallback={<Loading />}><ProcessModelingPage pageKey="productFamilies" /></Suspense>} />
          <Route path="documents" element={<Suspense fallback={<Loading />}><DocumentManagementPage /></Suspense>} />
          <Route path="form-templates" element={<Suspense fallback={<Loading />}><TemplateModelingPage pageKey="formTemplates" /></Suspense>} />
          <Route path="batch-record-templates" element={<Suspense fallback={<Loading />}><TemplateModelingPage pageKey="batchRecordTemplates" /></Suspense>} />
        </Route>
        <Route path="system">
          <Route path="organization" element={<Suspense fallback={<Loading />}><OrganizationPage /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<Loading />}><UserPage /></Suspense>} />
          <Route path="roles" element={<Suspense fallback={<Loading />}><RolePage /></Suspense>} />
          <Route path="menu-management" element={<Suspense fallback={<Loading />}><MenuManagementPage /></Suspense>} />
          <Route path="dictionaries" element={<Suspense fallback={<Loading />}><BusinessDictionaryPage /></Suspense>} />
          <Route path="icons" element={<Suspense fallback={<Loading />}><IconManagementPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<Loading />}><SystemSettingsPage /></Suspense>} />
          <Route path="login-logs" element={<Suspense fallback={<Loading />}><LoginLogPage /></Suspense>} />
          <Route path="audit-logs" element={<Suspense fallback={<Loading />}><AuditLogPage /></Suspense>} />
          <Route path="signatures" element={<Suspense fallback={<Loading />}><SignatureLogPage /></Suspense>} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
