import { IdentifierGroupInterface } from '../types/index';

export const functionGroup: IdentifierGroupInterface[] = [
  {
    id: 'LOGIC',
    name: $t('sys.pageDesigner.exp.logic.index'),
    children: [
      {
        desc:
          'IF(expr, a, b)\n' +
          `$t('sys.pageDesigner.exp.logic.desc_01_1')\n` +
          `$t('sys.pageDesigner.exp.logic.desc_01_2')\n` +
          `$t('sys.pageDesigner.exp.example')\n` +
          `IF(1 > 2, 1, 2); $t('sys.pageDesigner.exp.return') 2`,
        definition: 'declare function IF<T>(expr: boolean, v: T, l: T): T;',
      },
      {
        desc:
          'ISEMPTY(a)\n' +
          `$t('sys.pageDesigner.exp.logic.desc_02_1')\n` +
          `$t('sys.pageDesigner.exp.logic.desc_02_2')\n` +
          `$t('sys.pageDesigner.exp.example')\n` +
          `ISEMPTY('')   $t('sys.pageDesigner.exp.return') true\n` +
          `ISEMPTY(null)   $t('sys.pageDesigner.exp.return') true\n` +
          `ISEMPTY(undefined) $t('sys.pageDesigner.exp.return') true\n` +
          `ISEMPTY([]) $t('sys.pageDesigner.exp.return') true\n` +
          `ISEMPTY({}) $t('sys.pageDesigner.exp.return') true\n`,
        definition: 'declare function ISEMPTY<T>(val: T): boolean;',
      },
      {
        desc: `ISNULL(a)
    $t('sys.pageDesigner.exp.logic.desc_03_1')
    $t('sys.pageDesigner.exp.example')
    ISNULL('')   $t('sys.pageDesigner.exp.return') false
    ISNULL(null)   $t('sys.pageDesigner.exp.return') true
    ISNULL(undefined) $t('sys.pageDesigner.exp.return') false`,
        definition: 'declare function ISNULL<T>(val: T): Promise<boolean>;',
      },
      {
        desc: `ISUNDEFINED(a)
    $t('sys.pageDesigner.exp.logic.desc_04_1')
    $t('sys.pageDesigner.exp.example')
    ISUNDEFINED('')   $t('sys.pageDesigner.exp.return') false
    ISUNDEFINED(null)   $t('sys.pageDesigner.exp.return') false
    ISUNDEFINED(undefined) $t('sys.pageDesigner.exp.return') true`,
        definition: 'declare function ISUNDEFINED<T>(val: T): Promise<boolean>;',
      },
      {
        desc: `AND(conditions): boolean
    $t('sys.pageDesigner.exp.logic.desc_05_1')
    $t('sys.pageDesigner.exp.logic.desc_05_2')
    $t('sys.pageDesigner.exp.example')
    IF(AND(1==1,1 > 2,3==3),$t('sys.pageDesigner.exp.correct'),$t('sys.pageDesigner.exp.error')); $t('sys.pageDesigner.exp.return') $t('sys.pageDesigner.exp.error')`,
        definition: 'declare function AND<T>(...e: T[]): Promise<boolean>;',
      },
      {
        desc: `OR(conditions)
    $t('sys.pageDesigner.exp.logic.desc_06_1')
    $t('sys.pageDesigner.exp.logic.desc_06_2')
    $t('sys.pageDesigner.exp.example')
    IF(OR(1==1,1 > 2,3==3),$t('sys.pageDesigner.exp.correct'),$t('sys.pageDesigner.exp.error')); $t('sys.pageDesigner.exp.return') $t('sys.pageDesigner.exp.correct')`,
        definition: 'declare function OR<T>(...e: T[]): Promise<boolean>;',
      },
      {
        desc: `EQ(a, b)
    $t('sys.pageDesigner.exp.logic.desc_07_1')
    $t('sys.pageDesigner.exp.logic.desc_07_2')
    $t('sys.pageDesigner.exp.example')
    EQ(1, 1); $t('sys.pageDesigner.exp.return') true
    EQ("a", "c"); $t('sys.pageDesigner.exp.return') false
    EQ([1,2,3],[1,2,3]) $t('sys.pageDesigner.exp.return') true
    EQ({a:1,b:1},{a:1,b:1}) $t('sys.pageDesigner.exp.return') true`,
        definition: 'declare function EQ<T, K>(v: T, o: K): Promise<boolean>;',
      },
      {
        desc: `NE(a, b)
    $t('sys.pageDesigner.exp.logic.desc_08_1')
    $t('sys.pageDesigner.exp.logic.desc_08_2')
    $t('sys.pageDesigner.exp.example')
    NE(1, 1); $t('sys.pageDesigner.exp.return') false
    NE("a", "c"); $t('sys.pageDesigner.exp.return') true
    NE([1,2,3],[1,2,3]) $t('sys.pageDesigner.exp.return') false
    NE({a:1,b:1},{a:1,b:1}) $t('sys.pageDesigner.exp.return') false`,
        definition: 'declare function NE<T>(v: T, o: T): Promise<boolean>;',
      },
      {
        desc: `LE(a, b)
    $t('sys.pageDesigner.exp.logic.desc_09_1')
    $t('sys.pageDesigner.exp.logic.desc_09_2')
    $t('sys.pageDesigner.exp.example')
    LE(1, 1); $t('sys.pageDesigner.exp.return') true
    LE(2, 1); $t('sys.pageDesigner.exp.return') false
    LE('2023-07-12','2023-07-13') $t('sys.pageDesigner.exp.return') true
    LE('12:00','13:00') $t('sys.pageDesigner.exp.return') true`,
        definition: 'declare function LE<T>(v: T, o: T): Promise<boolean>;',
      },
      {
        desc: `LT(a, b)
    $t('sys.pageDesigner.exp.logic.desc_10_1')
    $t('sys.pageDesigner.exp.logic.desc_9_2')
    $t('sys.pageDesigner.exp.example')
    LT(1, 1); $t('sys.pageDesigner.exp.return') false
    LT(1, 2); $t('sys.pageDesigner.exp.return') true
    LT('2023-07-12','2023-07-13') $t('sys.pageDesigner.exp.return') true
    LT('13:00','12:00') $t('sys.pageDesigner.exp.return') true`,
        definition: 'declare function LT<T>(v: T, o: T): Promise<boolean>;',
      },
      {
        desc: `GE(a, b)
    $t('sys.pageDesigner.exp.logic.desc_11_1')
    $t('sys.pageDesigner.exp.logic.desc_9_2')
    $t('sys.pageDesigner.exp.example')
    GE(1, 1); $t('sys.pageDesigner.exp.return') true
    GE(2, 3); $t('sys.pageDesigner.exp.return') false
    GE('2023-07-13','2023-07-12') $t('sys.pageDesigner.exp.return') true
    GE('13:00','12:00') $t('sys.pageDesigner.exp.return') true`,
        definition: 'declare function GE<T>(v: T, o: T): Promise<boolean>;',
      },
      {
        desc: `GT(a, b)
    $t('sys.pageDesigner.exp.logic.desc_12_1')
    $t('sys.pageDesigner.exp.logic.desc_9_2')
    $t('sys.pageDesigner.exp.example')
    GT(1, 1); $t('sys.pageDesigner.exp.return') false
    GT(2, 1); $t('sys.pageDesigner.exp.return') false
    GT('2023-07-13','2023-07-12') $t('sys.pageDesigner.exp.return') true
    GT('13:00','12:00') $t('sys.pageDesigner.exp.return') true`,
        definition: 'declare function GT<T>(v: T, o: T): Promise<boolean>;',
      },
    ],
  },

  {
    id: 'STRING',
    name: $t('sys.pageDesigner.exp.string.index'),
    children: [
      {
        desc: `LEN(a)
    $t('sys.pageDesigner.exp.string.desc_01_1')
    $t('sys.pageDesigner.exp.example')
    LEN('aa');   $t('sys.pageDesigner.exp.return') 2`,
        definition: 'declare function LEN(v: string): Promise<number>;',
      },
      {
        desc: `CONCAT(a,b....)
    $t('sys.pageDesigner.exp.string.desc_02_1')
    $t('sys.pageDesigner.exp.string.desc_02_2')
    $t('sys.pageDesigner.exp.example')
    CONCAT('a','b','c') $t('sys.pageDesigner.exp.return')abc`,
        definition: 'declare function CONCAT(...args: string[]): Promise<string>;',
      },
      {
        desc: `SUBSTRING(str,start,end)
    $t('sys.pageDesigner.exp.string.desc_03_1')
    $t('sys.pageDesigner.exp.example')
    SUBSTRING('abcd',0,2) $t('sys.pageDesigner.exp.return')abc
    SUBSTRING('abcd',-1,-2) $t('sys.pageDesigner.exp.return') cd`,
        definition: 'declare function SUBSTRING(v: string, s: number, e: number): Promise<string>;',
      },
      {
        desc: `SUBSTR(str,start,len)
    $t('sys.pageDesigner.exp.string.desc_04_1')
    SUBSTR('abcd',0,2) $t('sys.pageDesigner.exp.return')ab
    SUBSTRING('abcd',-1,2) $t('sys.pageDesigner.exp.return') cd`,
        definition: 'declare function SUBSTR(v: string, s: number, l: number): Promise<string>;',
      },
      {
        desc: `UPPER(a)
    $t('sys.pageDesigner.exp.string.desc_05_1')
    $t('sys.pageDesigner.exp.example')
    UPPER('aa') $t('sys.pageDesigner.exp.return') AA `,
        definition: 'declare function UPPER(v: string): Promise<string>;',
      },
      {
        desc: `LOWER(a)
    $t('sys.pageDesigner.exp.string.desc_06_1')
    $t('sys.pageDesigner.exp.example')
    LOWER('AA') $t('sys.pageDesigner.exp.return') aa`,
        definition: 'declare function LOWER(v: string): Promise<string>;',
      },
      {
        desc: `TRIM(a)
    $t('sys.pageDesigner.exp.string.desc_07_1')
    $t('sys.pageDesigner.exp.example')
    TRIM(' ab ') $t('sys.pageDesigner.exp.return') 'ab'`,
        definition: 'declare function TRIM(v: string): Promise<string>;',
      },
      {
        desc: `LTRIM(a)
    $t('sys.pageDesigner.exp.string.desc_08_1')
    $t('sys.pageDesigner.exp.example')
    LTRIM(' ab ') $t('sys.pageDesigner.exp.return') 'ab '`,
        definition: 'declare function LTRIM(v: string): Promise<string>;',
      },
      {
        desc: `RTRIM(a)
    $t('sys.pageDesigner.exp.string.desc_09_1')
    $t('sys.pageDesigner.exp.example')
    LTRIM(' ab ') $t('sys.pageDesigner.exp.return') ' ab'`,
        definition: 'declare function RTRIM(v: string): Promise<string>;',
      },
      {
        desc: `REPEAT(str,a)
    $t('sys.pageDesigner.exp.string.desc_10_1')
    $t('sys.pageDesigner.exp.example')
    REPEAT('aabbcc','a') $t('sys.pageDesigner.exp.return') 2`,
        definition: 'declare function REPEAT(v: string, c: string): Promise<number | null>;',
      },
      {
        desc: `REPLACE(str,a,b)
    $t('sys.pageDesigner.exp.string.desc_11_1')
    $t('sys.pageDesigner.exp.example')
    REPLACE('aabbcc','a','1') $t('sys.pageDesigner.exp.return') 11bbcc`,
        definition: 'declare function REPLACE(v: string, o: string, t: string): Promise<string>;',
      },
      {
        desc: `FINDSTR(str,a)
    $t('sys.pageDesigner.exp.string.desc_12_1')
    $t('sys.pageDesigner.exp.example')
    FINDSTR('aabbcc','a') $t('sys.pageDesigner.exp.return') true`,
        definition: 'declare function FINDSTR(v: string, c: string): Promise<boolean>;',
      },
      {
        desc: `SEARCHSTR(str,a)
    $t('sys.pageDesigner.exp.string.desc_13_1')
    $t('sys.pageDesigner.exp.example')
    SEARCHSTR('aabbcc','a') $t('sys.pageDesigner.exp.return') 2`,
        definition: 'declare function SEARCHSTR(v: string, c: string): Promise<number>;',
      },
      {
        desc: `PARSENUMBER(str)
    $t('sys.pageDesigner.exp.string.desc_14_1')
    $t('sys.pageDesigner.exp.example')
    PARSENUMBER('1') $t('sys.pageDesigner.exp.return') 1
    PARSENUMBER('0.1') $t('sys.pageDesigner.exp.return') 0.1`,
        definition: 'declare function PARSENUMBER(v: string): Promise<number | null>;',
      },
      {
        desc: `SPLIET(str,a)
    $t('sys.pageDesigner.exp.string.desc_15_1')
    $t('sys.pageDesigner.exp.string.desc_15_2')
    $t('sys.pageDesigner.exp.example')
    SPLIT('aa-bb-cc','-') $t('sys.pageDesigner.exp.return') ['aa','bb','cc']`,
        definition: 'declare function SPLIT(v: string, c: string): Promise<string[]>;',
      },
    ],
  },
  {
    id: 'NUMBER',
    name: $t('sys.pageDesigner.exp.number.index'),
    children: [
      {
        desc: `SUM(a,b,c...)
    $t('sys.pageDesigner.exp.number.desc_01_1')
    $t('sys.pageDesigner.exp.example')
    SUM(1,2,3) $t('sys.pageDesigner.exp.return') 6`,
        definition: 'declare function SUM(...args: number[]): Promise<number>;',
      },
      {
        desc: `REDUCE(a,b,c...)
    $t('sys.pageDesigner.exp.number.desc_02_1')
    $t('sys.pageDesigner.exp.example')
    REDUCE(2,1) $t('sys.pageDesigner.exp.return') 1
    REDUCE(5,1,2) $t('sys.pageDesigner.exp.return') 2`,
        definition: 'declare function REDUCE(...args: number[]): Promise<number>;',
      },
      {
        desc: `MULTIPLICATION(a,b,c...)
    $t('sys.pageDesigner.exp.number.desc_03_1')
    $t('sys.pageDesigner.exp.example')
    MULTIPLICATION(2,1) $t('sys.pageDesigner.exp.return') 2
    MULTIPLICATION(5,1,2) $t('sys.pageDesigner.exp.return') 10`,
        definition: 'declare function MULTIPLICATION(...args: number[]): Promise<number>;',
      },
      {
        desc: `DIVISION(a,b,c...)
    $t('sys.pageDesigner.exp.number.desc_04_1')
    $t('sys.pageDesigner.exp.example')
    DIVISION(2,1) $t('sys.pageDesigner.exp.return') 2
    DIVISION(10,5,2) $t('sys.pageDesigner.exp.return') 1`,
        definition: 'declare function DIVISION(...args: number[]): Promise<number>;',
      },
      {
        desc: `FIXED(value,num)
    $t('sys.pageDesigner.exp.number.desc_05_1')
    $t('sys.pageDesigner.exp.example')
    FIXED(2.01,1) $t('sys.pageDesigner.exp.return') 2.0
    FIXED(2.015,2) $t('sys.pageDesigner.exp.return') 2.01`,
        definition:
          'declare function FIXED(v: number, n: number): Promise<number | Promise<Error>>;',
      },
      {
        desc: `ROUND(value,num)
    $t('sys.pageDesigner.exp.number.desc_06_1')
    $t('sys.pageDesigner.exp.example')
    ROUND(2.01,1) $t('sys.pageDesigner.exp.return') 2.0
    ROUND(2.015,2) $t('sys.pageDesigner.exp.return') 2.02`,
        definition:
          'declare function ROUND(v: number, n: number): Promise<number | Promise<Error>>;',
      },
      {
        desc: `ROUNDUP(value,num)
    $t('sys.pageDesigner.exp.number.desc_07_1')
    $t('sys.pageDesigner.exp.example')
    ROUNDUP(3.141,2) $t('sys.pageDesigner.exp.return') 3.15`,
        definition:
          'declare function ROUNDUP(v: number, n: number): Promise<number | Promise<Error>>;',
      },
      {
        desc: `MAX([value1, value2...])
    $t('sys.pageDesigner.exp.number.desc_08_1')
    $t('sys.pageDesigner.exp.number.desc_08_2')
    $t('sys.pageDesigner.exp.example')
    MAX([2, 1]) $t('sys.pageDesigner.exp.return') 2
    MAX([2.1, 2.2]) $t('sys.pageDesigner.exp.return') 2.2`,
        definition: 'declare function MAX(v: number[]): Promise<number>;',
      },
      {
        desc: `LARGE([value1, value2...], n)
    $t('sys.pageDesigner.exp.number.desc_09_1')
    $t('sys.pageDesigner.exp.number.desc_08_2')
    $t('sys.pageDesigner.exp.example')
    LARGE([5, 4, 3, 2, 1],2) $t('sys.pageDesigner.exp.return') 4
LARGE([2.5, 2.4, 2.3, 2.2, 2.1], 3) $t('sys.pageDesigner.exp.return') 2.3`,
        definition:
          'declare function LARGE(v: number[], n: number): Promise<number | Promise<Error>>;',
      },
      {
        desc: `MIN([value1, value2...])
$t('sys.pageDesigner.exp.number.desc_10_1')
$t('sys.pageDesigner.exp.number.desc_08_2')
$t('sys.pageDesigner.exp.example')
MIN([2, 1]) $t('sys.pageDesigner.exp.return') 1
MIN([2.1, 2.2]) $t('sys.pageDesigner.exp.return') 2.1`,
        definition: 'declare function MIN(v: number[]): Promise<number>;',
      },
      {
        desc: `SMALL([value1, value2...], n)
$t('sys.pageDesigner.exp.number.desc_11_1')
$t('sys.pageDesigner.exp.number.desc_08_2')
$t('sys.pageDesigner.exp.example')
SMALL([5, 4, 3, 2, 1], 2) $t('sys.pageDesigner.exp.return') 2
SMALL([2.5, 2.4, 2.3, 2.2, 2.1], 3) $t('sys.pageDesigner.exp.return') 2.3`,
        definition:
          'declare function SMALL(v: number[], n: number): Promise<number | Promise<Error>>;',
      },
      {
        desc: `AVERAGE([value1, value2...])
$t('sys.pageDesigner.exp.number.desc_12_1')
$t('sys.pageDesigner.exp.number.desc_08_2')
$t('sys.pageDesigner.exp.example')
AVERAGE([5, 4, 3, 2, 1]) $t('sys.pageDesigner.exp.return') 3`,
        definition: 'declare function AVERAGE(v: number[]): Promise<number | Promise<Error>>;',
      },
      {
        desc: `ABS(value)
$t('sys.pageDesigner.exp.number.desc_13_1')
$t('sys.pageDesigner.exp.number.desc_13_2')
$t('sys.pageDesigner.exp.example')
ABS(-1) $t('sys.pageDesigner.exp.return') 1`,
        definition: 'declare function ABS(v: number): Promise<number>;',
      },
      {
        desc: `MOD(value1, value2)
$t('sys.pageDesigner.exp.number.desc_14_1')
$t('sys.pageDesigner.exp.number.desc_13_2')
$t('sys.pageDesigner.exp.example')
MOD(4, 3) $t('sys.pageDesigner.exp.return') 1`,
        definition: 'declare function MOD(v: number, n: number): Promise<number | Promise<Error>>;',
      },
      {
        desc: `POWER(value, n)
$t('sys.pageDesigner.exp.number.desc_15_1')
$t('sys.pageDesigner.exp.number.desc_13_2')
$t('sys.pageDesigner.exp.example')
POWER(4, 2) $t('sys.pageDesigner.exp.return') 16`,
        definition: 'declare function POWER(v: number, n: number): Promise<number>;',
      },
      {
        desc: `SQRT(value)
$t('sys.pageDesigner.exp.number.desc_16_1')
$t('sys.pageDesigner.exp.number.desc_13_2')
$t('sys.pageDesigner.exp.example')
SQRT(4) $t('sys.pageDesigner.exp.return') 2`,
        definition: 'declare function SQRT(v: number): Promise<number>;',
      },
      {
        desc: `SUMSQ
    $t('sys.pageDesigner.exp.number.desc_17_1')
    $t('sys.pageDesigner.exp.example')
    SUMSQ(2,3)=2²+3²=13`,
        definition: 'declare function SUMSQ(...args: number[]): Promise<number>;',
      },
      {
        desc: `STDEV
    $t('sys.pageDesigner.exp.number.desc_18_1')
    $t('sys.pageDesigner.exp.example')
    STDEV([10, 12, 23, 23, 16, 23, 21, 16])=5.237229365663817`,
        definition: 'declare function STDEV(...args: number[]): Promise<number>;',
      },
    ],
  },
  {
    id: 'OBJECT,ARRAY',
    name: $t('sys.pageDesigner.exp.objOrArray.index'),
    children: [
      {
        desc: `TUPLE(1, 2, 3)
$t('sys.pageDesigner.exp.objOrArray.desc_01_1')
$t('sys.pageDesigner.exp.example')
TUPLE(1, 2, 3) $t('sys.pageDesigner.exp.return') [1, 2, 3]`,
        definition: 'declare function TUPLE(x:any): any[]',
      },
      {
        desc: `SEQMAP('a', 1, 'b', 'c')
$t('sys.pageDesigner.exp.objOrArray.desc_02_1')
$t('sys.pageDesigner.exp.example')
SEQMAP('a', 1, 'b', 'c') $t('sys.pageDesigner.exp.return') { a: 1, b: 'c' } `,
        definition: 'declare function SEQMAP(a:string,b:any): object',
      },
      {
        desc: `GET(a, b)
$t('sys.pageDesigner.exp.objOrArray.desc_03_1')
$t('sys.pageDesigner.exp.objOrArray.desc_03_2')
$t('sys.pageDesigner.exp.example')
GET(['A', 'B', 'C'], 1) $t('sys.pageDesigner.exp.return') A
GET({ a: 1, b: 2, c: 3 }, 'a') $t('sys.pageDesigner.exp.return') B`,
        definition:
          'declare function GET<T extends object | any[]>(v: T, p: number | keyof T): Promise<T[keyof T]>;',
      },
      {
        desc: `PUT(a, b, c)
$t('sys.pageDesigner.exp.objOrArray.desc_04_1')
$t('sys.pageDesigner.exp.objOrArray.desc_04_2')
$t('sys.pageDesigner.exp.example')
PUT(['A', 'B', 'C'], 1, 'D') $t('sys.pageDesigner.exp.return') ['A', 'D', 'C']
PUT({ a: 1, b: 2, c: 3 }, 'a', 4) $t('sys.pageDesigner.exp.return') { a: 4, b: 2, c: 3 } `,
        definition:
          'declare function PUT<T>(a: T, b: keyof T, c: T[keyof T | any]): Promise<T | Promise<Error>>;',
      },
      {
        desc: `PUSH(a, b)
$t('sys.pageDesigner.exp.objOrArray.desc_05_1')
$t('sys.pageDesigner.exp.objOrArray.desc_05_2')
$t('sys.pageDesigner.exp.example')
PUSH([1, 2, 3], 4) $t('sys.pageDesigner.exp.return') [1, 2, 3, 4]`,
        definition: 'declare function PUSH<T>(v: any[], n: T): Promise<T[] | Promise<Error>>;',
      },
      {
        desc: `HEADPUSH(a, b)
$t('sys.pageDesigner.exp.objOrArray.desc_06_1')
$t('sys.pageDesigner.exp.objOrArray.desc_05_2')
$t('sys.pageDesigner.exp.example')
HEADPUSH([1, 2, 3], 0) $t('sys.pageDesigner.exp.return') [0, 1, 2, 3]`,
        definition: 'declare function HEADPUSH<T>(v: any[], n: T): Promise<T[] | Promise<Error>>;',
      },
      {
        desc: `COUNT
    $t('sys.pageDesigner.exp.objOrArray.desc_07_1')
    $t('sys.pageDesigner.exp.example')
    COUNT([10, 12, 23, 23, 16, 23, 21, 16])=8`,
        definition: 'declare function COUNT(v: number[]): Promise<number>;',
      },
    ],
  },
  {
    id: 'DATE',
    name: $t('sys.pageDesigner.exp.date.index'),
    children: [
      {
        desc: `TIMESTAMP2DATE(dtstr)
$t('sys.pageDesigner.exp.date.desc_01_1')
$t('sys.pageDesigner.exp.example')
TIMESTAMP2DATE(1689558261) $t('sys.pageDesigner.exp.return') 2023-07 - 17 9: 44: 21`,
        definition: 'declare function TIMESTAMP2DATE(v: number): Promise<string | Promise<Error>>;',
      },
      {
        desc: `DATE2TIMESTAMP(dt)
$t('sys.pageDesigner.exp.date.desc_02_1')
$t('sys.pageDesigner.exp.example')
DATE2TIMESTAMP()`,
        definition: 'declare function DATE2TIMESTAMP(v: string): Promise<number>;',
      },
      {
        desc: `DATEFORMAT(dt, format)
$t('sys.pageDesigner.exp.date.desc_03_1')
$t('sys.pageDesigner.exp.example')
DATEFORMAT(NOW(), YYYY-MM-DD HH:mm)`,
        definition: 'declare function DATEFORMAT(v: Date, f: string): Promise<string>;',
      },
      {
        desc: `NOW()
$t('sys.pageDesigner.exp.date.desc_04_1')
NOW()  $t('sys.pageDesigner.exp.return') 2023-07 - 17 9: 44: 21`,
        definition: 'declare function NOW(): Promise<string>;',
      },
      {
        desc: `TODAY()
$t('sys.pageDesigner.exp.date.desc_05_1')
TODAY()  $t('sys.pageDesigner.exp.return') 2023-07-17`,
        definition: 'declare function TODAY(): Promise<string>;',
      },
      {
        desc: `YEAR(dt)
$t('sys.pageDesigner.exp.date.desc_06_1')
YEAR(NOW())  $t('sys.pageDesigner.exp.return') 2024`,
        definition: 'declare function YEAR(v: string | number | Date | null | undefined): number;',
      },
      {
        desc: `MONTH(dt)
$t('sys.pageDesigner.exp.date.desc_07_1')
MONTH(NOW())  $t('sys.pageDesigner.exp.return') 7`,
        definition:
          'declare function MONTH(v: string | number | Date | null | undefined): Promise<number>;',
      },
      {
        desc: `DAY(dt)
$t('sys.pageDesigner.exp.date.desc_08_1')
DAY(NOW())  $t('sys.pageDesigner.exp.return') 17`,
        definition:
          'declare function DAY(v: string | number | Date | null | undefined): Promise<number>;',
      },
      {
        desc: `HOUR(dt)
$t('sys.pageDesigner.exp.date.desc_09_1')
HOUR(NOW())  $t('sys.pageDesigner.exp.return') 10`,
        definition:
          'declare function HOUR(v: string | number | Date | null | undefined): Promise<number>;',
      },
      {
        desc: `MINUTE(dt)
$t('sys.pageDesigner.exp.date.desc_10_1')
MINUTE(NOW())  $t('sys.pageDesigner.exp.return') 44`,
        definition:
          'declare function MINUTE(v: string | number | Date | null | undefined): Promise<number>;',
      },
      {
        desc: `WEEKRANGE()
$t('sys.pageDesigner.exp.date.desc_11_1')
WEEKRANGE()  $t('sys.pageDesigner.exp.return') [2023-07 - 17 00:00:00.000000000 +0800 CST, 2023-07 - 23 23: 59: 59.000000000 +0800 CST]`,
        definition: 'declare function WEEKRANGE(): Promise<[string, string]>;',
      },
      {
        desc: `LASTWEEKRANGE()
$t('sys.pageDesigner.exp.date.desc_12_1')
LASTWEEKRANGE()  $t('sys.pageDesigner.exp.return') [2023-07 - 10 00:00:00.000000000 +0800 CST, 2023-07 - 16 23: 59: 59.000000000 +0800 CST]`,
        definition: 'declare function LASTWEEKRANGE(): Promise<[string, string]>;',
      },
      {
        desc: `MONTHRANGE()
$t('sys.pageDesigner.exp.date.desc_13_1')
MONTHRANGE()  $t('sys.pageDesigner.exp.return') [2023-07-01 00:00:00.000000000 +0800 CST, 2023-07 - 31 23: 59: 59.000000000 +0800 CST]`,
        definition: 'declare function MONTHRANGE(): Promise<[string, string]>;',
      },
      {
        desc: `LASTMONTHRANGE()
$t('sys.pageDesigner.exp.date.desc_14_1')
MONTHRANGE()  $t('sys.pageDesigner.exp.return') [2023-06-01 00:00:00.000000000 +0800 CST, 2023-06 - 30 23: 59: 59.000000000 +0800 CST]`,
        definition: 'declare function LASTMONTHRANGE(): Promise<[string, string]>;',
      },
      {
        desc: `YEARRANGE()
$t('sys.pageDesigner.exp.date.desc_15_1')
YEARRANGE()  $t('sys.pageDesigner.exp.return') [2023-01-01 00:00:00.000000000 +0800 CST, 2023 - 12 - 31 23: 59: 59.000000000 +0800 CST]`,
        definition: 'declare function YEARRANGE(): Promise<[string, string]>;',
      },
      {
        desc: `LASTYEARRANGE()
$t('sys.pageDesigner.exp.date.desc_16_1')
LASTYEARRANGE()  $t('sys.pageDesigner.exp.return') [2022-01-01 00:00:00.000000000 +0800 CST, 2022 - 12 - 31 23: 59: 59.000000000 +0800 CST]`,
        definition: 'declare function LASTYEARRANGE(): Promise<[string, string]>;',
      },
      {
        desc: `QUARTER()
$t('sys.pageDesigner.exp.date.desc_17_1')
QUARTER()  $t('sys.pageDesigner.exp.return') [2022-07-01 00:00:00.000000000 +0800 CST, 2022 -09 - 30 23: 59: 59.000000000 +0800 CST]`,
        definition: 'declare function QUARTER(): Promise<[string, string]>;',
      },
      {
        desc: `LASTQUARTER()
$t('sys.pageDesigner.exp.date.desc_18_1')
LASTQUARTER()  $t('sys.pageDesigner.exp.return') [2022-04-01 00:00:00.000000000 +0800 CST, 2022-06 - 30 23: 59: 59.000000000 +0800 CST]`,
        definition: 'declare function LASTQUARTER(): Promise<[string, string]>;',
      },
      {
        desc: `ISDATERANGE(dt, [startDate, endDate])
$t('sys.pageDesigner.exp.date.desc_19_1')
ISDATERANGE(NOW(), WEEKRANGE())  $t('sys.pageDesigner.exp.return') true`,
        definition: 'declare function ISDATERANGE(v: Date, r: [Date, Date]): Promise<boolean>;',
      },
      {
        desc: `ISTIMERANGE(dt, [startTime, endTime])
$t('sys.pageDesigner.exp.date.desc_20_1')
$t('sys.pageDesigner.exp.date.desc_20_2')
ISTIMERANGE(DATEFORMAT(NOW(), HH:mm), ['06:00', '12:00'])  $t('sys.pageDesigner.exp.return') true
ISTIMERANGE(DATEFORMAT(NOW(), HH:mm), ['13:00', '07:00'])  $t('sys.pageDesigner.exp.return') true `,
        definition:
          'declare function ISTIMERANGE(v: string, r: [string, string]): Promise<boolean>;',
      },
      {
        desc: `DateAdd(date, num, unit, format?)
给初始日期增加一个给定的时间量，比如可以推算某天后3个月的日期
参数 date: 原始日期，num: 数量，unit: 单位(year/month/week/day/hour/minute/second)，format: 输出格式(可选，默认 YYYY-MM-DD HH:mm:ss)
示例
DateAdd('2024-01-01', 3, 'month')  返回 2024-04-01 00:00:00
DateAdd('2024-01-01', 3, 'month', 'YYYY-MM-DD')  返回 2024-04-01`,
        definition:
          'declare function DateAdd(v: string, num: number, unit: string, format?: string): Promise<string>;',
      },
      {
        desc: `DateSubtract(date, num, unit, format?)
给初始日期减少一个给定的时间量，比如可以推算某天前3个月的日期
参数 date: 原始日期，num: 数量，unit: 单位(year/month/week/day/hour/minute/second)，format: 输出格式(可选，默认 YYYY-MM-DD HH:mm:ss)
示例
DateSubtract('2024-04-01', 3, 'month')  返回 2024-01-01 00:00:00
DateSubtract('2024-04-01', 3, 'month', 'YYYY-MM-DD')  返回 2024-01-01`,
        definition:
          'declare function DateSubtract(v: string, num: number, unit: string, format?: string): Promise<string>;',
      },
    ],
  },
].map((group) => {
  group.children = group.children!.map((item) => {
    const id = item.definition.match(/(?<=declare function )([A-Za-z][A-Za-z0-9]*)/g)![0];
    const args = (item.definition.match(/([a-z]:)+/g) || []).length;
    Object.assign(item, {
      id,
      name: id,
      idToChildren: false,
      _args_: args,
    });
    return item;
  });
  return group;
});

export const functionMap = functionGroup.reduce((map, g) => {
  g.children.forEach((item) => {
    map[item.id] = item;
  });
  return map;
}, {});

export const ipaasBackFunctionGroup: IdentifierGroupInterface[] = [
  {
    id: 'INNER',
    name: $t('sys.pageDesigner.exp.inner.index'),
    children: [
      {
        desc:
          `MD5(str) $t('sys.pageDesigner.exp.inner.desc_01_1')\n` +
          `$t('sys.pageDesigner.exp.example'): MD5('abc')\n` +
          `$t('sys.pageDesigner.exp.return') 900150983cd24fb0d6963f7d28e17f72\n`,
        definition: 'declare function MD5(str: string): string;',
      },
      {
        desc:
          `SHA1(str) $t('sys.pageDesigner.exp.inner.desc_02_1')\n` +
          `$t('sys.pageDesigner.exp.example'): SHA1('abc')\n` +
          `$t('sys.pageDesigner.exp.return') a9993e364706816aba3e25717850c26c9cd0d89d`,
        definition: 'declare function SHA1(str: string): string;',
      },
      {
        desc: `SHA256(str) $t('sys.pageDesigner.exp.inner.desc_02_1')\n`,
        definition: 'declare function SHA256(str: string): string;',
      },
      {
        desc:
          `SHA512(str) $t('sys.pageDesigner.exp.inner.desc_02_1')\n` +
          `$t('sys.pageDesigner.exp.example'): SHA512('abc')\n` +
          `$t('sys.pageDesigner.exp.return') ddaf35a193617abacc417349ae20...`,
        definition: 'declare function SHA512(str: string): string;',
      },
      {
        desc:
          `RANDOMSTR(number) $t('sys.pageDesigner.exp.inner.desc_03_1')\n` +
          `number:$t('sys.pageDesigner.exp.inner.desc_03_2')\n` +
          `$t('sys.pageDesigner.exp.example'): RandomStr(6)\n` +
          `$t('sys.pageDesigner.exp.return') o4EX1D`,
        definition: 'declare function RANDOMSTR(number: number): string;',
      },
      {
        desc:
          `NOW(format) $t('sys.pageDesigner.exp.inner.desc_04_1')\n` +
          `$t('sys.pageDesigner.exp.inner.desc_04_2')'yyyy-MM-dd','yyyy-MM-dd HH:mm:ss','HH:mm:ss'\n` +
          `$t('sys.pageDesigner.exp.example'): NOW('yyyy-MM-dd')\n` +
          `$t('sys.pageDesigner.exp.return') 1970-01-01`,
        definition: 'declare function NOW(format: string): string;',
      },
      {
        desc:
          'CONCAT(a,b....)\n' +
          `$t('sys.pageDesigner.exp.inner.desc_05_1')\n` +
          `$t('sys.pageDesigner.exp.inner.desc_05_2')\n` +
          `$t('sys.pageDesigner.exp.example'): CONCAT('a','b','c')\n` +
          `$t('sys.pageDesigner.exp.return') abc`,
        definition: 'declare function CONCAT(...args: string[]): string;',
      },
      {
        desc: `UNIX10()
$t('sys.pageDesigner.exp.inner.desc_06_1')
UNIX10()  $t('sys.pageDesigner.exp.return') 1677811200`,
        definition: 'declare function UNIX10(): number;',
      },
      {
        desc: `UNIX13()
$t('sys.pageDesigner.exp.inner.desc_07_1')
UNIX13()  $t('sys.pageDesigner.exp.return') 1677811200000`,
        definition: 'declare function UNIX13(): number;',
      },
    ],
  },
].map((group) => {
  group.children = group.children!.map((item) => {
    const id = item.definition.match(/(?<=declare function )([A-Z0-9]+)/g)![0];
    const args = (item.definition.match(/([a-z]:)+/g) || []).length;
    Object.assign(item, {
      id,
      name: id,
      idToChildren: false,
      _args_: args,
    });
    return item;
  });
  return group;
});

export const ipaasBackFunctionMap = functionGroup.reduce((map, g) => {
  g.children.forEach((item) => {
    map[item.id] = item;
  });
  return map;
}, {});

export const biBackFunctionGroup: IdentifierGroupInterface[] = [
  {
    id: 'COMMON',
    name: '常用',
    children: [
      {
        desc: '将多个字段合并成一个字符串\n' + "示例: CONCAT('a', '-', 'b') = 'a-b'\n",
        definition: 'declare function CONCAT( ...any: string[]): string;',
      },
      {
        desc:
          '返回日期的指定中加上指定的数字 后的日期\n' +
          "示例: DATEADD('2020-09-29', 100, day) = 2021-01-07\n",
        definition:
          'declare function DATEADD(data: string, interval: number, date_part: string): string;',
      },
      {
        desc:
          '返回 <date1> 与 <date2> 之差。以 <date_part> 的单位表示，只计算完整<date_part>\n' +
          "示例: DATEDIFF('2024-05-22', '2020-09-29', year) = 3\n",
        definition:
          'declare function DATEDIFF(date1: string, date2: string, date_part: string): number;',
      },
      {
        desc:
          '将日期进行格式化，并输出文本\n' +
          "示例: DATEFORMAT('2020-09-29', 'yyyyMMdd') = '20200929'\n",
        definition: 'declare function DATEFORMAT(date: any, format: string): string;',
      },
      {
        desc:
          '以<format>格式解析字符串<date_string>，并转化为日期类型。\n' +
          "示例: TODATE('2020-09-29', 'yyyy-MM-dd') = 2020-09-29\n",
        definition: 'declare function TODATE(date_string: string, format:string): any;',
      },
      {
        desc:
          'NULLIF函数接受两个参数，如果两个参数相等则返回NULL，否则返回第一个参数,可以用来避免分母为0的情况\n' +
          '示例: 如果field为0 则返回null,NULLIF(<field>,0) = null\n',
        definition: 'declare function NULLIF(arg1: any,arg2:any): any;',
      },
    ],
  },
  {
    id: 'NUMBER',
    name: '数值',
    children: [
      {
        desc: '返回多个参数中的最大值，至少输入2个参数\n' + '示例: GREATEST(10, 5, 7) = 10\n',
        definition: 'declare function GREATEST( ...any: number[]): number;',
      },
      {
        desc: '返回多个参数中的最小值，至少输入2个参数\n' + '示例: LEAST(10, 5, 7) = 5\n',
        definition: 'declare function LEAST( ...any: number[]): number;',
      },
      {
        desc:
          '将<number> 舍入为指定位数。 <decimals>指定输出结果的小数位数精度。如果省略decimals，则输出为整数\n' +
          '示例: ROUND(1/3, 2) = 0.33\n',
        definition: 'declare function ROUND(number: number, decimals?: number): number',
      },
    ],
  },
  {
    id: 'TEXT',
    name: '文本',
    children: [
      {
        desc: '将多个字段合并成一个字符串\n' + "示例: CONCAT('a', '-', 'b') = 'a-b'\n",
        definition: 'declare function CONCAT( ...any: string[]): string;',
      },
      {
        desc:
          '如果给定字符串包含指定子字符串，则返回 true\n' +
          "示例: CONTAINS('Hello World', ' ') = true\n",
        definition: 'declare function CONTAINS(string: string, substring: string): boolean;',
      },
      {
        desc:
          '返回子字符串在字符串中的索引位置，从指定的索引<start>开始查找（<start>可不填）。如果未找到子字符串，则返回 0。字符串中第一个字符的位置为 1\n' +
          "示例: FIND('World', 'Hello World') = 7\n" +
          "FIND('Computer', 'Hello World') = 0\n",
        definition:
          'declare function FIND(substring: string, string: string, start?: number): number;',
      },
      {
        desc: '返回字符串长度\n' + "示例: LEN('Hello World') = 11\n",
        definition: 'declare function LEN(string: string): number;',
      },
      {
        desc:
          '返回<string>从指定<start>位置处开始的字符串。字符串中第一个字符的位置为 1。 如果添加了可选数字参数<length>，则返回的字符串仅包含该数量的字符\n' +
          "示例: MID('Hello World', 2) = 'ello World'\n" +
          "MID('Hello World', 2, 4) ='ello'\n",
        definition: 'declare function MID(string: string, start: number, length?: number): string',
      },
      {
        desc:
          '在 <string> 中搜索 <substring> 并将其替换为 <replacement>。如果未找到 <substring>，则字符串保持不变。\n' +
          "示例: REPLACE('Hello World', ' ', '-') = 'Hello-World'\n",
        definition:
          'declare function REPLACE(string: string, substring: string, replacement: string): string',
      },
      {
        desc:
          '移除 <string> 的所有前置空格和尾随空格\n' +
          "示例: TRIM(' Hello World ') = 'Hello World'\n",
        definition: 'declare function TRIM(string: string): string',
      },
    ],
  },
  {
    id: 'DATE',
    name: '日期',
    children: [
      {
        desc:
          '返回日期的指定中加上指定的数字 后的日期\n' +
          "示例: DATEADD('2020-09-29', 100, day) = 2021-01-07\n",
        definition:
          'declare function DATEADD(data: string, interval: number, date_part: string): string;',
      },
      {
        desc: '以整数的形式返回给定 <date> 的天\n' + "示例: DAY('2020-09-29') = 29\n",
        definition: 'declare function DAY(date: string): number;',
      },
      {
        desc: '以整数形式返回给定 <date> 的月份\n' + "示例: MONTH('2020-09-29') = 9\n",
        definition: 'declare function MONTH(date: string): number;',
      },
      {
        desc:
          '返回一个依据指定 <year>、<month> 和 <day> 构造的日期值\n' +
          '示例: MAKEDATE(2020, 9, 29) = 2020-09-29\n',
        definition: 'declare function MAKEDATE(year: number, month: number, day: number): any;',
      },
      {
        desc: '返回当前时间\n' + '示例: NOW() = 2024-05-22 09:29:29\n',
        definition: 'declare function NOW(): any;',
      },
      {
        desc: '以整数形式返回给定 <date> 的季度\n' + "示例: QUARTER('2020-09-29') = 3\n",
        definition: 'declare function QUARTER(date: string): number;',
      },
      {
        desc: '返回当前日期\n' + '示例: TODAY() = 2024-05-22\n',
        definition: 'declare function TODAY(): any;',
      },
      {
        desc:
          '以整数形式返回给定 <date> 的周\n' +
          "示例: WEEK('2010-01-01') = 52\n" +
          "WEEK('2010-01-06') = 1\n",
        definition: 'declare function WEEK(date: string): number;',
      },
      {
        desc: '以整数形式返回给定 <date> 的年份\n' + "示例: YEAR('2020-09-29') = 2020\n",
        definition: 'declare function YEAR(date: string): number;',
      },
    ],
  },
  {
    id: 'PARSE',
    name: '转换',
    children: [
      {
        desc:
          '将日期进行格式化，并输出文本\n' +
          "示例: DATEFORMAT(2020-09-29, yyyyMMdd) = '20200929'\n",
        definition: 'declare function DATEFORMAT(date: any, format: string): string;',
      },
      {
        desc:
          '以<format>格式解析字符串<date_string>，并转化为日期类型。\n' +
          "示例: TODATE('2020-09-29', 'yyyy-MM-dd') = 2020-09-29\n",
        definition: 'declare function TODATE(date_string: string, format:string): any;',
      },
      {
        desc:
          '将文本或数值转为浮点数\n' +
          "示例: TODOUBLE('123.21') = 123.21\n" +
          'TODOUBLE(3) = 3.0\n',
        definition: 'declare function TODOUBLE(expression: string | number): number;',
      },
      {
        desc: '将文本或数值转为整数，若存在小数部分将舍弃\n' + "TOINT('123.9') = 123\n",
        definition: 'declare function TOINT(expression: string | number) : number;',
      },
      {
        desc: '将数值转为字符串\n' + "TOSTR(123) = '123'\n",
        definition: 'declare function TOSTR(expression: number) : string;',
      },
    ],
  },
  {
    id: 'AGG',
    name: '聚合',
    children: [
      {
        desc:
          '平均值\n' +
          '示例: AVG([订单金额])\n' +
          '根据图表中使用的维度进行聚合，求订单金额的平均值\n',
        definition: 'declare function AVG(number: number): number;',
      },
      {
        desc: '计数\n' + '示例: COUNT([订单ID])\n' + '根据图表中使用的维度进行聚合，求订单的数量\n',
        definition: 'declare function COUNT(expression: string | number): number;',
      },
      {
        desc:
          '去重计数\n' +
          '示例: COUNTD([订单ID])\n' +
          '根据图表中使用的维度进行聚合，求订单ID去重后的数量\n',
        definition: 'declare function COUNTD(expression: string | number): number;',
      },
      {
        desc:
          '最大值\n' +
          '示例: MAX([订单金额])\n' +
          '根据图表中使用的维度进行聚合，求订单金额的最大值\n',
        definition: 'declare function MAX(expression: number): number;',
      },
      {
        desc:
          '中位数\n' +
          '示例: MEDIAN([订单金额])\n' +
          '根据图表中使用的维度进行聚合，求订单金额的中位数\n',
        definition: 'declare function MEDIAN(number: number): number;',
      },
      {
        desc:
          '最小值\n' +
          '示例: MIN([订单金额])\n' +
          '根据图表中使用的维度进行聚合，求订单金额的最小值\n',
        definition: 'declare function MIN(expression: number): number;',
      },
      {
        desc:
          '求和\n' + '示例: SUM([订单金额])\n' + '根据图表中使用的维度进行聚合，求订单金额的总和\n',
        definition: 'declare function SUM(number: number): number;',
      },
    ],
  },
].map((group) => {
  group.children = group.children!.map((item) => {
    const id = item.definition.match(/(?<=declare function )([A-Z0-9_]+)/g)![0];
    const args = (item.definition.match(/([a-z]:)+/g) || []).length;
    Object.assign(item, {
      id,
      name: id,
      idToChildren: false,
      _args_: args,
    });
    return item;
  });
  return group;
});

export const biBackFunctionMap = biBackFunctionGroup.reduce((map, g) => {
  g.children.forEach((item) => {
    map[item.id] = item;
  });
  return map;
}, {});
