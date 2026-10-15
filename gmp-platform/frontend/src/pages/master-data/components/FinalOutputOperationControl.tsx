import { Checkbox, FormControlLabel, Tooltip } from '@mui/material';

interface OperationChoice { routeNodeKey: string; operationName: string; finalOutput?: boolean }

export default function FinalOutputOperationControl({ operation, operations, disabled, onChange }: {
  operation: OperationChoice; operations: OperationChoice[]; disabled?: boolean; onChange: (checked: boolean) => void;
}) {
  const other = operations.find(item => item.finalOutput && item.routeNodeKey !== operation.routeNodeKey);
  return <Tooltip title={other ? `已设置“${other.operationName}”，取消后可选择其他工序。`
    : '批次累计产出只取该工序的正式报工，可不设置；不自动选择最后一道工序。'}>
    <span><FormControlLabel sx={{ m: 0 }} label="作为最终产出工序" control={<Checkbox size="small"
      checked={operation.finalOutput ?? false} disabled={disabled || Boolean(other)} onChange={(_, checked) => onChange(checked)} />} /></span>
  </Tooltip>;
}
