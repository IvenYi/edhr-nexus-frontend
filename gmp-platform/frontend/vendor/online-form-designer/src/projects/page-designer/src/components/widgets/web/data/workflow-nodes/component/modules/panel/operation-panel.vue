<template>
  <div class="wf-panel">
    <a-tabs>
      <a-tab-pane key="1" :tab="$t('sys.workflow.operation')">
        <div class="pl-12px pr-12px pb-5px">
          <a-input-search
            placeholder="按名称搜索"
            enter-button
            @search="onDataSearch"
            allow-clear
          />
        </div>

        <a-list class="list-all" size="small" :data-source="specTreeData">
          <template #renderItem="{ item }">
            <a-list-item
              class="list-cell-item"
              @touchstart="(e) => drag(e, WorkflowNodeTypeEnum.NODE_SPEC, item)"
              @mousedown="(e) => drag(e, WorkflowNodeTypeEnum.NODE_SPEC, item)"
            >
              <span class="list-cell-text-overflow">{{ item.name_ }}</span>
            </a-list-item>
          </template>
        </a-list>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, inject, watch, onMounted, nextTick } from 'vue';
  import type { TreeProps } from 'ant-design-vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { IWidgetProps, WorkflowNodeTypeEnum } from '../../types';
  import { useWorkflow } from '../../hooks/useWorkflow';
  import { useSpec } from '../../hooks/useSpec';
  import { specData } from '../../data';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';

  const props = defineProps<{
    designMode?: boolean;
  }>();

  const workflowProps = inject('workflowProps') as IWidgetProps;

  const specExpandKeys = ref<string[]>([]);

  console.log('workflowProps.modelKey', workflowProps.modelKey);

  const specTreeData = ref<TreeProps['treeData']>([]);
  let specTreeDataBak: any[] = [];

  const Event = getPageEvent();
  const { drag } = useWorkflow(workflowProps.widgetId, Event);

  const { refModelKey, getRefModelKey } = useSpec(workflowProps);

  watch(
    () => workflowProps.modelKey,
    async (value) => {
      if (props.designMode) return;
      if (!value) return;
      getRefModelKey();
    },
    {
      immediate: true,
    },
  );

  watch(
    refModelKey,
    async (value) => {
      if (props.designMode) return;
      if (!value) return;
      await nextTick();
      getTreeData();
    },
    {
      immediate: true,
    },
  );

  onMounted(() => {
    if (props.designMode) {
      specTreeData.value = specData;
      specExpandKeys.value = specData.map((i) => i.key as string);
    }
  });

  /**
   * 工序数据
   */
  const getTreeData = async () => {
    let data = await postBizServiceByModelKeyByBsKey(
      {
        bsKey: 'listAll',
        modelKey: refModelKey.value!,
      },
      {
        query: {
          'operating_state_.eq': true,
        },
        sorts: [{ sortField: 'create_time_', sortType: 'desc' }],
      },
    );
    specTreeDataBak = (data.data ?? []).map((item) => {
      return {
        ...item,
        key: item.id_,
      };
    });
    specTreeData.value = specTreeDataBak;
  };

  const onDataSearch = (value) => {
    const key = value?.trim();
    if (!key) {
      specTreeData.value = specTreeDataBak;
      return;
    }
    specTreeData.value = specTreeDataBak.filter((item) => item.name_.includes(key));
  };
</script>

<style lang="less" scoped>
  .ant-tabs {
    height: 100%;

    :deep(.ant-tabs-nav) {
      padding-left: 16px;
    }

    :deep(.ant-tabs-content) {
      height: 100%;
      overflow-y: auto;
    }
  }

  .default-version {
    height: 20px;
    line-height: 20px;
    padding: 0 6px;
    color: var(--ant-primary-color);
    font-size: 12px;
    background-color: var(--ant-primary-3);
    border-radius: 2px;
    display: block;
    margin-left: 6px;
  }

  .list-cell-item {
    cursor: move;
    &:hover {
      background-color: #f5f5f5;
    }
  }

  .list-cell-text-overflow {
    display: -webkit-inline-box;
    display: -moz-inline-box;
    display: inline-flexbox;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: normal;
    -webkit-line-clamp: var(--text-rows, 1);
    line-clamp: var(--text-rows, 1);
    -webkit-box-orient: vertical;
    -moz-box-orient: vertical;
    box-orient: var(--text-rows, 1);
    &:hover {
      background-color: transparent;
    }
  }
</style>

<style lang="less">
  .--two-level-tree {
    --height: 32px;
    .ant-tree-treenode {
      padding: 0;
      &:hover {
        background: #f5f5f5;
      }
    }
    .ant-tree-switcher {
      line-height: var(--height);
      padding-left: 10px;
    }
    .ant-tree-node-content-wrapper {
      padding: 0;
      cursor: move;
      height: var(--height);
      line-height: var(--height);
      padding: 0 8px;
      width: 10px;
      &:hover {
        background-color: transparent;
      }
    }
    .ant-tree-node-selected {
      background-color: transparent !important;
    }
    .ant-tree-treenode:has(.ant-tree-switcher-noop) {
      .ant-tree-indent {
        display: none;
      }
    }
  }
</style>
