<template>
  <div class="remove-icon">
    <i :class="'gct-iconfont ' + icon"></i>
  </div>
</template>

<script lang="ts" setup name="remove-icon">
  const props = withDefaults(
    defineProps<{
      icon?: string;
    }>(),
    {
      icon: 'icon-icon_shanchu',
    },
  );
</script>

<style lang="scss" scoped>
  .remove-icon {
    .gct-iconfont {
      font-size: 14px;
    }
    cursor: pointer;
    color: #a6a6a6;
    width: 24px;
    height: 24px;
    border-radius: 4px 4px 4px 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #f2f5f8;
      color: #000000;
    }
  }
</style>
