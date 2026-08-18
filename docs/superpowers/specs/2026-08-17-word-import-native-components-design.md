# Word Import Native Components Design

## Status

This specification supersedes the Word-content isolation principle in `2026-08-12-word-document-component-management-design.md` for newly imported DOCX files.

## Goal

DOCX content that has a matching canvas component type must be imported as a native canvas node. Imported content and components created on an empty canvas must use the same selection, layout, styling, deletion, and history behavior.

## Scope

- Import DOCX paragraphs as `static-text` canvas nodes.
- Import DOCX images as `static-image` canvas nodes.
- Preserve paragraph text, font style, alignment, indentation, spacing, layout, and tab or wide-space horizontal offsets.
- Preserve image data, position, and dimensions on the resulting image nodes.
- Keep DOCX tables as `wordDocument.blocks` because this release does not introduce a reusable table component.
- Keep Excel grid-mode import, `cells`, and `mergedCells` unchanged.
- Do not migrate existing saved templates. Users re-import a DOCX file when they need the native-component representation.

## Data Flow

1. DOCX parsing produces paragraphs, tables, and media references.
2. The importer creates `static-text` nodes for paragraphs and `static-image` nodes for images.
3. The importer persists only DOCX tables and their required media resources in `wordDocument`.
4. Canvas rendering, selection, movement, resizing, style updates, deletion, and undo operate through the existing node/store paths for imported paragraphs and images.

## Interaction Boundaries

- A selected native node may be deleted with Delete or Backspace only while focus remains within the free-canvas interaction surface.
- Text editing fields and form controls retain their normal keyboard behavior.
- Imported Word tables keep their dedicated selection, editing, dragging, resizing, and deletion behavior.
- Delayed color-picker updates retain their original target. Blur or unmount flushes the latest draft color before clearing the pending timer.

## Compatibility And Error Handling

- Existing saved `wordDocument` paragraph and image blocks are rendered without conversion.
- New imports must not duplicate a paragraph or image in both `nodes` and `wordDocument.blocks`.
- Missing image media produces the existing safe image placeholder rather than an invalid node source.
- A malformed or unsupported DOCX image must not prevent paragraphs and tables from being imported.

## Acceptance Criteria

- A newly imported DOCX paragraph can be selected, moved, styled, deleted, and undone through the same paths as an inserted text component.
- A newly imported DOCX image can be selected, moved, styled, deleted, and undone through the same paths as an inserted image component.
- A newly imported DOCX table remains editable and resizable as a Word table.
- An existing saved template is not rewritten merely by being opened.
- Delayed color selection commits the last color on blur and unmount to the target that was selected when editing started.
- Delete and Backspace do not delete canvas content when focus is outside the free-canvas surface.
- Existing Excel table-mode verification remains green.

## Verification

- Extend `verify-template-designer-react.mjs` with source-level assertions for paragraph and image node conversion, no duplication, color flush behavior, and keyboard focus boundary.
- Run `npm run verify:template-modeling`.
- Run `npm run verify:template-designer-react`.
- Run `npm run build`.
- Run targeted browser interaction checks for imported text/image editing, color commit, and keyboard deletion.
