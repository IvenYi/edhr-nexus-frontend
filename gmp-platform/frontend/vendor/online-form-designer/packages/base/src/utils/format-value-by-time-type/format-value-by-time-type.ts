/**
 * 根据时间类型格式化数值，d:h:m:s 等格式类型
 *
 * @author chitanda
 * @date 2025-06-25 17:06:45
 * @export
 * @param {number} value
 * @param {string} timeType
 * @returns {*}  {string}
 */
export function formatValueByTimeType(value: number, timeType: string): string {
  const days = Math.floor(value / 86400);
  const hours = Math.floor((value % 86400) / 3600) || '00';
  const minutes = Math.floor((value % 3600) / 60) || '00';
  const seconds = value % 60 || '00';

  switch (timeType) {
    case 'd':
      return `${days}天`;
    case 'd:h':
      return `${days}天${hours}时`;
    case 'd:h:m':
      return `${days}天${hours}时${minutes}分`;
    case 'd:h:m:s':
      return `${days}天${hours}时${minutes}分${seconds}秒`;
    case 'h':
      const totalHours = Math.floor(value / 3600);
      return `${totalHours}时`;
    case 'h:m':
      const totalHoursHM = Math.floor(value / 3600);
      const remainingMinutes = Math.floor((value % 3600) / 60);
      return `${totalHoursHM}时${remainingMinutes}分`;
    case 'h:m:s':
      const totalHoursHMS = Math.floor(value / 3600);
      const remainingMinutesHMS = Math.floor((value % 3600) / 60);
      const remainingSecondsHMS = value % 60;
      return `${totalHoursHMS}时${remainingMinutesHMS}分${remainingSecondsHMS}秒`;
    case 'm':
      const totalMinutes = Math.floor(value / 60);
      return `${totalMinutes}分`;
    case 'm:s':
      const totalMinutesMS = Math.floor(value / 60);
      const remainingSecondsMS = value % 60;
      return `${totalMinutesMS}分${remainingSecondsMS}秒`;
    case 's':
      return `${value}秒`;
    default:
      return `${days}天${hours}时${minutes}分${seconds}秒`;
  }
}
