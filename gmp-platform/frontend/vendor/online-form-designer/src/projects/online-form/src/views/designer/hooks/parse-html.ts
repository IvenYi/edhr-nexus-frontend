import { isEmpty, pick, range } from 'lodash-es';
import { ICell, ICellStyle, ICopyData, IRange } from '../types';
import type { ICellBorder } from '@gct/nocode-base';

/** 需要解析的的样式 */
const NeedStyleKeyMap: Partial<Record<keyof CSSStyleDeclaration, string>> = {
  fontWeight: 'font-weight',
  fontStyle: 'font-style',
  textDecoration: 'text-decoration',
  textAlign: 'text-align',
  verticalAlign: 'vertical-align',
  color: 'color',
  backgroundColor: 'background-color',
  wordBreak: 'word-break',
  whiteSpace: 'white-space',
  fontSize: 'font-size',
  fontFamily: 'font-family',
} as const;

const CopyContainerId = 'online-form-copy-container';
/**
 * 获取一个新的容器，之前存在先删除在创建
 * @author lingxiaoming
 * @date 2024-07-09 09:52:40
 * @return {*}
 */
function getNewCopyContainer() {
  let container = document.getElementById(CopyContainerId);
  if (container) {
    container.remove();
  }
  container = document.createElement('div');
  container.style.display = 'none';
  container.setAttribute('id', CopyContainerId);
  document.body.appendChild(container);
  return container;
}

/**
 * 根据给定的html字符串渲染并获取table的dom元素
 * @author lingxiaoming
 * @date 2024-07-09 09:52:59
 * @param {string} html
 * @return {*}
 */
function getTableElement(html: string) {
  const container = getNewCopyContainer();
  const shadowRoot = container.attachShadow({ mode: 'open' });
  shadowRoot.innerHTML = html;
  return shadowRoot.querySelector('table');
}

/**
 * 解析td的dom元素，转换成ICell的相关数据
 * @author lingxiaoming
 * @date 2024-07-09 09:53:30
 * @param {HTMLTableCellElement} td
 * @return {*}  {ICell}
 */
function parseTd(td: HTMLTableCellElement): ICell {
  const computedStyle = getComputedStyle(td);
  const border: ICellBorder = {
    top: computedStyle.borderTopWidth !== '0px',
    bottom: computedStyle.borderBottomWidth !== '0px',
    left: computedStyle.borderLeftWidth !== '0px',
    right: computedStyle.borderRightWidth !== '0px',
  };

  const style: ICellStyle = {};
  Object.keys(NeedStyleKeyMap).forEach((key) => {
    style[NeedStyleKeyMap[key]] = computedStyle[key];
  });

  return {
    value: td.innerText,
    border: isEmpty(border) ? undefined : border,
    style,
  };
}

/**
 * 解析Html字符串
 * @author lingxiaoming
 * @date 2024-07-08 04:20:26
 * @export
 * @param {string} html
 */
export function parseHtml(html: string): ICopyData {
  const table = getTableElement(html);
  if (!table) {
    throw new Error($t('sys.onlineForm.htmlNotHasTableTip'));
  }
  const rows = table.querySelectorAll('tr');
  const cells: ICell[][] = [];
  const mergedCells: IRange[] = [];
  const setCell = (x, y, cell) => {
    if (!cells[y]) {
      cells[y] = [];
    }
    cells[y][x] = cell;
  };

  /** 获取指定行的第一个无值位置的索引 */
  const getInsertColIndex = (y) => {
    if (!cells[y]) {
      return 0;
    }
    const firstUndefined = cells[y].findIndex((item) => !item);
    return firstUndefined === -1 ? cells[y].length : firstUndefined;
  };

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const tr = rows[rowIndex];
    const tds = tr.querySelectorAll('td');
    for (let tdIndex = 0; tdIndex < tds.length; tdIndex++) {
      const td = tds[tdIndex];
      const colIndex = getInsertColIndex(rowIndex);
      if (td.colSpan > 1 || td.rowSpan > 1) {
        mergedCells.push({
          t: rowIndex + 1,
          l: colIndex + 1,
          r: colIndex + td.colSpan,
          b: rowIndex + td.rowSpan,
        });
      }

      const parsedCell = parseTd(td);
      range(0, td.rowSpan).forEach((i) => {
        const y = rowIndex + i;
        range(0, td.colSpan).forEach((j) => {
          const x = colIndex + j;
          setCell(
            x,
            y,
            y === rowIndex && x === colIndex ? parsedCell : pick(parsedCell, ['border', 'style']),
          );
        });
      });
    }
  }

  return {
    documentId: '',
    cells,
    mergedCells,
  };
}
