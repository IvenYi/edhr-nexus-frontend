<template>
  <div>
    <!-- <div class="flex justify-between items-center">
      <span class="text-14px font-500">输出参数</span>
      <a-button type="link" size="small" @click="handleReturnKeyAdd">添加</a-button>
    </div>
    <div class="mt-8px">
      <a-empty
        v-if="props.nodeData.bizData.nodeConfig.returnKeys?.length === 0"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
      />
      <template v-else>
        <div
          class="return-key-item"
          v-for="(item, index) in props.nodeData.bizData.nodeConfig.returnKeys ?? []"
          :key="index"
        >
          <a-input
            class="w-10px flex-1"
            v-model:value="item.key"
            size="small"
            placeholder="请输入参数键名"
            @change="(e) => handleKeyChange(index, e.target.value)"
          />
          <div
            class="ml-4px h-24px w-24px cursor-pointer flex items-center justify-center"
            @click="() => handleReturnKeyDelete(index)"
          >
            <i class="iconfont icon-shanchu1 lh-[1em] error-color"></i>
          </div>
        </div>
      </template>
    </div> -->

    <a-button
      class="mt-8px"
      size="small"
      :type="buttonType"
      block
      @click="handleScriptEditorOpen"
      >{{ t('sys.ipaas.openScriptEditor') }}</a-button
    >
    <DebugButton v-show="!readonly" :nodeId="nodeData.bizData.nodeId" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import type { GctFlowNode } from '@gct/flow';
  import { GctDialog } from '/@/utils/Dialog';
  import ScriptEditorModal from '../__comps__/script-editor-modal.vue';
  // import { Empty } from 'ant-design-vue';
  import CodeHelper from '/@ipaas/utils/CodeHelper';
  import DebugButton from '../__comps__/debug-button.vue';
  // import estraverse from 'estraverse';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Connector;
    readonly: boolean;
  }>();

  const { t } = useI18n();

  const buttonType = computed(() => {
    return props.nodeData.bizData.nodeConfig.tsCode ? 'primary' : 'default';
  });

  const handleScriptEditorOpen = () => {
    let tsCode = props.nodeData.bizData.nodeConfig.tsCode || '';
    try {
      tsCode = decodeURIComponent(tsCode);
    } catch (err) {
      console.warn(err);
    }

    GctDialog.open(ScriptEditorModal, {
      tsCode,
      arguments: JSON.parse(JSON.stringify(props.nodeData.bizData.nodeConfig.arguments ?? [])),
      readonly: !!props.readonly,
      options: {
        ...(props.readonly ? { footer: null } : {}),
      },
      onOk: (jsCode: string, tsCode: string, args: any[] = []) => {
        if (props.readonly) return;
        props.nodeData.bizData.nodeConfig.tsCode = encodeURIComponent(tsCode);
        props.nodeData.bizData.nodeConfig.script = encodeURIComponent(jsCode);
        props.nodeData.bizData.nodeConfig.arguments = args;

        const returnKeys = CodeHelper.getReturnKeys(jsCode);
        props.nodeData.bizData.nodeConfig.returnKeys = returnKeys;
      },
    });
  };

  const handleReturnKeyAdd = () => {
    if (!props.nodeData.bizData.nodeConfig.returnKeys) {
      props.nodeData.bizData.nodeConfig.returnKeys = [];
    }
    const keyItem = {
      id: '',
      key: '',
      isNew: true,
    };
    props.nodeData.bizData.nodeConfig.returnKeys.push(keyItem);
  };

  const handleReturnKeyDelete = (index: number) => {
    props.nodeData.bizData.nodeConfig.returnKeys.splice(index, 1);
  };

  const handleKeyChange = (index: number, key: string) => {
    const item = props.nodeData.bizData.nodeConfig.returnKeys[index];
    if (item.isNew) {
      item.id = key;
    }
  };
</script>

<style lang="less" scoped>
  .return-key-item {
    padding: 4px;
    border-radius: 4px;
    background-color: #f2f4f7;
    display: flex;
    align-items: center;
    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }
</style>
