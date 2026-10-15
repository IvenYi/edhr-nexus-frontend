import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box } from '@mui/material';
import client from '@/api/client';
import type { DhrInstanceSummary } from '@/api/dhr-instances';
import type { DhrTraceHit } from '@/api/trace-reports';
import { FormListPagination } from '@/pages/form-management/formManagementListStyles';
import { DhrEvidenceViewer } from '@/pages/dhr-management/DhrManagementPage';
import { dhrObjectTypeLabel, dhrStatusMeta } from '@/pages/dhr-management/dhrListPresentation';
import TraceQueryPanel, { initialTraceRequest } from './TraceQueryPanel';
import { ProjectionTable } from './FormProjectionReportPage';

type Row = DhrInstanceSummary & { hitFormCount?: number; hits?: DhrTraceHit[] };
const columns = [['dhrNo', 'DHR编号'], ['objectNo', '所属生产批次/SN'], ['objectTypeLabel', '生产对象类型'], ['workOrderNo', '工单编号'],
  ['productCode', '产品编码'], ['productName', '产品名称'], ['dhrTemplateName', 'DHR模板'], ['dhrTemplateVersion', '模板版本'], ['statusLabel', 'DHR状态'],
  ['hitFormCount', '命中表单数'], ['hitForms', '命中表单'], ['createdBy', '创建人'], ['createdAt', '创建时间'], ['completedAt', '完成时间']]
  .map(([id, label]) => ({ id, label, width: id === 'hitForms' ? 320 : 180 }));

export default function DhrTraceReportPage() {
  const [request, setRequest] = useState(initialTraceRequest);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Row | null>(null);
  const data = useQuery({ queryKey: ['dhr-trace-report', request, revision], queryFn: async () =>
    (await client.post('/reports/trace/dhrs/query', request)).data.data as { total: number; records: Row[] } });
  const reverse = request.direction === 'REVERSE';
  return <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 1.5 }}>
    <TraceQueryPanel dhr size={request.size} onSearch={next => { setRequest(next); setSelected(null); setRevision(current => current + 1); }} />
    {data.isError && <Alert severity="error">{data.error.message || 'DHR追溯读取失败，请重新查询。'}</Alert>}
    <ProjectionTable key={request.direction} preference={`dhr-trace-${request.direction}`} sourceLabel="查看DHR详情"
      columns={columns.filter(column => reverse || !['hitFormCount', 'hitForms'].includes(column.id))}
      description={reverse ? '各条件在同一DHR内满足；打开完整目录查看命中的表单、字段和子表行。' : '按DHR真实关联属性查询；打开完整目录查看已保存的生产证据。'}
      rows={(data.data?.records ?? []).map(row => ({ ...row, objectTypeLabel: dhrObjectTypeLabel[row.objectType], statusLabel: dhrStatusMeta(row.displayStatus).label,
        hitForms: row.hits?.map(hit => `${hit.templateName}（${hit.instanceNo}）`).join('；') }))}
      loading={data.isFetching} failed={data.isError} onSource={index => setSelected(data.data!.records[index])}
      footer={<FormListPagination totalElements={data.data?.total ?? 0} totalPages={Math.ceil((data.data?.total ?? 0) / request.size)} page={request.page} pageSize={request.size}
        onPageChange={page => setRequest({ ...request, page })} onPageSizeChange={size => setRequest({ ...request, size, page: 0 })} />} />
    {selected && <DhrEvidenceViewer selected={selected} traceRequest={request} onClose={() => setSelected(null)} />}
  </Box>;
}
