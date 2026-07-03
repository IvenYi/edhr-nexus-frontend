<template>
  <a-tooltip placement="bottom" :visible="visible" :overlayStyle="{ 'max-width': '208px' }">
    <template #title> {{ showLabel }}</template>

    <div class="gct-text-overflow" :style="props.style">
      <span @mouseenter="onMouseenter" @mouseleave="onMouseleave">
        <i v-if="showIcon" class="gct-iconfont icon-yibiaopan mr6px"></i>
        {{ showLabel }}
      </span>
    </div>
  </a-tooltip>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  const props = defineProps<{
    name: any;
    style?: any;
    showIcon?: boolean;
  }>();

  const visible = ref(false);
  const showLabel = computed(() => {
    return props.name;
  });

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
<style scoped lang="less"></style>
