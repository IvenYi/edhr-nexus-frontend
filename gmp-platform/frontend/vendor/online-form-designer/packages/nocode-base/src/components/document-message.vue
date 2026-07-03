<template>
  <transition name="slide-down">
    <div v-show="visible" :class="['document-message', `document-message-${type}`]">
      <i class="iconfont" :class="iconType" :style="{ color: iconColor }"></i>
      <span class="document-message-content">{{ content }}</span>
    </div>
  </transition>
</template>

<script setup lang="ts" name="document-message">
  import { ref, onMounted, computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      id: string;
      content: string;
      type: string;
      duration: number;
    }>(),
    {
      type: 'info',
      duration: 3000,
    },
  );

  const emit = defineEmits(['destroy']);

  const visible = ref(false);

  const iconType = computed(() => {
    switch (props.type) {
      case 'success':
        return 'icon-you1_right-two1';
      case 'warning':
        return 'icon-zhuyi';
      case 'error':
        return 'icon-cuowu2';
      default:
        return 'icon-zhuyi';
    }
  });
  const iconColor = computed(() => {
    switch (props.type) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'error':
        return '#ff4d4f';
      default:
        return '#1890ff';
    }
  });

  onMounted(() => {
    visible.value = true;

    if (props.duration > 0) {
      setTimeout(close, props.duration);
    }
  });

  function close() {
    visible.value = false;

    setTimeout(() => emit('destroy', props.id), 300);
  }

  defineExpose({ close });
</script>

<style scoped>
  .document-message {
    display: inline-block;
    padding: 8px 12px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 6px 16px 0 rgb(0 0 0 / 8%), 0 3px 6px -4px rgb(0 0 0 / 12%),
      0 9px 28px 8px rgb(0 0 0 / 5%);
    font-size: 14px;
    line-height: 22px;
    pointer-events: all;
  }

  .document-message .iconfont {
    margin-right: 4px;
    line-height: 1;
    vertical-align: text-bottom;
  }

  .document-message-content {
    display: inline-block;
    color: rgb(0 0 0 / 88%);
    line-height: 22px;
  }

  .slide-down-enter-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  .slide-down-enter-from {
    transform: translateY(-100%);
    opacity: 0;
  }

  .slide-down-enter-to {
    transform: translateY(0);
    opacity: 1;
  }

  .slide-down-leave-active {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .slide-down-leave-from {
    transform: translateY(0);
    opacity: 1;
  }

  .slide-down-leave-to {
    transform: translateY(-100%);
    opacity: 0;
  }
</style>
