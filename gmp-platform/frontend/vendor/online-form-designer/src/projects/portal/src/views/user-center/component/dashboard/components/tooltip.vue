<template>
  <a-tooltip placement="bottom" :visible="visible" :overlayStyle="{ 'max-width': '208px' }">
    <template #title> {{ showLabel }}</template>
    <div class="flex justify-center items-center">
      <div class="ell tag-content mr-8px">
        <span @mouseenter="onMouseenter" @mouseleave="onMouseleave">
          {{ item.name }}
        </span>
      </div>
      <close-outlined class="text-12px" @click="handleClose()" />
    </div>
  </a-tooltip>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  const props = defineProps<{
    item?: any;
  }>();

  const emit = defineEmits(['delete']);
  const visible = ref(false);
  const showLabel = computed(() => {
    return props.item.name;
  });

  /** 删除 */
  const handleClose = () => {
    emit('delete', props.item);
  };

  /**超出内容出现tip显示全部 */
  function onMouseenter(e) {
    const el = e.target.parentNode!;
    if (el.scrollWidth > el.clientWidth) {
      visible.value = true;
    }
  }
  function onMouseleave() {
    visible.value = false;
  }
</script>
<style scoped lang="less">
  .tag-content {
    display: inline-block;
    max-width: 184px;
    line-height: 20px;
  }
</style>
