import WriteStart from '/@/projects/online-form/src/assets/write-start.svg';
import WriteBetween from '/@/projects/online-form/src/assets/write-between.svg';
import WriteEnd from '/@/projects/online-form/src/assets/write-end.svg';

import { InstanceStatusValues, InstanceStatusValue } from './status';

export const InstanceStatusIconMap: Partial<Record<InstanceStatusValue, string>> = {
  [InstanceStatusValues.UNFILLED]: WriteStart,
  [InstanceStatusValues.RUNNING]: WriteBetween,
  [InstanceStatusValues.COMPLETED]: WriteEnd,
};
