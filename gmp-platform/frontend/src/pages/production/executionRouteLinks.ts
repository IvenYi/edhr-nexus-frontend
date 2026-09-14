import type { ExecutionView } from '@/api/production-execution';

// Presentation only: execution permissions continue to come from availability.
export function executionRouteLinks(snapshot: ExecutionView['snapshot']) {
  const operations = new Map(snapshot.operations.map((operation) => [operation.id, operation]));
  const nodes = new Set(snapshot.routeNodes?.map((node) => node.id) ?? []);
  const incoming = new Map<string, string[]>();
  for (const edge of snapshot.routeEdges ?? []) {
    incoming.set(edge.target, [...(incoming.get(edge.target) ?? []), edge.source]);
  }
  const links = new Map(snapshot.operations.map((operation) => [operation.id, { before: [] as string[], after: [] as string[] }]));
  for (const operation of snapshot.operations) {
    const before = new Set<string>();
    const visited = new Set([operation.id]);
    const pending = [...(incoming.get(operation.id) ?? [])];
    while (pending.length) {
      const source = pending.pop()!;
      if (visited.has(source)) continue;
      visited.add(source);
      const previous = operations.get(source);
      if (previous) {
        if (previous.type !== 'REWORK') before.add(source);
      } else if (nodes.has(source)) {
        pending.push(...(incoming.get(source) ?? []));
      }
    }
    links.get(operation.id)!.before = snapshot.operations.filter((item) => before.has(item.id)).map((item) => item.id);
    for (const source of before) links.get(source)!.after.push(operation.id);
  }
  return links;
}
