<template>
  <div :class="[ns.b(), ns.m(direction)]">
    <div :class="[ns.e('avatar')]">
      <img :class="[ns.e('avatar-img')]" :src="avatarUrl" />
    </div>
    <div v-if="name" :class="ns.e('name')">
      {{ name }}
    </div>
  </div>
</template>

<script lang="ts" setup name="Demo">
  import { useNamespace } from '@gct/runtime';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';

  import DefaultAvatar from '/@/assets/images/header.jpg';
  import { computed } from 'vue';

  const ns = useNamespace('avatar');

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
    return props.avatar ? transformUrl(props.avatar) : DefaultAvatar;
  });
</script>

<style lang="scss" scoped>
  $avatar: (
    height: auto,
    size: 32px,
  );

  @include b(avatar) {
    @include set-component-css-var(avatar, $avatar);
    height: getCssVar(avatar, height);
    display: inline-block;

    @include e(avatar) {
      padding: 4px 5px;
      display: inline-flex;
      align-items: center;
    }

    @include e(avatar-img) {
      height: getCssVar(avatar, size);
      width: getCssVar(avatar, size);
      border-radius: 50%;
    }

    @include e(name) {
      text-align: center;
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      line-height: 14px;
    }

    @include m(horizontal) {
      display: flex;
      align-items: center;
    }
  }
</style>
