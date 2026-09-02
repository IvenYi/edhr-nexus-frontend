const FIELD_MARKER_PREFIX = '\uE000field:';
const FIELD_MARKER_SUFFIX = '\uE001';

export type WordTableInlineContent =
  | { type: 'text'; text: string }
  | { type: 'field'; nodeId: string };

export function encodeWordTableFieldMarker(nodeId: string) {
  return `${FIELD_MARKER_PREFIX}${nodeId}${FIELD_MARKER_SUFFIX}`;
}

export function removeWordTableFieldMarker(text: string, nodeId: string) {
  return text.split(encodeWordTableFieldMarker(nodeId)).join('');
}

export function moveWordTableFieldMarker(text: string, nodeId: string, offset: number) {
  const marker = encodeWordTableFieldMarker(nodeId);
  const markerIndex = text.indexOf(marker);
  const textWithoutMarker = removeWordTableFieldMarker(text, nodeId);
  const normalizedOffset = Math.max(
    0,
    Math.min(
      offset - (markerIndex >= 0 && markerIndex < offset ? marker.length : 0),
      textWithoutMarker.length,
    ),
  );

  return `${textWithoutMarker.slice(0, normalizedOffset)}${marker}${textWithoutMarker.slice(normalizedOffset)}`;
}

export function decodeWordTableCellContent(text: string, fieldNodeIds: Iterable<string>) {
  const knownFieldNodeIds = new Set(fieldNodeIds);
  const segments: WordTableInlineContent[] = [];
  const pattern = /\uE000field:([^\uE001]+)\uE001/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const nodeId = match[1];
    if (!knownFieldNodeIds.has(nodeId)) continue;
    if (match.index > cursor) segments.push({ type: 'text', text: text.slice(cursor, match.index) });
    segments.push({ type: 'field', nodeId });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length || !segments.length) {
    segments.push({ type: 'text', text: text.slice(cursor) });
  }

  return segments;
}

function serializeWordTableCellNode(node: Node): string {
  if (node.nodeType === node.TEXT_NODE) return node.textContent ?? '';
  if (node.nodeType !== node.ELEMENT_NODE) return '';

  const element = node as HTMLElement;
  if (element.dataset.wordTableFieldNodeId) {
    return encodeWordTableFieldMarker(element.dataset.wordTableFieldNodeId);
  }
  if (element.tagName === 'BR') return '\n';
  return Array.from(element.childNodes).map(serializeWordTableCellNode).join('');
}

export function serializeWordTableCellContent(container: HTMLElement) {
  return Array.from(container.childNodes).map(serializeWordTableCellNode).join('');
}

function getClosestCaretRangeAtPoint(container: HTMLElement, clientX: number, clientY: number) {
  const walker = container.ownerDocument.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let closestRange: Range | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;
  let node = walker.nextNode();

  while (node) {
    const text = node.textContent ?? '';
    for (let offset = 0; offset <= text.length; offset += 1) {
      if (!text.length) continue;
      const candidate = container.ownerDocument.createRange();
      if (offset === text.length) {
        candidate.setStart(node, offset - 1);
        candidate.setEnd(node, offset);
      } else {
        candidate.setStart(node, offset);
        candidate.setEnd(node, Math.min(offset + 1, text.length));
      }
      const rect = candidate.getBoundingClientRect();
      if (!rect.width && !rect.height) continue;

      const caretX = offset === text.length ? rect.right : rect.left;
      const distance = Math.hypot(clientX - caretX, clientY - (rect.top + rect.height / 2));
      if (distance < closestDistance) {
        const caret = container.ownerDocument.createRange();
        caret.setStart(node, offset);
        caret.collapse(true);
        closestRange = caret;
        closestDistance = distance;
      }
    }
    node = walker.nextNode();
  }

  return closestRange;
}

function getCaretRangeAtPoint(container: HTMLElement, clientX: number, clientY: number) {
  const documentWithCaret = container.ownerDocument as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  let range = documentWithCaret.caretRangeFromPoint?.(clientX, clientY) ?? null;

  if (!range) {
    const position = documentWithCaret.caretPositionFromPoint?.(clientX, clientY) ?? null;
    if (position) {
      range = container.ownerDocument.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
    }
  }

  if (!range || !container.contains(range.startContainer)) {
    range = getClosestCaretRangeAtPoint(container, clientX, clientY);
  }

  if (!range || !container.contains(range.startContainer)) {
    range = container.ownerDocument.createRange();
    range.selectNodeContents(container);
    range.collapse(false);
  }

  const marker = (range.startContainer.nodeType === range.startContainer.ELEMENT_NODE
    ? range.startContainer as HTMLElement
    : range.startContainer.parentElement
  )?.closest<HTMLElement>('[data-word-table-field-node-id]');
  if (marker && container.contains(marker)) {
    const rect = marker.getBoundingClientRect();
    const parent = marker.parentNode;
    if (parent) {
      const markerIndex = Array.prototype.indexOf.call(parent.childNodes, marker);
      range.setStart(parent, markerIndex + (clientX < rect.left + rect.width / 2 ? 0 : 1));
      range.collapse(true);
    }
  }

  return range;
}

function getSerializedWordTableCaretOffset(container: HTMLElement, range: Range) {
  const prefix = container.ownerDocument.createRange();
  prefix.selectNodeContents(container);
  try {
    prefix.setEnd(range.startContainer, range.startOffset);
  } catch {
    return serializeWordTableCellContent(container).length;
  }

  return Array.from(prefix.cloneContents().childNodes)
    .map(serializeWordTableCellNode)
    .join('').length;
}

export function insertWordTableFieldAtDropPosition(container: HTMLElement, clientX: number, clientY: number) {
  const range = getCaretRangeAtPoint(container, clientX, clientY);

  return {
    text: serializeWordTableCellContent(container),
    offset: getSerializedWordTableCaretOffset(container, range),
  };
}
