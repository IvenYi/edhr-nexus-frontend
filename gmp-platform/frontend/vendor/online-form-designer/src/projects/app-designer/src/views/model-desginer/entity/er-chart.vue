<template>
  <div class="er-wrap">
    <div id="container"></div>
    <div id="minimap"></div>
    <TeleportContainer />
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { register, getTeleport } from '@antv/x6-vue-shape';
  import { Graph } from '@antv/x6';
  import { MiniMap } from '@antv/x6-plugin-minimap';
  import { Scroller } from '@antv/x6-plugin-scroller';
  import erNode from './components/shape/er-node.vue';
  import { ForceLayout, Force2Layout, Model } from '@antv/layout';
  import { getModelMetaEr } from '/@/apis/gct-apaas/ModelMetaController';

  const TeleportContainer = getTeleport();
  let graph: Graph;
  let chartData;
  register({
    shape: 'model',
    component: erNode,
    width: 265,
    height: 260,
  });
  onMounted(async () => {
    chartData = await getModelMetaEr();
    chartData.edges = chartData.edges.filter((e) => e.source && e.target);
    graph = new Graph({
      container: document.getElementById('container')!,
      autoResize: true,
      background: {
        color: '#f5f5f5', // 设置画布背景颜色
      },
      connecting: {
        allowBlank: false,
        allowLoop: false,
        allowNode: false,
        snap: {
          radius: 20,
        },
        router: {
          name: 'manhattan',
        },
        connector: {
          name: 'rounded',
          args: {
            radius: 30,
          },
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              stroke: '#5F95FF',
            },
          },
        },
      },
    });
    //如果节点为一个不需要布局直接渲染即可
    if (chartData.nodes.length < 2) {
      graph.fromJSON(chartData!);
      graph.centerContent();
    } else {
      const layout = new ForceLayout({
        type: 'force',
        preventOverlap: true,
        nodeSpacing: 50,
        nodeSize: 275,
        linkDistance: 400,
        tick: () => {
          graph.fromJSON(chartData!);
          graph.centerContent();
        },
      });
      layout.layout(chartData as Model);
    }
    graph.use(
      new Scroller({
        pannable: true,
        enabled: true,
      }),
    );
    graph.use(
      new MiniMap({
        container: document.getElementById('minimap') || undefined,
      }),
    );
  });

  // const transDataToForce = (erData) => {
  //   return new Promise((res, rej) => {
  //     const model: any = {
  //       nodes: [],
  //       edges: [],
  //     };
  //     model.edges = erData.filter((d) => {
  //       return d.shape === 'edge';
  //     });

  //     model.nodes = erData.filter((d) => {
  //       return d.shape === 'model';
  //     });

  //     return res(model);
  //   });
  // };
</script>

<style lang="less" scoped>
  .er-wrap {
    height: 100%;
    width: 100%;
    position: relative;

    #container {
      height: 100%;
    }

    #minimap {
      position: absolute;
      bottom: 0;
      right: 0%;
    }
  }
</style>
