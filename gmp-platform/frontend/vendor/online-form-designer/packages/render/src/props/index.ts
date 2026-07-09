import { PropType } from 'vue';
import { IDesignNode } from '@gct/base';
import { IDesignRenderContainerController, IDesignRenderItemController } from '../interface';

/**
 * 节点类型组件输入参数
 */
export const nodeProps = {
  // 是否为预览模式
  preview: {
    type: Boolean,
    default: false,
  },
  c: {
    type: Object as PropType<IDesignRenderItemController>,
    required: true,
  },
  model: {
    type: Object as PropType<IDesignNode>,
    required: true,
  },
  context: {
    type: Object as PropType<IContext>,
    required: true,
  },
} as const;

/**
 * 节点类型组件输入参数
 */
export const containerNodeProps = {
  // 是否为预览模式
  preview: {
    type: Boolean,
    default: false,
  },
  c: {
    type: Object as PropType<IDesignRenderContainerController>,
    required: true,
  },
  model: {
    type: Object as PropType<IDesignNode>,
    required: true,
  },
  context: {
    type: Object as PropType<IContext>,
    required: true,
  },
} as const;

/**
 * 节点编辑器组件输入参数
 */
export const nodeEditorProps = {
  // 是否为预览模式
  preview: {
    type: Boolean,
    default: false,
  },
  c: {
    type: Object as PropType<IDesignRenderItemController>,
    required: true,
  },
  model: {
    type: Object as PropType<IDesignNode>,
    required: true,
  },
  context: {
    type: Object as PropType<IContext>,
    required: true,
  },
  field: {
    type: Object as PropType<any>,
    required: true,
  },
  value: {
    type: Object as PropType<any>,
  }
}
