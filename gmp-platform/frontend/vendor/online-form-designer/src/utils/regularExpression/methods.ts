import { isEqual, isNull, isUndefined } from 'lodash-es';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import toArray from 'dayjs/plugin/toArray';
import isoWeek from 'dayjs/plugin/isoWeek';
import BigNumber from 'bignumber.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(quarterOfYear);
dayjs.extend(toArray);
dayjs.extend(isoWeek);

// IF函数
function IF<T>(expr: boolean, v: T, l: T): T {
  const fn = () => {
    return expr ? v : l;
  };
  const isIfFn = fn;
  return isIfFn();
}

// ISEMPTY 判断参数v是否为空,为空则返回true
function ISEMPTY<T>(v: T): boolean {
  const func = () => v == null || v === '' || v === 0;
  const isEmptyFn = func;
  return isEmptyFn();
}

// ISNULL 判断参数是否为null
function ISNULL<T>(v: T): boolean {
  const func = () => isNull(v);
  const isNullFn = func;
  return isNullFn();
}

// ISUNDEFINED 判断参数是否为undefined，为undefined则返回true
function ISUNDEFINED<T>(v: T): boolean {
  const func = () => isUndefined(v);
  const isUndefinedFn = func;
  return isUndefinedFn();
}

// AND 根据一组表达式判断是否为真，只要有一个为false，则返回false
function AND<T>(...e: T[]): boolean {
  const func = () => {
    for (const i of e) {
      if (!i) return false;
    }
    return true;
  };
  const isAndFn = func;
  return isAndFn();
}

// OR(conditions)根据一组表达式判断是否为真，只要有一个为true，则返回true
function OR<T>(...e: T[]): boolean {
  const func = () => e.some((i) => i);
  const isOrFn = func;
  return isOrFn();
}

//EQ比较两个值是否相等，如果相等则返回true
function EQ<T, K>(v: T, o: K): boolean {
  const func = () => isEqual(v, o);
  const isEqFn = func;
  return isEqFn();
}

//比较两个值是否不相等，如果不相等则返回true
function NE<T>(v: T, o: T): boolean {
  const func = () => v !== o;
  const isNotEqual = func;
  return isNotEqual();
}

// LE比较两个值大小，v小于等于o返回true
function LE<T>(v: T, o: T): boolean {
  const fn = () => {
    if (
      (typeof v === 'number' && typeof o === 'number') ||
      (typeof v === 'string' && typeof o === 'string') ||
      (v instanceof Date && o instanceof Date)
    ) {
      if (v <= o) {
        return true;
      } else {
        return false;
      }
    } else {
      // 类型不匹配直接返回false
      return false;
    }
  };
  const isLeFn = fn;
  return isLeFn();
}

// LE比较两个值大小，v小于等于o返回true
function LT<T>(v: T, o: T): boolean {
  const fn = () => {
    if (
      (typeof v === 'number' && typeof o === 'number') ||
      (typeof v === 'string' && typeof o === 'string') ||
      (v instanceof Date && o instanceof Date)
    ) {
      return v < o;
    } else {
      // 类型不匹配直接返回false
      return false;
    }
  };
  const isLtFn = fn;
  return isLtFn();
}

// GE(a, b)比较两个值大小，v大于等于o返回true
function GE<T>(v: T, o: T): boolean {
  const fn = () => {
    if (
      (typeof v === 'number' && typeof o === 'number') ||
      (typeof v === 'string' && typeof o === 'string') ||
      (v instanceof Date && o instanceof Date)
    ) {
      if (v >= o) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
  const isGeFn = fn;
  return isGeFn();
}

// 比较两个值大小，v大于o返回true
function GT<T>(v: T, o: T): boolean {
  const fn = () => {
    if (
      (typeof v === 'number' && typeof o === 'number') ||
      (typeof v === 'string' && typeof o === 'string') ||
      (v instanceof Date && o instanceof Date)
    ) {
      if (v > o) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
  const isGtFn = fn;
  return isGtFn();
}

// LEN获取字符串的长度
function LEN(v?: string): number {
  const fn = () => v?.length || 0;
  const isLenFn = fn;
  return isLenFn();
}

// CONCATE拼接多个字符串
function CONCAT(...args: string[]): string {
  const fn = () => args.join('');
  const isConcatFn = fn;
  return isConcatFn();
}

// SUBSTRING 截取字符串str，从start开始截取到end，start从0开始，
// 如果start和end为负数表示从最后开始截取，start为-1表示从最后一位开始截取，返回截取的字符串
function SUBSTRING(v: string = '', s: number, e: number): string {
  const fn = () => {
    // 如果start小于 0  需要 +1
    const val = (s < 0 ? [...v].reverse().join('') : v).slice(
      Math.abs(s + Number(s < 0)),
      Math.abs(e) + Number(s >= 0),
    );
    return s < 0 ? [...val].reverse().join('') : val;
  };
  const isSubstringFn = fn;
  return isSubstringFn();
}

// 截取len长度的字符串
function SUBSTR(v: string = '', s: number, l: number): string {
  const fn = () => {
    const val = (s < 0 ? [...v].reverse().join('') : v).slice(
      Math.abs(s + Number(s < 0)),
      Math.abs(s + Number(s < 0)) + Math.abs(l),
    );
    return s < 0 ? [...val].reverse().join('') : val;
  };
  const isSubstrFn = fn;
  return isSubstrFn();
}

// 字符串转大写
function UPPER(v: string = ''): string {
  const fn = () => v.toUpperCase();
  const isUpperFn = fn;
  return isUpperFn();
}

// 字符串转小写
function LOWER(v: string = ''): string {
  const fn = () => v.toLowerCase();
  const isLowerFn = fn;
  return isLowerFn();
}

// 字符串去前后空格
function TRIM(v: string = ''): string {
  const fn = () => v.trim();
  const isTrimFn = fn;
  return isTrimFn();
}

// 字符串去前空格
function LTRIM(v: string = ''): string {
  const fn = () => v.replace(/^\s\s*/, '');
  const isTrimFn = fn;
  return isTrimFn();
}

// 字符串去后空格
function RTRIM(v: string = ''): string {
  const fn = () => v.replace(/\s\s*$/, '');
  const isTrimFn = fn;
  return isTrimFn();
}

// 字符串重复的次数，返回重复次数
function REPEAT(v: string = '', c: string = ''): number | null {
  const fn = () => v.match(new RegExp(c, 'g'))?.length || null;
  const isRepeatFn = fn;
  return isRepeatFn();
}

// 字符串替换
function REPLACE(v: string = '', o: string = '', t: string = ''): string {
  const fn = () => v.replace(new RegExp(o, 'g'), t);
  const isReplaceFn = fn;
  return isReplaceFn();
}

// 在字符串查找字符串，如果存在返回true，不存在返回false
function FINDSTR(v: string = '', c: string = ''): boolean {
  const fn = () => v.includes(c);
  const isFindStrFn = fn;
  return isFindStrFn();
}

// 在字符串中查找字符，返回字符在字符串中出现的次数，如果不存在则返回0
function SEARCHSTR(v: string = '', c: string = ''): number {
  const fn = () => {
    const l = v.match(new RegExp(c, 'g'))?.length;
    return l ? l : 0;
  };
  const isSearchstrFn = fn;
  return isSearchstrFn();
}

// 字符串转化为数值
function PARSENUMBER(v: string = ''): number | null {
  const fn = () => {
    const num = parseFloat(v);
    return isNaN(num) ? null : num;
  };
  const isParsenumberFn = fn;
  return isParsenumberFn();
}

// 字符串根据c分割转化为数组，返回数组
function SPLIT(v: string = '', c: string = ''): string[] {
  const fn = () => v.split(c);
  const isSplitFn = fn;
  return isSplitFn();
}

// 参数a、b、c...相加，null 不参与计算返回相加后的数值
function SUM(...args: any[]): number | '' {
  const v = args.flat().filter((i) => i !== '' && i !== null && i !== undefined);
  if (!v.length) return '';
  const fn = () => v.reduce(plus, 0);
  const isSumFn = fn;
  return isSumFn();
}
// 参数a、b、c...相加，有null 则返回空则返回相加后的数值专门给+用的转化函数
function ADD(...args: any[]): number | '' {
  const v = args.flat();
  const fn = () => v.reduce(plus, 0);
  const isSumFn = fn;
  return isSumFn();
}
// 参数相减，返回相减后的数值
function REDUCE(v, ...args: number[]): number | '' {
  // const fn = () => args.reduce((r, n) => r - n);
  const fn = () => args.reduce(minus, v);
  const isReduceFN = fn;
  return isReduceFN();
}

// 参数相乘，返回相乘后的数值
function MULTIPLICATION(val, ...args: any[]): number | '' {
  const v = args.flat().filter((i) => i !== '' && i !== null && i !== undefined);
  if (!v.length) return '';
  const fn = () => v.reduce(multipliedBy, val);
  const isMultiFn = fn;
  return isMultiFn();
}

//参数相除，返回相除后的数值
function DIVISION(v, ...args: number[]): number | '' {
  // const fn = () => args.reduce((r, n) => r / n);
  const fn = () => args.reduce(div, v);
  const isDivision = fn;
  return isDivision();
}

// 参数v保留n位小数，返回数值。如果位数补足则补 0
function FIXED(v: number, n: number): string {
  const fn = () => {
    if (n < 0) {
      throw new Error('Decimal places should be non-negative.');
    }
    const arr = v.toString().split('.');
    const [integer, decimal = ''] = arr;
    if (n == 0) {
      return integer;
    }
    let decimalArr = decimal.split('');

    if (decimalArr.length > n) {
      decimalArr = decimalArr.slice(0, n);
    } else {
      const count = decimalArr.length;
      for (let i = 0; i < n - count; i++) {
        decimalArr.push('0');
      }
    }

    return `${integer}.${decimalArr.join('')}`;
  };
  const isFixedFn = fn;
  return isFixedFn();
}

// 参数v保留n位四舍五入后的小数，返回数值
function ROUND(v: any, n: number): number | '' {
  const fn = () => {
    if (v === null || v === '' || v === undefined) return '';
    if (n < 0) {
      throw new Error('Decimal places should be non-negative.');
    }
    n = n ? parseInt(n) : 0;
    // if (n <= 0) return Math.round(v);
    // v = Math.round(v * Math.pow(10, n)) / Math.pow(10, n);
    // return v;
    // return parseFloat(v.toFixed(n));

    return parseFloat(
      v > 0
        ? (+(Math.round(v + `e${n}`) + `e-${n}`)).toFixed(n)
        : -(+(Math.round(-v + `e${n}`) + `e-${n}`)).toFixed(n),
    );
  };
  const isRoundFn = fn;
  return isRoundFn();
}

// 参数v保留n位向上取整的小数
function ROUNDUP(v: any, n: number): number | '' {
  if (v === null || v === '' || v === undefined) return '';
  if (n < 0) {
    throw new Error('Decimal places should be non-negative.');
  }
  n = n ? parseInt(n) : 0;
  return new BigNumber(v).decimalPlaces(n, BigNumber.ROUND_UP).toNumber();
}

// 从数组参数中获取最大的数，返回数值
function MAX(...args): number | '' {
  const v = args.flat().filter((i) => i !== '' && i !== null && i !== undefined);
  if (!v.length) return '';
  const fn = () => Math.max.apply(null, v);
  const isMaxFn = fn;
  return isMaxFn();
}

// 从数组参数中获取第n大数值，返回数值
function LARGE(v: number[], n: number): number {
  const fn = () => {
    if (n < 1 || n > v.length) {
      throw new Error('Invalid value of n. It should be between 1 and the array length.');
    }
    const s = v.sort((a, b) => b - a);
    return s[n - 1];
  };
  const isLargeFn = fn;
  return isLargeFn();
}

// 从数组参数中获取最小的数，返回数值
function MIN(...args): number | '' {
  const v = args.flat().filter((i) => i !== '' && i !== null && i !== undefined);
  if (!v.length) return '';
  const fn = () => Math.min.apply(null, v);
  const isMinFn = fn;
  return isMinFn();
}

// 从数组参数中获取第n小数值，返回数值
function SMALL(v: number[], n: number): number {
  const fn = () => {
    if (n < 1 || n > v.length) {
      throw new Error('Invalid value of n. It should be between 1 and the array length.');
    }
    const s = v.sort((a, b) => a - b);
    return s[n - 1];
  };
  const isSmallFn = fn;
  return isSmallFn();
}

// 取数组中所有数值的平均值，返回数值
function AVERAGE(...args): number | '' {
  const numbers = args.flat().filter((i) => i !== '' && i !== null && i !== undefined);
  const count = numbers.length;
  if (!count) return '';
  let sum = new BigNumber(0);
  for (const number of numbers) {
    sum = sum.plus(number);
  }
  return sum.dividedBy(count).toNumber();
}

// 取数值参数value的绝对值，返回数值
function ABS(v: number): number {
  const fn = () => Math.abs.call(null, v);
  const isAbsFn = fn;
  return isAbsFn();
}

// 取数value1除以value2的余数，返回数值
function MOD(v: number, n: number): number | string {
  const fn = () => {
    if (v === 0) {
      throw new Error('The second value should not be zero.');
    }
    const result = new BigNumber(v).mod(n).toNumber();
    if (isNaN(result)) return '';
    return result;
  };
  const isModFn = fn;
  return isModFn();
}

function toSafeNumber(x: any): number | null {
  if (typeof x === 'number') {
    return Number.isFinite(x) ? x : null;
  }

  if (typeof x === 'string') {
    const s = x.trim();
    if (s === '') return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  if (typeof x === 'bigint') {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

// 获取数值value的n次乘幂，返回数值
function POWER(v: number, n: number): number {
  const fn = () => {
    const base = toSafeNumber(v);
    const exp = toSafeNumber(n);
    if (base === null || exp === null) return NaN;
    const MAX_EXP = 1e9;

    if (Math.abs(exp) > MAX_EXP) {
      return exp > 0 ? Infinity : 0;
    }
    const result = Math.pow(base, exp);
    return result;
  };

  const isProwerFn = fn;
  return isProwerFn();
}

// 获取数值value的平方根，返回数值
function SQRT(v: number): number {
  const fn = () => {
    const n = toSafeNumber(v);
    if (n === null) return NaN;
    return Math.sqrt(n);
  };
  const isSqrt = fn;
  return isSqrt();
}

// 返回泛型
function GET<T extends object | any[]>(v: T, p: number | keyof T): T[keyof T] {
  const fn = () => {
    if (Array.isArray(v)) {
      if (typeof p === 'number') {
        return v[p];
      } else {
        throw new Error('For arrays, the second argument should be a number.');
      }
    } else if (typeof v === 'object') {
      if (typeof p === 'string') {
        return v[p];
      } else {
        throw new Error('For objects, the second argument (b) should be a string.');
      }
    } else {
      throw new Error(
        'Unsupported data type. The first argument (a) should be an array or an object.',
      );
    }
  };
  const isGetFn = fn;
  return isGetFn();
}

// 修改对象中的属性
function PUT<T extends any>(a: T, b: keyof T, c: T[keyof T | any]): T {
  const fn = () => {
    if (Array.isArray(a)) {
      if (typeof b === 'number' && b >= 0 && b < a.length) {
        a[b] = c;
      } else {
        throw new Error('For arrays, the second argument (b) should be a number.');
      }
    } else if (typeof a === 'object') {
      if (typeof b === 'string' && a) {
        a[b] = c;
      } else {
        throw new Error('For objects, the second argument (b) should be a string.');
      }
    } else {
      throw new Error(
        'Unsupported data type. The first argument (a) should be an array or an object.',
      );
    }
    return a;
  };
  const isPutFn = fn;
  return isPutFn();
}

// 添加元素
function PUSH<T>(v: any[], n: T): T[] {
  const fn = () => {
    if (!n) {
      throw new Error('For arrays, the second argument should not be null or undefined');
    }
    v.push(n);
    return v;
  };
  const isPushFn = fn;
  return isPushFn();
}

// 往数组头部添加数值
function HEADPUSH<T>(v: any[], n: T): T[] {
  const fn = () => {
    if (!n) {
      throw new Error('For arrays, the second argument should not be null or undefined');
    }
    v.unshift(n);
    return v;
  };
  const isHeadpushFn = fn;
  return isHeadpushFn();
}

// 时间戳转化为日期对象，参数dtstr为时间戳类型，返回日期时间对象
function TIMESTAMP2DATE(v: number): string | undefined {
  if (!v) return;
  const fn = () => {
    if (!v) {
      throw new Error('the frist argument should not be null');
    }
    const dateObj = new Date(v * 1000);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  const isTimeStampFn = fn;
  return isTimeStampFn();
}

// 日期转时间戳，参数dt为日期类型，返回时间戳
function DATE2TIMESTAMP(v: string): number | undefined {
  if (!v) return;
  const fn = () => dayjs(v).unix();
  const isDateToTimestampFn = fn;
  return isDateToTimestampFn();
}

function DATEFORMAT(v: Date, f: string): string | undefined {
  if (!v) return;
  const fn = () => dayjs(v).format(f);
  const isDateFormatFn = fn;
  return isDateFormatFn();
}

// 识别日期字符串类型：date-only / time-only / datetime
type DateStringType = 'date' | 'time' | 'datetime';

function _detectDateType(v: string): DateStringType {
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(v.trim())) return 'time';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return 'date';
  return 'datetime';
}

function _getDefaultFormat(type: DateStringType): string {
  if (type === 'date') return 'YYYY-MM-DD';
  if (type === 'time') return 'HH:mm:ss';
  return 'YYYY-MM-DD HH:mm:ss';
}

// 对纯时间类型，借助一个固定日期基准进行 dayjs 运算
const TIME_BASE_DATE = '2000-01-01 ';

// 给初始日期增加一个给定的时间量，比如可以推算某天后3个月的日期
// 示例：DateAdd('日期字段', 3, 'month', 'YYYY-MM-DD')
// 示例：DateAdd('12:22:02', 1, 'hour')
function DateAdd(
  v: string,
  num: number,
  unit: dayjs.ManipulateType,
  format?: string,
): string | undefined {
  if (!v) return;
  const fn = () => {
    const type = _detectDateType(v);
    const fmt = format ?? _getDefaultFormat(type);
    const input = type === 'time' ? TIME_BASE_DATE + v.trim() : v;
    return dayjs(input).add(num, unit).format(fmt);
  };
  const isDateAddFn = fn;
  return isDateAddFn();
}

// 给初始日期减少一个给定的时间量，比如可以推算某天前3个月的日期
// 示例：DateSubtract('日期字段', 3, 'month', 'YYYY-MM-DD')
// 示例：DateSubtract('12:22:02', 1, 'hour')
function DateSubtract(
  v: string,
  num: number,
  unit: dayjs.ManipulateType,
  format?: string,
): string | undefined {
  if (!v) return;
  const fn = () => {
    const type = _detectDateType(v);
    const fmt = format ?? _getDefaultFormat(type);
    const input = type === 'time' ? TIME_BASE_DATE + v.trim() : v;
    return dayjs(input).subtract(num, unit).format(fmt);
  };
  const isDateSubtractFn = fn;
  return isDateSubtractFn();
}

function NOW(): string {
  return dayjs().format('YYYY-MM-DD HH:MM:ss');
}

function TODAY(): string {
  return dayjs().format('YYYY-MM-DD');
}

function YEAR(v: dayjs.ConfigType): number {
  return dayjs(v).year();
}

function MONTH(v: dayjs.ConfigType): number {
  const fn = () => {
    const m = dayjs(v).month();
    return m;
  };
  const isMonthFn = fn;
  return isMonthFn();
}

function DAY(v: dayjs.ConfigType): number {
  const fn = () => {
    const d = dayjs(v).day();
    return d;
  };
  const isDayFn = fn;
  return isDayFn();
}

function HOUR(v: dayjs.ConfigType): number {
  const fn = () => {
    const h = dayjs(v).hour();
    return h;
  };
  const isHourFn = fn;
  return isHourFn();
}

function MINUTE(v: dayjs.ConfigType): number {
  const fn = () => {
    const m = dayjs(v).minute();
    return m;
  };
  const isMinuteFn = fn;
  return isMinuteFn();
}

function WEEKRANGE(): [string, string] {
  const fn = (): [string, string] => {
    const startOfWeek = convertToCST(dayjs().startOf('week').toDate());
    const endOfWeek = convertToCST(dayjs().endOf('week').toDate());
    return [startOfWeek, endOfWeek];
  };
  const isWeekDayFn = fn;
  return isWeekDayFn();
}

function LASTWEEKRANGE(): [string, string] {
  const fn = (): [string, string] => {
    const startOfLastWeek = convertToCST(dayjs().subtract(1, 'week').startOf('week').toDate());
    const endOfLastWeek = convertToCST(dayjs().subtract(1, 'week').endOf('week').toDate());
    return [startOfLastWeek, endOfLastWeek];
  };
  const isLastWeekFn = fn;
  return isLastWeekFn();
}

function MONTHRANGE(): [string, string] {
  const fn = (): [string, string] => {
    const startOfLastMonth = convertToCST(dayjs().startOf('month').toDate());
    const endOfLastMonth = convertToCST(dayjs().endOf('month').toDate());
    return [startOfLastMonth, endOfLastMonth];
  };
  const isMonthRangeFn = fn;
  return isMonthRangeFn();
}

function LASTMONTHRANGE(): [string, string] {
  const fn = (): [string, string] => {
    const startOfLastMonth = convertToCST(dayjs().subtract(1, 'month').startOf('month').toDate());
    const endOfLastMonth = convertToCST(dayjs().subtract(1, 'month').endOf('month').toDate());
    return [startOfLastMonth, endOfLastMonth];
  };
  const isLastMonthRangeFn = fn;
  return isLastMonthRangeFn();
}

function YEARRANGE(): [string, string] {
  const fn = (): [string, string] => {
    const startOfYear = convertToCST(dayjs().startOf('year').toDate());
    const endOfYear = convertToCST(dayjs().endOf('year').toDate());
    return [startOfYear, endOfYear];
  };
  const isYearRange = fn;
  return isYearRange();
}

function LASTYEARRANGE(): [string, string] {
  const fn = (): [string, string] => {
    const startOfLastYear = convertToCST(dayjs().subtract(1, 'year').startOf('year').toDate());
    const endOfLastYear = convertToCST(dayjs().subtract(1, 'year').endOf('year').toDate());
    return [startOfLastYear, endOfLastYear];
  };
  const isLastYearRange = fn;
  return isLastYearRange();
}

function QUARTER(): [string, string] {
  const fn = (): [string, string] => {
    const currentQuarter = Math.floor((dayjs().month() + 3) / 3); // 当前季度
    const startOfCurrentQuarter = convertToCST(
      dayjs().quarter(currentQuarter).startOf('quarter').toDate(),
    );
    const endOfCurrentQuarter = convertToCST(
      dayjs().quarter(currentQuarter).endOf('quarter').toDate(),
    );

    return [startOfCurrentQuarter, endOfCurrentQuarter];
  };
  const isQuarterFn = fn;
  return isQuarterFn();
}

function LASTQUARTER(): [string, string] {
  const fn = (): [string, string] => {
    const currentQuarter = Math.floor((dayjs().month() + 3) / 3); // 当前季度
    const startOfLastQuarter = convertToCST(
      dayjs()
        .quarter(currentQuarter - 1)
        .startOf('quarter')
        .toDate(),
    );
    const endOfLastQuarter = convertToCST(
      dayjs()
        .quarter(currentQuarter - 1)
        .endOf('quarter')
        .toDate(),
    );
    return [startOfLastQuarter, endOfLastQuarter];
  };
  const isLastQuarter = fn;
  return isLastQuarter();
}

function ISDATERANGE(v: Date, r: [Date, Date]): boolean {
  const fn = () => {
    const [startDate, endDate] = r;
    return v >= startDate && v <= endDate;
  };
  const isDateRangFn = fn;
  return isDateRangFn();
}

function ISTIMERANGE(v: string, r: [string, string]): boolean {
  const fn = () => {
    const [startTime, endTime] = r;
    const dtTime = dayjs(v, 'HH:mm');
    if (startTime > endTime) {
      const startTimeAfterMidnight = dayjs(startTime, 'HH:mm');
      const endTimeBeforeMidnight = dayjs(endTime, 'HH:mm').add(1, 'day');
      return dtTime >= startTimeAfterMidnight || dtTime <= endTimeBeforeMidnight;
    } else {
      // 不跨天的情况，直接判断给定时间是否在时间范围内
      return dtTime >= dayjs(startTime, 'HH:mm') && dtTime <= dayjs(endTime, 'HH:mm');
    }
  };
  const isTimeRangFn = fn;
  return isTimeRangFn();
}

// 私有方法，转CST
function convertToCST(isoDateString: Date): string {
  const cstFormattedDate = dayjs(isoDateString)
    .tz('America/Chicago')
    .format('YYYY-MM-DD HH:mm:ss.SSSSSSSSS ZZ');
  return cstFormattedDate;
}

function TUPLE(...args) {
  return [...args];
}
function SEQMAP(...args) {
  const len = (args.length - (args.length % 2)) / 2;
  const map = {};
  Array(len).forEach((i, index) => {
    const key = args[index * 2];
    const value = args[index * 2 + 1];
    map[key] = value;
  });
  return map;
}

//参数平方和
function SUMSQ(...args: any[]): number | '' {
  args = args.flat().filter((i) => i !== '' && i !== null && i !== undefined);
  if (args.length === 0) return '';
  // 计算每个值的平方
  const squares = args.map((value) => {
    const square = multipliedBy(value, value);
    return square !== '' ? square : new BigNumber(0).toNumber();
  });

  // 累加所有平方值
  return squares.reduce((sum: number, square: number): number => {
    return plus(sum, square) || BigNumber(0).toNumber();
  }, new BigNumber(0).toNumber());
}

/**数组计数 */
function COUNT(v: any[]): number | '' {
  if (!Array.isArray(v)) {
    return '';
  }
  return v.length;
}
/**标准差函数 */
function STDEV(...args: any[]): number | '' {
  const data = args
    .flat()
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

  if (data.length < 2) {
    return '';
  }
  // 平均值
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  // 方差（n-1）
  const variance =
    data.reduce((sum, val) => {
      const diff = val - mean;
      return sum + diff * diff;
    }, 0) /
    (data.length - 1);

  return Math.sqrt(variance);
}
//加法
function plus(a, b) {
  const result = new BigNumber(a).plus(new BigNumber(b)).toNumber();
  if (isNaN(result)) return '';
  return result;
}
// 减法
function minus(a, b) {
  const result = new BigNumber(a).minus(new BigNumber(b)).toNumber();
  if (isNaN(result)) return '';
  return result;
}
//乘法
function multipliedBy(a, b) {
  const result = new BigNumber(a).multipliedBy(new BigNumber(b)).toNumber();
  if (isNaN(result)) return '';
  return result;
}
// 除法
function div(a, b) {
  const result = new BigNumber(a).div(new BigNumber(b)).toNumber();
  if (isNaN(result)) return '';
  return result;
}

export {
  IF,
  ISEMPTY,
  ISNULL,
  ISUNDEFINED,
  AND,
  OR,
  EQ,
  NE,
  LE,
  LT,
  GE,
  GT,
  LEN,
  CONCAT,
  SUBSTRING,
  SUBSTR,
  UPPER,
  LOWER,
  TRIM,
  LTRIM,
  RTRIM,
  REPEAT,
  REPLACE,
  FINDSTR,
  SEARCHSTR,
  PARSENUMBER,
  SPLIT,
  SUM,
  ADD,
  REDUCE,
  MULTIPLICATION,
  DIVISION,
  FIXED,
  ROUND,
  ROUNDUP,
  MAX,
  LARGE,
  MIN,
  SMALL,
  AVERAGE,
  ABS,
  MOD,
  POWER,
  SQRT,
  GET,
  PUT,
  PUSH,
  HEADPUSH,
  TIMESTAMP2DATE,
  DATE2TIMESTAMP,
  DATEFORMAT,
  DateAdd,
  DateSubtract,
  NOW,
  TODAY,
  YEAR,
  MONTH,
  DAY,
  HOUR,
  MINUTE,
  WEEKRANGE,
  LASTWEEKRANGE,
  MONTHRANGE,
  LASTMONTHRANGE,
  YEARRANGE,
  LASTYEARRANGE,
  QUARTER,
  LASTQUARTER,
  ISDATERANGE,
  ISTIMERANGE,
  TUPLE,
  SEQMAP,
  SUMSQ,
  COUNT,
  STDEV,
};
