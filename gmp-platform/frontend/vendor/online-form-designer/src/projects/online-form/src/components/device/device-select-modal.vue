<template>
  <div :class="ns.b()">
    <DeviceTable :selectedId="selectedId" @selected-change="onSelectedChange" />
  </div>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { reactive, ref } from 'vue';
  import { useModal, useNamespace } from '@gct/runtime';
  import DeviceTable from './device-table.vue';
  import { DeviceInterconnectionResponse } from '/@/apis/gct-platform/model';

  const ns = useNamespace('edhr-outline-modal');

  const props = defineProps<{
    selectedId?: string;
  }>();
  const selectedRow = ref<DeviceInterconnectionResponse>();

  const onSelectedChange = (row: DeviceInterconnectionResponse) => {
    selectedRow.value = row;
  };

  useModal(async () => {
    return {
      // 修改过后返回ok,外面刷新数据
      ok: true,
      data: selectedRow.value,
    };
  });
</script>

<style lang="scss" scoped>
  @include b(edhr-outline-modal) {
    padding: 16px 24px;
    height: 100%;
  }
</style>
