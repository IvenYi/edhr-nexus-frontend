<template>
  <basic-page-render>
    <AuditLogList :isFront="true" appId="APPFRONT" />
  </basic-page-render>
</template>
<script setup lang="ts">
  import AuditLogList from '/@app-designer/views/audit-log/components/audit-log-list.vue';
</script>
<style lang="less" scoped></style>
