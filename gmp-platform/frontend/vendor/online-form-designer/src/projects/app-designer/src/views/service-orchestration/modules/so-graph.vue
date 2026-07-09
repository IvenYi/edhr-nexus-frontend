<template>
  <div ref="GraphContainerRef" class="so-graph"></div>
  <TeleportContainer />
</template>

<script lang="ts" setup>
  import { ref, onMounted, vue } from 'vue';
  import { Graph } from '@antv/x6';

  import { register, getTeleport } from '@antv/x6-vue-shape';
  import { Dnd } from '@antv/x6-plugin-dnd';
  import { Snapline } from '@antv/x6-plugin-snapline';

  const TeleportContainer = getTeleport();

  // const GraphContainerRef = ref();
  // const DndContainerRef = ref();
  // let graph: Graph;
  // let dnd: Dnd;

  onMounted(() => {
    // console.log(3333333333333);

    return;
    const start = graph.addNode({
      shape: 'start',
      x: 100,
      y: 60,
      ports: {
        items: [
          {
            id: 'port_top',
            group: 'top',
          },
          {
            id: 'port_right',
            group: 'right',
          },
          {
            id: 'port_bottom',
            group: 'bottom',
          },
          {
            id: 'port_left',
            group: 'left',
          },
        ],
      },
    });

    const node1 = graph.addNode({
      shape: 'model-create',
      x: 500,
      y: 60,
      ports: {
        items: [
          {
            id: 'port_top',
            group: 'top',
          },
          {
            id: 'port_right',
            group: 'right',
          },
          {
            id: 'port_bottom',
            group: 'bottom',
          },
          {
            id: 'port_left',
            group: 'left',
          },
        ],
      },
    });

    graph.addEdge({
      source: { cell: start, port: 'port_right' }, // 源节点
      target: { cell: node1, port: 'port_left' }, // 目标节点
    });
  });

  defineExpose({
    a: 1,
  });
</script>

<style lang="less" scoped>
  .so-graph {
    height: 100%;
    width: 100%;
  }
</style>
