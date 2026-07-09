<template>
  <DocumentRouter :title="t('sys.pageDesigner.form')" />
</template>

<script setup lang="ts">
  import DocumentRouter from '/@online-form/views/web-render/form/router-view.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n() as any;
</script>

<style scoped></style>
