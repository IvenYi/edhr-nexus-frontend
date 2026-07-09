<template>
  <div class="ks-row-middle">
    <span class="iconfont icon-wenjianjia mr4px depticon"></span>
    <div class="ell ks-col"> {{ title }}</div>
    <DeleteOutlined @click="emit('deleteDept')" class="cursor-pointer" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, computed } from 'vue';
  import { Org } from '/@backend-management/views/user/types/org-user.d';

  const porps = defineProps<{
    deptId: string;
    deptOptions: Org[];
  }>();
  const { deptId, deptOptions } = reactive(porps);
  const emit = defineEmits(['deleteDept']);
  const title = computed(() => {
    return deptOptions.find((i) => i.id === deptId)?.name;
  });
</script>
<style scoped lang="less">
  .depticon {
    color: #fcc12b;
  }
</style>
