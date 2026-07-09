import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { PropGroup } from '/@page-designer/enum';
// import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { hiddenButtonProps } from './button-props-func';

export const permissionEditor: LowCodeWidget.PropEditor[] = [
  // {
  //   component: 'permission-switch-editor',
  //   label: 'sys.permission',
  //   group: PropGroup.PERMISSION,
  //   hidden: (widget) => {
  //     return hiddenButtonProps(widget);
  //   },
  // },
  {
    component: 'permission-editor',
    label: '',
    group: PropGroup.PERMISSION,
    hidden: (widget) => {
      return hiddenButtonProps(widget);
    },
  },
];
