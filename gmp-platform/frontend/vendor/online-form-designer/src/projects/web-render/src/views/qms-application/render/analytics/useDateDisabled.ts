import dayjs from "dayjs";
export function useDateDisabled(rangeDateData) {
  const disableStartDate = (current) => {
    if (rangeDateData.end_time_) {
      return current && current >= dayjs(rangeDateData.end_time_).endOf('day');
    }
    return false;
  };
  // 禁用开始时间的逻辑
  const disableStartTime = (current) => {
    const currentDate = dayjs(current);
    const startDateTime = dayjs(rangeDateData.start_time_);
    const endDateTime = dayjs(rangeDateData.end_time_);
    if (!startDateTime || !endDateTime) {
      return {};
    }
    // 如果选择的是同一天，则需要限制时间
    if (currentDate.isSame(endDateTime, 'day')) {
      return {
        disabledHours: () => range(0, 24).filter((h) => h > endDateTime.hour()),
        disabledMinutes: (selectedHour) => {
          if (selectedHour === endDateTime.hour()) {
            return range(0, 60).filter((m) => m > endDateTime.minute());
          }
          return [];
        },
        disabledSeconds: (selectedHour, selectedMinute) => {
          if (selectedHour === endDateTime.hour() && selectedMinute === endDateTime.minute()) {
            return range(0, 60).filter((s) => s > endDateTime.second());
          }
          return [];
        },
      };
    }
    return {};
  };
  // 禁用结束日期的逻辑
  const disableEndDate = (current) => {
    if (rangeDateData.start_time_) {
      return current && current <= dayjs(rangeDateData.start_time_).startOf('day');
    }
    return false;
  };

  // 禁用结束时间的逻辑
  const disableEndTime = (current) => {
    const currentDate = dayjs(current);
    const startDateTime = dayjs(rangeDateData.start_time_);
    const endDateTime = dayjs(rangeDateData.end_time_);
    if (!startDateTime || !endDateTime) {
      return {};
    }
    if (currentDate.isSame(startDateTime, 'day')) {
      return {
        disabledHours: () => range(0, 24).filter((h) => h < startDateTime.hour()),
        disabledMinutes: (selectedHour) => {
          if (selectedHour === startDateTime.hour()) {
            return range(0, 60).filter((m) => m < startDateTime.minute());
          }
          return [];
        },
        disabledSeconds: (selectedHour, selectedMinute) => {
          if (selectedHour === startDateTime.hour() && selectedMinute === startDateTime.minute()) {
            return range(0, 60).filter((s) => s < startDateTime.second());
          }
          return [];
        },
      };
    }
    return {};
  };
  // 辅助函数：生成数字范围
  const range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  return {
    disableStartDate,
    disableStartTime,
    disableEndDate,
    disableEndTime,
  };
};