<template>
  <a-button type="primary" ghost block class="add-btn" @click="onClick">
    {{ title }}
  </a-button>
</template>

<script setup lang="ts" name="add-button">
  const props = defineProps<{
    id?: string;
    title: string;
  }>();

  const emit = defineEmits<{
    (e: 'on-add', id: string | undefined): void;
  }>();

  function onClick() {
    emit('on-add', props.id);
  }
</script>

<style scoped lang="less">
  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    .iconfont {
      line-height: 1;
    }
  }
</style>
