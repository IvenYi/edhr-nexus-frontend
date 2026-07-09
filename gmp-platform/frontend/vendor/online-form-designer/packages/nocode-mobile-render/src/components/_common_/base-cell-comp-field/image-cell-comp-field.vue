<template>
  <div
    :class="['image-cell-comp-field-mobile', realFieldId, { 'is-disabled': showDisabled }]"
    role="group"
  >
    <div class="add-image-btn">
      <i class="iconfont icon-dianziqianmingdd"></i>
      <span>{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts" name="image-cell-comp-field">
  const props = defineProps<{
    label: string;
    showDisabled: boolean;
    realFieldId: string | undefined;
  }>();
</script>

<style scoped lang="less">
  .image-cell-comp-field-mobile {
    display: inline-flex;
    flex-wrap: nowrap;
    gap: 4px;
    align-items: center;
    font-size: 14px;
    line-height: 1;

    .add-image-btn {
      display: inline-flex;
      font-size: 14px;
      padding: 4px;
      border-radius: 4px;
      color: var(--required-border-hover-color, #026ac8);
      background-color: var(--required-background-color, rgba(49, 104, 236, 0.1));
      border: 1px dashed var(--required-border-color, #026ac8);
      cursor: pointer;
      box-sizing: content-box;

      > .iconfont {
        font-size: 16px;
        line-height: 1;
        margin-right: 2px;
      }

      > span {
        font-size: 12px;
        line-height: 16px;
        vertical-align: text-bottom;
      }
    }

    &.is-disabled {
      .add-image-btn {
        background-color: #f5f5f5;
        color: rgba(0, 0, 0, 0.25);
        border-color: rgba(0, 0, 0, 0.15);
        cursor: not-allowed;
      }
    }
  }
</style>
