import dayjs, { Dayjs } from 'dayjs';
import type { Ref } from 'vue';

interface FillTime {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  key?: string; // 可选唯一标识
}

interface FillTimeCheckResult {
  allowed: boolean;
  ranges: string[];
  message?: string;
}

export function useFillTimeChecker(options: { recordBookFillConfigRef: Ref<any> }) {
  const { recordBookFillConfigRef } = options;

  const timeToMinutes = (str: string): number | null => {
    const d = dayjs(str, 'HH:mm', true);
    if (!d.isValid()) return null;
    return d.hour() * 60 + d.minute();
  };

  const minutesToHHmm = (min: number): string => {
    // 格式化分钟（基于一天起点）
    return dayjs().startOf('day').add(min, 'minute').format('HH:mm');
  };

  function safeParse(jsonLike: unknown) {
    if (!jsonLike || typeof jsonLike !== 'string') return {};
    try {
      return JSON.parse(jsonLike);
    } catch (e) {
      return {};
    }
  }

  /**
   * 检查是否允许填报
   * @param config 配置
   * @param now 当前时间（默认 dayjs()）
   */
  const check = (now: Dayjs = dayjs()): FillTimeCheckResult => {
    try {
      const fillTimeConfig = safeParse(recordBookFillConfigRef.value?.fill_time_config_);
      if (!fillTimeConfig?.activateFillTime) {
        return { allowed: true, ranges: [] }; // 没有配置，默认允许
      }
      // 收集拆分后的区间（以分钟为单位，闭区间 [s, e]）
      const parts: [number, number][] = [];
      (fillTimeConfig.times || []).forEach((t) => {
        const s = timeToMinutes(t.startTime);
        const e = timeToMinutes(t.endTime);
        if (s === null || e === null) return; // 无效输入跳过
        if (e >= s) {
          parts.push([s, e]);
        } else {
          // 跨午夜，拆成两段：[s, 1439] 和 [0, e]
          parts.push([s, 1439]);
          parts.push([0, e]);
        }
      });

      if (parts.length === 0) {
        return { allowed: true, ranges: [] };
      }

      // 合并重叠或相邻区间
      parts.sort((a, b) => a[0] - b[0]);
      const merged: [number, number][] = [];
      let [curS, curE] = parts[0];
      for (let i = 1; i < parts.length; i++) {
        const [s, e] = parts[i];
        if (s <= curE + 1) {
          // 重叠或相邻（例如 12:00-13:00 与 13:01-14:00 不合并，13:00-13:00 则合并）
          curE = Math.max(curE, e);
        } else {
          merged.push([curS, curE]);
          [curS, curE] = [s, e];
        }
      }
      merged.push([curS, curE]);

      // 格式化区间
      const rangeList = merged.map(([s, e]) => `${minutesToHHmm(s)}-${minutesToHHmm(e)}`);

      // 检查当前时间是否在区间内
      const nowMin = now.hour() * 60 + now.minute();
      const isAllowed = merged.some(([s, e]) => nowMin >= s && nowMin <= e);

      if (!isAllowed) {
        const rangeStr = rangeList.join(' 或 ');

        return {
          allowed: false,
          ranges: rangeList,
          message: $t('sys.onlineForm.fillingTimeTip'),
        };
      }

      return { allowed: true, ranges: rangeList };
    } catch (err) {
      return { allowed: true, ranges: [] };
    }
  };

  return {
    check,
  };
}
