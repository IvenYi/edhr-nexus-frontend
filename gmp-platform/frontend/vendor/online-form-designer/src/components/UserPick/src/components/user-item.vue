<template>
  <div class="ks-row-middle">
    <span class="iconfont icon-a-Accountnumber mr4px icon"></span>
    <div class="ell ks-col"> {{ usetName }}</div>
    <DeleteOutlined @click="emit('deleteUser')" class="cursor-pointer"
  /></div>
</template>

<script setup lang="ts">
  import type { OrgUserResponse } from '/@/apis/gct-platform/model/index';
  import { reactive, computed } from 'vue';

  const porps = defineProps<{
    userId: string;
    usersMap: Record<string, OrgUserResponse>;
  }>();
  const { userId, usersMap } = reactive(porps);
  const emit = defineEmits(['deleteUser']);
  const usetName = computed(() => {
    const u = usersMap[userId] as any;
    return u?.__LABEL__ || u?.fullname;
  });
</script>
<style scoped lang="less">
  .icon {
    color: #bfbfbf;
  }
</style>
