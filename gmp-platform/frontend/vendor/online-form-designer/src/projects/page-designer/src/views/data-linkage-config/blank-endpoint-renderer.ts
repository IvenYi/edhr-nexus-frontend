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

export const register = () => {
  registerEndpointRenderer<ArrowEndpoint>(ArrowEndpoint.type, {
    makeNode: (ep: ArrowEndpoint, _style: PaintStyle) => {
      const { direction } = ep.params || {};

      return svg.node('polygon', {
        points: calcPoints(direction!),
        'stroke-width': 1,
      });
    },

    updateNode: (ep: ArrowEndpoint, node: SVGElement) => {
      const { direction } = ep.params || {};
      svg.attr(node, {
        points: calcPoints(direction!),
        'stroke-width': 1,
      });
    },
  });
};
