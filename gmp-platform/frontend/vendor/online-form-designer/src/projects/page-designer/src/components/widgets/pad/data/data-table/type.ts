import { DataTable } from '/@page-designer/types/web';

export type columnsType = DataTable['props']['columns'];
export interface QueryDataOptions {
  query?: Record<string, any>;
  exp?: string;
  pageNo?: number;
  pageSize?: number;
  sorts?: { sortfield: string; sortType: 'asc' | 'desc' }[];
  foreignFields?: string[];
}
