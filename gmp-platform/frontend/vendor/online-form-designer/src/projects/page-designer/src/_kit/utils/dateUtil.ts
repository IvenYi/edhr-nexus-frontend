import dayjs from "dayjs";
export function getDateRanges(valueFormat = 'YYYY-MM-DD HH:mm:ss') {
  // 当天
  const DAY_NOW = {
    startDate: dayjs().startOf('day').format(valueFormat),
    endDate: dayjs().endOf('day').format(valueFormat),
  };
  // 本周（周一到周日）
  const WEEK_NOW = {
    startDate: dayjs().startOf('week').add(1, 'day').format(valueFormat),
    endDate: dayjs().endOf('week').add(1, 'day').format(valueFormat),
  };
  // 本月
  const MONTH_NOW = {
    startDate: dayjs().startOf('month').format(valueFormat),
    endDate: dayjs().endOf('month').format(valueFormat),
  };

  return {
    DAY_NOW,
    WEEK_NOW,
    MONTH_NOW,
  }
}
