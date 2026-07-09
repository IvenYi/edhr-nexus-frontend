import { register } from '@antv/x6-vue-shape';
import { NodeShape } from './components/node-shape';
import { SHAPE_TYPE } from '../../constants';
import { EmptyNodeShape } from './components/empty-node-shape';

export function registerNodeShape(): void {
  const ports = {
    groups: {
      in: {
        position: 'left',
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: 'transparent',
            strokeWidth: 1,
            fill: 'transparent',
          },
        },
      },

      out: {
        position: {
          name: 'right',
          args: {
            dx: -32,
          },
        },

        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: 'transparent',
            strokeWidth: 1,
            fill: 'transparent',
          },
        },
      },
    },
  };
  // 注册标准节点
  register({
    shape: SHAPE_TYPE.NODE,
    width: 256,
    height: 56,
    component: NodeShape,
    ports,
  });
  // 注册空节点
  register({
    shape: SHAPE_TYPE.EMPTY,
    width: 256,
    height: 56,
    component: EmptyNodeShape,
    ports,
  });
}
