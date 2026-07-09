<template>
  <div class="flow__header">
    <a-breadcrumb>
      <a-breadcrumb-item v-for="item in flowCategoryInfo" :key="item.id">
        {{ item.name }}
      </a-breadcrumb-item>
      <a-breadcrumb-item>{{ flowBasicInfo.name }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="flex">
      <div
        v-if="debugNodeInfo.completed"
        class="button ml-16px cursor-pointer"
        @click="destroyDebugContext"
      >
        <i class="iconfont icon-tuichu"></i>
        {{ $t('sys.ipaas.exitDebugger') }}
      </div>
      <div
        v-if="
          [ConnectionFlowStatus.Init, ConnectionFlowStatus.Draft].includes(
            flowVersionInfo?.statusStr as ConnectionFlowStatus,
          )
        "
        class="button ml-16px cursor-pointer"
        @click="save"
      >
        <i class="iconfont icon-baocun1"></i>
        {{ t('sys.saveText') }}
      </div>
      <div
        v-if="flowVersionInfo?.statusStr === ConnectionFlowStatus.Draft"
        class="button ml-16px cursor-pointer"
        @click="saveAndPublish"
      >
        <i class="iconfont icon-baocun1"></i>
        {{ t('sys.ipaas.saveAndPublish') }}
      </div>

      <div
        v-if="
          [ConnectionFlowStatus.Publish, ConnectionFlowStatus.Offline].includes(
            flowVersionInfo?.statusStr as ConnectionFlowStatus,
          ) && setOnlineAvailable
        "
        class="button ml-16px cursor-pointer"
        @click="() => setOnline()"
      >
        <i class="iconfont icon-baocun1"></i>
        {{ t('sys.ipaas.setOnline') }}
      </div>

      <div
        v-if="ConnectionFlowStatus.Online === flowVersionInfo?.statusStr"
        class="button ml-16px cursor-pointer"
        @click="() => setOffline()"
      >
        <i class="iconfont icon-baocun1"></i>
        {{ t('sys.ipaas.setOffline') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ConnectionFlowStatus } from '@gct/flow/src/plugins/ipaas-bpmn/enums';
  import { useFlow } from '/@ipaas/hooks/useFlow';

  const {
    flowBasicInfo,
    flowVersionInfo,
    flowCategoryInfo,
    save,
    setOffline,
    setOnline,
    setOnlineAvailable,
    saveAndPublish,
    debugNodeInfo,
    destroyDebugContext,
  } = useFlow();

  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .flow__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 20px;
    background-color: #1a1d23;

    :deep(.ant-breadcrumb) {
      color: #fff;
      font-size: 14px;

      .ant-breadcrumb-separator {
        color: #fff;
      }

      & > span:last-child {
        color: #fff;
      }
    }

    .button {
      display: flex;
      align-items: center;
      height: 26px;
      padding: 0 12px;
      transition: all 0.3s;
      border-radius: 4px;
      background: #444;
      color: #fff;
      font-size: 12px;
      line-height: 1em;

      i {
        display: flex;
        margin-right: 6px;
        font-size: 12px;
      }

      &:hover {
        background-color: var(--ant-primary-color);
      }
    }
  }
</style>
