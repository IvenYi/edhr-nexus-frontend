<template>
  <div class="overflow-hidden">
    <div class="h100% overflow-auto pt12px pb12px">
      <div
        @click="handleSelect(item)"
        class="app-item relative"
        :class="[item.key === nodeData?.data?.case && 'selected']"
        v-for="item in cases"
        :key="item.key"
      >
        <div class="app-icon">
          <!-- <IconNext :value="item.icon" :size="24" class="app-icon-next" /> -->
          <i class="iconfont icon-fasong"></i>
        </div>
        <div class="overflow-hidden ks-col">
          <div class="title gct-text-overflow">{{ item.title }}</div>
          <div class="gct-text-overflow">{{ item.desc }}</div>
        </div>
        <i v-if="item.key === nodeData?.data?.case" class="iconfont icon-xuanze selected-icon"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useGctFlow } from '@gct/flow';
  // import { PanelStep, NodeBizDataSchemaMap, IPaasNodeType } from '/@/components/ConnectionFlow';
  // import { IconNext } from '/@/components/Icon';

  const emit = defineEmits(['nextStep']);

  const { nodeData } = useGctFlow();

  const cases = computed(() => {
    const type = nodeData.value?.type;
    const service = nodeData.value?.data.service;
    if (type && service) {
      return NodeBizDataSchemaMap[type].config.cases[service] ?? [];
    } else {
      return null;
    }
  });

  const handleSelect = (item) => {
    if (nodeData.value) {
      nodeData.value.data.case = item.key;
      nodeData.value.data.step = PanelStep.Setting;
      nodeData.value.tooltips && (nodeData.value.tooltips = []);
      if (nodeData.value?.data.service === IPaasNodeType.Http) {
        nodeData.value.data.nodeConfig.httpMethod = item.key;
      }
    }
    emit('nextStep', PanelStep.Setting);
  };
</script>

<style lang="less" scoped>
  .app-item {
    font-size: 12px;
    color: #797a7d;
    width: calc(100% - 24px);
    height: 62px;
    /* line-height: 62px; */
    margin-left: 12px;
    margin-right: 12px;
    padding: 0 12px;
    border: 1px solid #e0e3ea;
    border-radius: 4px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    cursor: pointer;

    & + .app-item {
      margin-top: 8px;
    }

    .app-icon {
      color: var(--ant-primary-color);
      width: 40px;
      height: 40px;
      border-radius: 4px;
      border: 1px solid var(--ant-primary-color);
      margin-right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: hsl(from var(--ant-primary-color) h s 95%);
    }
    .app-icon-next {
      color: var(--ant-primary-color);
    }

    .selected-icon {
      color: var(--ant-primary-color);
      font-size: 12px;
      position: absolute;
      right: -6px;
      top: -6px;
      line-height: 1;
      background-color: #fff;
      border-radius: 50%;
      height: 10px;
    }

    &:hover {
      background-color: hsl(from var(--ant-primary-color) h 24% 96%);
      .title {
        color: #212528;
        font-weight: 500;
      }
    }
    &.selected {
      background-color: hsl(from var(--ant-primary-color) h s 96%);
      border-color: var(--ant-primary-color);
      .title {
        color: #212528;
        font-weight: 500;
      }
    }
  }
</style>
