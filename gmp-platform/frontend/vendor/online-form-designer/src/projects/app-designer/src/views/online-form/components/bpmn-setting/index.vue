<template>
  <Split class="bpmn-setting" v-model:value="width" position="right">
    <template #left>
      <BpmnDiagram :actions="actions" />
      <BpmnVersions :readonly="detailMode" class="absolute top-16px left-16px z-10" />
    </template>
    <template #right>
      <div class="bpmn-setting__panel">
        <template v-if="nodeSelectedId && nodeSelectedData">
          <a-tabs v-model:activeKey="activeTab" centered>
            <a-tab-pane key="1" :tab="t('sys.bpmn.prop')">
              <component
                :is="nodePanelStrategy?.nodeConfig?.[PanelType.PROP]?.component"
                :key="nodeSelectedId"
                :node="nodeSelectedData"
              />
            </a-tab-pane>
            <a-tab-pane
              key="2"
              :tab="t('sys.bpmn.perm')"
              v-if="nodePanelStrategy?.nodeConfig?.[PanelType.PERM]?.visibility"
            >
              <component
                :is="nodePanelStrategy?.nodeConfig?.[PanelType.PERM]?.component"
                :key="nodeSelectedId"
                :node="nodeSelectedData"
              />
            </a-tab-pane>
            <a-tab-pane
              key="3"
              :tab="t('sys.bpmn.event')"
              v-if="nodePanelStrategy?.nodeConfig?.[PanelType.EVENT]?.visibility"
            >
              <component
                :is="nodePanelStrategy?.nodeConfig?.[PanelType.EVENT]?.component"
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
  import { ref, onMounted, watch, provide, onBeforeUnmount, computed } from 'vue';
  import { BpmnDiagram, useGctBpmn } from '@gct/flow/src/plugins/bpmn';
  import { BpmnNodeTypeEnum } from '@gct/flow/src/plugins/bpmn/enums';
  import { useGctFlow } from '@gct/flow';
  // import { DynamicPropMap, DynamicPermMap, DynamicEventMap } from './panels';
  import { useBpmnSetting } from './hooks/useBpmnSetting';
  import { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
  import BpmnVersions from './comps/bpmn-versions.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDefaultButtonPermission } from './hooks/useButtonPermission';
  import Split from '/@/components/Split/split.vue';
  import { useFieldPermission } from '../base-permission/field-permission/use-field-permission';
  import { DesignerType, PanelType } from '../../types/designer-type';
  import { PanelControl } from './panels/control';

  const width = ref(320);

  interface Props {
    templateInfo: OnlineFormTmplResponse;
    designerType?: DesignerType; // Summary：DHR汇总的审批
    detailMode?: boolean;
    actions?: Array<{
      key: BpmnNodeTypeEnum;
      name: string;
      icon: string;
      color: string;
    }>;
  }
  const props = withDefaults(defineProps<Props>(), {
    designerType: DesignerType.ONLINE_FORM,
    detailMode: false,
    actions: () => [
      {
        key: BpmnNodeTypeEnum.BpmnApproval,
        name: $t('sys.bpmn.nodeType.bpmnApproval'),
        icon: 'iconfont:icon-shenpi1',
        color: '#3168ec',
      },
      {
        key: BpmnNodeTypeEnum.BpmnTransaction,
        name: $t('sys.bpmn.nodeType.bpmnTransaction'),
        icon: 'iconfont:icon-fangfa',
        color: '#31B7EC',
      },
      {
        key: BpmnNodeTypeEnum.BpmnExclusive,
        name: $t('sys.bpmn.nodeType.bpmnExclusive'),
        icon: 'iconfont:icon-fenzhi',
        color: '#088c49',
      },
      {
        key: BpmnNodeTypeEnum.BpmnJudge,
        name: $t('sys.bpmn.nodeType.bpmnJudge'),
        icon: 'iconfont:icon-panduan',
        color: '#0D70AF',
      },
      {
        key: BpmnNodeTypeEnum.BpmnParallel,
        name: $t('sys.bpmn.nodeType.bpmnParallelReal'),
        icon: 'iconfont:icon-binghangfenzhi',
        color: '#FF980E',
      },
      {
        key: BpmnNodeTypeEnum.BpmnMessage,
        name: $t('sys.appDesigner.msgNotification'),
        icon: 'iconfont:icon-xiaoxitongzhi',
        color: '#6931ec',
      },
    ],
  });

  // 初始化字段权限配置需要的数据，只有modelKey有值时才初始化，组件共用，有些地方不需要这个功能
  if (props.templateInfo.modelKey) {
    const c = useFieldPermission(props.templateInfo.modelKey!);
    provide('FieldPermissionController', c);
    c.init({ designerJson: props.templateInfo.designerJson });
  }

  const { t } = useI18n();
  const { nodeSelectedId, nodeSelectedData, setNodeSelected } = useGctFlow();
  const { validateNode } = useGctBpmn();
  useDefaultButtonPermission();
  const { initMasterModel } = useModelFields();
  const {
    initFieldList,
    loadBpmnDef,
    getBpmnVerDefDirty,
    saveBpmnVerDef,
    publishBpmnVer,
    bpmnReadonly,
    setDetailMode,
  } = useBpmnSetting();

  const activeTab = ref<string>('1');

  const nodeType = computed(() => {
    if (
      nodeSelectedData.value?.type === BpmnNodeTypeEnum.BpmnApproval &&
      props.designerType === DesignerType.BIZ_PROCESS_TEMPLATE
    ) {
      return `${nodeSelectedData.value.type}Summary`;
    }
    return nodeSelectedData.value?.type;
  });
  const nodePanelStrategy = computed(() => {
    if (!nodeType.value) return;

    return PanelControl.setNodesPanelStrategy({
      designerType: props.designerType,
      nodeType: nodeType.value,
    });
  });

  provide('bpmnReadonly', bpmnReadonly);
  provide('bpmnMainModelKey', props.templateInfo.modelKey);

  onMounted(() => {
    loadBpmnDef(props.templateInfo.id);
    setDetailMode(props.detailMode);
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

  watch(
    () => props.templateInfo.modelKey,
    async (val) => {
      if (val) {
        initFieldList(props.templateInfo.modelKey, props.templateInfo.modelName);
        initMasterModel({
          key: props.templateInfo.modelKey,
          name: props.templateInfo.modelName,
        });
      }
    },
    { immediate: true },
  );

  const checkHasUnsaved = () => {
    return getBpmnVerDefDirty();
  };
  const handleSave = async () => {
    await saveBpmnVerDef({ designerType: props.designerType });
  };

  const handlePublish = async (opts = {}) => {
    await publishBpmnVer({ ...opts, designerType: props.designerType });
  };

  defineExpose({
    checkHasUnsaved,
    handleSave,
    handlePublish,
  });
</script>

<style lang="less" scoped>
  .bpmn-setting {
    height: calc(100vh - 54px);
    display: flex;
    position: relative;

    &__panel {
      // flex-shrink: 0;
      // border-left: 1px solid #e0e3ea;
      background-color: #fff;
      height: 100%;
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
