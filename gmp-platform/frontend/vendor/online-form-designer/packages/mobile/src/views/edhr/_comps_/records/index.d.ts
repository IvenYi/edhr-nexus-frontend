export interface INgItem {
  not_good_qty_: 10;
  not_good_group_id_: string;
  not_good_reason_id_: string;
}

export interface IScrapItem {
  scrap_qty_: 10;
  scrap_group_id_: string;
  scrap_reason_id_: string;
}

export interface IReportItem {
  id: string;
  good_qty_: number;
  not_good_qty_: number;
  scrap_qty_: number;
  report_user_id_: string;
  report_user_name_: string;
  create_time_: string;
  entries_?: INgItem[];
  scrap_entries_?: IScrapItem[];
  duration_: number;
}
