<template>
  <div class="nocode-document-layout-wrapper">
    <div v-if="loading" class="nocode-common-loading-warp">
      <DocumentLoading />
    </div>
    <div v-else-if="hasData" class="nocode-document-layout-container">
      <slot name="default"></slot>
    </div>
    <div v-else class="nocode-common-loading-warp">
      <div class="w200px text-center color-[#666]">
        <img class="w100% h100%" src="@/assets/images/edhr-empty.png" alt="" />
        <span>{{ $t('sys.noData') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="nocode-base-document-layout">
  import DocumentLoading from './document-loading.vue';

  defineProps<{
    /** 加载loading */
    loading: boolean;
    /** 是否存在内容 */
    hasData: boolean;
  }>();
</script>

<style lang="less">
  @import url('../css/common.less');
</style>
