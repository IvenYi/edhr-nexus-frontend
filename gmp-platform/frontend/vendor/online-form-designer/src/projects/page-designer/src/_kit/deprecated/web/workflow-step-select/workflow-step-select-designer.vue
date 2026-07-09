<template>
  <a-form-item :label="labelName" :required="widget.props.required">
    <a-select v-if="!widget.props.readonly"></a-select>
    <span v-else>{{ t('sys.pageDesigner.sampleText') }}</span>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-workflow-step-select">
  import { computed } from 'vue';
  import { IWorkflowStepSelect } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n();
  const props = defineProps<{
    widget: IWorkflowStepSelect;
  }>();
  const labelName = computed(() => {
    const map = {
      'em_txn_move&&next': t('sys.kit.nextStep'),
      'em_txn_rework&&next': t('sys.kit.reworkStep'),
    };
    return map[props.widget.props.usage!]
      ? map[props.widget.props.usage!]
      : t('sys.kit.currentStep');
  });
</script>

<style scoped></style>
