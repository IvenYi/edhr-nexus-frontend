<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="props.node.data" />
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.model.message_tmpl')">
      <form-item
        :label="t('sys.model.message_tmpl')"
        :rules="[{ required: true }]"
        :inline="false"
        is-first
      >
        <a-select
          v-model:value="formState.msgTmplKey"
          :options="tmplOptions"
          :disabled="paasBpmnReadonly"
          :fieldNames="{ label: 'name', value: 'id' }"
          :placeholder="t('sys.chooseText')"
          allow-clear
          size="small"
          style="width: 100%"
          @change="validNodeData(node.id)"
        />
      </form-item>
      <form-item
        v-if="isFrontPage"
        :label="t('sys.process.messagePusher')"
        :inline="false"
        :rules="[{ required: true }]"
      >
        <ApprovalUserSelectConfig
          v-model:modelValue="formState.targetUserConfig"
          :placeholder="t('sys.pleaseSelectSth', { sth: t('sys.process.messagePusher') })"
        />
      </form-item>
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import type { GctBpmnNode } from '@gct/flow/src/plugins/paas-bpmn/types';
  import { computed, inject, onMounted, provide, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import FormItem from '../../components/form-item.vue';
  import ApprovalUserSelectConfig from '../../../online-form/components/bpmn-setting/comps/approval-user-select-config.vue';
  import { getMessageTmplListByModelKey } from '/@/apis/gct-apaas/MessageTmplController';
  import { useProcess } from '../../hook/useProcess';

  const props = defineProps<{
    node: GctBpmnNode.BpmnMessage;
  }>();

  const { processInfo, validNodeData } = useProcess();
  provide('bpmnMainModelKey', processInfo.value.modelKey);
  const { t } = useI18n();
  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  const isFrontPage = inject('isFrontPage', true);
  const tmplOptions = ref<any[]>([]);
  const formState = computed({
    get() {
      return props.node.data!;
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });

  watch(
    () => formState.value.targetUserConfig,
    () => {
      validNodeData(formState.value.key);
    },
  );

  onMounted(() => {
    getMessageTmpl();
  });

  const getMessageTmpl = async () => {
    tmplOptions.value =
      (await getMessageTmplListByModelKey({ modelKey: processInfo.value.modelKey })) || [];
  };
</script>
<style lang="less" scoped></style>
