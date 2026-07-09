<template>
  <div v-if="props.userList.length === 1">
    <div v-for="p in props.userList" :key="p" class="flex justify-center items-center mr8px">
      <div class="flex items-center">
        <img class="avatar" :src="transformUrl(p.avatar || globSetting.defaultAvatar)" />
        <div class="ml6px name ell">{{ p.fullname }}</div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center">
    <div
      v-for="(p, idx) in props.userList.slice(0, 3)"
      :key="p"
      class="flex justify-center items-center mr8px"
    >
      <img
        v-if="idx === 0"
        class="avatar"
        :src="transformUrl(p.avatar || globSetting.defaultAvatar)"
      />
      <img
        v-if="idx && idx < 3"
        class="avatar avatar-double"
        :src="transformUrl(p.avatar || globSetting.defaultAvatar)"
      />
    </div>
    <div>{{ props.userList.length }}人</div>
  </div>
</template>
<script setup lang="ts">
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useGlobSetting } from '/@/hooks/setting';

  interface Props {
    /** 人员列表 */
    userList: any;
  }

  const props = defineProps<Props>();

  // 获取默认头像
  const globSetting = useGlobSetting();
</script>
<style lang="less" scoped>
  .avatar {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    border: 2px solid #fff;
  }
  .name {
    max-width: 77px;
  }
  .avatar-double {
    margin-left: -18px;
  }
</style>
