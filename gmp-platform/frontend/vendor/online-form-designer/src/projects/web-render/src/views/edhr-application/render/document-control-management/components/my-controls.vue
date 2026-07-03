<template>
  <ControlTable
    :columns="columnDefinitions"
    :api="getDocControlTaskTodoPageList"
    :type="controlMangementEnum.controls"
  />
</template>
<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { controlMangementEnum } from '../enums';
  import ControlTable from './table.vue';
  import { getDocControlTaskTodoPageList } from '/@/apis/gct-apaas/DocControlTaskTodoController';

  const { t } = useI18n();

  const columnDefinitions = [
    { title: t('sys.edhr.controlFileName'), field: 'docName', minWidth: 160 },
    { title: t('sys.edhr.controlFileCode'), field: 'docCode', minWidth: 160 },
    { title: t('sys.appDesigner.version'), field: 'version' },
    { title: t('sys.edhr.subcategory'), field: 'categoryName' },
    {
      title: t('sys.edhr.controlFileType'),
      field: 'controlTmplType',
      minWidth: 140,
      params: { i18nPrefix: 'sys.edhr.intervention' },
      slots: { default: 'value_i18n_render' },
    },
    { title: t('sys.edhr.businessOfflineVersion'), field: 'offlineVersion', minWidth: 120 },

    { title: t('sys.edhr.controlReporter'), field: 'initiatorName' },
    { title: t('sys.edhr.controlReportTime'), field: 'startTime', minWidth: 176 },
  ];
</script>
<style lang="less" scoped></style>
