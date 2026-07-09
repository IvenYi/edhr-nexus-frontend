import { GridColumn, GridRowData } from '../basic-grid';

export interface EmbedGridRowData extends GridRowData {
  children?: EmbedGridRowData[];
}

export type EmbedGridColumn = GridColumn;
