<template>
  <div class="page-report">
    <div class="title">{{ name }}</div>
    <ReportData
      :isDesign="false"
      :schema="schema"
      v-if="!!schema"
      :reportName="name"
      :appId="appId"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { ReportData } from './report-table';
  import { useRoute } from 'vue-router';
  import { transformSchemaByData } from '../schema';

  const route = useRoute();
  const schema = ref();
  const id = route.params.id as string;
  const appId = route.query.appId as string;
  const name = ref();
  onMounted(async () => {
    if (!id) return;
    /**新页面跳转 */
    schema.value = await transformSchemaByData(
      id,
      appId
        ? {
            transferToConfig: { headers: { 'App-Tag': appId } },
          }
        : {},
    );
    name.value = schema.value!.reportName;
  });
</script>
<style scoped lang="less">
  .page-report {
    height: 100%;
    padding-top: 40px;

    .title {
      margin-top: -24px;
      padding: 0 16px;
      font-weight: 600;
    }
  }
</style>
