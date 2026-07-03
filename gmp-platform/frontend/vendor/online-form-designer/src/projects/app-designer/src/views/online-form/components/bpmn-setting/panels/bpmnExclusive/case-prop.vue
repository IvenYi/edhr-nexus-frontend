<template>
  <div>
    <a-form :model="formState" layout="vertical">
      <SimpleCollapse :title="t('sys.appDesigner.approval.caseSetting')">
        <form-item
          :label="t('sys.appDesigner.approval.caseName')"
          name="name"
          is-first
          :inline="false"
          :rules="[
            {
              required: true,
              message: t('sys.notEmptySth', { sth: t('sys.appDesigner.approval.caseName') }),
            },
          ]"
        >
          <a-input
            v-model:value="formState!.name"
            :maxlength="32"
            show-count
            size="small"
            :disabled="bpmnReadonly"
          />
        </form-item>
      </SimpleCollapse>

      <SimpleCollapse :title="t('sys.appDesigner.approval.caseSetting')">
        <form-item
          :label="t('sys.appDesigner.approval.caseType')"
          name="name"
          is-first
          :inline="false"
        >
          <a-select
            :disabled="bpmnReadonly"
            v-model:value="formState!.type"
            size="small"
            @change="handleCaseTypeChange"
          >
            <a-select-option value="JSON">{{ t('sys.bpmn.caseType.JSON') }}</a-select-option>
            <a-select-option value="FORMULA">{{ t('sys.bpmn.caseType.FORMULA') }}</a-select-option>
          </a-select>
        </form-item>

        <div class="mt-10px">
          <CaseFormula v-if="formState.type === 'FORMULA'" :data="caseFlowNode.caseCfg.formula!" />
          <CaseEditor v-else :data="caseFlowNode.caseCfg.json!" />
        </div>
      </SimpleCollapse>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import CaseEditor from './case-editor.vue';
  import CaseFormula from './case-formula.vue';
  import type { GctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';
  import SimpleCollapse from '../../comps/simple-collapse.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FormItem from '../../comps/form-item.vue';
  import { computed, inject } from 'vue';

  const bpmnReadonly = inject('bpmnReadonly', false);

  const props = defineProps<{
    caseFlowNode: GctBpmnNode.BpmnExclusive['children'][number];
  }>();

  const { t } = useI18n();

  const formState = computed({
    get() {
      return props.caseFlowNode.caseCfg;
    },
    set(value) {
      Object.assign(props.caseFlowNode.caseCfg ?? {}, value);
    },
  });

  const handleCaseTypeChange = (val) => {
    if (val === 'FORMULA' && !formState.value.formula) {
      formState.value.formula = {};
    }
  };
</script>

<style></style>
