import { Graph } from '@antv/x6';
import { SHAPE_TYPE } from '../../constants';
import { getLabelSvgCfg } from '../../utils';

export function registerLinkEdge(): void {
  // 注册空连接线
  Graph.registerEdge(
    SHAPE_TYPE.EMPTY_LINK,
    {
      inherit: 'edge',
      router: {
        name: 'manhattan',
        args: {
          padding: 80,
          startDirections: ['right'],
          endDirections: ['left'],
        },
      },
      connector: {
        name: 'rounded',
      },
      attrs: {
        line: {
          stroke: 'transparent',
          strokeDasharray: 3,
          targetMarker: null, // 去除目标箭头
          sourceMarker: null, // 去除源箭头
        },
      },
      defaultLabel: {},
      zIndex: -1,
    },
    true,
  );
  // 注册连接线
  Graph.registerEdge(
    SHAPE_TYPE.LINK,
    {
      inherit: 'edge',
      router: {
        name: 'manhattan',
        args: {
          padding: 80,
          startDirections: ['right'],
          endDirections: ['left'],
        },
      },
      connector: {
        name: 'rounded',
      },
      attrs: {
        line: {
          stroke: 'rgba(217, 217, 217, 1)',
          targetMarker: null, // 去除目标箭头
          sourceMarker: null, // 去除源箭头
        },
      },
      defaultLabel: getLabelSvgCfg(),
      zIndex: 1,
    },
    true,
  );
}
