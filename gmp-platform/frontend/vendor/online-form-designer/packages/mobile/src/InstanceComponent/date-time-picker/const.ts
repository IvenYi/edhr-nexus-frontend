export const DateFormat = {
  YYYY: {
    valueFormat: 'YYYY-01-01',
    columnsType: ['year'],
    component: 'datePicker',
  },
  'YYYY-MM': {
    valueFormat: 'YYYY-MM-01',
    columnsType: ['year', 'month'],
    component: 'datePicker',
  },
  'YYYY-MM-DD': {
    valueFormat: 'YYYY-MM-DD',
    columnsType: ['year', 'month', 'day'],
    component: 'datePicker',
  },
  'YYYY-MM-DD HH': {
    valueFormat: 'YYYY-MM-DD HH:00:00',
    columnsType: ['hour'],
    component: 'dateTimePicker',
  },
  'YYYY-MM-DD HH:mm': {
    valueFormat: 'YYYY-MM-DD HH:mm:00',
    columnsType: ['hour', 'minute'],
    component: 'dateTimePicker',
  },
  'YYYY-MM-DD HH:mm:ss': {
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    columnsType: ['hour', 'minute', 'second'],
    component: 'dateTimePicker',
  },
  'HH:mm:ss': {
    valueFormat: 'HH:mm:ss',
    columnsType: ['hour', 'minute', 'second'],
    component: 'timePicker',
  },
  'HH:mm': {
    valueFormat: 'HH:mm:00',
    columnsType: ['hour', 'minute'],
    component: 'timePicker',
  },
  HH: {
    valueFormat: 'HH:00:00',
    columnsType: ['hour'],
    component: 'timePicker',
  },
};
