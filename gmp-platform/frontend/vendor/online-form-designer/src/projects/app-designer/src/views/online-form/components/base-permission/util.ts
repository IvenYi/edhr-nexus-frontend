import dayjs from 'dayjs';

/**
 * 获取现在的时间字符串
 * @export
 * @return {*}
 */
export function now(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}
