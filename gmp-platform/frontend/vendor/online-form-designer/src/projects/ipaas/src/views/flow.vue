<template>
  <div class="flow-page ks-column">
    <div class="h54px">
      <FlowHeader />
    </div>
    <div ref="contentRef" class="ks-row ks-col overflow-hidden">
      <div class="relative ks-col">
        <div class="absolute top-30px left-20px z-10">
          <FlowVersions />
        </div>
        <a-spin v-if="loading" size="large" />
        <!-- <IPaasFlow :node-create="beforeAddNode" /> -->
        <iPaaSBpmnDiagram :on-node-created="onNodeCreated" />
      </div>
      <a-divider
        type="vertical"
        class="cursor-col-resize"
        style="border-color: #eaedf1; height: 100%; margin: 0 1px 0 1px"
        @mousedown="panelMoveDomDown"
      />
      <div class="overflow-hidden ks-row" :style="{ width: `${start < 280 ? 280 : start}px` }">
        <FlowPanel class="ks-col" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import FlowHeader from '/@ipaas/comps/flow-header.vue';
  import FlowPanel from '/@ipaas/comps/flow-panel.vue';
  import FlowVersions from '/@ipaas/comps/flow-versions.vue';
  import { onBeforeUnmount, onMounted, ref } from 'vue';
  import { useFlow } from '/@ipaas/hooks/useFlow';
  import { iPaaSBpmnDiagram } from '@gct/flow/src/plugins/ipaas-bpmn';
  import { useUserStoreWithOut } from '/@/store/modules/user';
  import { UseDragByLine } from '/@/projects/page-designer/src/components/widgets/hooks/useDragLine';
  import { COLUMNS_TYPE } from '@gct/runtime';

  const route = useRoute();
  const { fuuid, appTag, branchId, env } = route.query as {
    fuuid: string;
    appTag?: string;
    branchId?: string;
    env?: string;
  };
  const { start, moveDomDown } = UseDragByLine(280, COLUMNS_TYPE.RIGHT);
  const { loadFlow, loading, clearSocket, onNodeCreated, setAppInfo } = useFlow();
  const userStore = useUserStoreWithOut();
  const contentRef = ref();

  // 初始化连接流信息
  loadFlow(fuuid);

  const panelMoveDomDown = (e) => moveDomDown(e, contentRef.value);

  onMounted(() => {
    setAppInfo({ appTag, branchId, env, tenantId: userStore.getTenant });
    window.addEventListener('beforeunload', clearSocket);
  });

  onBeforeUnmount(() => {
    // clearSocket();
    window.removeEventListener('beforeunload', clearSocket);
  });
</script>

<style lang="less" scoped>
  .flow-page {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    // display: grid;
    // grid-template-columns: 1fr 280px;
    // grid-template-rows: 54px 1fr;
    // grid-template-areas:
    //   'header header'
    //   'content panel';

    & > div {
      &:nth-child(1) {
        // grid-area: header;
      }
      &:nth-child(2) {
        // grid-area: content;
        // background-color: #f2f4f7;
        // padding: 4px;
      }
      &:nth-child(3) {
        // grid-area: panel;
        background-color: #fff;
        border-left: 1px solid #e0e3ea;
      }
    }
  }

  .ant-spin-spinning {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.5);
  }
</style>
