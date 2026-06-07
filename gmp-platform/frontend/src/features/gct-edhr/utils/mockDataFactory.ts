import { GCT_EDHR_PAGES } from '../metadata/generatedPages';
import type { EdhrFieldMeta, EdhrPageMeta, EdhrRecord } from '../types';
import { getInitialStatusForPage } from './actionPolicy';
import { createDeterministicMockValue, inferEdhrFieldType, stableHash } from './fieldInfer';

export const MOCK_RECORDS_PER_PAGE = 20;
export const MOCK_TENANT_ID = 'tenant-gct-demo';

const MOCK_USERS = ['张工', '李工', '王主管', '赵审核', '陈管理员'];
const BASE_TIME = Date.UTC(2026, 0, 6, 8, 30, 0);

export function generateMockRecordsByPage(
  pages: EdhrPageMeta[] = GCT_EDHR_PAGES,
): Record<string, EdhrRecord[]> {
  return Object.fromEntries(pages.map((page) => [page.code, generateMockRecordsForPage(page)]));
}

export function generateMockRecordsForPage(page: EdhrPageMeta): EdhrRecord[] {
  return Array.from({ length: MOCK_RECORDS_PER_PAGE }, (_, index) => createDeterministicRecord(page, index));
}

export function createDeterministicRecord(page: EdhrPageMeta, recordIndex: number): EdhrRecord {
  const ordinal = recordIndex + 1;
  const createdAt = createDeterministicTimestamp(page.code, recordIndex, 0);
  const updatedAt = createDeterministicTimestamp(page.code, recordIndex, 90);
  const createdBy = MOCK_USERS[recordIndex % MOCK_USERS.length];
  const updatedBy = MOCK_USERS[(recordIndex + 2) % MOCK_USERS.length];
  const status = getInitialStatusForPage(page, recordIndex);

  const record: EdhrRecord = {
    id: `${page.code}-mock-${String(ordinal).padStart(3, '0')}`,
    tenantId: MOCK_TENANT_ID,
    pageCode: page.code,
    status,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt,
    remark: `${page.label} mock record ${ordinal}`,
    values: {},
  };

  record.values = createValuesForRecord(page, record, recordIndex);
  return record;
}

export function createValuesForRecord(page: EdhrPageMeta, record: EdhrRecord, recordIndex: number): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  const statusValues = [...page.businessStatuses, ...page.baseStatuses];

  for (const field of page.fields) {
    if (field.system) {
      values[field.name] = record[field.name as keyof EdhrRecord] ?? record.remark ?? '';
      continue;
    }

    values[field.name] = createDeterministicMockValue(field, {
      page,
      recordIndex,
      statusValues,
    });
  }

  return values;
}

export function copyRecordValues(
  record: EdhrRecord,
  page: EdhrPageMeta,
  mode: 'copy' | 'version',
  sequence: number,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const field of page.fields) {
    if (field.system) continue;

    const currentValue = record.values[field.name];
    if (shouldRewriteCopiedField(field)) {
      values[field.name] = createCopiedCodeValue(currentValue, mode, sequence);
    } else if (mode === 'version' && inferEdhrFieldType(field) === 'code' && field.label.includes('版本')) {
      values[field.name] = `V${sequence}`;
    } else {
      values[field.name] = deepCopyMockValue(currentValue);
    }
  }

  return values;
}

export function deepCopyRecordValues(values: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!values) return {};
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, deepCopyMockValue(value)]));
}

export function deepCopyMockValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepCopyMockValue(item)) as T;
  }
  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        deepCopyMockValue(nestedValue),
      ]),
    ) as T;
  }
  return value;
}

export function createDeterministicTimestamp(pageCode: string, recordIndex: number, minuteOffset: number): string {
  const seed = stableHash(`${pageCode}:${recordIndex}`);
  const timestamp = BASE_TIME + (seed % 10_080) * 60_000 + recordIndex * 3_600_000 + minuteOffset * 60_000;
  return new Date(timestamp).toISOString();
}

function shouldRewriteCopiedField(field: EdhrFieldMeta): boolean {
  const fieldType = inferEdhrFieldType(field);
  return fieldType === 'code' && !field.label.includes('版本');
}

function createCopiedCodeValue(currentValue: unknown, mode: 'copy' | 'version', sequence: number): string {
  const value = String(currentValue || 'GCT-MOCK');
  const suffix = mode === 'version' ? `V${sequence}` : `COPY${sequence}`;
  return `${value}-${suffix}`;
}
