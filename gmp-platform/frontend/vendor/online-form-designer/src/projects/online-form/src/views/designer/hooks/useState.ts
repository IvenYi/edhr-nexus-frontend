import { computed, ref, reactive } from 'vue';
import { useSpreadSheet } from './useSpreadSheet';

const { paper, selection } = useSpreadSheet();

type CellStyleState = Record<
  | 'bold'
  | 'italic'
  | 'underline'
  | 'through'
  | 'wrap'
  | 'left'
  | 'center'
  | 'right'
  | 'top'
  | 'middle'
  | 'bottom',
  boolean
>;

const cellStyleValue = computed(() => {
  const { _t, _l } = selection.e;
  if (_t === 0) return {};

  return paper.value.cells[_t - 1][_l - 1].style ?? {};
});

const cellStyleState = computed<CellStyleState | undefined>(() => {
  const { _t } = selection.e;
  if (_t === 0) return;

  const s = cellStyleValue.value;
  const textDecorations = s['text-decoration'] ? (s['text-decoration'] as string).split(' ') : [];

  const state: CellStyleState = {
    bold: s['font-weight'] === 'bold',
    italic: s['font-style'] === 'italic',
    underline: textDecorations.includes('underline'),
    through: textDecorations.includes('line-through'),
    wrap: s['word-break'] === 'break-all' || s['white-space'] === 'pre-line',
    left: s['text-align'] === 'left',
    center: s['text-align'] === 'center',
    right: s['text-align'] === 'right',
    top: s['vertical-align'] === 'top',
    middle: s['vertical-align'] === 'middle',
    bottom: s['vertical-align'] === 'bottom'
  };
  return state;
});

export function useState() {
  return {
    cellStyleValue,
    cellStyleState,
  };
}
