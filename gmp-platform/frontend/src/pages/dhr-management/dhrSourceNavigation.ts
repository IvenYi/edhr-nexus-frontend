import type { DhrDirectory, DhrEvidenceRecord, DhrSummaryDirectoryOverlay, DhrSummaryPlacement } from '@/api/dhr-instances';
import { groupSummarySources, summarySourceKey } from './summarySourceGroups';
import { orderedSummaryChildren } from './summaryPlacementOrder';

export type DhrSource = 'DIRECTORY' | 'WORK' | 'CUSTOM';
export type DhrNavigationView = 'ARCHIVE' | 'SOURCE';
export interface DhrNavigationNode {
  key: string;
  label: string;
  depth: number;
  folder?: boolean;
  recordIds: string[];
  secondary?: string;
  emptyMessage?: string;
}

export function defaultEvidencePlacements(directories: DhrDirectory[], records: DhrEvidenceRecord[]): DhrSummaryPlacement[] {
  const items = new Set(directories.flatMap(directory => directory.items.map(item => String(item.id))));
  return records.map(record => ({ recordId: record.id, targetNodeKey: record.originKind === 'DIRECTORY'
    ? items.has(String(record.snapshot.dhrItemId ?? '')) ? `base-item-${record.snapshot.dhrItemId}` : 'source-directory'
    : record.originKind === 'WORK' ? 'source-work' : 'source-custom' }));
}

/** Reading projection of the same placement order used by the editor; never changes evidence identity. */
export function archiveNavigation(directories: DhrDirectory[], records: DhrEvidenceRecord[], overlay: DhrSummaryDirectoryOverlay[] = [], overrides: DhrSummaryPlacement[] = []): DhrNavigationNode[] {
  const byId = new Map(records.map(record => [record.id, record]));
  const placements = [...defaultEvidencePlacements(directories, records).filter(p => !overrides.some(o => o.recordId === p.recordId)), ...overrides.filter(p => byId.has(p.recordId))];
  const names = new Map(placements.map(p => [p.recordId, p.displayName]));
  const staticNodes = [
    ...directories.flatMap(d => [
      { key: `base-dir-${d.id}`, label: d.name, parent: d.parentId != null ? `base-dir-${d.parentId}` : '', folder: true, rank: 0, order: d.sortOrder ?? 0 },
      ...d.items.map(i => ({ key: `base-item-${i.id}`, label: i.displayName || i.formName || '未命名表单', parent: `base-dir-${d.id}`, folder: false, rank: 1, order: i.sortOrder ?? 0 })),
    ]),
    ...overlay.map(d => ({ key: d.key, label: d.name, parent: d.parentKey ?? '', folder: true, rank: 2, order: d.sortOrder })),
    ...(['directory', 'work', 'custom'] as const).filter(source => source !== 'directory' || placements.some(p => p.targetNodeKey === 'source-directory')).map((source, index) => ({ key: `source-${source}`, label: source === 'work' ? '作业表单' : source === 'custom' ? '自定义表单' : '未匹配目录表单', parent: '', folder: true, rank: 3 + index, order: 0 })),
  ];
  const result: DhrNavigationNode[] = [], visited = new Set<string>();
  const visit = (parent: string, depth: number) => {
    const children = staticNodes.filter(n => n.parent === parent).sort((a, b) => a.rank - b.rank || a.order - b.order);
    const keys = orderedSummaryChildren(parent, children.map(n => n.key), placements);
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      if (visited.has(key)) continue;
      visited.add(key);
      if (key.startsWith('record-')) {
        const record = byId.get(key.slice(7));
        if (!record) continue;
        const ids = [record.id];
        while (index + 1 < keys.length && keys[index + 1].startsWith('record-')) {
          const next = byId.get(keys[index + 1].slice(7));
          if (!next || summarySourceKey(next) !== summarySourceKey(record) || names.get(next.id) !== names.get(record.id)) break;
          ids.push(next.id); visited.add(keys[++index]);
        }
        result.push({ key, label: names.get(record.id) || record.templateName || record.snapshot.name || '未命名表单', depth, recordIds: ids });
      } else {
        const node = children.find(n => n.key === key);
        if (!node) continue;
        if (node.folder) {
          const start = result.length;
          result.push({ key, label: node.label, depth, folder: true, recordIds: [] });
          visit(key, depth + 1);
          const count = result.slice(start + 1).reduce((total, child) => total + child.recordIds.length, 0);
          if (key.startsWith('source-')) {
            result[start].label += `（${count}）`;
            if (!count) result[start].emptyMessage = records.some(r => `source-${r.originKind.toLowerCase()}` === key) ? '暂无留在默认位置的记录' : '暂无记录';
          }
        } else {
          const ids = placements.filter(p => p.targetNodeKey === key).map(p => p.recordId);
          result.push({ key, label: names.get(ids[0]) || node.label, depth, recordIds: ids, secondary: ids.length ? undefined : '尚无实例' });
        }
      }
    }
  };
  visit('', 0);
  return result;
}

/** Source navigation follows original identity, never the summary placements. */
export function evidenceNavigation(source: DhrSource, directories: DhrDirectory[], records: DhrEvidenceRecord[]): DhrNavigationNode[] {
  const candidates = records.filter(record => record.originKind === source);
  if (source !== 'DIRECTORY') return groupSummarySources(candidates).map(group => ({
    key: group.key, label: group.records[0].templateName || group.records[0].snapshot.name || '未命名表单',
    depth: 0, recordIds: group.records.map(record => record.id), secondary: [group.records[0].operationName,
      source === 'WORK' ? group.records[0].snapshot.workNodeName || group.records[0].snapshot.workNodeId : undefined,
      `已完成 ${group.records.filter(record => record.status === 'COMPLETED').length}/${group.records.length}`].filter(Boolean).join(' · '),
  }));
  const nodes: DhrNavigationNode[] = [], visited = new Set<string>(), placed = new Set<string>();
  const byId = new Map(directories.map(directory => [String(directory.id), directory]));
  const visit = (parent: string | null, depth: number) => directories
    .filter(directory => (directory.parentId != null && byId.has(String(directory.parentId)) ? String(directory.parentId) : null) === parent)
    .slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).forEach(directory => {
      const id = String(directory.id);
      if (visited.has(id)) return;
      visited.add(id);
      nodes.push({ key: `directory-${id}`, label: directory.name, depth, folder: true, recordIds: [] });
      directory.items.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).forEach(item => {
        // Frozen base directories contain definitions only; instances come from this version's candidates.
        const ids = new Set((item.records ?? []).map(record => record.id));
        const matched = candidates.filter(record => ids.has(record.id) || String(record.snapshot.dhrItemId ?? '') === String(item.id))
          .sort((a, b) => a.instanceNo.localeCompare(b.instanceNo) || a.id.localeCompare(b.id));
        matched.forEach(record => placed.add(record.id));
        nodes.push({ key: `item-${item.id}`, label: item.displayName || item.formName || '未命名表单', depth: depth + 1, recordIds: matched.map(record => record.id), secondary: matched.length ? `已完成 ${matched.filter(record => record.status === 'COMPLETED').length}/${matched.length}` : '尚无实例' });
      });
      visit(id, depth + 1);
    });
  visit(null, 0);
  candidates.filter(record => !placed.has(record.id)).forEach(record => nodes.push({ key: `record-${record.id}`, label: record.templateName || '未命名表单', depth: 0, recordIds: [record.id] }));
  return nodes;
}
