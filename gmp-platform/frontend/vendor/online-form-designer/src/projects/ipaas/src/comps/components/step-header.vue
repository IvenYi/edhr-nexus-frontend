<template>
  <div
    class="ks-row step-header"
    :style="{
      '--border-color': color,
      '--bg-color': bgColor,
    }"
  >
    <div class="icon-box">
      <IconNext :value="icon" :color="color" :size="24" />
    </div>
    <div class="overflow-hidden">
      <template v-if="nodeData?.type === FlowNodeTypeEnum.App">
        <div class="text-[#797A7D] gct-text-overflow">
          N{{ idx }}.<template v-if="!nodeData?.data.service">{{ $t('sys.pleaseSelect', { sth: $t('sys.ipaas.executeApp') }) }}</template
          ><template v-else>{{ nodeData?.data.service }}</template>
        </div>
        <div class="text-[#C3C3C3] gct-text-overflow">
          <template v-if="!nodeData?.data.service">{{ $t('sys.pleaseSelect', { sth: $t('sys.ipaas.action') }) }}</template>
          <template v-else-if="!!nodeData?.data.service && !nodeData?.data.case">
            {{ $t('sys.pleaseSelect', { sth: $t('sys.ipaas.triggerOperation') }) }}
          </template>
          <template v-else-if="!!nodeData?.data.service && nodeData?.data.case">
            {{ selectedCase.title }}
          </template>
        </div>
      </template>
      <template v-else-if="nodeData?.type === FlowNodeTypeEnum.Bool">
        <div class="text-[#797A7D] gct-text-overflow"> N{{ idx }}.{{ $t('sys.ipaas.judge') }} </div>
        <div class="text-[#C3C3C3] gct-text-overflow">{{ $t('sys.pleaseSetSth', { sth: $t('sys.ipaas.condition.judge') }) }}</div>
      </template>
      <template v-else-if="nodeData?.type === FlowNodeTypeEnum.Switch">
        <div class="text-[#797A7D] gct-text-overflow"> N{{ idx }}.{{ $t('sys.ipaas.branch') }} </div>
        <div class="text-[#C3C3C3] gct-text-overflow">{{ $t('sys.ipaas.addConditionTip') }}</div>
      </template>
      <template v-else-if="nodeData?.type === FlowNodeTypeEnum.Condition">
        <div class="text-[#797A7D] gct-text-overflow"> N{{ idx }}.{{ $t('sys.ipaas.condition.index') }} </div>
        <div class="text-[#C3C3C3] gct-text-overflow">{{ $t('sys.pleaseSetSth', { sth: $t('sys.ipaas.condition.branch') }) }}</div>
      </template>
      <template v-else-if="nodeData?.type === FlowNodeTypeEnum.Loop">
        <div class="text-[#797A7D] gct-text-overflow"> N{{ idx }}.{{ $t('sys.ipaas.loop') }} </div>
        <div class="text-[#C3C3C3] gct-text-overflow">{{ $t('sys.pleaseSetSth', { sth: $t('sys.ipaas.condition.loop') }) }}</div>
      </template>
      <template v-else-if="nodeData?.type === FlowNodeTypeEnum.End">
        <div class="text-[#797A7D] gct-text-overflow"> N{{ idx }}.{{ $t('sys.ipaas.end') }} </div>
        <div class="text-[#C3C3C3] gct-text-overflow">{{ $t('sys.ipaas.endRunningProcess') }}</div>
      </template>
      <template v-else>
        <div class="text-[#797A7D] gct-text-overflow"> N{{ idx }}.{{ $t('sys.ipaas.apiResponse') }} </div>
        <div class="text-[#C3C3C3] gct-text-overflow">{{ $t('sys.pleaseSetSth', { sth: $t('sys.ipaas.responseParams') }) }}</div>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import { IconNext } from '/@/components/Icon';
  import { IconType, IconTypeColor, IconTypeBgColor, FlowNodeTypeEnum } from '@gct/flow/src/enums';
  import { useGctFlow } from '@gct/flow';
  import { NodeBizDataSchemaMap } from '/@/components/ConnectionFlow';

  const { nodeData, gctFlowDataMap } = useGctFlow();

  const icon = computed(() => {
    return nodeData.value?.type ? IconType[nodeData.value?.type] : '';
  });

  const color = computed(() => {
    return nodeData.value?.type ? IconTypeColor[nodeData.value?.type] : '';
  });

  const bgColor = computed(() => {
    return nodeData.value?.type ? IconTypeBgColor[nodeData.value?.type] : '';
  });

  const idx = computed(() => {
    return nodeData.value?.id ? gctFlowDataMap.value[nodeData.value?.id].idx + 1 : 1;
  });

  const selectedCase = computed(() => {
    const type = nodeData.value?.type;
    const service = nodeData.value?.data.service;
    if (type && service) {
      const cases = NodeBizDataSchemaMap[type].config.cases[service] ?? [];
      return cases.filter((e) => e.key === nodeData.value?.data.case)[0] || {};
    } else {
      return {};
    }
  });
</script>
<style lang="less" scoped>
  .step-header {
    align-items: center;
    padding: 4px 8px;
    background-color: #f2f4f7;
    font-size: 12px;

    .icon-box {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      margin-right: 8px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--bg-color);
      line-height: 1;
    }
  }
</style>
