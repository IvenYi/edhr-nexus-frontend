<template>
  <div
    :class="[
      'form-item ',
      isFirst ? 'mt-0' : 'mt-12px',
      inline ? 'form-inline' : '',
      required ? 'is-required' : '',
    ]"
  >
    <div class="form-item__label">
      <slot name="label">
        {{ label }}
      </slot>
      <span class="form-item__extra">
        <slot name="extra"> </slot>
      </span>
    </div>
    <a-form-item v-bind="$attrs" :required="required" class="form-item__content">
      <slot> </slot>
    </a-form-item>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      label?: string;
      inline?: boolean;
      isFirst?: boolean;
      required?: boolean;
    }>(),
    {
      inline: true,
      isFirst: false,
      required: false,
    },
  );
</script>

<style lang="less" scoped>
  .form-item {
    line-height: 18px;

    &__label {
      color: #252525;
      font-size: 12px;
      flex: none;
    }
    &__extra {
      float: right;
    }

    &__content {
      flex: 1;
      margin-bottom: 0;
    }

    &.form-inline {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    &:not(.form-inline) &__label {
      margin-bottom: 4px;
    }

    &.is-required {
      .form-item__label {
        &::before {
          display: inline-block;
          margin-inline-end: 4px;
          color: #ff4d4f;
          font-size: 14px;
          font-family: SimSun, sans-serif;
          line-height: 1;
          content: '*';
        }
      }
    }
  }
</style>
