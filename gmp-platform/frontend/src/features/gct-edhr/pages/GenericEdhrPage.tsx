import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import ApprovalPanel from '../components/adapters/ApprovalPanel';
import DashboardPanel from '../components/adapters/DashboardPanel';
import ExecutionPanel from '../components/adapters/ExecutionPanel';
import ReportPanel from '../components/adapters/ReportPanel';
import DemoChainPanel from '../components/DemoChainPanel';
import DetailDrawer from '../components/DetailDrawer';
import EdhrDataTable from '../components/EdhrDataTable';
import EdhrQueryBar from '../components/EdhrQueryBar';
import EdhrToolbar from '../components/EdhrToolbar';
import FormDialog from '../components/FormDialog';
import type { EdhrFormMode } from '../components/FormDialog';
import StateTransitionDialog from '../components/StateTransitionDialog';
import { GCT_EDHR_PAGES } from '../metadata/generatedPages';
import { useMockEdhrStore } from '../store/mockEdhrStore';
import type { EdhrActionMeta, EdhrPageMeta, EdhrRecord } from '../types';
import { getActionLabel, getDisplayActionsForPage } from '../utils/actionPolicy';

interface FormState {
  open: boolean;
  mode: EdhrFormMode;
  record: EdhrRecord | null;
  action: EdhrActionMeta | null;
}

interface TransitionState {
  open: boolean;
  record: EdhrRecord | null;
  action: EdhrActionMeta | null;
}

const emptyFormState: FormState = {
  open: false,
  mode: 'create',
  record: null,
  action: null,
};

const emptyTransitionState: TransitionState = {
  open: false,
  record: null,
  action: null,
};

const stateTransitionActions = new Set([
  'process',
  'finish',
  'approve',
  'reject',
  'release',
  'withdraw',
  'transfer',
  'delete',
  'disable',
  'enable',
]);

const formActionCodes = new Set(['fill', 'inspect', 'configure', 'save', 'add_field', 'import']);

export default function GenericEdhrPage() {
  const location = useLocation();
  const page = useMemo(() => findPageByPath(location.pathname), [location.pathname]);
  const {
    records,
    total,
    loading,
    error,
    query,
    pagination,
    sorting,
    selectedRecord,
    auditEntries,
    statusHistory,
    lastActionResult,
    loadPage,
    setQuery,
    resetQuery,
    setPagination,
    setSorting,
    selectRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    executeAction,
  } = useMockEdhrStore();
  const [detailOpen, setDetailOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [transitionState, setTransitionState] = useState<TransitionState>(emptyTransitionState);
  const [snackbar, setSnackbar] = useState('');
  const displayActions = useMemo(() => (page ? getDisplayActionsForPage(page) : []), [page]);

  useEffect(() => {
    if (page) {
      void loadPage(page.code);
      setDetailOpen(false);
      setFormState(emptyFormState);
      setTransitionState(emptyTransitionState);
    }
  }, [loadPage, page]);

  if (!page) {
    return <NotFoundState pathname={location.pathname} />;
  }

  const handleSelectRecord = async (recordId: string | null) => {
    await selectRecord(recordId);
    setDetailOpen(Boolean(recordId));
  };

  const handleGlobalAction = async (action: EdhrActionMeta) => {
    if (action.code === 'query') {
      await setQuery(query);
      setSnackbar('查询条件已应用');
      return;
    }
    if (action.code === 'reset') {
      await resetQuery();
      setSnackbar('查询条件已重置');
      return;
    }
    if (isCreateAction(action.code)) {
      setFormState({ open: true, mode: 'create', record: null, action });
      return;
    }

    const record = selectedRecord ?? records[0] ?? null;
    if (!record) {
      setSnackbar('当前没有可执行动作的记录');
      return;
    }
    await handleRecordAction(action, record);
  };

  const handleRecordAction = async (action: EdhrActionMeta, record: EdhrRecord) => {
    const normalizedLabel = getActionLabel(action.code, action);
    if (isDetailAction(action.code)) {
      await selectRecord(record.id);
      setDetailOpen(true);
      return;
    }
    if (action.code === 'edit') {
      setFormState({ open: true, mode: 'edit', record, action });
      return;
    }
    if (action.code === 'copy') {
      setFormState({ open: true, mode: 'copy', record, action });
      return;
    }
    if (action.code === 'version_create' || action.code === 'version_copy') {
      setFormState({ open: true, mode: 'version', record, action });
      return;
    }
    if (stateTransitionActions.has(action.code)) {
      setTransitionState({ open: true, record, action });
      return;
    }
    if (formActionCodes.has(action.code)) {
      setFormState({ open: true, mode: 'action', record, action });
      return;
    }

    await executeAction(record.id, action.code, {
      remark: `${normalizedLabel}快捷执行`,
      operatorName: '前端演示用户',
    });
    setSnackbar(`${normalizedLabel}已执行`);
  };

  const shouldShowDemoChain = page.module === '操作面板' || page.type === 'dashboard';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <EdhrToolbar
        page={page}
        actions={displayActions}
        total={total}
        loading={loading}
        onAction={handleGlobalAction}
      />

      {shouldShowDemoChain ? <DemoChainPanel currentPage={page} /> : null}

      {renderTypeAdapter(page, records, displayActions, handleRecordAction)}

      <EdhrQueryBar
        page={page}
        query={query}
        loading={loading}
        setQuery={setQuery}
        resetQuery={resetQuery}
      />

      {error ? <Alert severity="error">{error}</Alert> : null}
      {lastActionResult ? <Alert severity="success">{lastActionResult.message}</Alert> : null}

      <EdhrDataTable
        page={page}
        records={records}
        total={total}
        loading={loading}
        pagination={pagination}
        sorting={sorting}
        actions={displayActions}
        setPagination={setPagination}
        setSorting={setSorting}
        selectRecord={handleSelectRecord}
        onRowAction={handleRecordAction}
      />

      <DetailDrawer
        page={page}
        selectedRecord={selectedRecord}
        auditEntries={auditEntries}
        statusHistory={statusHistory}
        actions={displayActions}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          void selectRecord(null);
        }}
        onEdit={(record) => setFormState({ open: true, mode: 'edit', record, action: null })}
        onAction={handleRecordAction}
      />

      <FormDialog
        page={page}
        open={formState.open}
        mode={formState.mode}
        record={formState.record}
        action={formState.action}
        createRecord={createRecord}
        updateRecord={updateRecord}
        executeAction={executeAction}
        onClose={() => setFormState(emptyFormState)}
        onSaved={setSnackbar}
      />

      <StateTransitionDialog
        page={page}
        open={transitionState.open}
        record={transitionState.record}
        action={transitionState.action}
        executeAction={executeAction}
        deleteRecord={deleteRecord}
        onClose={() => setTransitionState(emptyTransitionState)}
        onDone={setSnackbar}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={2800}
        onClose={() => setSnackbar('')}
        message={snackbar}
      />
    </Box>
  );
}

function renderTypeAdapter(
  page: EdhrPageMeta,
  records: EdhrRecord[],
  actions: EdhrActionMeta[],
  onAction: (action: EdhrActionMeta, record: EdhrRecord) => void,
) {
  if (page.type === 'execution') {
    return <ExecutionPanel page={page} records={records} actions={actions} onAction={onAction} />;
  }
  if (page.type === 'approval') {
    return <ApprovalPanel page={page} records={records} actions={actions} onAction={onAction} />;
  }
  if (page.type === 'report') {
    return <ReportPanel page={page} records={records} actions={actions} onAction={onAction} />;
  }
  if (page.type === 'dashboard') {
    return <DashboardPanel page={page} records={records} />;
  }
  return null;
}

function findPageByPath(pathname: string): EdhrPageMeta | undefined {
  const normalizedPath = normalizePath(pathname);
  return GCT_EDHR_PAGES.find((page) => normalizePath(page.path) === normalizedPath);
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '').replace(/^\/?/, '/');
}

function isCreateAction(actionCode: string): boolean {
  return actionCode === 'create' || actionCode === 'add' || actionCode.startsWith('create_');
}

function isDetailAction(actionCode: string): boolean {
  return actionCode === 'detail' || actionCode === 'view' || actionCode.endsWith('_detail');
}

function NotFoundState({ pathname }: { pathname: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 1, bgcolor: '#fff' }}>
      <Stack spacing={1}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>未找到 GCT eDHR 页面</Typography>
        <Typography variant="body2" color="text.secondary">
          当前路径 {pathname} 未匹配到页面元数据，请从左侧菜单进入已生成的 GCT 页面。
        </Typography>
      </Stack>
    </Paper>
  );
}
