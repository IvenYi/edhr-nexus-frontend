<template>
  <div class="h100% p8px position-relative report">
    <div
      v-if="reportInfo?.reportName"
      class="font600 text-16px title ell"
      :title="reportInfo?.reportName"
    >
      {{ reportInfo?.reportName }}
    </div>
    <ReportTable
      v-if="reportInfo"
      :schema="reportInfo"
      :appId="props.info.appId"
      :isDesign="false"
      :showHeader="!props.isDesign"
      :reportName="reportInfo?.reportName"
    />
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { ReportTable, transformSchemaByData } from '@gct/runtime-web';

  interface Props {
    /** 组件标题 */
    compTitle: string;
    /** 是否是设计器 */
    isDesign?: boolean;
    /**布局信息 */
    info: any;
  }

  const props = defineProps<Props>();

  const reportInfo = ref();

  const getReport = async () => {
    reportInfo.value = await transformSchemaByData(props.info.reportId, {
      transferToConfig: { headers: { 'App-Tag': props.info.appId } },
    });
  };
  onMounted(getReport);
</script>
<style lang="less" scoped>
  .title {
    position: absolute;
    z-index: 2;
    top: 18px;
    left: 24px;
    max-width: calc(100% - 368px);
  }

  .report {
    margin-bottom: -3px;
  }
</style>
