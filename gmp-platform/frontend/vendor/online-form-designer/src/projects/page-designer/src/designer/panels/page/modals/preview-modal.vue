<template>
  <a-drawer
    v-model:visible="open"
    placement="right"
    :title="false"
    width="100%"
    :get-container="false"
    :style="{ position: 'absolute', padding: 0 }"
    :closable="false"
  >
    <div class="preview-title-container">
      <div class="preview-close" @click="close">
        <LeftOutlined style="margin-right: 8px" />
        {{ t('sys.appDesigner.customAppHome.preview.back') }}
      </div>
      {{ pageInfo?.name }}
    </div>
    <div v-if="isWeb" class="web-iframe">
      <iframe id="web-frame" frameborder="0" style="width: 100%; height: 100%"></iframe>
    </div>
    <div v-if="!isWeb" class="mobile-iframe">
      <iframe id="mobile-frame" frameborder="0" style="width: 375px; height: 725px"></iframe>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, defineExpose } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Platform } from '../../../../enum';
  import { pageInfo } from '/@page-designer/hooks/usePage';

  const open = ref<boolean>(false);

  const { t } = useI18n();

  const isWeb = ref<boolean>(true);

  const openPreview = (options) => {
    open.value = true;
    isWeb.value = options.platform === Platform.WEB;

    setTimeout(() => {
      let iframeElement = document.getElementById(isWeb.value ? 'web-frame' : 'mobile-frame');
      iframeElement.src = options.url;

      if (options.platform === Platform.MOBILE) {
        iframeElement.style.width = '375px';
        iframeElement.style.height = '725px';
      }

      if (options.platform === Platform.PAD) {
        iframeElement.style.width = '1220px';
        iframeElement.style.height = '798px';
      }
    }, 50);
  };

  const close = () => {
    open.value = false;
    let iframeElement = document.getElementById(isWeb.value ? 'web-frame' : 'mobile-frame');
    iframeElement.src = '';
  };

  defineExpose({ openPreview });
</script>

<style scoped lang="less">
  :deep(.ant-drawer-body) {
    padding: 0;
  }
  .preview-title-container {
    position: absolute;
    width: 100%;
    height: 54px;
    background: #1a1d23;
    color: #fff;
    text-align: center;
    line-height: 54px;
    font-size: 14px;
    padding-left: 0 16px;
    .preview-close {
      position: absolute;
      left: 16px;
      cursor: pointer;
    }
  }

  .web-iframe {
    width: 100%;
    height: calc(100% - 54px);
    margin-top: 54px;
    background-color: #f2f4f7;
  }
  .mobile-iframe {
    width: 100%;
    margin-top: 54px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #f2f4f7;
    .mobile-pad {
      display: flex;
      justify-content: space-around;
      align-items: center;
      width: 64px;
      height: 28px;
      background: #ffffff;
      border-radius: 4px 4px 4px 4px;
      margin: 8px;
      .iconfont {
        cursor: pointer;
        &.active {
          background-color: #f5f5f5;
          color: var(--ant-primary-color);
        }
        &:hover {
          color: var(--ant-primary-color);
        }
      }
    }
  }
</style>
