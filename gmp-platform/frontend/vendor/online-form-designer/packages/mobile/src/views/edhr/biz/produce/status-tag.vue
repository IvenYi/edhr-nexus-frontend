<template>
  <van-tag
    v-show="label || getStatusInfo()?.text"
    :color="bgColor ?? 'rgba(2, 106, 200, 0.1)'"
    size="medium"
    :text-color="textColor ?? getStatusInfo()?.textColor"
  >
    {{ label ?? getStatusInfo()?.text }}
  </van-tag>
</template>
<script setup lang="ts">
  import { getModelComprehensiveEnumInfoByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const props = defineProps<{
    value?: string;
    label?: string;
    textColor?: string;
    bgColor?: string;
  }>();

  const statusOptions = ref<any>([]);

  onMounted(() => {
    getStatusOptions();
  });

  function getStatusInfo() {
    return props.value ? statusOptions.value?.find((e: any) => e.value === props.value) : '';
  }

  async function getStatusOptions() {
    const res: any = await getModelComprehensiveEnumInfoByModelCategory(
      { modelCategory: 'view' },
      {
        modelKey: 'vm_container_task_jhwd',
        fieldKey: 'f_status__jhwd',
      },
    );
    statusOptions.value = res ?? [];
  }
</script>
<style lang="less" scoped></style>
