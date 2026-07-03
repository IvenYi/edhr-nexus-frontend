import { IPaper, IRange, ITable } from '../types';

export class CheckTable {
  paper: IPaper;
  table: ITable;

  constructor(paper: IPaper, table: ITable) {
    this.paper = paper;
    this.table = table;
  }

  static calcRowHeight(table: ITable) {
    const { rowRange } = table;
    return rowRange!.b - rowRange!.t + 1;
  }
}
