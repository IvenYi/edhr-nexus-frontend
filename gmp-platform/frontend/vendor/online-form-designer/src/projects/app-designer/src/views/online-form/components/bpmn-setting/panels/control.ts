import { BpmnNodeTypeEnum } from '@gct/nocode-base';
import { DesignerType, PanelType } from '../../../types/designer-type';
import { DynamicPropMap, DynamicPermMap, DynamicEventMap } from './index';

/**
 * 定义不同节点的面板 额外控制策略
 */
const PanelStrategy: Record<
  DesignerType,
  Record<BpmnNodeTypeEnum, Record<PanelType, { visibility: boolean }>>
> = {
  [DesignerType.BIZ_PROCESS_TEMPLATE]: {
    // 审核模板类型BpmnSubmit(开始)节点不需要配置
    [BpmnNodeTypeEnum.BpmnSubmit]: {
      [PanelType.PROP]: {
        visibility: true,
      },
      [PanelType.PERM]: {
        visibility: false,
      },
      [PanelType.EVENT]: {
        visibility: false,
      },
    },
  },
};

export class PanelControl {
  static setNodesPanelStrategy({ designerType, nodeType }) {
    const getDefaultStrategy = (panelType, hasPanelComp) => {
      const visibilityStrategy = PanelStrategy?.[designerType]?.[nodeType]?.[panelType];
      const visibility = visibilityStrategy?.visibility ?? true;
      return {
        visibility: hasPanelComp && visibility,
      };
    };

    return {
      nodeType: nodeType,
      nodeConfig: {
        [PanelType.PROP]: {
          component: DynamicPropMap[nodeType] || null,
          ...getDefaultStrategy(PanelType.PROP, !!DynamicPropMap[nodeType]),
        },
        [PanelType.PERM]: {
          component: DynamicPermMap[nodeType] || null,
          ...getDefaultStrategy(PanelType.PERM, !!DynamicPermMap[nodeType]),
        },
        [PanelType.EVENT]: {
          component: DynamicEventMap[nodeType] || null,
          ...getDefaultStrategy(PanelType.EVENT, !!DynamicEventMap[nodeType]),
        },
      },
    };
  }
}
