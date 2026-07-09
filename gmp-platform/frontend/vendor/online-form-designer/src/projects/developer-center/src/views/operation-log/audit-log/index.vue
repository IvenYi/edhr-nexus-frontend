<template>
  <basic-page>
    <AuditLogList :isFrontPrint="true" appId="DEVELOPER" />
  </basic-page>
</template>
<script setup lang="ts">
  import AuditLogList from '/@app-designer/views/audit-log/components/audit-log-list.vue';
</script>
<style lang="less" scoped></style>
