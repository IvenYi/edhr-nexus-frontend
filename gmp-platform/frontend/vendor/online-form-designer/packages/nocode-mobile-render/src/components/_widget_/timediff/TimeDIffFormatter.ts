import { TimeDiffFormat } from '@gct/nocode-base';

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_DAY = 24 * 60 * 60;
const SECONDS_IN_MONTH = 30 * SECONDS_IN_DAY;
const SECONDS_IN_YEAR = 12 * SECONDS_IN_MONTH;

const concatString = (data) => {
  return data.reduce((result, item) => {
    result += item.value + item.unit;
    return result;
  }, '');
};

const TimeDiffFormatter: Record<TimeDiffFormat, (seconds: number) => string> = {
  [TimeDiffFormat.Y_M_D_H_MIN_S]: function (seconds: number) {
    const years = Math.floor(seconds / SECONDS_IN_YEAR);
    seconds %= SECONDS_IN_YEAR;
    const months = Math.floor(seconds / SECONDS_IN_MONTH);
    seconds %= SECONDS_IN_MONTH;
    const days = Math.floor(seconds / SECONDS_IN_DAY);
    seconds %= SECONDS_IN_DAY;
    const hours = Math.floor(seconds / SECONDS_IN_HOUR);
    seconds %= SECONDS_IN_HOUR;
    const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
    seconds %= SECONDS_IN_MINUTE;
    return concatString([
      {
        value: years,
        unit: '年',
      },
      {
        value: months,
        unit: '月',
      },
      {
        value: days,
        unit: '日',
      },
      {
        value: hours,
        unit: '时',
      },
      {
        value: minutes,
        unit: '分',
      },
      {
        value: Math.floor(seconds),
        unit: '秒',
      },
    ]);
  },
  [TimeDiffFormat.D_H_MIN_S]: function (seconds: number): string {
    const days = Math.floor(seconds / SECONDS_IN_DAY);
    seconds %= SECONDS_IN_DAY;
    const hours = Math.floor(seconds / SECONDS_IN_HOUR);
    seconds %= SECONDS_IN_HOUR;
    const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
    seconds %= SECONDS_IN_MINUTE;
    return concatString([
      {
        value: days,
        unit: '日',
      },
      {
        value: hours,
        unit: '时',
      },
      {
        value: minutes,
        unit: '分',
      },
      {
        value: Math.floor(seconds),
        unit: '秒',
      },
    ]);
  },
  [TimeDiffFormat.H_MIN_S]: function (seconds: number): string {
    const hours = Math.floor(seconds / SECONDS_IN_HOUR);
    seconds %= SECONDS_IN_HOUR;
    const minutes = Math.floor(seconds / SECONDS_IN_MINUTE);
    seconds %= SECONDS_IN_MINUTE;
    return concatString([
      {
        value: hours,
        unit: '时',
      },
      {
        value: minutes,
        unit: '分',
      },
      {
        value: Math.floor(seconds),
        unit: '秒',
      },
    ]);
  },
  [TimeDiffFormat.Y]: function (seconds: number): string {
    return (seconds / SECONDS_IN_YEAR).toFixed(3) + '年';
  },
  [TimeDiffFormat.M]: function (seconds: number): string {
    return (seconds / SECONDS_IN_MONTH).toFixed(3) + '月';
  },
  [TimeDiffFormat.D]: function (seconds: number): string {
    return (seconds / SECONDS_IN_DAY).toFixed(3) + '天';
  },
  [TimeDiffFormat.H]: function (seconds: number): string {
    return (seconds / SECONDS_IN_HOUR).toFixed(3) + '时';
  },
  [TimeDiffFormat.MIN]: function (seconds: number): string {
    return (seconds / SECONDS_IN_MINUTE).toFixed(3) + '分';
  },
  [TimeDiffFormat.S]: function (seconds: number): string {
    return seconds + '秒';
  },
};

export default TimeDiffFormatter;
