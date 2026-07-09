<template>
  <div :id="`text-wrap-${uniqueId}`" class="w100% ks-row overflow-hidden relative">
    <div :id="`text-${uniqueId}`" class="ks-col" :class="[showMore && 'ell']" style="white-space: nowrap;">
      {{ text }}
    </div>
    <van-popover v-model:show="showPo" :show-arrow="false">
      <div v-show="!$slots.popoverText" class="break-all p16px">
        {{ text }}
      </div>
      <slot name="popoverText"></slot>
      <template v-if="showMore" #reference>
        <div v-show="!$slots.reference" class="more ml4px">详情</div>
        <slot name="reference"></slot>
      </template>
    </van-popover>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, ref, nextTick } from 'vue';
  import { commonUtils } from '@gct/nocode-base';

  const props = defineProps<{
    text: string;
  }>();

  const showMore = ref<boolean>(false);
  const showPo = ref<boolean>(false);
  const uniqueId = ref();

  onMounted(() => {
    nextTick(() => {
      if (!props.text) return;
      caculateWidth();
    })
  })

  async function caculateWidth() {
    uniqueId.value = commonUtils.uuid2(16, 16);
    await nextTick();
    const ww = document.querySelector(`#text-wrap-${uniqueId.value}`)?.offsetWidth;
    const tw = document.querySelector(`#text-${uniqueId.value}`)?.offsetWidth;
    showMore.value = tw > ww;
  }

</script>
<style lang="less" scoped>
  .more {
    color: var(--van-primary-color);
  }
</style>
