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
        unit: $t('sys.year'),
      },
      {
        value: months,
        unit: $t('sys.month'),
      },
      {
        value: days,
        unit: $t('sys.day'),
      },
      {
        value: hours,
        unit: $t('sys.hour'),
      },
      {
        value: minutes,
        unit: $t('sys.appDesigner.timedTask.editor.minute'),
      },
      {
        value: Math.floor(seconds),
        unit: $t('sys.timeSecond'),
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
        unit: $t('sys.day'),
      },
      {
        value: hours,
        unit: $t('sys.hour'),
      },
      {
        value: minutes,
        unit: $t('sys.appDesigner.timedTask.editor.minute'),
      },
      {
        value: Math.floor(seconds),
        unit: $t('sys.timeSecond'),
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
        unit: $t('sys.hour'),
      },
      {
        value: minutes,
        unit: $t('sys.appDesigner.timedTask.editor.minute'),
      },
      {
        value: Math.floor(seconds),
        unit: $t('sys.timeSecond'),
      },
    ]);
  },
  [TimeDiffFormat.Y]: function (seconds: number): string {
    return (seconds / SECONDS_IN_YEAR).toFixed(3) + $t('sys.year');
  },
  [TimeDiffFormat.M]: function (seconds: number): string {
    return (seconds / SECONDS_IN_MONTH).toFixed(3) + $t('sys.month');
  },
  [TimeDiffFormat.D]: function (seconds: number): string {
    return (seconds / SECONDS_IN_DAY).toFixed(3) + $t('sys.component.time.days');
  },
  [TimeDiffFormat.H]: function (seconds: number): string {
    return (seconds / SECONDS_IN_HOUR).toFixed(3) + $t('sys.hour');
  },
  [TimeDiffFormat.MIN]: function (seconds: number): string {
    return (seconds / SECONDS_IN_MINUTE).toFixed(3) + $t('sys.appDesigner.timedTask.editor.minute');
  },
  [TimeDiffFormat.S]: function (seconds: number): string {
    return seconds + $t('sys.timeSecond');
  },
};

export default TimeDiffFormatter;
