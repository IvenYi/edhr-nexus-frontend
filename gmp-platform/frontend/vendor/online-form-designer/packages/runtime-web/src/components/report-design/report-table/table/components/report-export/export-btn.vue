<template>
  <a-dropdown overlayClassName="export-table">
    <more-outlined />
    <template #overlay>
      <a-menu>
        <a-sub-menu key="1" :title="$t('sys.export')" v-if="exportTable">
          <a-menu-item v-for="i in exportOptions" :key="i" @click="exportExcel(i)">{{
            exportMap[i]
          }}</a-menu-item>
        </a-sub-menu>
        <a-menu-item @click="emit('reload')">{{ $t('sys.report.refreshData') }}</a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs';
  import { ExportTypeEnum } from './export-hook';
  import exportConfig from './export-config.vue';
  // defineProps is a compiler macro, no import needed

  const props = defineProps({
    reportName: {
      type: String,
      default: window.$t('sys.report.untitledReport'),
    },
    reportType: {
      type: String,
      default: window.$t('sys.report.report'),
    },
    exportTable: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits(['reload', 'exportExcel']);
  const exportMap = {
    [ExportTypeEnum.EXCEL]: window.$t('sys.report.exportExcel'),
    [ExportTypeEnum.PNG]: window.$t('sys.report.exportImage'),
    [ExportTypeEnum.PDF]: window.$t('sys.report.exportPdf'),
  };
  const exportOptions = [ExportTypeEnum.EXCEL, ExportTypeEnum.PNG, ExportTypeEnum.PDF];

  // 生成导出文件名称
  function generateFileName(exportType) {
    const reportName = props.reportName || window.$t('sys.report.untitledReport');
    const reportType = props.reportType || window.$t('sys.report.report');
    const dateTime = dayjs().format('YYYYMMDDHHmm');

    return `${reportName}_${reportType}_${dateTime}`;
  }

  async function exportExcel(exportType) {
    const fileName = generateFileName(exportType);

    if (exportType !== ExportTypeEnum.EXCEL) {
      emit('exportExcel', {
        exportType,
        config: { filename: fileName },
      });
      return;
    }

    const res = await gct.openUtil.modal(
      exportConfig,
      {},
      {
        width: 640,
        title: exportMap[exportType],
        okText: window.$t('sys.okText'),
      },
    );

    if (res.ok) {
      // 合并用户配置和文件名
      const config = {
        ...res.data,
        filename: fileName,
      };
      emit('exportExcel', { exportType, config });
    }
  }
</script>
<style scoped lang="less"></style>
