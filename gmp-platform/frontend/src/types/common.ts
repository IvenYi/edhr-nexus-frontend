/** Unified API response wrapper. */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  traceId: string;
}

/** Paginated result. */
export interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Pagination query parameters. */
export interface PageQuery {
  page: number;
  size: number;
  sort?: string;
}

/** Generic key-value pair. */
export interface KeyValue {
  label: string;
  value: string;
}

/** Select option. */
export interface SelectOption {
  label: string;
  value: string | number;
}
