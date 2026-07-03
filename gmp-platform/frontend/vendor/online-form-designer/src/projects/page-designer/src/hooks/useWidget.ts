import { computed } from 'vue';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { useSelectedWidget } from './useSelectedWidget';
import { FormComponents, Platform } from '/@page-designer/enum';
import { has } from 'lodash-es';
import { mobileWidgetDesignerConfig, webWidgetDesignerConfig, padWidgetDesignerConfig } from '/@page-designer/schema/index';

/**不需要遮罩 */
export const NotMask: string[] = [
  FormComponents.Search,
  FormComponents.DataTable,
  FormComponents.DataVTable,
  FormComponents.SubDataTable,
  FormComponents.Form,
  FormComponents.FormProcess,
  FormComponents.RdoForm,
  FormComponents.MedProRdoForm,
  FormComponents.LayoutContainer,
  FormComponents.Grid,
  FormComponents.GridCol,
  FormComponents.LeftRightColumns,
  FormComponents.ButtonContainer,
  FormComponents.SubTable,
  FormComponents.Tabs,
  FormComponents.TabPane,
  FormComponents.TableSelect,
  FormComponents.Collapse,
  FormComponents.CardList,
  FormComponents.TreeTable,
  FormComponents.RefDataTable,
  FormComponents.DynamicTable,
  FormComponents.Text,
  FormComponents.UploadFile,
  FormComponents.Descriptions,
  FormComponents.BottomButtonContainer,
  FormComponents.ButtonProcessContainer,
  FormComponents.ApprovalHistory,
];

interface Props {
  /**组件 */
  widget?: LowCodeWidget.BasicSchema;
  /**父组件 */
  parentWidget?: LowCodeWidget.BasicSchema;
  /**父组件List */
  parentList?: Array<LowCodeWidget.BasicSchema>;
  /**在父组件列表的下标 */
  indexOfParentList?: number;
}
export function useWidget(props: Props) {
  const { selectedWidget } = useSelectedWidget();
  const widget = props.widget!;
  /**组件是否被选中 */
  const isWidgetSelected = computed(() => {
    if (selectedWidget.value.id === widget.id) {
      if (!has(selectedWidget.value, 'materialType') || !has(widget, 'materialType')) {
        return true;
      } else {
        return selectedWidget.value.materialType === widget.materialType;
      }
    }
    return false;
  });
  /**初始化label */
  const label = computed(() => {
    return widget.props.label;
  });
  const value = computed(() => {
    return '';
  });
  const widgetdesigner =
    widget.platform === Platform.MOBILE
      ? mobileWidgetDesignerConfig
      : widget.platform === Platform.PAD
        ? padWidgetDesignerConfig
        : webWidgetDesignerConfig;
  const hideMaskValue = computed(() => {
    if (typeof widgetdesigner[widget.type]?.hideMask === 'function') {
      return widgetdesigner[widget.type].hideMask(widget);
    }
    return widgetdesigner[widget.type]?.hideMask;
  });
  const hideMask = computed(() => {
    return NotMask.indexOf(widget.type) === -1 && !hideMaskValue.value;
  });

  const showMask = computed(() => {
    return NotMask.indexOf(widget.type) === -1 && !hideMaskValue.value;
  });

  return { isWidgetSelected, value, label, hideMask, showMask };
}

/**widget-wrapper通用的props */
export const widgetWrapperProps = {
  /**组件 */
  widget: {
    type: Object as PropType<LowCodeWidget.BasicSchema>,
  },
  /**父组件 */
  parentWidget: {
    type: Object as PropType<LowCodeWidget.BasicSchema> | undefined,
  },
  /**父组件List */
  parentList: {
    type: Array<LowCodeWidget.BasicSchema>,
  },
  /**在父组件列表的下标 */
  indexOfParentList: {
    type: Number,
  },
  /** 是否隐藏操作按钮 */
  hideAction: {
    type: Boolean,
  },
  /** 显示哪些操作按钮 */
  actionTypes: {
    type: Array<String>,
  },
  action: {
    // 返回 true 中断自身操作
    type: Object as PropType<(id: string) => boolean>,
  },
  /** 是否为新版设计器 */
  isNewDesigner: {
    type: Boolean,
  },
  deleteCallback: { type: Function },
  /**是否开启悬浮虚线 */
  showHoverLine: {
    type: Boolean,
    default: false,
  },
};

export const widgetProps = {
  /**组件 */
  widget: {
    type: Object as PropType<LowCodeWidget.BasicSchema>,
    require: true,
    default: () => {},
  },
  rowReadonly: Boolean,
  formData: {
    type: Object,
  },
  isNewDesigner: Boolean,
};
