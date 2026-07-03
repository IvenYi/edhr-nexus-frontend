import { ref, computed } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import type { Ref } from 'vue';
import { InstanceStatusValues } from '../../../utils/instance-status/index';

type TimeUnit = 'DAY' | 'WEEK' | 'MONTH';

interface CreateConfig {
  createLimit?: boolean;
  timeUnit?: TimeUnit;
  times?: number;
}

interface CheckResult {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  periodStart: string;
  periodEnd: string;
}

interface PrepareResult {
  proceed: boolean;
  reason?: 'limit' | 'unSubmitted' | 'noConfig' | 'invalid';
  checkResult?: CheckResult;
  createConfig?: CreateConfig;
}

export function useCreateLimiter(options: {
  recordBookFillConfigRef: Ref<any>;
  docInstanceListRef: Ref<any[]>;
}) {
  const { recordBookFillConfigRef, docInstanceListRef } = options;

  const formatType = 'YYYY-MM-DD hh:mm:ss';

  /** 过滤掉作废的状态 */
  const instanceList = computed(() => {
    return docInstanceListRef.value.filter((item) => {
      return item.instanceStatus !== InstanceStatusValues.ABANDON;
    });
  });

  function safeParse(jsonLike: unknown) {
    if (!jsonLike || typeof jsonLike !== 'string') return {};
    try {
      return JSON.parse(jsonLike);
    } catch (e) {
      return {};
    }
  }

  function getPeriodRange(clickedAt: Dayjs = dayjs(), timeUnit: TimeUnit = 'DAY') {
    let start: Dayjs, end: Dayjs;
    if (timeUnit === 'DAY') {
      start = clickedAt.startOf('day');
      end = start.add(1, 'day').subtract(1, 'ms');
    } else if (timeUnit === 'MONTH') {
      start = clickedAt.startOf('month');
      end = start.add(1, 'month').subtract(1, 'ms');
    } else if (timeUnit === 'WEEK') {
      // 周一为起点
      const d = clickedAt.toDate();
      const day = d.getDay();
      const daysFromMonday = (day + 6) % 7;
      start = dayjs(new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysFromMonday)).startOf(
        'day',
      );
      end = start.add(7, 'day').subtract(1, 'ms');
    } else {
      throw new Error('Unsupported timeUnit');
    }
    return { start, end };
  }

  function checkCreateLimit(
    config: CreateConfig | null | undefined,
    items: any[] = [],
    clickedAt: Dayjs = dayjs(),
  ): CheckResult {
    if (!config || !config.createLimit) {
      return {
        allowed: true,
        count: 0,
        limit: Infinity,
        remaining: Infinity,
        periodStart: clickedAt.startOf('day').format(formatType),
        periodEnd: clickedAt.startOf('day').add(1, 'day').subtract(1, 'ms').format(formatType),
      };
    }
    const timeUnit = (config.timeUnit ?? 'DAY') as TimeUnit;
    const times = config.times ?? Infinity;
    const { start, end } = getPeriodRange(clickedAt, timeUnit);

    let count = 0;
    for (const it of items || []) {
      const t = dayjs(it.createTime);
      if (!t.isValid()) continue;
      if ((t.isAfter(start) || t.isSame(start)) && (t.isBefore(end) || t.isSame(end))) count++;
    }

    const allowed = count < times;
    return {
      allowed,
      count,
      limit: times,
      remaining: Math.max(0, times - count),
      periodStart: start.format(formatType),
      periodEnd: end.format(formatType),
    };
  }

  function hasUnSubmitted(items: any[] = []) {
    return items.some((item) =>
      [InstanceStatusValues.STASH, InstanceStatusValues.UNFILLED].includes(item.instanceStatus),
    );
  }

  /**
   * prepareCreate:
   * - 读取 create_config_（通过 safeParse）
   * - 执行次数校验 + 未提交检查
   * - 返回 PrepareResult（不做 message / modal / api）
   */
  async function prepareCreate(clickedAt: Dayjs = dayjs()): Promise<PrepareResult> {
    try {
      const createConfig = safeParse(recordBookFillConfigRef.value?.create_config_);
      if (!createConfig) {
        return { proceed: true, reason: 'noConfig' }; // 没有配置，默认允许
      }
      const res = checkCreateLimit(createConfig, instanceList.value ?? [], clickedAt);
      if (!res.allowed) {
        return { proceed: false, reason: 'limit', checkResult: res, createConfig };
      }
      if (hasUnSubmitted(docInstanceListRef.value ?? [])) {
        return { proceed: false, reason: 'unSubmitted', createConfig };
      }
      return { proceed: true, createConfig, checkResult: res };
    } catch (err) {
      return { proceed: false, reason: 'invalid' };
    }
  }

  const limitLabelMap = {
    DAY: $t('sys.onlineForm.oneDay'),
    WEEK: $t('sys.onlineForm.oneWeek'),
    MONTH: $t('sys.onlineForm.oneMonth'),
  };

  return {
    getPeriodRange,
    checkCreateLimit,
    prepareCreate,
    limitLabelMap,
  };
}
