import { ref, computed, Ref } from 'vue';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import allWidgetInfo from '/@page-designer/schema/index';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { usePage, platform } from '/@page-designer/hooks/usePage';
import { getCompPos } from '/@page-designer/schema/utils';
import { PanelEnum, Platform, SCOPE, FormComponents, BuiltinType } from '../enum';
import { useScope } from './useScope';
import { get, has, isArray, isEmpty } from 'lodash-es';
import { LowCodeModal } from '/@page-designer/types/modal-types';
import commonStyle from '../schema/common-config/common-style';
import {
  fieldFormEvents,
  fieldFormEditors,
  fieldFormStyles,
} from '/@page-designer/schema/field/form/index';
import { findNode } from '/@/utils/helper/treeHelper';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { IVue3DndItemOptions } from '../designer/interface';

const { togglePanel } = usePage();

const selectedConfig: Ref<IVue3DndItemOptions> = ref({ mode: 'move' });
// 选中部件的所有同级数据
const selectedParentChildren: Ref<Array<LowCodeWidget.BasicSchema>> = ref([]);
const selectedParentWidgets: Ref<Array<LowCodeWidget.BasicSchema>> = ref([]);
const selectedWidget: Ref<Partial<LowCodeWidget.BasicSchema>> = ref({});
const selectedModal: Ref<Partial<LowCodeModal.Modal>> = ref({});
const focusFormWidget: Ref<Partial<LowCodeWidget.BasicSchema>> = ref({});
// 拖拽时的悬浮对象
const hoverWidget: Ref<Partial<LowCodeWidget.BasicSchema>> = ref({});

export function useSelectedWidget() {
  const { setScope, getScope, scopeData } = useScope();
  const { subTableModalState, subTableModalId, allWidget } = useDesigner();
  /**被选中的对象 Widget或者Modal */
  const selectedRef = computed(() => {
    if (!isEmpty(selectedModal.value) && isEmpty(selectedWidget.value)) {
      return selectedModal.value;
    } else {
      return selectedWidget.value;
    }
  });

  const selectedParentRef = computed(() => {
    if (!selectedRef.value.id) {
      return undefined;
    }
    return selectedParentWidgets.value[selectedParentWidgets.value.length - 1];
  });

  const selectedParentsRef = computed(() => {
    if (!selectedRef.value.id) {
      return [];
    }
    return selectedParentWidgets.value;
  });

  const selectedParentChildrenRef = computed(() => {
    if (!selectedRef.value.id) {
      return [];
    }
    return selectedParentChildren.value;
  });

  const selectedConfigRef = computed(() => {
    return selectedConfig.value;
  });

  function setSelectedConfig(config: IVue3DndItemOptions) {
    selectedConfig.value = config;
  }

  const setSelectedParentChildrenRef = (widgets: Array<LowCodeWidget.BasicSchema>) => {
    selectedParentChildren.value = widgets;
  };

  const selectModalRef = computed(() => {
    if (subTableModalState.value) {
      const modalInfo = findNode(scopeData.value, (node) => {
        return (
          getCompPos(node, FIELD_TYPE.MASTERSLAVE, FormComponents.Form) &&
          node.preLocation === subTableModalId.value
        );
      });
      // 兼容老数据
      if (!modalInfo) {
        return selectedRef.value;
      }

      return modalInfo;
    }
    return selectedRef.value;
  });

  const focusFormRef = computed(() => {
    if (
      [
        FormComponents.Form,
        FormComponents.RdoForm,
        FormComponents.MedProRdoForm,
        FormComponents.CardList,
        BuiltinType.MODAL,
        FormComponents.FormProcess,
      ].includes(selectedRef.value.type as any)
    ) {
      return selectedRef.value;
    }
    return focusFormWidget.value;
  });

  const hoverRef = computed(() => {
    return hoverWidget.value;
  });

  function setHoverWidget(widget: Partial<LowCodeWidget.BasicSchema> = {}) {
    hoverWidget.value = widget;
  }

  function setSelectedParentWidgets(widgets: Array<LowCodeWidget.BasicSchema>) {
    selectedParentWidgets.value = widgets;
  }

  /**设置模态框选中 */
  const setSelectedModal = (modal) => {
    selectedModal.value = modal;
    selectedWidget.value = {};
    togglePanel(PanelEnum.WIDGET);
  };
  const resetSelectedModal = () => {
    selectedModal.value = {};
  };
  /**
   * 设置组件选中
   * @param widget 组件JSON
   * @param scope 组件所在域
   * @param widgetItemFlag 是否是行内编辑/部件的组件(如在子表中)
   */
  const setSelectedWidget = (widget, scope?: SCOPE) => {
    selectedWidget.value = widget;
    selectedModal.value = {};
    !!scope && setScope(scope);
    togglePanel(PanelEnum.WIDGET);
  };
  const resetSelectedWidget = (scope?: SCOPE) => {
    selectedWidget.value = {};
    selectedParentWidgets.value = [];
    selectedConfig.value = { mode: 'move' };
    focusFormWidget.value = {};
    selectedParentChildren.value = [];
    setScope(scope ? scope : getScope());
  };
  /**被选择的组件的样式 */
  const selectedStyle = computed(() => {
    if (!selectedRef.value.style) {
      selectedRef.value.style = {};
    }
    return selectedRef.value.style || commonStyle;
  });
  /**被选择的组件/弹框的属性 */
  const selectedProps = computed(() => {
    return selectedRef.value.props!;
  });
  /**被选择的组件/弹框已经配置的事件 */
  const selectedEvents = computed({
    get() {
      return selectedRef.value.events!;
    },
    set(val) {
      selectedRef.value.events = val;
    },
  });
  /**被选择的组件/弹框拥有的所有事件 */
  const selectedAllEvents = computed(() => {
    const { type } = selectedRef.value;
    let widgetEvents;
    if (platform.value === Platform.MOBILE) {
      widgetEvents = allWidgetInfo.mobileWidgetEvents;
    } else if (platform.value === Platform.PAD) {
      widgetEvents = allWidgetInfo.padWidgetEvents;
    } else {
      widgetEvents = allWidgetInfo.webWidgetEvents;
    }
    const eventConfig = (widgetEvents[type!] || fieldFormEvents[type!] || []) as any;
    if (typeof eventConfig === 'function') {
      return eventConfig(selectedRef.value);
    } else {
      return eventConfig;
    }
  });
  /**被选择的组件/弹框拥有的所有属性编辑器的描述集合 */
  const selectedAllPropEditors = computed(() => {
    const { type } = selectedRef.value;
    let widgetPropsEditors;
    if (platform.value === Platform.MOBILE) {
      widgetPropsEditors = allWidgetInfo.mobileWidgetPropEditors;
    } else if (platform.value === Platform.PAD) {
      widgetPropsEditors = allWidgetInfo.padWidgetPropEditors;
    } else {
      widgetPropsEditors = allWidgetInfo.webWidgetPropEditors;
    }

    let preCompInfo;
    if (has(selectedRef.value, 'preLocation')) {
      const { scopeData } = useScope();
      preCompInfo = findNode(scopeData.value, (widget) => {
        return widget.id === get(selectedRef.value, 'preLocation');
      });
    }
    return widgetPropsEditors[type!] && isArray(widgetPropsEditors[type!])
      ? widgetPropsEditors[type!]
      : fieldFormEditors[type!]?.(selectedRef.value, preCompInfo);
  });
  /**被选择的组件/弹框拥有的所有样式编辑器的描述集合 */
  const selectedAllStyleEditors = computed(() => {
    const { type } = selectedRef.value;
    let widgetStyleEditors;
    if (platform.value === Platform.MOBILE) {
      widgetStyleEditors = allWidgetInfo.mobileWidgetStyleEditors;
    } else if (platform.value === Platform.PAD) {
      widgetStyleEditors = allWidgetInfo.padWidgetStyleEditors;
    } else {
      widgetStyleEditors = allWidgetInfo.webWidgetStyleEditors;
    }
    return widgetStyleEditors[type!] || fieldFormStyles[type!]?.(selectedRef.value);
  });

  /**被选择的组件所有设计相关配置信息集合 */
  const selectedAllDesingerConfig = computed(() => {
    let widgetDesignerConfig;
    if (platform.value === Platform.MOBILE) {
      widgetDesignerConfig = allWidgetInfo.mobileWidgetDesignerConfig;
    } else if (platform.value === Platform.PAD) {
      widgetDesignerConfig = allWidgetInfo.padWidgetDesignerConfig;
    } else {
      widgetDesignerConfig = allWidgetInfo.webWidgetDesignerConfig;
    }
    return widgetDesignerConfig[selectedRef.value.type!];
  });

  const setFocusFormContainer = (formId) => {
    focusFormWidget.value = (formId && allWidget.value.find((e) => e.id === formId)) || {};
  };

  /** 是否选中表单 */
  const focusFormContainer = computed(() => {
    if (subTableModalState.value && focusFormRef.value.type === BuiltinType.MODAL) {
      // 只有子表-弹窗打开的时候，左侧默认选中字段，走这里的逻辑
      return {
        isFocus: true,
      };
    }
    if (focusFormRef.value && focusFormRef.value?.props?.model) {
      return {
        isFocus: true,
        formModelKey: focusFormRef.value?.props?.model,
        formId: focusFormRef.value?.id,
        nodeType: focusFormRef.value.props?.nodeType, // 工作流节点类型
        /**子表关联父模型 */
        refParentModelkey: focusFormRef.value.props?.refParentModelkey,
      };
    }
    return {
      isFocus: false,
      formModelKey: '',
      formId: '',
      nodeType: '',
    };
  });

  return {
    setSelectedModal,
    resetSelectedModal,
    setSelectedWidget,
    resetSelectedWidget,
    selectedAllPropEditors,
    selectedAllStyleEditors,
    selectedAllEvents,
    selectedEvents,
    selectedProps,
    selectedStyle,
    selectedWidget,
    selectedRef,
    selectModalRef,
    focusFormContainer,
    selectedAllDesingerConfig,
    setFocusFormContainer,
    focusFormRef,
    hoverRef,
    setHoverWidget,
    selectedParentRef,
    setSelectedParentWidgets,
    selectedParentsRef,
    selectedParentChildrenRef,
    setSelectedParentChildrenRef,
    selectedConfigRef,
    setSelectedConfig,
  };
}
