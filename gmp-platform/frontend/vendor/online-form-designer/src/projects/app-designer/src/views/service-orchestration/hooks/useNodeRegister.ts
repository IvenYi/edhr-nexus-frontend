import { register } from '@antv/x6-vue-shape';
import { NodeConfigMap } from '../constants';

const nodes: Record<string, any> = import.meta.glob('../nodes/graph/*.vue', {
  eager: true,
});
const dndNodes: Record<string, any> = import.meta.glob('../nodes/dnd/*.vue', {
  eager: true,
});

export function useNodeRegister() {
  function registerNodes() {
    console.log(nodes);
    Object.keys(nodes).forEach((path) => {
      const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
      const size = NodeConfigMap[name].size;
      register({
        shape: `${name}`,
        component: nodes[path].default,
        width: size.width,
        height: size.height,
        ports: {
          groups: {
            top: {
              position: 'top',
              attrs: {
                circle: {
                  magnet: true,
                  stroke: '#8f8f8f',
                  r: 5,
                  style: {
                    visibility: 'hidden',
                  },
                },
              },
            },
            right: {
              position: 'right',
              attrs: {
                circle: {
                  magnet: true,
                  stroke: '#8f8f8f',
                  r: 5,
                  style: {
                    visibility: 'hidden',
                  },
                },
              },
            },
            bottom: {
              position: 'bottom',
              attrs: {
                circle: {
                  magnet: true,
                  stroke: '#8f8f8f',
                  r: 5,
                  style: {
                    visibility: 'hidden',
                  },
                },
              },
            },
            left: {
              position: 'left',
              attrs: {
                circle: {
                  magnet: true,
                  stroke: '#8f8f8f',
                  r: 5,
                  style: {
                    visibility: 'hidden',
                  },
                },
              },
            },
          },
        },
      });
    });
  }

  return { nodes, dndNodes, registerNodes };
}
