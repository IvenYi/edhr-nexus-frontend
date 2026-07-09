<template>
  <div class="wf-panel">
    <a-tabs>
      <a-tab-pane key="1" :tab="$t('sys.workflow.spec')">
        <div class="pl-12px pr-12px pb-5px"
          ><a-input-search placeholder="按名称搜索" enter-button @search="onSpecSearch" allow-clear
        /></div>
        <a-tree
          class="--two-level-tree"
          :load-data="onLoadSpec"
          :tree-data="specTreeData"
          block-node
          v-model:expanded-keys="specExpandKeys"
        >
          <template #title="data">
            <div
              class="flex items-center"
              @mousedown="(e) => drag(e, WorkflowNodeTypeEnum.NODE_SPEC, data)"
            >
              <span
                class="list-cell-text-overflow"
                :title="`${data.base_id_ ? data.version_ : data.name_}`"
                >{{ data.base_id_ ? data.version_ : data.name_ }}</span
              >
              <span class="default-version" v-if="!!data.default_">{{
                $t('sys.pageDesigner.default')
              }}</span>
            </div>
          </template>
        </a-tree>
      </a-tab-pane>

      <!-- TODO: 先隐藏子流程 -->
      <!-- <a-tab-pane key="2" :tab="$t('sys.workflow.subWorkflow')">
        <div class="pl-12px pr-12px pb-5px"
          ><a-input-search
            placeholder="按名称搜索"
            enter-button
            @search="onWorkflowSearch"
            allow-clear
        /></div>
        <a-tree
          class="--two-level-tree"
          :load-data="onLoadWorkflow"
          :tree-data="workflowTreeData"
          block-node
        >
          <template #title="data">
            <div
              class="flex items-center"
              @mousedown="(e) => drag(e, WorkflowNodeTypeEnum.NODE_WORKFLOW, data)"
            >
              <span
                class="list-cell-text-overflow"
                :title="`${data.base_id_ ? data.version_ : data.name_}`"
                >{{ data.base_id_ ? data.version_ : data.name_ }}</span
              >
              <span class="default-version" v-if="!!data.default_">{{
                $t('sys.pageDesigner.default')
              }}</span>
            </div>
          </template>
        </a-tree>
      </a-tab-pane> -->
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

  const props = defineProps<{
    designMode?: boolean;
  }>();

  const workflowProps = inject('workflowProps') as IWidgetProps;

  const specExpandKeys = ref<string[]>([]);

  console.log('workflowProps.modelKey', workflowProps.modelKey);

  const specTreeData = ref<TreeProps['treeData']>([]);
  let specTreeDataBak: any[] = [];
  const workflowTreeData = ref<TreeProps['treeData']>([]);
  let workflowTreeDataBak: any[] = [];

  const Event = getPageEvent();
  const { drag } = useWorkflow(workflowProps.widgetId, Event);

  const { refModelKey, getRefModelKey, getSpecChildren } = useSpec(workflowProps);

  watch(
    () => workflowProps.modelKey,
    async (value) => {
      if (props.designMode) return;
      if (!value) return;
      getRefModelKey();
      // getWorkflowTree();
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
      getSpecTree();
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
   * 工艺数据
   */
  const getSpecTree = async () => {
    let data = await Event.context.$httpBizService(
      {
        action: 'rdoListAll',
        key: refModelKey.value!,
      },
      {},
    );
    specTreeDataBak = (data.data ?? []).map((item) => {
      return {
        ...item,
        isLeaf: false,
        key: item.id_,
      };
    });
    specTreeData.value = specTreeDataBak;
  };

  const onLoadSpec: TreeProps['loadData'] = async (treeNode) => {
    if ((treeNode.dataRef!.children ?? []).length > 0) return;
    const data = await getSpecChildren(treeNode.id_);
    treeNode.dataRef!.children = data;
    specTreeData.value = [...specTreeData.value];
  };

  /**
   * 子流程数据
   */
  async function getWorkflowTree() {
    let data = await Event.context.$httpBizService(
      {
        action: 'rdoListAll',
        key: workflowProps.modelKey,
      },
      {},
    );
    workflowTreeDataBak = (data.data ?? []).map((item) => {
      return {
        ...item,
        isLeaf: false,
        key: item.id_,
      };
    });
    workflowTreeData.value = workflowTreeDataBak;
  }
  async function getWorkflowChildren(id) {
    const data = (await Event.context.$httpBizService(
      { action: 'rdoListAllVersion', key: workflowProps.modelKey },
      {
        query: {
          base_id_: id,
        },
      },
    )) as { data: any[] };
    return data.data.map((i) => {
      return { ...i, isLeaf: true, key: i.id_ };
    });
  }
  const onLoadWorkflow: TreeProps['loadData'] = async (treeNode) => {
    if ((treeNode.dataRef!.children ?? []).length > 0) return;
    const data = await getWorkflowChildren(treeNode.id_);
    treeNode.dataRef!.children = data;
    workflowTreeData.value = [...workflowTreeData.value];
  };

  const onSpecSearch = (value) => {
    const key = value?.trim();
    if (!key) {
      specTreeData.value = specTreeDataBak;
      return;
    }
    specTreeData.value = specTreeDataBak.filter((item) => item.name_.includes(key));
  };

  const onWorkflowSearch = (value) => {
    const key = value?.trim();
    if (!key) {
      workflowTreeData.value = workflowTreeDataBak;
      return;
    }
    workflowTreeData.value = workflowTreeDataBak.filter((item) => item.name_.includes(key));
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
