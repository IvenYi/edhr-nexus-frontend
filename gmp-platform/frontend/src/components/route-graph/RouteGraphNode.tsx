import { Box, Stack } from '@mui/material';
import { createContext, useContext } from 'react';
import { type NodeProps } from '@xyflow/react';
import { StandardFlowNode, FLOW_NODE_APPEARANCE, type FlowDirection } from '@/components/flow-designer/FlowDesigner';
import { ROUTE_DESIGNER_HANDLE_IDS, ROUTE_DESIGNER_OPERATION_NODE_WIDTH, ROUTE_DESIGNER_OPERATION_NODE_HEIGHT, type RouteFlowNode } from './routeGraph';

export const RouteGraphEditorContext = createContext<{
  onQuickAdd: (nodeId: string, direction: FlowDirection, anchor: HTMLElement) => void;
  errors: Record<string, string>;
  quickAddEnabled: boolean;
} | null>(null);

function RouteDesignerNode({ id, data, selected, isConnectable }: NodeProps<RouteFlowNode>) {
  const editor = useContext(RouteGraphEditorContext);
  const start = data.nodeType === 'START';
  const end = data.nodeType === 'END';
  const boundary = start || end;
  const routeBadges = [...(data.occurrenceBadge ? [data.occurrenceBadge] : []), ...(data.parallelBadges ?? []), ...(data.mergeBadges ?? []), ...(data.reworkBadges ?? [])];
  return (
    <Box data-process-route-node data-record-id={id} data-process-route-node-type={data.nodeType ?? 'OPERATION'} sx={{ position: 'relative' }}>
      <StandardFlowNode
        id={id}
        label={data.label || ''}
        caption={boundary ? undefined : data.operationCode || undefined}
        appearance={FLOW_NODE_APPEARANCE[start ? 'START' : end ? 'END' : 'OPERATION']}
        width={boundary ? 96 : ROUTE_DESIGNER_OPERATION_NODE_WIDTH}
        height={boundary ? 52 : ROUTE_DESIGNER_OPERATION_NODE_HEIGHT}
        boundary={boundary} start={start} end={end}
        editable={isConnectable} selected={Boolean(selected)}
        handleIds={{ top: ROUTE_DESIGNER_HANDLE_IDS.TOP, right: ROUTE_DESIGNER_HANDLE_IDS.RIGHT, bottom: ROUTE_DESIGNER_HANDLE_IDS.BOTTOM, left: ROUTE_DESIGNER_HANDLE_IDS.LEFT }}
        targetDirections={end ? ['top', 'right', 'left'] : undefined}
        sourceDirections={start ? ['right', 'bottom', 'left'] : undefined}
        validationMessage={editor?.errors[id]}
        quickDirections={start ? ['right', 'bottom', 'left'] : end ? ['top', 'right', 'left'] : ['top', 'right', 'bottom', 'left']}
        quickActions={[]} canUseQuickAction={Boolean(editor?.quickAddEnabled)}
        onOpenQuickMenu={(direction, anchor) => { if (anchor) editor?.onQuickAdd(id, direction, anchor); }}
        onQuickAdd={() => {}}
      />
      {routeBadges.length > 0 ? (
        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: -12, right: -10, zIndex: 2, pointerEvents: 'none' }}>
          {routeBadges.map((badge) => {
            const isMergeBadge = badge.startsWith('合');
            const isReworkBadge = badge.startsWith('返');
            const isOccurrenceBadge = badge.startsWith('节点');
            return (
              <Box
                key={badge}
                data-process-route-occurrence-badge={isOccurrenceBadge ? true : undefined}
                data-process-route-parallel-badge={!isMergeBadge && !isReworkBadge && !isOccurrenceBadge ? true : undefined}
                data-process-route-merge-badge={isMergeBadge ? true : undefined}
                data-process-route-rework-badge={isReworkBadge ? true : undefined}
                sx={{
                  minWidth: 30,
                  height: 18,
                  px: 0.75,
                  borderRadius: 9,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: isReworkBadge ? '#c45656' : isMergeBadge ? '#7a4d00' : '#075985',
                  border: isReworkBadge ? '1px solid #f56c6c' : isMergeBadge ? '1px solid #f5c56b' : '1px solid #7dd3fc',
                  bgcolor: isReworkBadge ? '#fef0f0' : isMergeBadge ? '#fff7e6' : '#e0f2fe',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.12)',
                }}
              >
                {badge}
              </Box>
            );
          })}
        </Stack>
      ) : null}
    </Box>
  );
}

export const routeDesignerNodeTypes = { routeDesigner: RouteDesignerNode };
