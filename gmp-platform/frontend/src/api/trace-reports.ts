import type { DhrInstanceDetail } from './dhr-instances';
import type { SourceHit } from '@/pages/reports/projectionSourceHighlight';

export interface TraceHit extends SourceHit { attributes: Record<string, string>; fieldNames: Record<string, string> }
export interface DhrTraceHit { instanceId: string; instanceNo: string; templateName: string; hits: TraceHit[]; lookupItems: Record<string, { name: string }> }
export type DhrTraceDetail = DhrInstanceDetail & {
  traceHits?: DhrTraceHit[];
  traceConditionsSatisfied?: boolean;
  traceEvidenceBasis?: 'CURRENT_SAVED' | 'TERMINATION_SNAPSHOT';
};
