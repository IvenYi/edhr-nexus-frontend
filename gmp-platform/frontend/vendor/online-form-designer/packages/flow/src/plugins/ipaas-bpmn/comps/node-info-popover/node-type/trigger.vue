<template>
  <div class="node-popover w238px">
    <template v-if="configData?.endpointType === EndpointType.webhook">
      <div class="node-popover-item">
        <div class="node-popover-label">请求方式：</div>
        <div class="node-popover-content">{{ configData?.requestMethod }}</div>
      </div>
      <div class="node-popover-item">
        <div class="node-popover-label">响应方式：</div>
        <div class="node-popover-content">
          {{ $t('sys.ipaas.responseMethod.' + configData?.responseMethod) }}
        </div>
      </div>
    </template>
    <template v-if="configData?.quartzType === QuartzType.CRON">
      <div class="node-popover-item">
        <div class="node-popover-label">cron：</div>
        <div class="node-popover-content" :title="configData?.cronPattern">
          {{ configData?.cronPattern }}
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
  import { GctBpmnNode } from '../../../types';
  import { EndpointType, QuartzType } from '../../../enums';

  defineProps<{
    node: GctBpmnNode.BpmnTrigger;
    configData: any;
  }>();
</script>
<style lang="less" scoped></style>
