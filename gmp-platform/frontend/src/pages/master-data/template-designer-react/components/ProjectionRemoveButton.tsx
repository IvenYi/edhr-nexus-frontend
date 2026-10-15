import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { IconButton, Tooltip } from '@mui/material';

export default function ProjectionRemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <Tooltip title={label}><IconButton size="small" color="error" aria-label={label}
    onClick={event => { event.stopPropagation(); onClick(); }}><DeleteOutlined fontSize="small" /></IconButton></Tooltip>;
}
