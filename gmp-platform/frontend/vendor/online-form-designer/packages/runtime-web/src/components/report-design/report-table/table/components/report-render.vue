<template>
  <div class="link-report">
    <iframe :src="url" v-if="url"></iframe>
    <ReportData :isDesign="false" :schema="schema" v-else :reportName="reportName" :appId="appId" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { ReportData } from '../../report-table';

  const props = defineProps<{
    schema: any;
    url?: string;
    reportName: string;
    appId?: string;
  }>();
</script>
<style scoped lang="less">
  .link-report {
    height: 600px;

    iframe {
      width: 100%;
      height: 100%;
    }
  }
</style>
