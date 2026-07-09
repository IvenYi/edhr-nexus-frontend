import { IDesignEditorNode, IDesignNode } from '@gct/base';
import { PropType } from 'vue';

/**
 * 节点类型组件输入参数
 */
export const nodeProps = {
  count: {
    type: Number,
    required: true,
  },
  data: {
    type: Object as PropType<IDesignNode>,
    required: true,
    default: () => ({}),
  },
  parent: {
    type: Object as PropType<IDesignNode>,
  },
} as const;

/**
 * 容器类型组件输入参数
 */
export const nodeContainerProps = {
  count: {
    type: Number,
    required: true,
  },
  data: {
    type: Object as PropType<IDesignNode>,
    required: true,
  },
  children: {
    type: Array as PropType<IDesignNode[]>,
    default: () => [],
  },
  parent: {
    type: Object as PropType<IDesignNode>,
  },
} as const;

/**
 * 设计编辑器节点输入参数
 */
export const nodeEditorProps = {
  count: {
    type: Number,
    required: true,
  },
  data: {
    type: Object as PropType<IDesignEditorNode>,
    required: true,
    default: () => ({}),
  },
  field: {
    type: Object,
    required: true,
  },
  value: {
    type: Object as PropType<any>,
    default: '',
  },
  parent: {
    type: Object as PropType<IDesignNode>,
  },
};
