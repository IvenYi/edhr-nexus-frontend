import { IPaper, IRange, ITable } from '../types';
import { zip } from 'lodash-es';
import { num2Col } from '../utils';

export interface IDataGroupArea {
  dataGroupIndex?: number;
  range: IRange;
  cellRef: Record<string, string>;
  cellTo: Record<string, string>;
}

type ITableMore = ITable & {
  _dataGroupRange?: IRange;
  _dataGroupCount?: number;
};

export class DataGroup {
  paper: IPaper;
  table: ITableMore;

  /**
   *
   * @param paper 纸张信息
   * @param table 子表信息
   */
  constructor(paper: IPaper, table: ITableMore) {
    this.paper = paper;
    this.table = table;
  }

  /**
   * 计算出所有数据分组
   */
  calcDataGroups() {
    const { table, paper } = this;
    const originCells: string[][] = [];
    let originCellsFlat: string[] = [];

    const bottomRange = Math.max(table.range.b, table._dataGroupRange?.b ?? 0);
    const xDataGroups: IDataGroupArea[] = [];
    const yDataGroups: IDataGroupArea[] = [];
    const otherDataGroups: IDataGroupArea[][] = [];
    if (table._dataGroupRange) {
      const { t, l, r, b } = table._dataGroupRange!;
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

      if (table.autoFill) {
        // 自动填充逻辑
        let startX = r + 1;
        while (startX <= table.range.r) {
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

          if (x - 1 <= table.range.r) {
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
    if (table.fillDirection === 'x') {
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

    const cellRefMap = {};

    xDataGroups.forEach((_) => {
      Object.keys(_.cellRef).forEach((key) => {
        cellRefMap![key] = {
          dataGroupIndex: _.dataGroupIndex,
          cellRef: _.cellRef[key],
        };
      });
    });
    yDataGroups.forEach((_) => {
      Object.keys(_.cellRef).forEach((key) => {
        cellRefMap![key] = {
          dataGroupIndex: _.dataGroupIndex,
          cellRef: _.cellRef[key],
        };
      });
    });
    otherDataGroups.forEach((row) => {
      row.forEach((_) => {
        Object.keys(_.cellRef).forEach((key) => {
          cellRefMap![key] = {
            dataGroupIndex: _.dataGroupIndex,
            cellRef: _.cellRef[key],
          };
        });
      });
    });

    const count =
      1 + xDataGroups.length + yDataGroups.length + xDataGroups.length * yDataGroups.length;

    const result = {
      id: table.id,
      name: table.name,
      table: table,
      cells: originCellsFlat,
      xDataGroups:
        table._dataGroupCount !== undefined
          ? xDataGroups.filter((item) => item.dataGroupIndex! + 1 <= table._dataGroupCount!)
          : xDataGroups,
      yDataGroups:
        table._dataGroupCount !== undefined
          ? yDataGroups.filter((item) => item.dataGroupIndex! + 1 <= table._dataGroupCount!)
          : yDataGroups,
      otherDataGroups: table._dataGroupCount
        ? otherDataGroups
            .map((r) => {
              return r.filter((c) => c.dataGroupIndex! + 1 <= table._dataGroupCount!);
            })
            .filter((item) => item.length)
        : otherDataGroups,
      cellRefMap,
      count: table._dataGroupCount !== undefined ? Math.min(count, table._dataGroupCount) : count,
    };

    console.log(result);

    return result;
  }
}
