<template>
  <div :class="prefixCls">
    <div class="w-80px mr-16px">
      <a-select
        size="small"
        v-model:value="factor"
        @change="handleChange"
        :dropdownStyle="{ zIndex: 3100 }"
      >
        <a-select-option :value="0.5">50%</a-select-option>
        <a-select-option :value="0.75">75%</a-select-option>
        <a-select-option :value="1">100%</a-select-option>
        <a-select-option :value="1.5">150%</a-select-option>
        <a-select-option :value="2">200%</a-select-option>
      </a-select>
    </div>

    <a-tooltip
      :title="isFullScreen ? t('sys.tooltipExitFull') : t('sys.tooltipEntryFull')"
      placement="bottom"
    >
      <span class="mr-8px" @click="toggle">
        <i class="iconfont" :class="[isFullScreen ? 'icon-tuichuquanping' : 'icon-quanping']"></i>
      </span>
    </a-tooltip>

    <a-tooltip :title="t('sys.delete')" placement="bottom">
      <span
        v-if="!workflowProps.readonly"
        class="mr-8px"
        :class="{
          disabled: !deleteValid,
        }"
        @click="handleDeleteSelected"
      >
        <i class="iconfont icon-shanchu2"></i>
      </span>
    </a-tooltip>

    <!-- 隐藏edhr-medpro节点编辑入口  25/01/16 -->
    <a-tooltip :title="t('sys.setting')" placement="bottom">
      <span
        v-if="settingVisible"
        class="mr-8px"
        :class="{
          disabled: !settingValid,
        }"
        @click="handleNodeSetting"
      >
        <i class="iconfont icon-jiedian"></i>
      </span>
    </a-tooltip>

    <!-- 移除分组节点 改为并行路径 by wangcheng 24/02/05 -->
    <!-- <template v-if="!workflowProps.readonly">
      <i class="line mr-8px"></i>
      <a-tooltip :title="t('并行节点')" placement="bottom">
        <span @mousedown="(e) => drag(e, WorkflowNodeTypeEnum.NODE_GROUP)">
          <i class="iconfont icon-bianzu"></i>
        </span>
      </a-tooltip>
    </template> -->

    <!-- <span
      class="ml-8px"
      @click="
        () => {
          console.log(JSON.stringify(workflowData.graph?.toJSON()));
        }
      "
      >toJson</span
    > -->
  </div>
</template>

<script setup lang="ts">
  import { ref, inject, computed } from 'vue';
  import { IWidgetProps, WorkflowNodeTypeEnum } from '../types';
  import { useWorkflow } from '../hooks/useWorkflow';
  import { useEvent } from '../hooks/useEvent';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  defineProps<{
    toggle: any;
    isFullScreen: boolean;
  }>();

  const { t } = useI18n();
  const workflowProps = inject('workflowProps') as IWidgetProps;
  const { workflowData, drag, deleteSelected } = useWorkflow(workflowProps.widgetId);
  // const { workflowData, drag, deleteSelected } = useWorkflow();

  const factor = ref<number>(1);
  const prefixCls = 'wf-header';

  const deleteValid = computed(() => {
    return workflowData.currentCell;
  });

  const settingValid = computed(() => {
    return [WorkflowNodeTypeEnum.NODE_SPEC, WorkflowNodeTypeEnum.NODE_WORKFLOW].includes(
      workflowData.currentCell?.shape,
    );
  });

  const settingVisible = computed(() => {
    const { appInfo } = useAppInfoStore();
    if (appInfo.suiteKey !== 'MEDPRO') {
      return false;
    }
    return !workflowProps.readonly;
  });

  const handleChange = (value) => {
    workflowData.graph?.zoomTo(value);
  };

  const handleDeleteSelected = () => {
    if (!deleteValid.value) return;
    deleteSelected();
  };

  const handleNodeSetting = () => {
    const { settingCallback } = useEvent();
    settingCallback!(workflowData.currentCell?.id);
  };
</script>

<style lang="less" scoped>
  @prefix-cls: ~'wf-header';

  .@{prefix-cls}{
    display: flex;
    align-items: center;

    span:has(.iconfont){
      height: 24px;
      width: 24px;
      transition: all .3s;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      cursor: pointer;

      &:hover:not(.disabled){
        background-color: #E6E6E6;
        color: var(--ant-primary-color);
      }

      &.disabled{
        color: #bfbfbf;
        cursor: not-allowed;
      }

      .iconfont{
        line-height: 1em;
      }
    }

    .line{
      height: 16px;
      border: 1px solid #F0F0F0;
    }
  }
</style>
