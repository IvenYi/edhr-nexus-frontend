import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { toRef, inject, Ref } from 'vue';
import { getPremission } from '../utils/runGlobalByPage';
import { Dependency_ENUM, DisplayType } from '/@page-designer/enum';
import { calculateDepResult, insetDep } from './controller';
import { useVisibileByRuleHook } from '../utils/displayRule';
import { ProcessAppRovedData } from '../utils/processRovedInfo';

export function useDependencyToShow(widget: LowCodeWidget.BasicSchema) {
  if (widget.props?.displayRule && widget.props?.displayType === DisplayType.RULE) {
    /**老版本显隐逻辑 */
    return useVisibileByRuleHook(widget.props, widget.id);
  } else {
    return dependencyToShow(widget);
  }
}

export function dependencyToShow(
  widget: LowCodeWidget.BasicSchema,
  rowData?: object,
): boolean | Ref<boolean> {
  if (!widget.id) return false;
  //权限逻辑必须在应用内部测
  if (!getPremission(widget.id)) {
    /**权限不存在就直接返回false */
    widget.props.hidden = true;
    return false;
  }
  const useProcessFieldEvent = inject<ProcessAppRovedData | undefined>(
    'useProcessFieldEvent',
    undefined,
  );
  if (useProcessFieldEvent) {
    /**流程节点隐藏的字段 */
    useProcessFieldEvent.useFieldToShow(widget);
    return !widget.props.hidden;
  }
  const { displayType, displayRule } = widget.props || {};
  const configDependency = widget.props.componentDependency?.configDependency || {};
  const { value, expression } = configDependency[Dependency_ENUM.HIDDEN] || {};
  if (value && expression) {
    widget.props.hidden = true;
    insetDep({ expression, rowData }, (res) => {
      widget.props.hidden = res;
    });
  } else if (value) {
    /**开启组件依赖没有配置隐藏条件 */
    widget.props.hidden = true;
  } else if (displayType === DisplayType.RULE && displayRule) {
    /**老数据显示隐藏配置兼容 */
    widget.props.hidden = true;
    insetDep({ expression: displayRule, rowData }, (res) => {
      widget.props.hidden = !res;
    });
  }
  return toRef(() => !widget.props.hidden);
}

/**直接返回计算结果的依赖显隐逻辑 */
export async function dependencyToShowSync(
  widget: LowCodeWidget.BasicSchema,
  rowData?: object,
): Promise<boolean> {
  if (!widget.id) return false;
  //权限逻辑必须在应用内部测
  if (!getPremission(widget.id)) {
    /**权限不存在就直接返回false */
    widget.props.hidden = true;
    return false;
  }
  const useProcessFieldEvent = inject<ProcessAppRovedData | undefined>(
    'useProcessFieldEvent',
    undefined,
  );
  if (useProcessFieldEvent) {
    /**流程节点隐藏的字段 */
    useProcessFieldEvent.useFieldToShow(widget);
    return !widget.props.hidden;
  }
  const { displayType, displayRule } = widget.props || {};
  const configDependency = widget.props.componentDependency?.configDependency || {};
  const { value, expression } = configDependency[Dependency_ENUM.HIDDEN] || {};
  if (value && expression) {
    widget.props.hidden = true;
    widget.props.hidden = await calculateDepResult({ expression, rowData });
  } else if (value) {
    /**开启组件依赖没有配置隐藏条件 */
    widget.props.hidden = true;
  } else if (displayType === DisplayType.RULE && displayRule) {
    /**老数据显示隐藏配置兼容 */
    widget.props.hidden = true;
    widget.props.hidden = await calculateDepResult({ expression: displayRule, rowData });
  }
  return !widget.props.hidden;
}

/**组件集合处理 */
export function useDependencyToShowList(widgetList: LowCodeWidget.BasicSchema[], rowData?: object) {
  widgetList.forEach((widget) => {
    dependencyToShow(widget, rowData);
  });
  return toRef(() => widgetList.filter((i) => !i.props.hidden));
}

export function tableWidgetToShow(widget: LowCodeWidget.BasicSchema, callback) {
  const configDependency = widget.props.componentDependency?.configDependency || {};
  const { value, expression } = configDependency[Dependency_ENUM.HIDDEN] || {};
  if (value && expression) {
    insetDep({ expression }, (res) => {
      callback(res);
    });
  }
  callback(widget.props.hidden);
}

export function tableWidgetToRequired(widget: LowCodeWidget.BasicSchema, callback) {
  const configDependency = widget.props.componentDependency?.configDependency || {};
  const { value, expression } = configDependency[Dependency_ENUM.REQUIRED] || {};
  if (value && expression) {
    insetDep({ expression }, (res) => {
      callback(res);
    });
  }
  callback(widget.props.required);
}

export function tableWidgetByDept(widget: LowCodeWidget.BasicSchema) {
  const configDependency = widget.props.componentDependency?.configDependency || {};
  const { value, expression } = configDependency[Dependency_ENUM.HIDDEN] || {};
  if (value && expression) {
    insetDep({ expression }, (res) => {
      widget.props.hidden = res;
    });
  }
  const { value: required_value, expression: required_expression } =
    configDependency[Dependency_ENUM.REQUIRED] || {};
  if (required_value && required_expression) {
    insetDep({ expression: required_expression }, (res) => {
      widget.props.required = res;
    });
  }
}
