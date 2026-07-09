<template>
  <div
    class="flex-shrink-0 flex justify-between items-center px-3 md:px-6 h-14 md:h-16"
    :class="props.class"
  >
    <!-- left -->
    <div
      class="flex-shrink-0 w-1/5 h-full flex justify-start items-center"
      :class="onBack ? '' : renderAsPDA ? '' : 'md:hidden'"
    >
      <div
        v-if="onBack"
        class="flex-shrink-0 flex justify-center items-center w-12 h-full"
        @click="onBack()"
      >
        <van-icon name="arrow-left" class="text-xl text-black" />
      </div>
      <!-- <slot v-else name="left"></slot> -->
    </div>

    <!-- title -->
    <div
      class="flex-shrink-0 w-3/5 truncate font-bold text-center text-black text-lg md:text-xl"
      :class="onBack ? '' : renderAsPDA ? '' : 'md:text-left'"
    >
      {{ title }}
    </div>

    <!-- action -->
    <div class="flex-shrink-0 w-1/5 h-full flex justify-end items-center">
      <div
        v-if="action"
        class="text-sm text-[#1A1D23] font-500"
        :class="action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
        @click="handleActionClick"
      >
        {{ action.name }}
      </div>

      <slot v-else name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    title: string;
    class?: string;
    // 左侧返回
    onBack?: () => void;
    // 右侧按钮
    action?: {
      name: string;
      disabled?: boolean;
      loading?: boolean;
      onClick: () => void;
    };
    renderAsPDA?: boolean;
  }>();

  const handleActionClick = () => {
    const { action } = props;
    if (!action || action.disabled || action.loading) return;
    action.onClick();
  };
</script>
