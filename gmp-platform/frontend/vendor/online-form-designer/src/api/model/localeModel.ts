import { BasicInfo } from './baseModel';

export type I18nInfo = {
  info: string;
};

export interface LanguageInfo extends BasicInfo {
  key: string;
  info: string;
  type: string;
}

export interface I18nPageListReq {
  pageNo?: number;
  pageSize?: number;
  searchKey?: string;
}

export interface I18nPageListRes extends BasicInfo {
  data: LanguageInfo[];
  pageNo: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}
