<template>
  <div :class="ns.b()">
    <OperationLogTable :logs="logs" />
  </div>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { ref } from 'vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import OperationLogTable from './operation-log-table.vue';
  import { OpLogField } from './types';

  const ns = useNamespace('edhr-outline-modal');

  defineProps<{
    logs: OpLogField[];
  }>();

  useModal(async () => {
    return {
      // 修改过后返回ok,外面刷新数据
      ok: true,
    };
  });
</script>

<style lang="scss" scoped>
  @include b(edhr-outline-modal) {
    height: 100%;
    padding: 12px;
  }
</style>
