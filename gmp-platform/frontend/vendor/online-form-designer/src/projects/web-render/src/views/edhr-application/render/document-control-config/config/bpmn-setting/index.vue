<template>
  <Split class="bpmn-setting" v-model:value="width" position="right">
    <template #left>
      <BpmnDiagram
        :actions="[
          {
            key: BpmnNodeTypeEnum.BpmnApproval,
            name: $t('sys.kit.edhr.approvalNode'),
            icon: 'iconfont:icon-shenpi1',
            color: '#3168ec',
          },
        ]"
      />
      <BpmnVersions class="absolute top-16px left-16px z-10" />
    </template>
    <template #right>
      <div class="bpmn-setting__panel h100%">
        <template v-if="nodeSelectedId && nodeSelectedData">
          <a-tabs v-model:activeKey="activeTab" centered>
            <a-tab-pane key="1" :tab="t('sys.bpmn.prop')">
              <component
                :is="DynamicPropMap[nodeSelectedData.type]"
                :key="nodeSelectedId"
                :node="nodeSelectedData"
              />
            </a-tab-pane>
            <a-tab-pane
              key="2"
              :tab="t('sys.bpmn.perm')"
              v-if="DynamicPermMap[nodeSelectedData.type]"
            >
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
          </a-tabs>
        </template>
      </div>
    </template>
  </Split>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, provide, onBeforeUnmount } from 'vue';
  import { BpmnDiagram, useGctBpmn } from '@gct/flow/src/plugins/bpmn';
  import { useGctFlow } from '@gct/flow';
  import { DynamicPropMap, DynamicPermMap, DynamicEventMap } from './panels';
  import { useBpmnSetting } from './hooks/useBpmnSetting';
  import { ControlConfigResponse } from '/@/apis/gct-apaas/model';
  import BpmnVersions from './comps/bpmn-versions.vue';
  // import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDefaultButtonPermission } from './hooks/useButtonPermission';
  import Split from '/@/components/Split/split.vue';
  import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';

  const width = ref(280);

  const props = defineProps<{
    templateInfo: ControlConfigResponse;
  }>();

  const { t } = useI18n();
  const { nodeSelectedId, nodeSelectedData, setNodeSelected } = useGctFlow();
  const { validateNode } = useGctBpmn();
  useDefaultButtonPermission();
  // const { initMasterModel } = useModelFields();
  const {
    // initFieldList,
    loadBpmnDef,
    getBpmnVerDefDirty,
    saveBpmnVerDef,
    publishBpmnVer,
    bpmnReadonly,
  } = useBpmnSetting();

  const activeTab = ref<string>('1');

  provide('bpmnReadonly', bpmnReadonly);
  // provide('bpmnMainModelKey', props.templateInfo.modelKey);

  onMounted(() => {
    loadBpmnDef(props.templateInfo.procDefId);
  });

  onBeforeUnmount(() => {
    // 清空选中节点，防止二次进入不触发节点 id 监听
    setNodeSelected();
  });

  watch(nodeSelectedId, (_id, oldId) => {
    activeTab.value = '1';
    // 节点切换时 检验上一节点
    oldId && validateNode(oldId);
  });

  // watch(
  //   () => props.templateInfo.modelKey,
  //   async (val) => {
  //     if (val) {
  //       initFieldList(props.templateInfo.modelKey, props.templateInfo.modelName);
  //       initMasterModel({
  //         key: props.templateInfo.modelKey,
  //         name: props.templateInfo.modelName,
  //       });
  //     }
  //   },
  //   { immediate: true },
  // );

  const checkHasUnsaved = () => {
    return getBpmnVerDefDirty();
  };
  const handleSave = async (info) => {
    await saveBpmnVerDef(info);
  };

  const handlePublish = async (opts) => {
    await publishBpmnVer(opts);
  };

  defineExpose({
    checkHasUnsaved,
    handleSave,
    handlePublish,
  });
</script>

<style lang="less" scoped>
  .bpmn-setting {
    display: flex;
    position: relative;
    height: calc(100vh - 54px);

    &__panel {
      // flex-shrink: 0;
      // border-left: 1px solid #e0e3ea;
      background-color: #fff;
    }
  }

  .ant-tabs {
    height: 100%;

    :deep(.ant-tabs-nav) {
      margin-bottom: 0;
    }

    :deep(.ant-tabs-content-holder) {
      height: calc(100% - 46px);
      overflow-y: auto;
    }
  }
</style>
