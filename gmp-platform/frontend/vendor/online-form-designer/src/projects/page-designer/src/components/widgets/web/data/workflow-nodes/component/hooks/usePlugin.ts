import { ref } from 'vue';
import { Graph, Shape } from '@antv/x6';
import { WorkflowNodeTypeEnum } from '../types';

import { Transform } from '@antv/x6-plugin-transform';
import { Selection } from '@antv/x6-plugin-selection';

export function usePlugin(graph: Graph) {
  graph.use(
    new Transform({
      resizing: {
        enabled(node) {
          // console.log(node);
          return node.shape === WorkflowNodeTypeEnum.NODE_GROUP;
        },
        // orthogonal(node: Node) {
        //   const { enableOrthogonal } = node.getData();
        //   return enableOrthogonal;
        // },
      },
    }),
  );

  graph.use(
    new Selection({
      // className: '',
      enabled: true,
      multiple: false,
      rubberband: false,
      movable: false,
      showNodeSelectionBox: false,
      showEdgeSelectionBox: false,
    }),
  );
}
