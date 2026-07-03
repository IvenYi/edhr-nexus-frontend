import { range } from 'lodash-es';
import { IPaper, ICell } from '../types';
import type { ICellBorder } from '@gct/nocode-base';

/**
 * 获取单元格坐标
 * @param x
 * @param y
 * @param paper
 * @returns
 */
function _getTargetPosition(x: number, y: number, paper: IPaper): { x: number; y: number } {
  const mergedCell = (paper.mergedCells ?? []).find(
    (c) => c.l <= x && c.r >= x && c.t <= y && c.b >= y,
  );
  if (mergedCell) {
    // 如果合并的单元格
    return {
      x: mergedCell.l,
      y: mergedCell.t,
    };
  } else {
    return { x, y };
  }
}

/**
 * 获取当前单元格指定方向的单元格
 * @param x
 * @param y
 * @param paper
 */
type DeltaItemValue = -1 | 0 | 1;
type DeltaParam = {
  x?: DeltaItemValue;
  y?: DeltaItemValue;
};
function _getCellPositionByDelta(
  x: number,
  y: number,
  paper: IPaper,
  delta: DeltaParam,
): { x: number; y: number } | null {
  let _x = x + (delta.x ?? 0);
  let _y = y + (delta.y ?? 0);

  const mergedCell = (paper.mergedCells ?? []).find(
    (c) => c.l <= x && c.r >= x && c.t <= y && c.b >= y,
  );

  if (mergedCell) {
    if (delta.x === -1) {
      _x = mergedCell.l - 1;
      _y = y;
    } else if (delta.x === 1) {
      _x = mergedCell.r + 1;
      _y = y;
    } else if (delta.y === -1) {
      _x = x;
      _y = mergedCell.t - 1;
    } else if (delta.y === 1) {
      _x = x;
      _y = mergedCell.b + 1;
    }
  }

  if (_x < 1 || _x > paper.cols.length || _y < 1 || _y > paper.rows.length) {
    return null;
  }

  return _getTargetPosition(_x, _y, paper);
}

export class CellBorder {
  /**
   * 获取指定单元格的指定方向的相邻单元格
   * @author lingxiaoming
   * @date 2024-07-02 04:23:11
   * @static
   * @param {number} x
   * @param {number} y
   * @param {IPaper} paper
   * @param {('top' | 'bottom' | 'left' | 'right')} position
   * @return {*}
   */
  static getAdjacentCell(
    x: number,
    y: number,
    paper: IPaper,
    position: 'top' | 'bottom' | 'left' | 'right',
  ) {
    let targetCell: ICell | null;
    switch (position) {
      case 'top':
        targetCell = paper.cells[y - 1 - 1]?.[x - 1];
        break;
      case 'bottom':
        targetCell = paper.cells[y + 1 - 1]?.[x - 1];
        break;
      case 'left':
        targetCell = paper.cells[y - 1]?.[x - 1 - 1];
        break;
      case 'right':
        targetCell = paper.cells[y - 1]?.[x + 1 - 1];
        break;
      default:
        return undefined;
    }
    if (!targetCell) return;
    return targetCell;
  }

  static setLeft(x: number, y: number, paper: IPaper, bold = false, value = true) {
    // 设置本身
    const targetCellData = paper.cells[y - 1][x - 1];
    targetCellData.border = {
      ...targetCellData.border,
      left: value,
      bold,
      boldLeft: bold,
    };

    // 清除的时候清除两侧的边框
    if (value === false) {
      // 设置左侧单元格（如果有的话）的右边框
      const leftCell = this.getAdjacentCell(x, y, paper, 'left');
      if (leftCell) {
        leftCell.border = {
          ...leftCell.border,
          right: false,
          bold: false,
          boldLeft: false,
        };
      }
    }
  }

  static setRight(x: number, y: number, paper: IPaper, bold = false, value = true) {
    // 设置本身
    const targetCellData = paper.cells[y - 1][x - 1] || {};
    targetCellData.border = {
      ...targetCellData.border,
      right: value,
      bold,
      boldRight: bold,
    };

    // 清除的时候清除两侧的边框
    if (value === false) {
      // 设置右侧单元格（如果有的话）的左边框
      const rightCell = this.getAdjacentCell(x, y, paper, 'right');
      if (rightCell) {
        rightCell.border = {
          ...rightCell.border,
          left: false,
          bold: false,
          boldRight: bold,
        };
      }
    }
  }

  static setTop(x: number, y: number, paper: IPaper, bold = false, value = true) {
    // 设置本身
    const targetCellData = paper.cells[y - 1][x - 1];
    targetCellData.border = {
      ...targetCellData.border,
      top: value,
      bold,
      boldTop: bold,
    };

    // 清除的时候清除两侧的边框
    if (value === false) {
      // 设置上侧单元格（如果有的话）的下边框
      const topCell = this.getAdjacentCell(x, y, paper, 'top');
      if (topCell) {
        topCell.border = {
          ...topCell.border,
          bottom: false,
          bold: false,
          boldTop: false,
        };
      }
    }
  }

  static setBottom(x: number, y: number, paper: IPaper, bold = false, value = true) {
    // 设置本身
    const targetCellData = paper.cells[y - 1][x - 1];
    targetCellData.border = {
      ...targetCellData.border,
      bottom: value,
      bold,
      boldBottom: bold,
    };

    // 清除的时候清除两侧的边框
    if (value === false) {
      // 设置下侧单元格（如果有的话）的上边框
      const bottomCell = this.getAdjacentCell(x, y, paper, 'bottom');
      if (bottomCell) {
        bottomCell.border = {
          ...bottomCell.border,
          top: false,
          bold: false,
          boldBottom: false,
        };
      }
    }
  }

  static clearBorder(x: number, y: number, paper: IPaper) {
    this.setLeft(x, y, paper, false, false);
    this.setRight(x, y, paper, false, false);
    this.setTop(x, y, paper, false, false);
    this.setBottom(x, y, paper, false, false);
    const targetCellData = paper.cells[y - 1][x - 1];
    targetCellData.border = undefined;
  }

  /**
   * 获取单元格是否有下边框 作用于分页时判断最后一行是否有下边框
   * @param x
   * @param y
   * @param paper
   */
  static getBottomBorder(x: number, y: number, paper: IPaper): boolean {
    const mergedCells = paper.mergedCells;
    const mergeCell = mergedCells.find((c) => c.t === y && c.l === x);
    if (mergeCell) {
      return range(mergeCell.l, mergeCell.r).every(
        (v) => !!paper.cells[mergeCell.b - 1][v - 1]?.border?.bottom,
      );
    } else {
      // 自身下边框
      return !!paper.cells[y - 1][x - 1].border?.bottom;
    }
  }

  /**
   *
   * @param x
   * @param y
   * @param paper
   */
  static getTopBorder(x: number, y: number, paper: IPaper): boolean {
    const mergedCells = paper.mergedCells;
    const mergeCell = mergedCells.find((c) => c.t === y && c.l === x);
    if (mergeCell) {
      return range(mergeCell.l, mergeCell.r).every(
        (v) => !!paper.cells[mergeCell.t - 1][v - 1]?.border?.top,
      );
    } else {
      // 自身上边框
      return !!paper.cells[y - 1][x - 1].border?.top;
    }
  }

  /**
   *
   * @param x
   * @param y
   * @param paper
   */
  static getLeftBorder(x: number, y: number, paper: IPaper): boolean {
    const mergedCells = paper.mergedCells;
    const mergeCell = mergedCells.find((c) => c.t === y && c.l === x);
    if (mergeCell) {
      console.log(
        x,
        y,
        range(mergeCell.t, mergeCell.b).every(
          (v) => !!paper.cells[v - 1][mergeCell.l - 1]?.border?.left,
        ),
      );

      return range(mergeCell.t, mergeCell.b).every(
        (v) => !!paper.cells[v - 1][mergeCell.l - 1]?.border?.left,
      );
    } else {
      // 自身左边框
      return !!paper.cells[y - 1][x - 1].border?.left;
    }
  }

  /**
   *
   * @param x
   * @param y
   * @param paper
   */
  static getRightBorder(x: number, y: number, paper: IPaper): boolean {
    const mergedCells = paper.mergedCells;
    const mergeCell = mergedCells.find((c) => c.t === y && c.l === x);
    if (mergeCell) {
      return range(mergeCell.t, mergeCell.b).every(
        (v) => !!paper.cells[v - 1][mergeCell.r - 1]?.border?.right,
      );
    } else {
      // 自身右边框
      return !!paper.cells[y - 1][x - 1].border?.right;
    }
  }

  /**
   * 获取单元格的边框信息，合并单元格只有左上角那个一会获得汇总后的边框信息
   * @author lingxiaoming
   * @date 2024-07-04 06:35:10
   * @static
   * @param {number} x
   * @param {number} y
   * @param {IPaper} paper
   * @return {*}  {(ICellBorder | undefined)}
   */
  static getCellBorder(x: number, y: number, paper: IPaper): ICellBorder | undefined {
    const mergedCell = (paper.mergedCells ?? []).find(
      (c) => c.l <= x && c.r >= x && c.t <= y && c.b >= y,
    );
    if (mergedCell) {
      // 是否在合并单元格范围内
      if (mergedCell.t === y && mergedCell.l === x) {
        //是否是合并里面第一个单元格
        const top = range(mergedCell.l, mergedCell.r + 1).every(
          (v) => !!paper.cells[mergedCell.t - 1][v - 1]?.border?.top,
        );
        const bottom = range(mergedCell.l, mergedCell.r + 1).every(
          (v) => !!paper.cells[mergedCell.b - 1][v - 1]?.border?.bottom,
        );
        const left = range(mergedCell.t, mergedCell.b + 1).every(
          (v) => !!paper.cells[v - 1][mergedCell.l - 1]?.border?.left,
        );
        const right = range(mergedCell.t, mergedCell.b + 1).every(
          (v) => !!paper.cells[v - 1][mergedCell.r - 1]?.border?.right,
        );
        const bold =
          range(mergedCell.l, mergedCell.r + 1).some(
            (v) => !!paper.cells[mergedCell.t - 1][v - 1]?.border?.bold,
          ) ?? false;
        const boldTop =
          range(mergedCell.l, mergedCell.r + 1).every(
            (v) => !!paper.cells[mergedCell.t - 1][v - 1]?.border?.boldTop,
          ) ?? false;
        const boldBottom =
          range(mergedCell.l, mergedCell.r + 1).every(
            (v) => !!paper.cells[mergedCell.b - 1][v - 1]?.border?.boldBottom,
          ) ?? false;
        const boldLeft =
          range(mergedCell.t, mergedCell.b + 1).every(
            (v) => !!paper.cells[v - 1][mergedCell.l - 1]?.border?.boldLeft,
          ) ?? false;
        const boldRight =
          range(mergedCell.t, mergedCell.b + 1).every(
            (v) => !!paper.cells[v - 1][mergedCell.r - 1]?.border?.boldRight,
          ) ?? false;
        return {
          top,
          bottom,
          left,
          right,
          bold,
          boldTop,
          boldBottom,
          boldLeft,
          boldRight,
        };
      }
      // 范围内的其他格子不需要绘制边框
    }
    // 普通单元格返回自己的边框
    return paper.cells[y - 1][x - 1]?.border || {};
  }
}
