import { create } from 'zustand';
import { mockEdhrClient } from '../api/mockEdhrClient';
import { GCT_EDHR_PAGES } from '../metadata/generatedPages';
import type {
  EdhrActionExecuteInput,
  EdhrActionResult,
  EdhrAuditEntry,
  EdhrPageMeta,
  EdhrQueryFilters,
  EdhrRecord,
  EdhrRecordMutationInput,
  EdhrRecordStatusHistory,
  EdhrSortDirection,
} from '../types';

interface GctEdhrPaginationState {
  page: number;
  pageSize: number;
}

interface GctEdhrSortingState {
  sortField?: string;
  sortDirection: EdhrSortDirection;
}

interface GctEdhrMockStoreState {
  pageCode?: string;
  pageMeta?: EdhrPageMeta;
  records: EdhrRecord[];
  total: number;
  loading: boolean;
  error?: string;
  query: EdhrQueryFilters;
  pagination: GctEdhrPaginationState;
  sorting: GctEdhrSortingState;
  selectedRecord: EdhrRecord | null;
  auditEntries: EdhrAuditEntry[];
  statusHistory: EdhrRecordStatusHistory[];
  lastActionResult: EdhrActionResult | null;
  loadPage: (pageCode: string) => Promise<void>;
  setQuery: (query: EdhrQueryFilters) => Promise<void>;
  resetQuery: () => Promise<void>;
  setPagination: (pagination: Partial<GctEdhrPaginationState>) => Promise<void>;
  setSorting: (sorting: Partial<GctEdhrSortingState>) => Promise<void>;
  selectRecord: (recordId: string | null) => Promise<void>;
  createRecord: (input?: EdhrRecordMutationInput) => Promise<EdhrRecord>;
  updateRecord: (recordId: string, input: EdhrRecordMutationInput) => Promise<EdhrRecord>;
  deleteRecord: (recordId: string, input?: EdhrActionExecuteInput) => Promise<EdhrActionResult>;
  executeAction: (
    recordId: string,
    actionCode: string,
    input?: EdhrActionExecuteInput,
  ) => Promise<EdhrActionResult>;
  loadAuditTrail: (recordId?: string) => Promise<void>;
}

const DEFAULT_PAGINATION: GctEdhrPaginationState = { page: 1, pageSize: 10 };
const DEFAULT_SORTING: GctEdhrSortingState = { sortDirection: 'asc' };

let loadPageRequestSeq = 0;
let auditTrailRequestSeq = 0;

export const useMockEdhrStore = create<GctEdhrMockStoreState>((set, get) => ({
  records: [],
  total: 0,
  loading: false,
  query: {},
  pagination: DEFAULT_PAGINATION,
  sorting: DEFAULT_SORTING,
  selectedRecord: null,
  auditEntries: [],
  statusHistory: [],
  lastActionResult: null,

  loadPage: async (pageCode) => {
    const requestId = ++loadPageRequestSeq;
    const current = get();
    const pageChanged = current.pageCode !== pageCode;
    const pageMeta = findPageMeta(pageCode);
    const query = pageChanged ? {} : current.query;
    const pagination = pageChanged ? DEFAULT_PAGINATION : current.pagination;
    const sorting = pageChanged ? DEFAULT_SORTING : current.sorting;

    set({
      loading: true,
      error: undefined,
      pageCode,
      pageMeta,
      query,
      pagination,
      sorting,
      selectedRecord: pageChanged ? null : current.selectedRecord,
      auditEntries: pageChanged ? [] : current.auditEntries,
      statusHistory: pageChanged ? [] : current.statusHistory,
    });

    try {
      const result = await mockEdhrClient.queryRecords(pageCode, {
        page: pagination.page,
        pageSize: pagination.pageSize,
        filters: query,
        sortField: sorting.sortField,
        sortDirection: sorting.sortDirection,
      });
      if (requestId !== loadPageRequestSeq || get().pageCode !== pageCode) {
        return;
      }
      set({
        records: result.records,
        total: result.total,
        pagination: { page: result.page, pageSize: result.pageSize },
        loading: false,
      });
    } catch (error) {
      if (requestId === loadPageRequestSeq) {
        set({ loading: false, error: toErrorMessage(error) });
      }
      throw error;
    }
  },

  setQuery: async (query) => {
    set((state) => ({
      query: { ...state.query, ...query },
      pagination: { ...state.pagination, page: 1 },
    }));
    await reloadCurrentPage(get);
  },

  resetQuery: async () => {
    set((state) => ({
      query: {},
      pagination: { ...state.pagination, page: 1 },
    }));
    await reloadCurrentPage(get);
  },

  setPagination: async (pagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    }));
    await reloadCurrentPage(get);
  },

  setSorting: async (sorting) => {
    set((state) => ({
      sorting: { ...state.sorting, ...sorting },
      pagination: { ...state.pagination, page: 1 },
    }));
    await reloadCurrentPage(get);
  },

  selectRecord: async (recordId) => {
    const pageCode = requireCurrentPageCode(get());
    if (!recordId) {
      set({ selectedRecord: null, auditEntries: [], statusHistory: [] });
      return;
    }

    const selectedRecord = await mockEdhrClient.getRecord(pageCode, recordId);
    set({ selectedRecord: selectedRecord ?? null });
    await get().loadAuditTrail(recordId);
  },

  createRecord: async (input = {}) => {
    const pageCode = requireCurrentPageCode(get());
    const record = await mockEdhrClient.createRecord(pageCode, input);
    set({ selectedRecord: record, lastActionResult: null });
    await get().loadPage(pageCode);
    await get().loadAuditTrail(record.id);
    return record;
  },

  updateRecord: async (recordId, input) => {
    const pageCode = requireCurrentPageCode(get());
    const record = await mockEdhrClient.updateRecord(pageCode, recordId, input);
    set({ selectedRecord: record, lastActionResult: null });
    await get().loadPage(pageCode);
    await get().loadAuditTrail(record.id);
    return record;
  },

  deleteRecord: async (recordId, input = {}) => {
    const pageCode = requireCurrentPageCode(get());
    const result = await mockEdhrClient.deleteRecord(pageCode, recordId, input);
    set({ selectedRecord: result.record, lastActionResult: result });
    await get().loadPage(pageCode);
    await get().loadAuditTrail(recordId);
    return result;
  },

  executeAction: async (recordId, actionCode, input = {}) => {
    const pageCode = requireCurrentPageCode(get());
    const result = await mockEdhrClient.executeAction(pageCode, recordId, actionCode, input);
    const selectedRecord = result.createdRecord ?? result.record;
    set({ selectedRecord, lastActionResult: result });
    await get().loadPage(pageCode);
    await get().loadAuditTrail(selectedRecord.id);
    return result;
  },

  loadAuditTrail: async (recordId) => {
    const requestId = ++auditTrailRequestSeq;
    const state = get();
    const pageCode = requireCurrentPageCode(state);
    const targetRecordId = recordId ?? state.selectedRecord?.id;

    if (!targetRecordId) {
      set({ auditEntries: [], statusHistory: [] });
      return;
    }

    const [auditEntries, statusHistory] = await Promise.all([
      mockEdhrClient.getAuditEntries(pageCode, targetRecordId),
      mockEdhrClient.getStatusHistory(pageCode, targetRecordId),
    ]);

    const current = get();
    if (
      requestId !== auditTrailRequestSeq ||
      current.pageCode !== pageCode ||
      (current.selectedRecord?.id && current.selectedRecord.id !== targetRecordId)
    ) {
      return;
    }

    set({ auditEntries, statusHistory });
  },
}));

async function reloadCurrentPage(get: () => GctEdhrMockStoreState): Promise<void> {
  const pageCode = get().pageCode;
  if (pageCode) {
    await get().loadPage(pageCode);
  }
}

function findPageMeta(pageCode: string): EdhrPageMeta | undefined {
  return GCT_EDHR_PAGES.find((page) => page.code === pageCode);
}

function requireCurrentPageCode(state: GctEdhrMockStoreState): string {
  if (!state.pageCode) {
    throw new Error('GCT eDHR mock store has no loaded page');
  }
  return state.pageCode;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
