<template>
  <div class="bpmn-content-panel overflow-hidden" :class="[hidden && 'hidden']">
    <div class="header ks-row-middle h46px px12px">
      <div class="ell ks-col">{{
        nodeSelectedData?.type === 'global'
          ? t('sys.pageDesigner.globalSetting')
          : t('sys.process.nodeSetting')
      }}</div>
      <div class="w14px">
        <close-outlined
          class="text-[#797A7D] cursor-pointer"
          @click="emit('update:hidden', true)"
        />
      </div>
    </div>
    <div class="bpmn-panel-main" v-if="nodeSelectedId && nodeSelectedData">
      <component
        :is="DynamicPropMap[nodeSelectedData.type]"
        :key="nodeSelectedId"
        :node="nodeSelectedData"
      />
      <!-- <a-tabs v-model:activeKey="activeTab" centered>
        <a-tab-pane key="1" :tab="t('sys.bpmn.prop')">
          <component
            :is="DynamicPropMap[nodeSelectedData.type]"
            :key="nodeSelectedId"
            :node="nodeSelectedData"
          />
        </a-tab-pane>
        <a-tab-pane key="2" v-if="DynamicPermMap[nodeSelectedData.type]">
          <template #tab>
            {{ t('sys.appDesigner.fieldRole') }}
            <a-tooltip>
              <template #title>{{ t('sys.process.fieldPermissionTip') }}</template>
              <i class="iconfont icon-assist text-[#C3C3C3] cursor-pointer relative top-1px"></i>
            </a-tooltip>
          </template>
          <component
            :is="DynamicPermMap[nodeSelectedData.type]"
            :key="nodeSelectedId"
            :node="nodeSelectedData"
          />
        </a-tab-pane>
        <a-tab-pane
          key="3"
          :tab="t('sys.bpmn.event')"
          v-if="DynamicEventMap[nodeSelectedData.type]"
        >
          <component
            :is="DynamicEventMap[nodeSelectedData.type]"
            :key="nodeSelectedId"
            :node="nodeSelectedData"
          />
        </a-tab-pane>
      </a-tabs> -->
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, provide, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { DynamicPropMap } from '../panels';
  import { useProcess } from '../hook/useProcess';

  const emit = defineEmits(['update:hidden']);
  const props = defineProps<{
    data?: object;
    hidden: boolean;
  }>();

  const { bpmnReadonly } = useProcess();
  const { t } = useI18n();
  // const activeTab = ref('1');
  provide('paasBpmnReadonly', bpmnReadonly);

  const nodeSelectedId = computed(() => {
    return props.data?.id || new Date().getTime();
  });

  const nodeSelectedData = computed(() => {
    return props.data;
  });

  // watch(
  //   () => nodeSelectedId.value,
  //   () => {
  //     activeTab.value = '1';
  //   },
  // );
</script>
<style lang="less" scoped>
  .b-b {
    border-bottom: 1px solid #e0e3ea;
  }
  .bpmn-panel-main {
    height: calc(100% - 46px);
    overflow: auto;
  }
  .ant-tabs {
    height: 100%;
    :deep(.ant-tabs-nav) {
      margin-bottom: 0;
      .ant-tabs-tab {
        padding: 6px 16px;

        & + & {
          margin-left: 20px;
        }

        &-active {
          position: relative;
          &::after {
            content: ' ';
            display: block;
            width: 16px;
            height: 2px;
            background-color: var(--ant-primary-color);
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      }
      .ant-tabs-ink-bar {
        display: none;
        // width: 16px !important;
      }
    }
    :deep(.ant-tabs-tabpane) {
      font-size: 12px;
      height: calc(100% - 34px);
    }
    :deep(.ant-tabs-content-holder) {
      height: 100%;
      overflow-y: auto;
    }
  }
  :deep(.ant-input.ant-input-sm) {
    font-size: 12px;
    line-height: 1.2;
  }
  :deep(.ant-select-sm) {
    font-size: 12px;
  }
  :deep(textarea.ant-input.ant-input-sm) {
    padding: 4px 7px;
  }
  :deep(.ant-select-selection-placeholder) {
    font-size: 12px;
  }
</style>
