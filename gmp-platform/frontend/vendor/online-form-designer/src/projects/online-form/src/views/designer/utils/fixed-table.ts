import { IPaper, IRange, IFixedTable } from '../types';
import { zip } from 'lodash-es';
import { num2Col } from '../utils';

export interface IDataGroupArea {
  dataGroupIndex?: number;
  range: IRange;
  cellRef: Record<string, string>;
  cellTo: Record<string, string>;
}

export class FixedTable {
  paper: IPaper;
  fixedTable: IFixedTable;

  /**
   *
   * @param paper 纸张信息
   * @param fixedTable 固定表信息
   */
  constructor(paper: IPaper, fixedTable: IFixedTable) {
    this.paper = paper;
    this.fixedTable = fixedTable;
  }

  /**
   * 计算出所有数据分组
   */
  calcDataGroups() {
    const { fixedTable, paper } = this;
    const originCells: string[][] = [];
    let originCellsFlat: string[] = [];

    const bottomRange = Math.max(fixedTable.range.b, fixedTable.dgRange?.b ?? 0);
    // const dataGroups: Array<{
    //   range: IRange;
    //   cells: string[][];
    // }> = [];
    const xDataGroups: IDataGroupArea[] = [];
    const yDataGroups: IDataGroupArea[] = [];
    const otherDataGroups: IDataGroupArea[][] = [];
    const allCellRef: Record<string, string> = {};
    if (fixedTable.dgRange) {
      const { t, l, r, b } = fixedTable.dgRange!;
      // 数据分组起始模版
      Array(b - t + 1)
        .fill('')
        .forEach((m, i) => {
          originCells.push([]);
          Array(r - l + 1)
            .fill('')
            .forEach((n, j) => {
              const x = l + j;
              const y = t + i;

              const mc = (paper.mergedCells ?? []).find(
                (e) => e.t <= y && e.b >= y && e.l <= x && e.r >= x,
              );
              const mcTl = mc?.t === y && mc.l === x;

              if (!mc || (mc && mcTl)) {
                originCells[i].push(`${num2Col(x)}${y}`);
              } else {
                originCells[i].push('');
              }
            });
        });

      console.log('nextCells originCells', originCells);
      originCellsFlat = originCells.flat().filter((cell) => cell);
      const originCellsX = zip(...zip(...originCells).filter((row) => row.some((c) => c)));
      const originCellsY = originCells.filter((row) => row.some((c) => c));

      console.log('nextCells originCellsX', originCellsX);
      console.log('nextCells originCellsY', originCellsY);

      if (fixedTable.autoFill) {
        // 自动填充逻辑
        let startX = r + 1;
        while (startX <= fixedTable.range.r) {
          const cellRef: Record<string, string> = {};
          const cellTo: Record<string, string> = {};
          // let startXTmp = startX;
          let x = startX;
          const y = t;
          Array(originCellsX[0].length)
            .fill('')
            .forEach((_, colIndex) => {
              const mCell = paper.mergedCells.find(
                (c) => c.l <= x && c.r >= x && c.t <= y && c.b >= y,
              );

              // 处理引用关系
              originCellsX.forEach((_, rowIndex) => {
                const cellname: string = `${num2Col(x)}${y + rowIndex}`;
                const sourceCell = originCellsX[rowIndex][colIndex];
                if (sourceCell) {
                  cellRef[cellname] = sourceCell;
                  cellTo[sourceCell] = cellname;
                }
              });

              if (mCell) {
                x = mCell.r + 1;
              } else {
                x++;
              }
            });

          if (x - 1 <= fixedTable.range.r) {
            xDataGroups.push({
              range: {
                t,
                b,
                l: startX,
                r: x - 1, // 下一组的l-1为当前组的r
              },
              cellRef,
              cellTo,
            });
          }
          startX = x;
        }

        console.log('nextCells ...xx', xDataGroups);

        let startY = b + 1;
        while (startY <= bottomRange) {
          const cellRef: Record<string, string> = {};
          const cellTo: Record<string, string> = {};
          const x = l;
          let y = startY;

          Array(originCellsY.length)
            .fill('')
            .forEach((_, rowIndex) => {
              const mCell = paper.mergedCells.find(
                (c) => c.l <= x && c.r >= x && c.t <= y && c.b >= y,
              );

              // 处理引用关系
              originCellsY[0].forEach((_, colIndex) => {
                const cellname: string = `${num2Col(x + colIndex)}${y}`;
                const sourceCell = originCellsY[rowIndex][colIndex];
                if (sourceCell) {
                  cellRef[cellname] = sourceCell;
                  cellTo[sourceCell] = cellname;
                }
              });

              if (mCell) {
                y = mCell.b + 1;
              } else {
                y++;
              }
            });

          if (y - 1 <= bottomRange) {
            yDataGroups.push({
              range: {
                l,
                r,
                t: startY,
                b: y - 1, // 下一组的t-1为当前组的b
              },
              cellRef,
              cellTo,
            });
          }
          startY = y;
        }
      }

      console.log('nextCells ...yy', yDataGroups);
    }
    // dataGroups.push({
    //   range: {
    //     ...fixedTable.dgRange!,
    //   },
    //   cells: originCells,
    // });

    yDataGroups.forEach((ydg) => {
      const rowDataGroups: IDataGroupArea[] = [];
      xDataGroups.forEach((xdg) => {
        const { t, b } = ydg.range;
        const { l, r } = xdg.range;
        const cellRef: Record<string, string> = {};
        const cellTo: Record<string, string> = {};
        originCellsFlat.forEach((c) => {
          const xCellTo = xdg.cellTo[c];
          const yCellTo = ydg.cellTo[c];
          const newCellTo = xCellTo.replace(/\d/g, '') + yCellTo.replace(/[A-Z]/g, '');
          cellTo[c] = newCellTo;
          cellRef[newCellTo] = c;
        });
        const item: IDataGroupArea = {
          range: {
            t,
            b,
            l,
            r,
          },
          cellRef,
          cellTo,
        };
        rowDataGroups.push(item);
      });
      otherDataGroups.push(rowDataGroups);
    });

    /**
     * 处理数据索引
     */
    const width = xDataGroups.length + 1;
    const height = yDataGroups.length + 1;
    if (fixedTable.fillDirection === 'x') {
      xDataGroups.forEach((_, index) => {
        _.dataGroupIndex = index + 1;
      });
      yDataGroups.forEach((_, index) => {
        _.dataGroupIndex = width * (index + 1);
      });
      otherDataGroups.forEach((row, rowIndex) => {
        row.forEach((_, colIndex) => {
          _.dataGroupIndex = width * (rowIndex + 1) + colIndex + 1;
        });
      });
    } else {
      yDataGroups.forEach((_, index) => {
        _.dataGroupIndex = index + 1;
      });
      xDataGroups.forEach((_, index) => {
        _.dataGroupIndex = height * (index + 1);
      });
      otherDataGroups.forEach((row, rowIndex) => {
        row.forEach((_, colIndex) => {
          _.dataGroupIndex = height * (colIndex + 1) + rowIndex + 1;
        });
      });
    }

    const result = {
      id: fixedTable.id,
      name: fixedTable.name,
      table: fixedTable,
      cells: originCellsFlat,
      xDataGroups,
      yDataGroups,
      otherDataGroups,
    };

    console.log(result);

    return result;
  }
}
