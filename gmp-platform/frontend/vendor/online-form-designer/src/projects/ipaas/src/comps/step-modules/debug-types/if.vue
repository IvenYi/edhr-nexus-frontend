<template>
  <div>
    <a-form ref="formRef" :model="caseData" autocomplete="off" layout="vertical">
      <a-form-item :label="$t('sys.ipaas.judgeResult')">
        <span class="log-status" :class="'log-status--' + Number(caseData.output?.body ?? 0)">
          {{ caseData.output?.body ? $t('sys.true') : $t('sys.false') }}
        </span>
      </a-form-item>
      <a-form-item :label="$t('sys.ipaas.executeTime')">
        {{ caseData.endTime && caseData.startTime ? caseData.endTime - caseData.startTime : '' }}
        ms
      </a-form-item>
      <a-form-item :label="$t('sys.ipaas.executeDetail')">
        <case-translate :data="caseData?.input" />
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import { useFlow } from '../../../hooks/useFlow';
  import CaseTranslate from '../__comps__/case-translate.vue';

  const props = defineProps<{
    caseId: string;
  }>();

  const { debugNodeMap } = useFlow();

  const caseData = computed(() => {
    return debugNodeMap.value[props.caseId];
  });
</script>
<style lang="less" scoped>
  .log-status {
    &--1 {
      color: var(--ant-success-color);
    }

    &--0 {
      color: var(--ant-error-color);
    }
  }
</style>
