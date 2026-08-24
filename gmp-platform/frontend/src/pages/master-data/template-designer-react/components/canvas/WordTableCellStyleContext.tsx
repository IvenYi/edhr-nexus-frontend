import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTemplateDesignerStore } from '../../store/useTemplateDesignerStore';
import type { CanvasWordTableBlock } from '../../types';
import { updateWordTableCellStyle } from '../../utils/wordTableOperations';

export interface WordTableCellStyleTarget {
  blockId: string;
  range: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
}

interface WordTableCellStyleContextValue {
  selectedStyle: Record<string, unknown> | null;
  target: WordTableCellStyleTarget | null;
  setWordTableCellStyleTarget: (target: WordTableCellStyleTarget | null) => void;
  updateWordTableCellStyle: (patch: Record<string, unknown>) => void;
  updateWordTableCellStyleAtTarget: (target: WordTableCellStyleTarget, patch: Record<string, unknown>) => void;
}

const WordTableCellStyleContext = createContext<WordTableCellStyleContextValue>({
  selectedStyle: null,
  target: null,
  setWordTableCellStyleTarget: () => undefined,
  updateWordTableCellStyle: () => undefined,
  updateWordTableCellStyleAtTarget: () => undefined,
});

function isCellInTarget(cell: CanvasWordTableBlock['cells'][number], target: WordTableCellStyleTarget) {
  return cell.row <= target.range.bottom
    && cell.row + cell.rowSpan - 1 >= target.range.top
    && cell.col <= target.range.right
    && cell.col + cell.colSpan - 1 >= target.range.left;
}

export function WordTableCellStyleProvider({ children }: { children: ReactNode }) {
  const currentPage = useTemplateDesignerStore((state) => state.getCurrentPage());
  const updateCurrentPage = useTemplateDesignerStore((state) => state.updateCurrentPage);
  const [target, setTarget] = useState<WordTableCellStyleTarget | null>(null);
  const table = target
    ? currentPage?.wordDocument?.blocks.find((block): block is CanvasWordTableBlock => block.type === 'table' && block.id === target.blockId)
    : null;
  const selectedStyle = target && table
    ? table.cells.find((cell) => isCellInTarget(cell, target))?.style ?? {}
    : null;

  useEffect(() => {
    if (target && !table) setTarget(null);
  }, [table, target]);

  const updateStyleAtTarget = (styleTarget: WordTableCellStyleTarget, patch: Record<string, unknown>) => {
    const latestPage = useTemplateDesignerStore.getState().getCurrentPage();
    if (!latestPage?.wordDocument) return;

    updateCurrentPage({
      wordDocument: {
        ...latestPage.wordDocument,
        blocks: latestPage.wordDocument.blocks.map((block) => (
          block.type === 'table' && block.id === styleTarget.blockId
            ? updateWordTableCellStyle(block, styleTarget.range, patch)
            : block
        )),
      },
    });
  };

  const updateStyle = (patch: Record<string, unknown>) => {
    if (!target) return;
    updateStyleAtTarget(target, patch);
  };

  return (
    <WordTableCellStyleContext.Provider
      value={{
        selectedStyle,
        target,
        setWordTableCellStyleTarget: setTarget,
        updateWordTableCellStyle: updateStyle,
        updateWordTableCellStyleAtTarget: updateStyleAtTarget,
      }}
    >
      {children}
    </WordTableCellStyleContext.Provider>
  );
}

export function useWordTableCellStyle() {
  return useContext(WordTableCellStyleContext);
}
