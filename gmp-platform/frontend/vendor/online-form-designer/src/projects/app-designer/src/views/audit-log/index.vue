<template>
  <basic-page>
    <audit-log-list :isFrontPrint="isFrontPrint" :permission="true" appId="APPDESIGNER" />
  </basic-page>
</template>

<script setup lang="ts" name="audit-log">
  import auditLogList from './components/audit-log-list.vue';
  import { useNamespace } from '@gct/runtime';
  import { useRoute } from 'vue-router';
  import { computed } from 'vue';

  const ns = useNamespace('audit-log');
  const route = useRoute();

  const isFrontPrint = computed(() => {
    const arr = route.fullPath.split('/');
    const routeName = arr[arr.length - 1];
    return ['LabelDesigner', 'PrintDesigner', 'ReceiptDesigner'].includes(routeName);
  });
</script>

<style lang="scss" scoped>
  $audit-log: ();
  @include b(audit-log) {
  }
</style>
