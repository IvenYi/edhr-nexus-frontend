const FIELD_MARKER_PREFIX = '\uE000field:';
const FIELD_MARKER_SUFFIX = '\uE001';
const FIELD_INSERTION_MARKER_ID = '__new_field__';

export type WordTableInlineContent =
  | { type: 'text'; text: string }
  | { type: 'field'; nodeId: string };

export function encodeWordTableFieldMarker(nodeId: string) {
  return `${FIELD_MARKER_PREFIX}${nodeId}${FIELD_MARKER_SUFFIX}`;
}

export function removeWordTableFieldMarker(text: string, nodeId: string) {
  return text.split(encodeWordTableFieldMarker(nodeId)).join('');
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

export function serializeWordTableCellContent(container: HTMLElement) {
  const serializeNode = (node: Node): string => {
    if (node.nodeType === node.TEXT_NODE) return node.textContent ?? '';
    if (node.nodeType !== node.ELEMENT_NODE) return '';

    const element = node as HTMLElement;
    if (element.dataset.wordTableFieldNodeId) {
      return encodeWordTableFieldMarker(element.dataset.wordTableFieldNodeId);
    }
    if (element.dataset.wordTableFieldInsertionMarker === 'true') {
      return encodeWordTableFieldMarker(FIELD_INSERTION_MARKER_ID);
    }
    if (element.tagName === 'BR') return '\n';
    return Array.from(element.childNodes).map(serializeNode).join('');
  };

  return Array.from(container.childNodes).map(serializeNode).join('');
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

export function insertWordTableFieldAtDropPosition(container: HTMLElement, clientX: number, clientY: number) {
  const range = getCaretRangeAtPoint(container, clientX, clientY);
  const marker = container.ownerDocument.createElement('span');
  marker.dataset.wordTableFieldInsertionMarker = 'true';
  range.insertNode(marker);

  const textWithMarker = serializeWordTableCellContent(container);
  marker.remove();
  const insertionMarker = encodeWordTableFieldMarker(FIELD_INSERTION_MARKER_ID);
  const offset = textWithMarker.indexOf(insertionMarker);

  return {
    text: textWithMarker.replace(insertionMarker, ''),
    offset: offset < 0 ? textWithMarker.length : offset,
  };
}
