<template>
  <div class="ebr-wiki-edhr-builder-wrapper">
    <div v-if="loading" class="nocode-common-loading-warp">
      <DocumentLoading />
    </div>
    <div v-else-if="hasData" class="ebr-wiki-edhr-builder-container">
      <slot name="ebr-left"></slot>
      <div class="ebr-wiki-edhr-builder-content" :class="{ isFullScreen }">
        <div class="ebr-container-full-screen" @click="changeIsFullScreen" v-if="showFullScreen">
          <i :class="['iconfont', isFullScreen ? 'icon-tuichuquanping' : 'icon-quanping']"></i>
        </div>
        <slot name="ebr-right"></slot>
      </div>
      <slot name="ebr-action"></slot>
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
  import { ref } from 'vue';
  import DocumentLoading from './document-loading.vue';

  defineProps<{
    /** 加载loading */
    loading: boolean;
    /** 是否存在内容 */
    hasData: boolean;
    /** 显示放大缩小按钮 */
    showFullScreen?: boolean;
  }>();

  const isFullScreen = ref(false);

  function changeIsFullScreen() {
    isFullScreen.value = !isFullScreen.value;
  }
</script>

<style lang="less">
  @import url('../css/common.less');
</style>

<style scoped lang="less">
  .ebr-wiki-edhr-builder-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .ebr-wiki-edhr-builder-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex: 1;

      .ebr-wiki-edhr-builder-content {
        position: relative;
        box-sizing: border-box;
        overflow: hidden;
        width: 100%;
        height: 100%;
        height: auto;
        background-color: #e6e9ef;

        &.isFullScreen {
          width: 100vw;
          max-width: 100vw;
          height: 100vh;
          max-height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 999;
        }
      }
    }
  }
</style>
<style scoped lang="less">
  .ebr-container-full-screen {
    position: absolute;
    top: 8px;
    right: 24px;
    padding: 4px;
    color: #fff;
    line-height: 1;
    cursor: pointer;
    z-index: 888;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 4px;
    pointer-events: all;

    .iconfont {
      font-size: 24px;
      line-height: 1;
    }
  }
</style>
