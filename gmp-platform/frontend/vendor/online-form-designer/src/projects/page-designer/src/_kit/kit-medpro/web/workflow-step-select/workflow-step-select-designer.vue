<template>
  <a-form-item :label="labelName" :required="widget.props.required">
    <a-select v-if="!widget.props.readonly" />
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
    return props.widget.props.label;
  });
</script>

<style scoped></style>
