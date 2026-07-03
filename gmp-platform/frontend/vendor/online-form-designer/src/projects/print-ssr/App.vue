<script setup lang="ts">
  import { ref, computed } from 'vue';
  import ExcelPrintRender from './components/ExcelPrintRender.vue';
  import WordPrintRender from './components/WordPrintRender.vue';
  import { OfficeTypeEnum } from '@gct/nocode-base';

  //QE5YfBF2dCeDtkCd
  const queryParams = new URLSearchParams(location.search);
  const queryInstId = ref<string | null>(queryParams.get('inst'));
  const queryType = ref<string>(queryParams.get('type') || 'INST');
  const queryOfficeType = ref<string | null>(queryParams.get('officeType'));
  const queryModelKey = ref<string>(queryParams.get('modelKey') || '');
  const appTag = ref<string | null>(queryParams.get('appTag'));
  // 如果存在appTag，则添加到请求头中
  if (appTag.value) {
    sessionStorage.setItem('customRequestHeader', JSON.stringify({ 'App-Tag': appTag.value }));
  }

  const comp = computed(() => {
    if (queryOfficeType.value === OfficeTypeEnum.EXCEL) return ExcelPrintRender;
    if (queryOfficeType.value === OfficeTypeEnum.WORD) return WordPrintRender;
    return null;
  });
</script>

<template>
  <component
    :is="comp"
    v-if="comp && queryInstId"
    :inst="queryInstId"
    :type="queryType"
    :modelKey="queryModelKey"
    :paramExtraProps="{ _gct_useDynRowHeight_: true }"
  />
  <div v-else>No Data</div>
</template>
