<template>
  <div v-if="condition">
    {{ condition }}
  </div>
  <div v-else> {{ displayValue }} </div>
</template>
<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    TypeEnum,
    PatternEnum,
  } from '/@app-designer/views/model-desginer/entity/constant/serial';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';

  const { displayValue } = useGlobalSetting();
  const { t } = useI18n();
  const props = defineProps<{ conditionConfig: string }>();

  const condition = computed(() => {
    if (!props.conditionConfig) {
      return '';
    }
    const ruleInfo = JSON.parse(props.conditionConfig);
    const expression = ruleInfo?.specificConfig?.formulaConfig?.expression;
    return expression ? '${' + expression + '}' : '';
  });
</script>
<style lang="scss" scoped></style>
