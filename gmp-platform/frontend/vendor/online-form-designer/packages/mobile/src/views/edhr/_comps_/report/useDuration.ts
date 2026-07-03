import DateTimePopup from '../date-time/date-time-popup.vue';
import { GctPopup } from '@mobile/utils/popup';
import dayjs from 'dayjs';

const isBlank = (value) => {
  return (
    [null, undefined, ''].includes(value) || (typeof value === 'string' && value.trim() === '')
  );
};

export function useDuration(reportFormData) {
  const handleDurationChange = (value: number) => {
    if (isBlank(value)) return;
    const { start_time_, end_time_, duration_: tmp } = reportFormData.value;
    const duration_ = Number(tmp.toFixed(1));
    reportFormData.value.duration_ = duration_;
    if (start_time_ && end_time_) {
      reportFormData.value.start_time_ = undefined;
      reportFormData.value.end_time_ = undefined;
    } else if (start_time_ && !end_time_) {
      const result = dayjs(start_time_).add(duration_, 'hour').format('YYYY-MM-DD HH:mm');
      reportFormData.value.end_time_ = result;
    } else if (!start_time_ && end_time_) {
      const result = dayjs(end_time_).subtract(duration_, 'hour').format('YYYY-MM-DD HH:mm');
      reportFormData.value.start_time_ = result;
    }
  };

  const handleEditStartTime = () => {
    GctPopup.open(DateTimePopup, {
      popupProps: {
        position: 'bottom',
      },
      context: {
        max: reportFormData.value.end_time_,
      },
      onOk: (value: string) => {
        reportFormData.value.start_time_ = value;
        const { start_time_, end_time_, duration_ } = reportFormData.value;
        if (end_time_) {
          const diff = dayjs(end_time_).diff(dayjs(start_time_), 'hour', true);
          reportFormData.value.duration_ = Number(diff.toFixed(1));
        } else if (!end_time_ && !isBlank(duration_)) {
          const result = dayjs(start_time_).add(duration_, 'hour').format('YYYY-MM-DD HH:mm');
          reportFormData.value.end_time_ = result;
        }
      },
    });
  };

  const handleEditEndTime = () => {
    GctPopup.open(DateTimePopup, {
      popupProps: {
        position: 'bottom',
      },
      context: {
        min: reportFormData.value.start_time_,
      },
      onOk: (value: string) => {
        reportFormData.value.end_time_ = value;
        const { start_time_, end_time_, duration_ } = reportFormData.value;
        if (start_time_) {
          const diff = dayjs(end_time_).diff(dayjs(start_time_), 'hour', true);
          reportFormData.value.duration_ = Number(diff.toFixed(1));
        } else if (!start_time_ && !isBlank(duration_)) {
          const result = dayjs(end_time_).subtract(duration_, 'hour').format('YYYY-MM-DD HH:mm');
          reportFormData.value.start_time_ = result;
        }
      },
    });
  };

  return {
    handleDurationChange,
    handleEditStartTime,
    handleEditEndTime,
  };
}
