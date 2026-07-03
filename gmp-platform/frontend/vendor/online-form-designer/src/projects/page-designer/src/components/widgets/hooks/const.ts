import { DateRangeEnums } from '/@page-designer/enum';

export const DateFormat = {
  YYYY: {
    valueFormat: 'YYYY-01-01',
    picker: 'year',
    columnsType: ['year'],
  },
  'YYYY-MM': {
    valueFormat: 'YYYY-MM-01',
    picker: 'month',
    columnsType: ['year', 'month'],
  },
  'YYYY-MM-DD': {
    valueFormat: 'YYYY-MM-DD',
    picker: 'date',
    columnsType: ['year', 'month', 'day'],
  },
  'YYYY-MM-DD HH': {
    valueFormat: 'YYYY-MM-DD HH:00:00',
    columnsType: ['hour'],
  },
  'YYYY-MM-DD HH:mm': {
    valueFormat: 'YYYY-MM-DD HH:mm:00',
    columnsType: ['hour', 'minute'],
  },
  'YYYY-MM-DD HH:mm:ss': {
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    columnsType: ['hour', 'minute', 'second'],
  },
  'HH:mm:ss': {
    valueFormat: 'HH:mm:ss',
    columnsType: ['hour', 'minute', 'second'],
  },
  'HH:mm': {
    valueFormat: 'HH:mm:00',
    columnsType: ['hour', 'minute'],
  },
  HH: {
    valueFormat: 'HH:00:00',
    columnsType: ['hour'],
  },
};

export const DatepickerRanges = {
  [DateRangeEnums.WEEK_NOW]: '',
};
