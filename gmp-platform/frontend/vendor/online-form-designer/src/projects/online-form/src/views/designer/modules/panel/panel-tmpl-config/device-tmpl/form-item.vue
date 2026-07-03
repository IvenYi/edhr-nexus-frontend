<template>
  <div class="form-item">
    <div class="form-item__label">{{ label }}：</div>
    <div class="form-item__value">{{ value }}</div>
  </div>
</template>

<script lang="ts" setup name="form-item">
  withDefaults(
    defineProps<{
      label?: string;
      value?: string;
    }>(),
    {
      label: '--',
      value: '--',
    },
  );
</script>

<style lang="scss" scoped>
  .form-item {
    font-weight: 400;
    font-size: 12px;
    display: flex;
    &__label {
      color: #5a5f6b;
    }

    &__value {
      color: #1a1d23;
    }
  }

  .form-item ~ .form-item {
    margin-top: 8px;
  }
</style>
