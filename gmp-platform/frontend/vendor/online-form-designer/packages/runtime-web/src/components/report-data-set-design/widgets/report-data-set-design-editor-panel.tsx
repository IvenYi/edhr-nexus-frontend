import { defineComponent, nextTick, onMounted, ref } from 'vue'; // 移除了 readonly
import { useNamespace } from '@gct-paas/core';
import { Graph } from '@antv/x6';
import { Selection } from '@antv/x6-plugin-selection';
import { message } from 'ant-design-vue';
import { useMouseInElement } from '@vueuse/core';
import { useReportDataSetDesignStore } from '../store';
import { SHAPE_TYPE } from '../constants';
import { INodeData } from '../interface';
import './report-data-set-design-editor-panel.scss';

/**
 * 设计编辑区
 */
export const ReportDataSetDesignEditorPanel = defineComponent({
  name: 'ReportDataSetDesignEditorPanel',
  setup() {
    const ns = useNamespace('report-data-set-design-editor-panel');
    const elRef = ref<any>(null);
    const store = useReportDataSetDesignStore();

    const { isOutside } = useMouseInElement(elRef);

    onMounted(() => {
      if (!elRef.value) {
        console.error('elRef is null');
        return;
      }
      const graph = new Graph({
        container: elRef.value,
        autoResize: true,
        interacting: false,
        mousewheel: {
          enabled: true,
          minScale: 0.5,
          maxScale: 12,
          modifiers: ['ctrl', 'meta'],
        },
        translating: {
          restrict: true,
        },
        connecting: {
          allowLoop: false,
          allowMulti: false,
        },
        panning: true,
        scaling: {
          min: 0.5,
          max: 5,
        },
        embedding: {
          enabled: true,
          findParent({ node }) {
            const nodeBox = node.getBBox();
            const nodes = this.getNodes().filter((itemNode) => {
              const data = itemNode.getData();
              if (data && data.type === SHAPE_TYPE.EMPTY) {
                const bbox = itemNode.getBBox();
                // 节点的任意一个位置在空节点的范围内
                if (
                  nodeBox.x < bbox.x + bbox.width &&
                  nodeBox.x + nodeBox.width > bbox.x &&
                  nodeBox.y < bbox.y + bbox.height &&
                  nodeBox.y + nodeBox.height > bbox.y
                ) {
                  return true;
                }
              }
              return false;
            });
            return nodes;
          },
        },
      });

      // 使用 Selection 插件
      graph.use(
        new Selection({
          enabled: true,
          rubberband: false,
          multiple: false,
        }),
      );

      graph.on('node:added', async ({ node }) => {
        store.isDragging = false;
        if (store.nodes.length === 0) {
          await store.setNode(node.data);
          store.setActive(node.data.id);
          setTimeout(() => {
            store.updateX6Layout();
          });
        } else {
          setTimeout(() => {
            graph.removeNode(node);
          });
        }
      });

      graph.on('node:change:parent', ({ node }) => {
        // 如果节点已经存在则忽略
        const data = node.getData<INodeData>();
        if (store.nodes.find((item) => item.id === data.id)) {
          setTimeout(() => {
            store.updateX6Layout();
            message.error(window.$t('sys.dataSet.sthModelExistsMsg', { sth: data.modelName }));
          });
          return;
        }
        if (node.parent) {
          const pData = node.parent.getData<INodeData>();
          const link = store.findLinkByTarget(pData.id);
          if (link) {
            link.target = data.id;
            link.targetFilter = {};
            link.type = SHAPE_TYPE.LINK;
            store.setLink(link, false);
          }
          store.removeNode(pData.id, false);
          nextTick(async () => {
            await store.setNode(data);
            if (link) {
              store.setActiveLink(link.id);
            }
          });
        }
      });

      store.setGraph(graph);

      store.updateX6Layout();
    });

    return () => {
      return (
        <div
          class={[
            ns.b(),
            isOutside.value ? null : ns.m('mouse-in'),
            ns.is('dragging', store.isDragging && store.nodes.length === 0),
          ]}
        >
          <div ref={(ref) => (elRef.value = ref)} class={[ns.b('x6')]}></div>
        </div>
      );
    };
  },
});
