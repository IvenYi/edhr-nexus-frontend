<template>
  <div :class="[ns.b(), disabled && ns.m('disabled')]">
    <PlusOutlined :class="['iconfont', 'icon-a-', ns.e('add-icon')]" />
  </div>
</template>

<script lang="ts" setup>
  import { useNamespace } from '@gct/runtime';

  const ns = useNamespace('cell-upload');

  defineProps<{
    disabled?: boolean;
  }>();
</script>

<style lang="scss" scoped>
  $cell-upload: (
    height: 22px,
    icon-size: 16px,
    primary-color: #0daa9c,
  );

  @include b(cell-upload) {
    width: 100%;
    min-width: 36px;
    @include set-component-css-var(cell-upload, $cell-upload);
    height: getCssVar(cell-upload, height);
    padding: 0 10px;
    display: flex;
    align-items: center;

    @include e(add-icon) {
      font-size: getCssVar(cell-upload, icon-size);
      color: getCssVar(cell-upload, primary-color);
      cursor: pointer;
    }

    @include m(disabled) {
      background-color: #f7f8fa;
    }
  }
</style>
