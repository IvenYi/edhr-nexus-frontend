import { ComputedRef, Ref } from 'vue';
import type { ITd } from '@gct/nocode-base';

export type PaginationStatus = {
  isStart: ComputedRef<boolean>;
  isEnd: ComputedRef<boolean>;
  total: ComputedRef<number>;
  loadingPrev: Ref<boolean>;
  loadingNext: Ref<boolean>;
};

export interface IPaginationControl {
  currentIndex: Ref<number>;
  handlePagination: (type: 'prev' | 'next') => void;
  paginationStatus: PaginationStatus;
}

export type GroupKey = number | string;

export type LockMap = {
  before?: Ref<boolean>;
  after?: Ref<boolean>;
  delete?: Ref<boolean>;
};

export interface ISubTableDataContext {
  subField: string;
  isRowSubTable2d?: boolean;
  childInitRowLen?: number;
  crossFieldKeys?: string[];
  callback: Function;
  lockMap?: LockMap;
}

export interface IMatrixDataProps {
  layoutMode?: string;
  widgetCenter: Record<string, ITd>;
  mode: 'subTable2d' | 'checkTable2d';
  mainWidgetIds: string[];
  linkWidgetIds: string[];
  callback?: () => void;
}
