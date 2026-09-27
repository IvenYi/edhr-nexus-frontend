import type { DhrEvidenceRecord } from '@/api/dhr-instances';
import type { DhrNavigationNode } from './dhrSourceNavigation';

/** Folder selection follows the exact frozen navigation, not the source classification. */
export function exportSelectionNodes(nodes: DhrNavigationNode[], records: DhrEvidenceRecord[], keyword: string) {
  const byId = new Map(records.map(record => [record.id, record]));
  const query = keyword.trim().toLowerCase();
  const parents: DhrNavigationNode[] = [];
  const expanded = nodes.map(node => {
    while (parents.length && parents[parents.length - 1].depth >= node.depth) parents.pop();
    const ancestorKeys = parents.map(parent => parent.key);
    const pathText = [...parents.map(parent => parent.label), node.label].join(' ').toLowerCase();
    const ids = node.recordIds.filter(id => byId.has(id) && (!query || `${pathText} ${byId.get(id)!.instanceNo}`.toLowerCase().includes(query)));
    if (node.folder) parents.push(node);
    return { ...node, recordIds: ids, ancestorKeys };
  });
  return expanded.map(node => ({ ...node, recordIds: node.folder
    ? [...new Set(expanded.filter(child => child.ancestorKeys.includes(node.key)).flatMap(child => child.recordIds))]
    : node.recordIds,
  })).filter(node => !query || node.recordIds.length);
}
