<template>
  <DataSource
    class="pt-0"
    :can-create="dsManagementUsePerms.Insert"
    :can-edit="dsManagementUsePerms.Update"
    :can-delete="dsManagementUsePerms.Delete"
  />
</template>

<script setup lang="ts">
  import DataSource from '/@developer-center/views/integration/data-source.vue';
  import { usePagePermissions } from '../../hooks/usePagePermissions';

  const dsManagementUsePerms = usePagePermissions('ds-management');
</script>

<style scoped></style>
