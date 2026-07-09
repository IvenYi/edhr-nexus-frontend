import { svg, PaintStyle, registerEndpointRenderer } from '@jsplumb/browser-ui';
import { ArrowEndpoint } from './arrow-endpoint';

// 计算节点三角形方向
const calcPoints = (direction: 'left' | 'right'): string => {
  if (direction === 'left') {
    return '0,3 6,0 6,6';
  } else {
    return '0,0 6,3 0,6';
  }
};

export const register = (): void => {
  registerEndpointRenderer<ArrowEndpoint>(ArrowEndpoint.type, {
    makeNode: (ep: ArrowEndpoint, style: PaintStyle) => {
      const { direction, cssClass } = ep.params || {};
      const fillColor = style?.fill || 'var(--gct-primary-color)';

      const node = svg.node('polygon', {
        points: calcPoints(direction!),
        fill: fillColor,
        'stroke-width': 0,
      });

      // 添加自定义 CSS 类名用于控制层级
      if (cssClass) {
        node.setAttribute('class', cssClass);
      }

      return node;
    },

    updateNode: (ep: ArrowEndpoint, node: SVGElement, style: PaintStyle) => {
      const { direction, cssClass } = ep.params || {};
      const fillColor = style?.fill || 'var(--gct-primary-color)';

      svg.attr(node, {
        points: calcPoints(direction!),
        fill: fillColor,
        'stroke-width': 0,
      });

      // 更新 CSS 类名
      if (cssClass) {
        node.setAttribute('class', cssClass);
      }
    },
  });
};
