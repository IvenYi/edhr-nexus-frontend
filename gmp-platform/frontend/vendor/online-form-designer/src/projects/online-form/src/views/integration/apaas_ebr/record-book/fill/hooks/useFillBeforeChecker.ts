import dayjs from 'dayjs';

type ClickCheckResult = { allowed: true } | { allowed: false; reason: 'not-yet'; message: string };

type EnterPageCheckResult =
  | { limited: false; message: string }
  | { limited: true; message: string };

export function useFillBeforeChecker(options?: { displayFormat?: string }) {
  const displayFormat = options?.displayFormat ?? 'YYYY-MM-DD HH:mm';

  const parse = (v?: string | null) => {
    if (!v) return null;
    const d = dayjs(v);
    return d.isValid() ? d : null;
  };

  /**
   * 点击“填报”按钮时使用：
   * - createTime: 填报开始时间（可能为空或不合法字符串）
   * - now: 点击填报按钮的时间
   */
  function checkClickFill(createTime?: string | null, now = dayjs()): ClickCheckResult {
    const start = parse(createTime);

    if (start) {
      if (now.isBefore(start)) {
        return {
          allowed: false,
          reason: 'not-yet',
          message: $t('sys.onlineForm.recordBookNotInFillTime', {
            time: start.format(displayFormat),
          }),
        };
      }
      return { allowed: true };
    }

    return { allowed: true };
  }

  /**
   * 进入填报页面时使用：
   * - endTime: 填报截止时间（可能为空或不合法字符串）
   * - now: 点击填报按钮的时间
   *
   * 若超过截止时间，返回 limited:true 和提示信息，页面收到后应：
   * - 弹出提示 "该记录本已过最晚可填报时间，不能再进行填报"
   * - 仅允许“表单提交”和“记录本封存”这类受限操作（由页面实现）
   */
  function checkEnterFillPage(endTime?: string | null, now = dayjs()): EnterPageCheckResult {
    const end = parse(endTime);

    if (end && now.isAfter(end)) {
      return { limited: true, message: $t('sys.onlineForm.recordBookOverdue') };
    }
    return { limited: false, message: '' };
  }

  function formatTime(v?: string | null) {
    const d = parse(v);
    return d ? d.format(displayFormat) : '';
  }

  return {
    checkClickFill,
    checkEnterFillPage,
    formatTime,
  };
}
