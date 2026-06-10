import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import LoginPage from '@/pages/LoginPage';
import AppLayout from '@/components/shared/AppLayout';
import NotFoundPage from '@/pages/NotFoundPage';

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const GenericEdhrPage = lazy(() => import('@/features/gct-edhr/pages/GenericEdhrPage'));

const ReviewTemplateList = lazy(() => import('@/pages/workflow-center/ReviewTemplateList'));
const ReviewTemplateEditor = lazy(() => import('@/pages/workflow-center/ReviewTemplateEditor'));
const TxnTemplateList = lazy(() => import('@/pages/workflow-center/TxnTemplateList'));
const TxnTemplateEditor = lazy(() => import('@/pages/workflow-center/TxnTemplateEditor'));
const BindingRuleList = lazy(() => import('@/pages/workflow-center/BindingRuleList'));
const InstanceList = lazy(() => import('@/pages/workflow-center/InstanceList'));
const InstanceDetail = lazy(() => import('@/pages/workflow-center/InstanceDetail'));
const InstanceLogs = lazy(() => import('@/pages/workflow-center/InstanceLogs'));
const TaskDetail = lazy(() => import('@/pages/workflow-center/TaskDetail'));

const ProductFamilyPage = lazy(() => import('@/pages/master-data/ProductFamilyPage'));
const UnitPage = lazy(() => import('@/pages/master-data/UnitPage'));
const EquipmentPage = lazy(() => import('@/pages/master-data/EquipmentPage'));
const SopDocumentPage = lazy(() => import('@/pages/master-data/SopDocumentPage'));
const OperationPage = lazy(() => import('@/pages/master-data/OperationPage'));
const RoutePage = lazy(() => import('@/pages/master-data/RoutePage'));
const SiteWorkshopPage = lazy(() => import('@/pages/master-data/SiteWorkshopPage'));

const TenantPage = lazy(() => import('@/pages/system/TenantPage'));
const OrganizationPage = lazy(() => import('@/pages/system/OrganizationPage'));
const UserPage = lazy(() => import('@/pages/system/UserPage'));
const RolePage = lazy(() => import('@/pages/system/RolePage'));
const PermissionPage = lazy(() => import('@/pages/system/PermissionPage'));
const MenuManagementPage = lazy(() => import('@/pages/system/MenuManagementPage'));
const NumberingRulePage = lazy(() => import('@/pages/system/NumberingRulePage'));
const AuditLogPage = lazy(() => import('@/pages/system/AuditLogPage'));
const SignatureLogPage = lazy(() => import('@/pages/system/SignatureLogPage'));
const FormTemplatePage = lazy(() => import('@/pages/system/FormTemplatePage'));

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
          <Route path="product-families" element={<Suspense fallback={<Loading />}><ProductFamilyPage /></Suspense>} />
          <Route path="units" element={<Suspense fallback={<Loading />}><UnitPage /></Suspense>} />
          <Route path="equipment" element={<Suspense fallback={<Loading />}><EquipmentPage /></Suspense>} />
          <Route path="sop-documents" element={<Suspense fallback={<Loading />}><SopDocumentPage /></Suspense>} />
          <Route path="operations" element={<Suspense fallback={<Loading />}><OperationPage /></Suspense>} />
          <Route path="routes" element={<Suspense fallback={<Loading />}><RoutePage /></Suspense>} />
          <Route path="sites" element={<Suspense fallback={<Loading />}><SiteWorkshopPage /></Suspense>} />
        </Route>
        <Route path="system">
          <Route path="tenant" element={<Suspense fallback={<Loading />}><TenantPage /></Suspense>} />
          <Route path="organization" element={<Suspense fallback={<Loading />}><OrganizationPage /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<Loading />}><UserPage /></Suspense>} />
          <Route path="roles" element={<Suspense fallback={<Loading />}><RolePage /></Suspense>} />
          <Route path="permissions" element={<Suspense fallback={<Loading />}><PermissionPage /></Suspense>} />
          <Route path="menu-management" element={<Suspense fallback={<Loading />}><MenuManagementPage /></Suspense>} />
          <Route path="numbering-rules" element={<Suspense fallback={<Loading />}><NumberingRulePage /></Suspense>} />
          <Route path="audit-logs" element={<Suspense fallback={<Loading />}><AuditLogPage /></Suspense>} />
          <Route path="signatures" element={<Suspense fallback={<Loading />}><SignatureLogPage /></Suspense>} />
          <Route path="form-templates" element={<Suspense fallback={<Loading />}><FormTemplatePage /></Suspense>} />
        </Route>
        <Route path="gct-edhr/*" element={<Suspense fallback={<Loading />}><GenericEdhrPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
