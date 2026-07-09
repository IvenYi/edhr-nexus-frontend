declare function IF<T>(expr: boolean, v: T, l: T): Promise<T>;
declare function ISEMPTY<T>(val: T): Promise<boolean>;
declare function ISNULL<T>(val: T): Promise<boolean>;
declare function ISUNDEFINED<T>(val: T): Promise<boolean>;
declare function AND<T>(...e: T[]): Promise<boolean>;
declare function OR<T>(...e: T[]): Promise<boolean>;
declare function EQ<T, K>(v: T, o: K): Promise<boolean>;
declare function NE<T>(v: T, o: T): Promise<boolean>;
declare function LE<T>(v: T, o: T): Promise<boolean>;
declare function LT<T>(v: T, o: T): Promise<boolean>;
declare function GE<T>(v: T, o: T): Promise<boolean>;
declare function GT<T>(v: T, o: T): Promise<boolean>;
declare function LEN(v: string): Promise<number>;
declare function CONCAT(...args: string[]): Promise<string>;
declare function SUBSTRING(v: string, s: number, e: number): Promise<string>;
declare function SUBSTR(v: string, s: number, l: number): Promise<string>;
declare function UPPER(v: string): Promise<string>;
declare function LOWER(v: string): Promise<string>;
declare function TRIM(v: string): Promise<string>;
declare function LTRIM(v: string): Promise<string>;
declare function RTRIM(v: string): Promise<string>;
declare function REPEAT(v: string, c: string): Promise<number | null>;
declare function REPLACE(v: string, o: string, t: string): Promise<string>;
declare function FINDSTR(v: string, c: string): Promise<boolean>;
declare function SEARCHSTR(v: string, c: string): Promise<number>;
declare function PARSENUMBER(v: string): Promise<number | null>;
declare function SPLIT(v: string, c: string): Promise<string[]>;
declare function SUM(...args: number[]): Promise<number>;
declare function REDUCE(...args: number[]): Promise<number>;
declare function MULTIPLICATION(...args: number[]): Promise<number>;
declare function DIVISION(...args: number[]): Promise<number>;
declare function FIXED(v: number, n: number): Promise<number | Promise<Error>>;
declare function ROUND(v: number, n: number): Promise<number | Promise<Error>>;
declare function ROUNDUP(v: number, n: number): Promise<number | Promise<Error>>;
declare function MAX(v: number[]): Promise<number>;
declare function LARGE(v: number[], n: number): Promise<number | Promise<Error>>;
declare function MIN(v: number[]): Promise<number>;
declare function SMALL(v: number[], n: number): Promise<number | Promise<Error>>;
declare function AVERAGE(v: number[]): Promise<number | Promise<Error>>;
declare function ABS(v: number): Promise<number>;
declare function MOD(v: number, n: number): Promise<number | Promise<Error>>;
declare function POWER(v: number, n: number): Promise<number>;
declare function SQRT(v: number): Promise<number>;
declare function GET<T extends object | any[]>(v: T, p: number | keyof T): Promise<T[keyof T]>;
declare function PUT<T>(a: T, b: keyof T, c: T[keyof T | any]): Promise<T | Promise<Error>>;
declare function PUSH<T>(v: any[], n: T): Promise<T[] | Promise<Error>>;
declare function HEADPUSH<T>(v: any[], n: T): Promise<T[] | Promise<Error>>;
declare function TIMESTAMP2DATE(v: number): Promise<string | Promise<Error>>;
declare function DATE2TIMESTAMP(v: string): Promise<number>;
declare function DATEFORMAT(v: Date, f: string): Promise<string>;
declare function NOW(): Promise<string>;
declare function TODAY(): Promise<string>;
declare function MONTH(v: string | number | Date | null | undefined): Promise<number>;
declare function DAY(v: string | number | Date | null | undefined): Promise<number>;
declare function HOUR(v: string | number | Date | null | undefined): Promise<number>;
declare function MINUTE(v: string | number | Date | null | undefined): Promise<number>;
declare function WEEKRANGE(): Promise<[string, string]>;
declare function LASTWEEKRANGE(): Promise<[string, string]>;
declare function MONTHRANGE(): Promise<[string, string]>;
declare function LASTMONTHRANGE(): Promise<[string, string]>;
declare function YEARRANGE(): Promise<[string, string]>;
declare function LASTYEARRANGE(): Promise<[string, string]>;
declare function QUARTER(): Promise<[string, string]>;
declare function LASTQUARTER(): Promise<[string, string]>;
declare function ISDATERANGE(v: Date, r: [Date, Date]): Promise<boolean>;
declare function ISTIMERANGE(v: string, r: [string, string]): Promise<boolean>;
declare function DateAdd(
  v: string,
  num: number,
  unit: string,
  format?: string,
): Promise<string | undefined>;
declare function DateSubtract(
  v: string,
  num: number,
  unit: string,
  format?: string,
): Promise<string | undefined>;
declare function COUNT(...args: number[]): Promise<number | ''>;
declare function STDEV(...args: number[]): Promise<number | ''>;
