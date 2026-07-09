import WriteStart from '/@online-form/assets/write-start.svg';
import WriteBetween from '/@online-form/assets/write-between.svg';
import WriteEnd from '/@online-form/assets/write-end.svg';
import { InstanceStatusValues, InstanceStatusValue } from './status';

export const InstanceStatusIconMap: Partial<Record<InstanceStatusValue, string>> = {
  [InstanceStatusValues.UNFILLED]: WriteStart,
  [InstanceStatusValues.RUNNING]: WriteBetween,
  [InstanceStatusValues.COMPLETED]: WriteEnd,
};
