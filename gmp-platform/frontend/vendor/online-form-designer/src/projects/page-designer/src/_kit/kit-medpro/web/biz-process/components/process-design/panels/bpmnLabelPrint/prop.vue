<template>
  <a-form :model="formState">
    <SimpleCollapse :title="t('sys.appDesigner.approval.basicInfo')">
      <NodeBasicInfo :data="node.data" />
    </SimpleCollapse>
    <SimpleCollapse :title="t('sys.edhr.labelConfig')">
      <form-item
        :label="$t('sys.pageDesigner.labelTemplateRef')"
        :inline="false"
        is-first
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <LabelTmplSelect
          v-model="formState.printTmplId"
          v-model:templateType="formState.templateType"
          :disabled="paasBpmnReadonly"
          size="small"
          @change="onTmplChange"
        />
      </form-item>
      <form-item
        v-if="formState.templateType === 'zpl'"
        :label="$t('sys.pageDesigner.printService')"
        :inline="false"
        :rules="[
          {
            required: formState.templateType === 'zpl',
          },
        ]"
      >
        <PrinterTreeSelect
          v-model="formState.printService"
          :disabled="!formState.printTmplId || formState.templateType !== 'zpl' || paasBpmnReadonly"
          size="small"
        />
      </form-item>
      <form-item
        :label="$t('sys.pageDesigner.printNumber')"
        :inline="false"
        :rules="[
          {
            required: true,
          },
        ]"
      >
        <a-input-number
          v-model:value="formState.printNumber"
          :min="1"
          :precision="0"
          :controls="false"
          :disabled="paasBpmnReadonly"
          size="small"
        />
      </form-item>
    </SimpleCollapse>
  </a-form>
</template>
<script setup lang="ts">
  import SimpleCollapse from '../../components/simple-collapse.vue';
  import NodeBasicInfo from '../../components/node-basic-info.vue';
  import formItem from '../../components/form-item.vue';
  import { computed, inject, onMounted, provide, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/biz-bpmn/types';
  import LabelTmplSelect from '../../components/label-tmpl-select.vue';
  import PrinterTreeSelect from '../../components/printer-tree-select.vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnLabelPrint;
  }>();

  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  provide('bpmnReadonly', paasBpmnReadonly);
  const { t } = useI18n();

  const formState: any = computed({
    get() {
      return props.node.data || {};
    },
    set(value) {
      Object.assign(props.node.data ?? {}, value);
    },
  });


  function onTmplChange(val, opt) {
    console.log('onTmplChange', val, opt);
    if (opt.printType === 'btw') {
      formState.value.printService = undefined;
    }
  }

  onMounted(() => {
    if (!formState.value.printNumber) {
      formState.value.printNumber = 1;
    }
  });
</script>
<style lang="less" scoped></style>
