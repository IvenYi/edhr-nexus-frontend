import { register } from '@antv/x6-vue-shape';
// import { NodeConfigMap } from '../constants';
import { controlSchema, getSize } from '../schema';
import { ControlType } from '../types';

const controls: Record<string, any> = import.meta.glob('../views/controls/graph/*.vue', {
  eager: true,
});
const dndControls: Record<string, any> = import.meta.glob('../views/controls/dnd/*.vue', {
  eager: true,
});

export function useControlsRegister() {
  function registerControls() {
    Object.keys(controls).forEach((path) => {
      const name = path.match(/([a-zA-z\-0-9_]+)(?=.vue)/g)![0];
      const size = getSize(name as ControlType);
      register({
        shape: `${name}`,
        component: controls[path].default,
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

  return { controls, dndControls, registerControls };
}
