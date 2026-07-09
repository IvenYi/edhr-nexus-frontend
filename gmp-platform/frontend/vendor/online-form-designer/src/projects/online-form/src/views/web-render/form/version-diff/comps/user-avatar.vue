<template>
  <div class="user">
    <div class="user-avatar">
      <img :src="'/minio/' + (userInfo.avatar || avatorDefault)" width="24" />
    </div>
    <div>{{ userInfo.fullname }}</div>
  </div>
</template>
<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { getUserInfoByIds } from '/@/apis/gct-platform/UserController';
  import { UserResponse } from '/@/apis/gct-platform/model';
  import avatorDefault from '/@/assets/images/avator-default.png';

  const props = defineProps<{
    userId: string;
  }>();

  const userInfo = ref<UserResponse>({});

  async function getUserInfo(id: string) {
    if (!props.userId) return;
    const res = (await getUserInfoByIds({ ids: id })) || [];
    userInfo.value = res[0] || {};
  }

  watch(
    () => props.userId,
    (id) => {
      if (!id) return;
      getUserInfo(id);
    },
    {
      immediate: true,
    },
  );
</script>
<style lang="less" scoped>
  .user {
    display: inline-flex;
    column-gap: 6px;
    padding: 4px 16px 4px 4px;
    background-color: #f2f5f8;
    border-radius: 50px;
    align-items: center;

    &-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      overflow: hidden;
    }
  }
</style>
