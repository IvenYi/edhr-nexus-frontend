<template>
  <div class="layout-section2 rounded-12px overflow-hidden ks-row-middle py-20px">
    <slot name="extra"></slot>
    <div>
      <div class="layout-section2__title">
        {{ title }}
      </div>
      <div class="layout-section2__content mt6px">
        <slot name="default">
          {{ content }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      /** 标题 */
      title: string;
      /** 内容 */
      content?: string;
    }>(),
    {},
  );
</script>
<style scoped lang="less">
  .layout-section2 {
    position: relative;
    color: #1a1d23;

    &__title {
      color: #5a5f6b;
      font-size: 13px;
    }

    &__content {
      color: #1a1d23;
      font-size: 15px;
    }

    &__arrow {
      display: none;
    }
  }
</style>
