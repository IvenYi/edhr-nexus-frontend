import { SubTableType } from '../enums';
import { IPaper, ITable, IRange, ICell, IFixedTable } from '../types';
import type { SpreadSheetTag } from '/@online-form/views/types/spread-sheet.d';
import { DefaultPaper } from '../constants';
import { cloneDeep } from 'lodash-es';
import { CellBorder } from './cell-border';
import { CodeRunner } from './code-runner';

type DynamicTable = ITable & { _range_: IRange };
const CellType = {
  Default: 'Default',
  Widget: 'Widget',
  Field: 'Field',
} as const;

let cellOriginMap: Record<string, any> | null = null;
let cellRefOriginMap: Record<
  string,
  {
    cellRef: string;
    dataGroupIndex?: number;
    rowIndex?: number;
    colIndex?: number;
  }
> | null = null;
let masterField2SubTable: Record<
  string,
  (IFixedTable | ITable) & {
    colCells?: string[];
    crossCells?: string[];
    crossFields?: string[];
  }
> | null = null;
let masterField2CheckTable: Record<
  string,
  (IFixedTable | ITable) & {
    colCells?: string[];
    crossCells?: string[];
    crossFields?: string[];
  }
> | null = null;

const _transformStyleObject = (style: object): string => {
  return Object.keys(style)
    .map((key) => {
      return `${key}: ${style[key]};`;
    })
    .join(' ');
};

export class DomParser {
  static paper: IPaper;
  static table: Element;
  static dynamicTables: DynamicTable[];
  static tableDataGroups: any[];
  // static globalSubTables: ITable[];

  /**
   * @param els
   * @param elJsonArr
   * @param tableId
   * @param cellWeakMap
   * @returns
   */
  static _domToJson(
    els: Element[],
    elJsonArr: any = [],
    tableId?: string,
    cellWeakMap = new WeakMap(),
    tableWeakMap = new WeakMap(),
  ) {
    Array.prototype.forEach.call(els, (el: HTMLElement) => {
      const tagDesc: any = {
        tag: el.tagName.toLowerCase(),
        attrs: {},
        value: undefined,
      };

      const x = Number(el.dataset.x);
      const y = Number(el.dataset.y);

      if (el.tagName === 'TABLE') {
        tagDesc.attrs.cellpadding = '0';
        tagDesc.attrs.cellspacing = '0';
        tagDesc.attrs.style = 'table-layout: fixed; border-collapse: separate; width: 0;';
      } else if (el.tagName === 'COL') {
        tagDesc.attrs.width = DomParser.paper.cols[x - 1].width;
      } else if (el.tagName === 'TR') {
        tagDesc.attrs.height = DomParser.paper.rows[y - 1].height;

        // 全局表头
        if (
          DomParser.paper.thead?.thRange &&
          DomParser.paper.thead?.thRange.t <= y &&
          DomParser.paper.thead?.thRange.b >= y
        ) {
          tagDesc.type = 'thead';
        }

        // 在子表中
        const subTableData = DomParser.dynamicTables.find((item) => item.id === tableId);
        if (subTableData?.thRange && subTableData?.thRange.t <= y && subTableData?.thRange.b >= y) {
          tagDesc.type = 'thead';
        } else if (
          // 子表范围内的行全部类型改成动态行
          subTableData?.range &&
          subTableData?.range.t <= y &&
          subTableData?.range.b >= y &&
          [
            SubTableType.DEFAULT,
            SubTableType._2D,
            SubTableType.MATERIAL_CONSUMPTION,
            SubTableType.MATERIAL_BALANCE,
          ].includes(subTableData.type)
        ) {
          tagDesc.type = 'dynamicTr';
        }
      } else if (el.tagName === 'TD') {
        tagDesc.valueType = CellType.Default;
        const {
          value,
          fieldMeta,
          fieldWidget,
          paperWidget,
          type: valueType,
          multiFields,
          multiFieldsContent,
          autoMerge,
          xAutoMerge,
          fillDirection,
        } = (DomParser.paper.cells[y - 1][x - 1] || {}) as ICell;
        tagDesc.autoMerge = autoMerge;
        tagDesc.xAutoMerge = xAutoMerge;
        tagDesc.fillDirection = fillDirection;

        const border = CellBorder.getCellBorder(x, y, DomParser.paper);

        tagDesc.cbb = border?.bottom;
        tagDesc.cbt = border?.top;
        tagDesc.cbl = border?.left;
        tagDesc.cbr = border?.right;
        tagDesc.bold = border?.bold;
        tagDesc.boldTop = border?.boldTop;
        tagDesc.boldBottom = border?.boldBottom;
        tagDesc.boldLeft = border?.boldLeft;
        tagDesc.boldRight = border?.boldRight;

        // 查询是不是在子表中
        const subTable = DomParser.dynamicTables?.find((t) => {
          return (
            t._range_.l <= x &&
            t._range_.r >= x &&
            t._range_.t <= y &&
            t._range_.b >= y &&
            ([
              SubTableType.DEFAULT,
              SubTableType._2D,
              SubTableType.MATERIAL_CONSUMPTION,
              SubTableType.MATERIAL_BALANCE,
            ].includes(t.type) ||
              (t.indexedTd !== true && SubTableType.FIXED === t.type)) &&
            tableWeakMap.get(t) !== 'running'
          );
        });

        // 子表左上
        const isSubTableTl = subTable && subTable._range_.l === x && subTable._range_.t === y;

        if (subTable) {
          // 子表
          if (isSubTableTl) {
            // 子表左上
            tableWeakMap.set(subTable, 'running');
            const trs: any[] = [];
            const cols: any[] = [];

            for (let y = subTable._range_.t; y <= subTable._range_.b; y++) {
              const tr: any = {
                tagName: 'TR',
                dataset: {
                  y,
                },
              };
              const tds: any[] = [];
              for (let x = subTable._range_.l; x <= subTable._range_.r; x++) {
                if (y === subTable._range_.t) {
                  cols.push({
                    tag: 'col',
                    attrs: {
                      width: DomParser.paper.cols[x - 1].width,
                    },
                  });
                }
                tds.push(DomParser.table.querySelector(`td[data-x="${x}"][data-y="${y}"]`));
              }
              tr.children = tds;
              trs.push(tr);
            }

            /** 子表标签对象属性处理 */
            tagDesc.children = [
              {
                tag: 'table',
                attrs: {
                  cellpadding: '0',
                  cellspacing: '0',
                },
                field: subTable.field,
                model: subTable.mainModel,
                isFixedTable: subTable.type === SubTableType.FIXED,
                quickFill: subTable.quickFill,
                tableTitle: subTable.name,
                subModelType: subTable.type || undefined,
                children: [
                  {
                    tag: 'colgroup',
                    children: cols,
                  },
                  {
                    tag: 'tbody',
                    children: DomParser._domToJson(
                      trs as any,
                      undefined,
                      subTable.id,
                      cellWeakMap,
                      tableWeakMap,
                    ),
                  },
                ],
              },
            ];
            Object.assign(tagDesc.attrs, {
              colspan: subTable._range_.r - subTable._range_.l + 1,
              rowspan: subTable._range_.b - subTable._range_.t + 1,
            });
            tableWeakMap.set(subTable, 'finished');
          }
          if (!isSubTableTl) {
            // 非子表左上
            tagDesc['cellHidden'] = true;
            tagDesc.valueType = undefined;
          }
        } else {
          // 非子表
          if (el.hasAttribute('hidden')) {
            tagDesc.valueType = undefined;
            tagDesc['cellHidden'] = true;
          } else {
            const style = el.getAttribute('style');
            tagDesc.attrs.style = style;

            const colspan = el.getAttribute('colspan');
            const rowspan = el.getAttribute('rowspan');

            if (colspan && colspan != '1') {
              Object.assign(tagDesc.attrs, {
                colspan,
              });
            }
            if (rowspan && rowspan != '1') {
              Object.assign(tagDesc.attrs, {
                rowspan,
              });
            }

            tagDesc.value = value;
            const opt: Partial<SpreadSheetTag.Td> = multiFields
              ? {
                  valueType: CellType.Field,
                  multiFields,
                  autoMerge,
                  xAutoMerge,
                  fillDirection,
                  multiFieldsContent: multiFieldsContent?.map((item) => {
                    return {
                      ...item,
                      valueType: CellType.Field,
                    };
                  }),
                }
              : {
                  valueType: valueType || CellType.Default,
                  fieldMeta,
                  fieldWidget,
                  paperWidget,
                  autoMerge,
                  fillDirection,
                  xAutoMerge,
                };

            // 单元格名称
            const cellName = el.dataset.name as string;
            if (cellOriginMap && cellName in cellOriginMap) {
              // 源单元格
              Object.assign(cellOriginMap[cellName], opt);
              Object.assign(tagDesc, {
                cellConfigRefId: cellName,
                dataGroupIndex: 0,
                ...cellRefOriginMap![cellName],
              });

              const targetTable = DomParser.dynamicTables?.find(
                (t) => t.id === tableId && t.type === SubTableType._2D,
              );
              if (targetTable && masterField2SubTable && masterField2SubTable[targetTable.field]) {
                // 处理二维表的交叉字段信息
                const crossCells: any[] = [];
                const crossFields: any[] = [];
                if (multiFields) {
                  multiFieldsContent?.forEach((item) => {
                    if (item.fieldMeta?.model === targetTable?.model) {
                      crossCells.push(cellName);
                      crossFields.push(item.fieldMeta?.field);
                    }
                  });
                } else {
                  if (opt.fieldMeta?.model === targetTable?.model) {
                    crossCells.push(cellName);
                    crossFields.push(opt.fieldMeta?.field);
                  }
                }
                masterField2SubTable[targetTable?.field].crossCells!.push(...crossCells);
                masterField2SubTable[targetTable?.field].crossFields!.push(...new Set(crossFields));
              }

              const targetCheckTable = DomParser.dynamicTables?.find(
                (item) =>
                  item.type === SubTableType.CHECK &&
                  item.dgRange &&
                  item.rowRange.t <= y &&
                  item.rowRange.b >= y &&
                  item.rowRange.l <= x &&
                  item.rowRange.r >= x &&
                  item.dgRange.t <= y &&
                  item.dgRange.b >= y &&
                  item.dgRange.l <= x &&
                  item.dgRange.r >= x,
              );

              if (
                targetCheckTable &&
                masterField2CheckTable &&
                masterField2CheckTable[targetCheckTable.field]
              ) {
                // 处理二维表的交叉字段信息
                const crossCells: any[] = [];
                const crossFields: any[] = [];
                if (multiFields) {
                  multiFieldsContent?.forEach((item) => {
                    if (item.fieldMeta?.model === targetCheckTable?.model) {
                      crossCells.push(cellName);
                      crossFields.push(item.fieldMeta?.field);
                    }
                  });
                } else {
                  if (opt.fieldMeta?.model === targetCheckTable?.model) {
                    crossCells.push(cellName);
                    crossFields.push(opt.fieldMeta?.field);
                  }
                }
                masterField2CheckTable[targetCheckTable?.field].crossCells!.push(...crossCells);
                masterField2CheckTable[targetCheckTable?.field].crossFields!.push(
                  ...new Set(crossFields),
                );
              }
            }
            if (cellRefOriginMap && cellName in cellRefOriginMap) {
              // 复制单元格
              const originCellName = cellRefOriginMap[cellName].cellRef;
              Object.assign(tagDesc, {
                cellConfigRefId: originCellName,
                dataGroupIndex: cellRefOriginMap[cellName].dataGroupIndex,
                ...cellRefOriginMap[cellName],
              });

              // 继承样式 start
              const originCellEl: HTMLElement = document.querySelector(
                `#sheet-cell--${originCellName}`,
              )!;
              tagDesc.attrs.style = originCellEl.getAttribute('style');
              const border = CellBorder.getCellBorder(
                Number(originCellEl.dataset.x),
                Number(originCellEl.dataset.y),
                DomParser.paper,
              );
              tagDesc.cbb = border?.bottom;
              tagDesc.cbt = border?.top;
              tagDesc.cbl = border?.left;
              tagDesc.cbr = border?.right;
              tagDesc.bold = border?.bold;
              tagDesc.boldTop = border?.boldTop;
              tagDesc.boldBottom = border?.boldBottom;
              tagDesc.boldLeft = border?.boldLeft;
              tagDesc.boldRight = border?.boldRight;
              // 继承样式 end
            } else {
              // 普通单元格
              Object.assign(tagDesc, opt);
            }
          }
        }
      }

      if (!['TD', 'COL'].includes(el.tagName)) {
        tagDesc.children = DomParser._domToJson(
          el.children as any,
          undefined,
          tableId,
          cellWeakMap,
          tableWeakMap,
        );
      }

      elJsonArr.push(tagDesc);
    });
    return elJsonArr;
  }

  /**
   * 图片转成json
   * @returns
   */
  static _image2json() {
    return (DomParser.paper.images ?? [])?.map((img) => {
      const m = DomParser.paper.medias?.find((m) => m.id === img.mediaId);
      const { top, left, width, height } = img.layout;
      const style = `position:absolute;top:${top}px;left:${left}px;width:${width}px;height:${height}px;`;
      return {
        attrs: {
          src: m?.src,
          style,
        },
      };
    });
  }

  /**
   * 设计态表格转成临时渲染json
   * @param table
   * @param paper
   * @returns
   */
  static dom2json(
    table: Element,
    paper: IPaper,
    options: Pick<SpreadSheetTag.Paper, 'type' | 'size'>,
    { tableDataGroups, checkColDataGroups, checkRowDataGroups, globalSubTables },
  ) {
    DomParser.table = table;
    DomParser.paper = paper;
    DomParser.tableDataGroups = tableDataGroups;
    // DomParser.globalSubTables = globalSubTables;

    console.log(tableDataGroups);

    DomParser.dynamicTables = globalSubTables.map((item) => {
      const table: Partial<DynamicTable> = {
        ...item,
      };
      table._range_ = {
        ...item.range,
      };
      if (item.thRange) {
        // 处理带表头的子表的真实范围
        table._range_.t = item.thRange.t;
      }
      return table as DynamicTable;
    });

    cellOriginMap = {};
    cellRefOriginMap = {};

    // 二维表信息
    masterField2SubTable = DomParser.dynamicTables
      ?.filter((item) => item.type === SubTableType._2D)
      .reduce((total, item) => {
        total[item.field] = {
          ...item,
          crossCells: [],
          crossFields: [],
        };
        return total;
      }, {}) as unknown as any;

    // 物料消耗表信息
    const masterField2MaterialConsumeTable = DomParser.dynamicTables
      ?.filter((item) => item.type === SubTableType.MATERIAL_CONSUMPTION)
      .reduce((total, item) => {
        total[item.field] = cloneDeep(item);
        return total;
      }, {}) as unknown as any;

    // 物料平衡表信息
    const masterField2MaterialBalanceTable = DomParser.dynamicTables
      ?.filter((item) => item.type === SubTableType.MATERIAL_BALANCE)
      .reduce((total, item) => {
        total[item.field] = cloneDeep(item);
        return total;
      }, {}) as unknown as any;

    // 检验表信息
    masterField2CheckTable = DomParser.dynamicTables
      ?.filter((item) => item.type === SubTableType.CHECK)
      .reduce((total, item) => {
        const colGroup = checkColDataGroups.find((g) => g.id === item.id);
        const rowGroup = checkRowDataGroups.find((g) => g.id === item.id);
        total[item.field] = {
          ...item,
          crossCells: [],
          crossFields: [],
          rowCount: rowGroup.count,
          colCount: colGroup.count,
        };
        return total;
      }, {}) as unknown as any;

    tableDataGroups.forEach((item) => {
      item.cells.forEach((cell) => {
        cellOriginMap![cell] =
          SubTableType._2D === item.table.type
            ? {
                fixedTable: {
                  model: item.table.colModel,
                  field: item.table.colField,
                  indexedTd: true,
                },
                masterFieldKey: item.table.field,
              }
            : {
                fixedTable: {
                  model: item.table.model,
                  field: item.table.field,
                  indexedTd: item.table.indexedTd,
                },
              };
      });
      item.xDataGroups.forEach((_) => {
        Object.keys(_.cellRef).forEach((key) => {
          cellRefOriginMap![key] = {
            subTableType: SubTableType._2D,
            dataGroupIndex: _.dataGroupIndex,
            cellRef: _.cellRef[key],
          };
        });
      });
      item.yDataGroups.forEach((_) => {
        Object.keys(_.cellRef).forEach((key) => {
          cellRefOriginMap![key] = {
            subTableType: SubTableType._2D,
            dataGroupIndex: _.dataGroupIndex,
            cellRef: _.cellRef[key],
          };
        });
      });
      item.otherDataGroups.forEach((row) => {
        row.forEach((_) => {
          Object.keys(_.cellRef).forEach((key) => {
            cellRefOriginMap![key] = {
              subTableType: SubTableType._2D,
              dataGroupIndex: _.dataGroupIndex,
              cellRef: _.cellRef[key],
            };
          });
        });
      });
    });

    checkColDataGroups.forEach((item) => {
      item.cells.forEach((c) => {
        cellRefOriginMap[c] = {
          subTableType: SubTableType.CHECK,
          cellRef: c,
          colIndex: 0,
        };
      });
      Object.entries(item.cellRefMap).forEach(([colCell, value]) => {
        cellRefOriginMap[colCell] = {
          subTableType: SubTableType.CHECK,
          cellRef: value.cellRef,
          colIndex: value.dataGroupIndex,
        };
      });
      const rowDataGroup = checkRowDataGroups.find((r) => r.id === item.id);
      if (rowDataGroup) {
        item.cells.forEach((c) => {
          cellOriginMap[c] = {
            masterFieldKey: item.table.field,
          };
        });
        rowDataGroup.cells.forEach((c) => {
          cellOriginMap[c] = {
            masterFieldKey: item.table.field,
          };
        });
        rowDataGroup.cells.forEach((r) => {
          cellRefOriginMap[r] = {
            subTableType: SubTableType.CHECK,
            cellRef: r,
            ...cellRefOriginMap[r],
            rowIndex: 0,
          };
        });
        Object.entries(rowDataGroup.cellRefMap).forEach(([rowCell, value]) => {
          const cellOriginRef = cellRefOriginMap[value.cellRef]?.cellRef;
          cellRefOriginMap[rowCell] = {
            subTableType: SubTableType.CHECK,
            ...cellRefOriginMap[rowCell],
            rowIndex: value.dataGroupIndex,
            cellRef: cellOriginRef ?? value.cellRef,
          };
        });
      }
    });

    const domJson = DomParser._domToJson([table]);

    const { t, b, l, r } = DomParser.paper.padding;
    const paperJson: SpreadSheetTag.Paper = {
      tag: 'paper',
      padding: `${t}mm ${r}mm ${b}mm ${l}mm`,
      orientation: DomParser.paper.orientation,
      children: [...domJson],
      headerWidgets: paper.paperHeaderWidgets ?? [],
      footerWidgets: paper.paperFooterWidgets ?? [],
      images: DomParser._image2json(),
      paramToField: paper.paramToField ?? [],
      parameterMapping: paper.parameterMapping ?? [],
      customDataSource: paper.customDataSource ?? [],
      checkTableDataSource: paper.checkTableDataSource ?? [],
      subTableFieldMap: paper.dynamicTables?.map((item) => item.field) ?? [],
      masterField2SubTable,
      masterField2CheckTable,
      masterField2MaterialConsumeTable,
      masterField2MaterialBalanceTable,
      ...options,
      cellConfigMap: cellOriginMap,
      javascript: CodeRunner.buildRuntimeJs(paper.javascript ?? ''),
    };

    cellOriginMap = null;
    cellRefOriginMap = null;

    console.log(paperJson);

    return paperJson;
  }

  /**
   * 直接根据导入的模版生成runtime
   */
  static async toRuntimeJson(paper: IPaper, options: Partial<SpreadSheetTag.Paper>) {
    DomParser.paper = {
      ...cloneDeep(DefaultPaper),
      ...paper,
    };

    const cols = DomParser.paper.cols.map((item) => {
      return {
        tag: 'col',
        attrs: {
          width: item.width,
        },
      };
    });

    const rows = DomParser.paper.rows.map((rowItem, rowIndex) => {
      return {
        tag: 'tr',
        attrs: {
          height: rowItem.height,
        },
        children: DomParser.paper.cols.map((_, colIndex) => {
          const tagDesc: any = {
            tag: 'td',
            attrs: {},
            value: undefined,
          };

          const {
            value,
            // border,
            type: valueType,
            style,
          } = DomParser.paper.cells[rowIndex][colIndex] as ICell;

          // 检查是否合并
          const mergedCell = DomParser.paper.mergedCells.find(
            (c) =>
              c.l <= colIndex + 1 &&
              c.r >= colIndex + 1 &&
              c.t <= rowIndex + 1 &&
              c.b >= rowIndex + 1,
          );
          const mergeCellTl =
            mergedCell && mergedCell.t === rowIndex + 1 && mergedCell.l === colIndex + 1;
          const cellVisible = !mergedCell || mergeCellTl;

          const border = CellBorder.getCellBorder(colIndex + 1, rowIndex + 1, DomParser.paper);

          tagDesc.cbb = border?.bottom;
          tagDesc.cbt = border?.top;
          tagDesc.cbl = border?.left;
          tagDesc.cbr = border?.right;
          tagDesc.bold = border?.bold;
          tagDesc.boldTop = border?.boldTop;
          tagDesc.boldBottom = border?.boldBottom;
          tagDesc.boldLeft = border?.boldLeft;
          tagDesc.boldRight = border?.boldRight;

          if (cellVisible) {
            style && (tagDesc.attrs.style = _transformStyleObject(style) + 'border: none;');
            if (mergeCellTl) {
              const colspan = mergedCell.r - mergedCell.l + 1;
              const rowspan = mergedCell.b - mergedCell.t + 1;
              colspan > 1 && (tagDesc.attrs.colspan = String(colspan));
              rowspan > 1 && (tagDesc.attrs.rowspan = String(rowspan));
            }

            tagDesc.value = value;
            const opt: Partial<SpreadSheetTag.Td> = {
              valueType: valueType || CellType.Default,
            };

            Object.assign(tagDesc, opt);
          } else {
            tagDesc.cellHidden = true;
            tagDesc.valueType = undefined;
          }

          return tagDesc;
        }),
      };
    });

    const domJson = [
      {
        tag: 'table',
        attrs: {
          cellpadding: '0',
          cellspacing: '0',
          style: 'table-layout: fixed; border-collapse: separate; width: 0;',
        },
        children: [
          {
            tag: 'colgroup',
            attrs: {},
            children: cols,
          },
          {
            tag: 'tbody',
            attrs: {},
            children: rows,
          },
        ],
      },
    ];

    const { t, b, l, r } = DomParser.paper.padding;
    const paperJson: SpreadSheetTag.Paper = {
      tag: 'paper',
      padding: `${t}mm ${r}mm ${b}mm ${l}mm`,
      orientation: DomParser.paper.orientation,
      children: [...domJson],
      headerWidgets: [],
      footerWidgets: [],
      images: DomParser._image2json(),
      paramToField: [],
      parameterMapping: [],
      customDataSource: [],
      subTableFieldMap: [],
      ...options,
    };

    const { generateLocalRuntimeJson } = await import('./local-runtime-json');
    return generateLocalRuntimeJson(paperJson);
  }
}
