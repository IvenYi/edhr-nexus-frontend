<template>
  <div ref="rightRef" class="h-full w-full right-main">
    <TableDrawer v-if="!readonlySummary" :parent="rightRef" />
    <div class="h-full w-full overflow-auto">
      <div v-if="!currentFormInst?.form_inst_id_" class="ks-row-center-middle h-full">
        <a-empty :description="$t('sys.noData')" :image="EmptyImg" />
      </div>
      <OnlineFormOperator
        v-else
        ref="operatorRef"
        class="paas-si-form-builder-container h100%"
        :selfId="currentFormInst.form_inst_id_"
        :in-drawer="false"
        :isViewPage="true"
        :keep="false"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useEdhrSummary } from '../hook/useEdhrSummary';
  // import { PaasSiFormBuilderModal } from '/@online-form/views/integration/apaas_si/index';
  import EmptyImg from '@/assets/images/edhr-empty.png';
  import OnlineFormOperator from '/@online-form/views/integration/apaas_si/render/operator/online-form-operator.vue';
  import TableDrawer from './modals/table-drawer.vue';
  import { ref } from 'vue';

  const { currentFormInst, readonlySummary } = useEdhrSummary();
  const rightRef = ref();
</script>
<style lang="less" scoped>
  :deep(.ant-switch) {
    height: 20px;
    min-width: 36px;

    .ant-switch-handle {
      width: 16px;
      height: 16px;
    }
  }
  :deep(.ant-tabs) {
    height: 100%;
    background-color: #fff;
    border-radius: 4px;
    .ant-tabs-nav {
      margin: 0;
      .ant-tabs-tab {
        margin: 0 !important;
        border-radius: 0;
        border-top: 0;
        border-right: 1px solid #e0e3eb;
        border-bottom: 1px solid #e0e3eb;
        border-left: 0;
        color: #5a5f6b;

        &.ant-tabs-tab-active {
          border-bottom-color: #fff;
        }
      }
    }
    .ant-tabs-content-holder {
      height: calc(100% - 42px);

      .ant-tabs-content {
        height: 100%;
      }
    }
  }
</style>
