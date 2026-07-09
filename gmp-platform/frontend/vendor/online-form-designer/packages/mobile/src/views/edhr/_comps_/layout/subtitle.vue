<template>
  <div class="layout-section__subtitle">
    <span>{{ title }}</span>
    <span v-if="arrow" @click="onClick">
      <van-icon name="arrow" />
    </span>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      title: string;
      arrow?: boolean;
    }>(),
    {
      arrow: false,
    },
  );

  const emit = defineEmits(['arrow-click']);

  const onClick = () => {
    emit('arrow-click');
  };
</script>
<style scoped lang="less">
  .layout-section {
    &__subtitle {
      color: var(--text-color-1);
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
