<template>
  <div class="overflow-hidden">
    <div class="h100% overflow-auto pt12px">
      <div
        v-for="item in appList"
        :key="item.type"
        class="app-item relative"
        :class="[item.type === node.data?.service && 'selected']"
        @click="changeApp(item)"
      >
        <div class="app-icon">
          <IconNext :value="item.icon" :size="16" class="app-icon-next" />
        </div>
        <div class="gct-text-overflow">{{ item.type }}</div>
        <i v-if="item.type === node.data?.service" class="iconfont icon-xuanze selected-icon"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  // import { BuiltinApp } from '/@ipaas/constants';
  import type { GctFlowNode } from '@gct/flow';
  // import { PanelStep } from '/@/components/ConnectionFlow';
  import { IconNext } from '/@/components/Icon';
  import { useGctFlow } from '@gct/flow';

  const emit = defineEmits(['nextStep', 'appChange']);

  const { gctFlowData } = useGctFlow();

  const props = defineProps<{
    node: GctFlowNode.Basic;
  }>();

  const appList = computed(() => {
    return BuiltinApp.filter((e) => {
      if (props.node.id === gctFlowData.value?.children[0].id) {
        return e.onlyStart;
      } else return !e.onlyStart;
    });
  });

  const changeApp = (app) => {
    if (app.type !== props.node.data.service) {
      props.node.data.service = app.type;
      props.node.data.case = '';
    }
    props.node.data.step = PanelStep.SelectCase;
    emit('nextStep', PanelStep.SelectCase);
    emit('appChange', app);
  };
</script>

<style lang="less" scoped>
  .app-item {
    font-size: 12px;
    color: #797a7d;
    width: (50% - 4px);
    height: 40px;
    line-height: 40px;
    margin-bottom: 8px;
    padding: 0 8px;
    border: 1px solid #e0e3ea;
    border-radius: 4px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    cursor: pointer;

    &:nth-child(n) {
      margin-left: 12px;
      margin-right: 4px;
    }
    &:nth-child(2n) {
      margin-left: 4px;
      margin-right: 12px;
    }

    .app-icon {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .app-icon-next {
      color: var(--ant-primary-color);
      margin-right: 8px;
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
      background-color: hsl(from var(--ant-primary-color) h s 96%);
    }
    &.selected {
      background-color: hsl(from var(--ant-primary-color) h s 96%);
      border-color: var(--ant-primary-color);
    }
  }
</style>
