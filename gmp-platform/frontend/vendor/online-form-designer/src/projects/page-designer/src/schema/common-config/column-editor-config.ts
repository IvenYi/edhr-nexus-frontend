import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { Platform, PropGroup, fixedAlignENUM } from '/@page-designer/enum';

/** 列固定config */
const fixedAlignEditor: LowCodeWidget.PropEditor[] = [
  {
    component: 'radio-icon-editor',
    name: 'fixedAlign',
    label: 'sys.pageDesigner.columnFixed',
    group: PropGroup.SHOW,
    _config: {
      options: [
        {
          label: 'sys.pageDesigner.left',
          value: fixedAlignENUM.LEFT,
        },
        {
          label: 'sys.pageDesigner.none',
          value: fixedAlignENUM.NONE,
        },
        {
          label: 'sys.pageDesigner.right',
          value: fixedAlignENUM.RIGHT,
        },
      ],
    },
    hidden(widget) {
      return widget.platform === Platform.PAD;
    },
  },
];

export default {
  /** 列固定config */
  fixedAlignEditor,
};
