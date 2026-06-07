import { GCT_EDHR_PAGES } from '../metadata/generatedPages';
import type {
  EdhrActionExecuteInput,
  EdhrActionResult,
  EdhrAuditEntry,
  EdhrPageMeta,
  EdhrQueryFilters,
  EdhrRecord,
  EdhrRecordMutationInput,
  EdhrRecordPageResult,
  EdhrRecordQuery,
  EdhrRecordStatusHistory,
} from '../types';
import {
  getActionLabel,
  getActionPolicy,
  getDisplayActionsForPage,
  getNextStatusForAction,
} from '../utils/actionPolicy';
import {
  copyRecordValues,
  createDeterministicRecord,
  generateMockRecordsByPage,
  MOCK_TENANT_ID,
} from '../utils/mockDataFactory';

const DEFAULT_OPERATOR_ID = 'mock-user';
const DEFAULT_OPERATOR_NAME = '演示用户';
const DEFAULT_PAGE_SIZE = 10;
const LOGICAL_DISABLE_STATUS = '禁用';
const MUTATION_TIME = Date.UTC(2026, 1, 1, 9, 0, 0);

interface ClonedRecordResult {
  record: EdhrRecord;
  auditEntry: EdhrAuditEntry;
  statusHistory: EdhrRecordStatusHistory;
}

export class GctEdhrMockClient {
  private readonly pagesByCode = new Map(GCT_EDHR_PAGES.map((page) => [page.code, page]));
  private readonly recordsByPage = new Map<string, EdhrRecord[]>();
  private readonly auditEntriesByRecord = new Map<string, EdhrAuditEntry[]>();
  private readonly statusHistoryByRecord = new Map<string, EdhrRecordStatusHistory[]>();
  private recordSequence = 0;
  private timeSequence = 0;

  constructor() {
    const recordsByPage = generateMockRecordsByPage(GCT_EDHR_PAGES);
    for (const [pageCode, records] of Object.entries(recordsByPage)) {
      this.recordsByPage.set(pageCode, records.map((record) => cloneRecord(record)));
      records.forEach((record) => this.seedRecordTrail(record));
    }
  }

  async queryRecords(pageCode: string, query: EdhrRecordQuery = {}): Promise<EdhrRecordPageResult> {
    const pageMeta = this.requirePage(pageCode);
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
    const filters = query.filters ?? {};
    const sortDirection = query.sortDirection ?? 'asc';

    const visibleRecords = this.getPageRecords(pageCode).filter((record) => shouldIncludeRecord(record, filters));
    const filteredRecords = applyFilters(visibleRecords, pageMeta, filters);
    const sortedRecords = applySorting(filteredRecords, pageMeta, query.sortField, sortDirection);
    const start = (page - 1) * pageSize;

    return {
      records: sortedRecords.slice(start, start + pageSize).map((record) => cloneRecord(record)),
      total: sortedRecords.length,
      page,
      pageSize,
    };
  }

  async getRecord(pageCode: string, recordId: string): Promise<EdhrRecord | undefined> {
    this.requirePage(pageCode);
    const record = this.getPageRecords(pageCode).find((item) => item.id === recordId);
    return record ? cloneRecord(record) : undefined;
  }

  async createRecord(pageCode: string, input: EdhrRecordMutationInput = {}): Promise<EdhrRecord> {
    const pageMeta = this.requirePage(pageCode);
    const records = this.getPageRecords(pageCode);
    const sequence = this.nextRecordSequence();
    const baseRecord = createDeterministicRecord(pageMeta, records.length + sequence);
    const operatorId = input.operatorId ?? DEFAULT_OPERATOR_ID;
    const operatorName = input.operatorName ?? DEFAULT_OPERATOR_NAME;
    const timestamp = this.nextTimestamp();

    const record: EdhrRecord = {
      ...baseRecord,
      id: `${pageCode}-created-${String(sequence).padStart(4, '0')}`,
      tenantId: MOCK_TENANT_ID,
      pageCode,
      status: input.status ?? '草稿',
      createdBy: operatorName,
      createdAt: timestamp,
      updatedBy: operatorName,
      updatedAt: timestamp,
      remark: input.remark ?? baseRecord.remark,
      values: {
        ...baseRecord.values,
        ...input.values,
      },
    };

    mirrorSystemValues(record);
    records.unshift(record);
    this.appendAuditEntry(pageCode, record.id, 'create', '新建', undefined, serializeRecord(record), {
      operatorId,
      operatorName,
      remark: input.remark,
    });
    this.appendStatusHistory(record, '', record.status, 'create', operatorName, input.remark);

    return cloneRecord(record);
  }

  async updateRecord(
    pageCode: string,
    recordId: string,
    input: EdhrRecordMutationInput = {},
  ): Promise<EdhrRecord> {
    const record = this.requireRecord(pageCode, recordId);
    const before = cloneRecord(record);
    const operatorId = input.operatorId ?? DEFAULT_OPERATOR_ID;
    const operatorName = input.operatorName ?? DEFAULT_OPERATOR_NAME;

    record.values = {
      ...record.values,
      ...input.values,
    };
    record.status = input.status ?? record.status;
    record.remark = input.remark ?? record.remark;
    record.updatedBy = operatorName;
    record.updatedAt = this.nextTimestamp();
    mirrorSystemValues(record);

    this.appendAuditEntry(pageCode, record.id, 'edit', '编辑', serializeRecord(before), serializeRecord(record), {
      operatorId,
      operatorName,
      remark: input.remark,
    });
    if (before.status !== record.status) {
      this.appendStatusHistory(record, before.status, record.status, 'edit', operatorName, input.remark);
    }

    return cloneRecord(record);
  }

  async deleteRecord(
    pageCode: string,
    recordId: string,
    input: EdhrActionExecuteInput = {},
  ): Promise<EdhrActionResult> {
    return this.executeAction(pageCode, recordId, 'delete', input);
  }

  async disableRecord(
    pageCode: string,
    recordId: string,
    input: EdhrActionExecuteInput = {},
  ): Promise<EdhrActionResult> {
    return this.executeAction(pageCode, recordId, 'disable', input);
  }

  async executeAction(
    pageCode: string,
    recordId: string,
    actionCode: string,
    input: EdhrActionExecuteInput = {},
  ): Promise<EdhrActionResult> {
    const pageMeta = this.requirePage(pageCode);
    const record = this.requireRecord(pageCode, recordId);
    const before = cloneRecord(record);
    const actionMeta = getDisplayActionsForPage(pageMeta).find((action) => action.code === actionCode);
    const actionLabel = getActionLabel(actionCode, actionMeta);
    const policy = getActionPolicy(actionCode);
    const operatorId = input.operatorId ?? DEFAULT_OPERATOR_ID;
    const operatorName = input.operatorName ?? DEFAULT_OPERATOR_NAME;
    const auditRequired = policy.auditRequired && (actionMeta?.auditRequired ?? true);
    let createdRecord: EdhrRecord | undefined;
    let auditEntry: EdhrAuditEntry | undefined;
    let statusHistory: EdhrRecordStatusHistory | undefined;

    if (policy.cloneMode) {
      const cloneResult = this.createClonedRecord(pageMeta, record, policy.cloneMode, actionCode, actionLabel, input);
      createdRecord = cloneResult.record;
      statusHistory = cloneResult.statusHistory;

      if (auditRequired) {
        const afterValue = serializeRecord(record);
        afterValue.createdRecordId = createdRecord.id;
        auditEntry = this.appendAuditEntry(
          pageCode,
          record.id,
          actionCode,
          actionLabel,
          serializeRecord(before),
          afterValue,
          {
            operatorId,
            operatorName,
            remark: input.remark,
          },
        );
      }

      return {
        actionCode,
        actionLabel,
        record: cloneRecord(record),
        createdRecord: cloneRecord(createdRecord),
        auditEntry,
        statusHistory,
        message: policy.message,
      };
    }

    const nextStatus = getNextStatusForAction(actionCode, record.status, pageMeta);
    const shouldUpdateRecord = Boolean(policy.targetStatus);
    const shouldAppendStatusHistory = shouldUpdateRecord && nextStatus !== before.status;

    if (shouldUpdateRecord) {
      if (input.values) {
        record.values = { ...record.values, ...input.values };
      }
      record.status = nextStatus;
      record.remark = input.remark ?? record.remark;
      record.updatedBy = operatorName;
      record.updatedAt = this.nextTimestamp();
      mirrorSystemValues(record);
    }

    if (auditRequired) {
      auditEntry = this.appendAuditEntry(pageCode, record.id, actionCode, actionLabel, serializeRecord(before), serializeRecord(record), {
        operatorId,
        operatorName,
        remark: input.remark,
      });
    }

    if (shouldAppendStatusHistory) {
      statusHistory = this.appendStatusHistory(record, before.status, record.status, actionCode, operatorName, input.remark);
    }

    return {
      actionCode,
      actionLabel,
      record: cloneRecord(record),
      auditEntry,
      statusHistory,
      message: policy.message,
    };
  }

  async getAuditEntries(pageCode: string, recordId: string): Promise<EdhrAuditEntry[]> {
    this.requirePage(pageCode);
    return (this.auditEntriesByRecord.get(recordId) ?? []).map((entry) => ({ ...entry }));
  }

  async getStatusHistory(pageCode: string, recordId: string): Promise<EdhrRecordStatusHistory[]> {
    this.requirePage(pageCode);
    return (this.statusHistoryByRecord.get(recordId) ?? []).map((entry) => ({ ...entry }));
  }

  appendAuditEntry(
    pageCode: string,
    recordId: string,
    actionCode: string,
    actionLabel: string,
    beforeValue: Record<string, unknown> | undefined,
    afterValue: Record<string, unknown> | undefined,
    options: { operatorId: string; operatorName: string; remark?: string },
  ): EdhrAuditEntry {
    const entry: EdhrAuditEntry = {
      id: `${recordId}-audit-${String((this.auditEntriesByRecord.get(recordId)?.length ?? 0) + 1).padStart(3, '0')}`,
      pageCode,
      recordId,
      actionCode,
      actionLabel,
      operatorId: options.operatorId,
      operatorName: options.operatorName,
      operatedAt: this.nextTimestamp(),
      beforeValue,
      afterValue,
      remark: options.remark,
    };

    const entries = this.auditEntriesByRecord.get(recordId) ?? [];
    entries.push(entry);
    this.auditEntriesByRecord.set(recordId, entries);
    return { ...entry };
  }

  appendStatusHistory(
    record: EdhrRecord,
    fromStatus: string,
    toStatus: string,
    actionCode: string,
    operatorName: string,
    remark?: string,
  ): EdhrRecordStatusHistory {
    const history: EdhrRecordStatusHistory = {
      id: `${record.id}-status-${String((this.statusHistoryByRecord.get(record.id)?.length ?? 0) + 1).padStart(3, '0')}`,
      recordId: record.id,
      fromStatus,
      toStatus,
      actionCode,
      operatorName,
      changedAt: this.nextTimestamp(),
      remark,
    };

    const histories = this.statusHistoryByRecord.get(record.id) ?? [];
    histories.push(history);
    this.statusHistoryByRecord.set(record.id, histories);
    return { ...history };
  }

  private createClonedRecord(
    pageMeta: EdhrPageMeta,
    sourceRecord: EdhrRecord,
    mode: 'copy' | 'version',
    actionCode: 'copy' | 'version_create' | 'version_copy' | string,
    actionLabel: string,
    input: EdhrActionExecuteInput,
  ): ClonedRecordResult {
    const records = this.getPageRecords(pageMeta.code);
    const sequence = this.nextRecordSequence();
    const operatorName = input.operatorName ?? DEFAULT_OPERATOR_NAME;
    const timestamp = this.nextTimestamp();
    const record: EdhrRecord = {
      ...sourceRecord,
      id: `${pageMeta.code}-${mode}-${String(sequence).padStart(4, '0')}`,
      status: '草稿',
      createdBy: operatorName,
      createdAt: timestamp,
      updatedBy: operatorName,
      updatedAt: timestamp,
      remark: input.remark ?? `${sourceRecord.remark ?? pageMeta.label} ${mode === 'version' ? '版本' : '副本'}`,
      values: {
        ...copyRecordValues(sourceRecord, pageMeta, mode, sequence),
        ...input.values,
      },
    };

    mirrorSystemValues(record);
    records.unshift(record);
    const auditEntry = this.appendAuditEntry(pageMeta.code, record.id, actionCode, actionLabel, undefined, serializeRecord(record), {
      operatorId: input.operatorId ?? DEFAULT_OPERATOR_ID,
      operatorName,
      remark: input.remark,
    });
    const statusHistory = this.appendStatusHistory(record, '', record.status, actionCode, operatorName, input.remark);
    return { record, auditEntry, statusHistory };
  }

  private requirePage(pageCode: string): EdhrPageMeta {
    const page = this.pagesByCode.get(pageCode);
    if (!page) {
      throw new Error(`Unknown GCT eDHR page: ${pageCode}`);
    }
    return page;
  }

  private getPageRecords(pageCode: string): EdhrRecord[] {
    const records = this.recordsByPage.get(pageCode);
    if (!records) {
      throw new Error(`No mock records for GCT eDHR page: ${pageCode}`);
    }
    return records;
  }

  private requireRecord(pageCode: string, recordId: string): EdhrRecord {
    this.requirePage(pageCode);
    const record = this.getPageRecords(pageCode).find((item) => item.id === recordId);
    if (!record) {
      throw new Error(`Unknown GCT eDHR record: ${pageCode}/${recordId}`);
    }
    return record;
  }

  private seedRecordTrail(record: EdhrRecord): void {
    this.auditEntriesByRecord.set(record.id, [
      {
        id: `${record.id}-audit-001`,
        pageCode: record.pageCode,
        recordId: record.id,
        actionCode: 'mock_seed',
        actionLabel: '模拟数据初始化',
        operatorId: 'mock-seed',
        operatorName: '系统',
        operatedAt: record.createdAt,
        afterValue: serializeRecord(record),
        remark: '初始化演示数据',
      },
    ]);
    this.statusHistoryByRecord.set(record.id, [
      {
        id: `${record.id}-status-001`,
        recordId: record.id,
        fromStatus: '',
        toStatus: record.status,
        actionCode: 'mock_seed',
        operatorName: '系统',
        changedAt: record.createdAt,
        remark: '初始化演示状态',
      },
    ]);
  }

  private nextRecordSequence(): number {
    this.recordSequence += 1;
    return this.recordSequence;
  }

  private nextTimestamp(): string {
    this.timeSequence += 1;
    return new Date(MUTATION_TIME + this.timeSequence * 60_000).toISOString();
  }
}

export const mockEdhrClient = new GctEdhrMockClient();

export function applyFilters(records: EdhrRecord[], pageMeta: EdhrPageMeta, filters: EdhrQueryFilters): EdhrRecord[] {
  const activeFilters = Object.entries(filters).filter(([, value]) => !isEmptyFilterValue(value));
  if (activeFilters.length === 0) return records;

  return records.filter((record) =>
    activeFilters.every(([fieldKey, expectedValue]) => {
      const rangeMatch = fieldKey.match(/(.+)(From|To|Start|End)$/);
      const normalizedFieldKey = rangeMatch?.[1] ?? fieldKey;
      const actualValue = getRecordValue(record, pageMeta, normalizedFieldKey);

      if (rangeMatch) {
        return compareRangeValue(actualValue, expectedValue, rangeMatch[2] === 'From' || rangeMatch[2] === 'Start');
      }
      if (Array.isArray(expectedValue)) {
        return expectedValue.map(String).includes(String(actualValue));
      }
      if (typeof expectedValue === 'number') {
        return Number(actualValue) === expectedValue;
      }

      return String(actualValue ?? '').toLowerCase().includes(String(expectedValue).toLowerCase());
    }),
  );
}

export function applySorting(
  records: EdhrRecord[],
  pageMeta: EdhrPageMeta,
  sortField: string | undefined,
  sortDirection: 'asc' | 'desc',
): EdhrRecord[] {
  if (!sortField) return [...records];

  const direction = sortDirection === 'desc' ? -1 : 1;
  return [...records].sort((left, right) => {
    const leftValue = getRecordValue(left, pageMeta, sortField);
    const rightValue = getRecordValue(right, pageMeta, sortField);
    return compareValues(leftValue, rightValue) * direction;
  });
}

function shouldIncludeRecord(record: EdhrRecord, filters: EdhrQueryFilters): boolean {
  if (record.status === LOGICAL_DISABLE_STATUS) return true;
  if (record.status !== '已删除') return true;
  const statusFilter = filters.status ?? filters['状态'];
  if (Array.isArray(statusFilter)) return statusFilter.includes('已删除');
  return statusFilter === '已删除';
}

function getRecordValue(record: EdhrRecord, pageMeta: EdhrPageMeta, fieldKey: string): unknown {
  if (fieldKey in record) {
    return record[fieldKey as keyof EdhrRecord];
  }

  const field = pageMeta.fields.find((item) => item.name === fieldKey || item.label === fieldKey);
  if (field) {
    return record.values[field.name];
  }

  return record.values[fieldKey];
}

function compareValues(leftValue: unknown, rightValue: unknown): number {
  const leftNumber = Number(leftValue);
  const rightNumber = Number(rightValue);
  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    return leftNumber - rightNumber;
  }

  const leftTime = Date.parse(String(leftValue));
  const rightTime = Date.parse(String(rightValue));
  if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
    return leftTime - rightTime;
  }

  return String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'zh-CN');
}

function compareRangeValue(actualValue: unknown, expectedValue: unknown, isLowerBound: boolean): boolean {
  const actualTime = Date.parse(String(actualValue));
  const expectedTime = Date.parse(String(expectedValue));
  if (!Number.isNaN(actualTime) && !Number.isNaN(expectedTime)) {
    return isLowerBound ? actualTime >= expectedTime : actualTime <= expectedTime;
  }

  const actualNumber = Number(actualValue);
  const expectedNumber = Number(expectedValue);
  if (!Number.isNaN(actualNumber) && !Number.isNaN(expectedNumber)) {
    return isLowerBound ? actualNumber >= expectedNumber : actualNumber <= expectedNumber;
  }

  return true;
}

function isEmptyFilterValue(value: unknown): boolean {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function mirrorSystemValues(record: EdhrRecord): void {
  record.values.id = record.id;
  record.values.tenantId = record.tenantId;
  record.values.status = record.status;
  record.values.createdBy = record.createdBy;
  record.values.createdAt = record.createdAt;
  record.values.updatedBy = record.updatedBy;
  record.values.updatedAt = record.updatedAt;
  record.values.remark = record.remark;
}

function cloneRecord(record: EdhrRecord): EdhrRecord {
  return {
    ...record,
    values: { ...record.values },
  };
}

function serializeRecord(record: EdhrRecord): Record<string, unknown> {
  return {
    id: record.id,
    tenantId: record.tenantId,
    pageCode: record.pageCode,
    status: record.status,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedBy: record.updatedBy,
    updatedAt: record.updatedAt,
    remark: record.remark,
    values: { ...record.values },
  };
}
