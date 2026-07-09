<template>
  <div :class="['avatar', `avatar--${direction}`]">
    <div :class="['avatar__avatar']">
      <img :class="['avatar__avatar-img']" :src="avatarUrl" />
    </div>
    <div v-if="name" :class="'avatar__name'">
      {{ name }}
    </div>
  </div>
</template>

<script lang="ts" setup name="Demo">
  import { transformUrl } from '@mobile/stores/useFile';
  import DefaultAvatar from '/@/assets/images/header.jpg';
  import { computed } from 'vue';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

  const props = withDefaults(
    defineProps<{
      /** 用户头像图片地址 */
      avatar?: string;
      /** 用户名 */
      name?: string;
      direction?: 'vertical' | 'horizontal';
    }>(),
    {
      direction: 'vertical',
    },
  );

  const avatarUrl = computed(() => {
    return props.avatar ? MOBILE_MINIO_PATH.value + props.avatar : DefaultAvatar;
  });
</script>

<style lang="less" scoped>
  .avatar {
    --avatar-size: 32px;
    display: inline-block;

    &__avatar {
      padding: 4px 5px;
      display: inline-flex;
      align-items: center;
    }

    &__avatar-img {
      height: var(--avatar-size);
      width: var(--avatar-size);
      border-radius: 50%;
    }

    &__name {
      text-align: center;
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 14px;
    }

    &--horizontal {
      display: flex;
      align-items: center;
    }
  }
</style>
