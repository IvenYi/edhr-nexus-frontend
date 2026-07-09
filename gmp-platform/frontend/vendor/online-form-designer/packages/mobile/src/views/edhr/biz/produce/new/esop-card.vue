<template>
  <div :class="['esop-card', isFullScreen ? 'esop-card__full' : '']">
    <div class="esop-card__header">
      <template v-if="!isFullScreen">
        <div class="flex items-center justify-between">
          <div class="color-#1A1D23 text-17px font-bold mt-15px">
            <gct-icon value="icon-preset:edhr-zhidaoshu" :size="20" class="mb-[-1px]" />
            SOP作业指导书
          </div>
          <div class="flex gap-10px mt-14px">
            <IconButton value="icon-preset:edhr-fullscreen" @click="fullScreen" />
            <IconButton value="icon-preset:edhr-switch" @click="toggle" />
          </div>
        </div>
        <div class="color-#8B8B8B text-14px"> 当前文件：{{ fileMeta?.name }} </div>
      </template>
      <template v-else>
        <div class="flex items-center justify-between h-64px">
          <div></div>
          <div class="color-#1A1D23 text-17px font-bold"> {{ fileMeta?.name }} </div>
          <van-icon name="cross" @click="exitFullScreen" />
        </div>
      </template>
    </div>
    <div class="esop-card__content">
      <EsopRender :file-meta="fileMeta" />
    </div>
  </div>
</template>

<script lang="ts" setup name="esop-card">
  import { i18n } from '@mobile/locales/setupI18n';
  import type { IContainerOperationEsop } from '@mobile/views/edhr/_comps_/esop/type';
  import EsopRender from '@mobile/views/edhr/_comps_/esop/esop-render.vue';
  import IconButton from '@mobile/views/edhr/_comps_/layout/icon-button.vue';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      fileMeta?: IContainerOperationEsop;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'toggle'): void;
  }>();

  const isFullScreen = ref(false);

  const fullScreen = () => {
    isFullScreen.value = true;
  };

  const exitFullScreen = () => {
    isFullScreen.value = false;
  };
  const toggle = () => {
    emit('toggle');
  };
</script>

<style lang="less" scoped>
  .esop-card {
    padding: 0 16px;
    background: #ffffff;
    border-radius: 8px 8px 8px 8px;
    overflow: hidden;

    &__header {
      border-bottom: 1px solid #e0e3eb;
      padding-bottom: 16px;
    }

    &__content {
      background: linear-gradient(270deg, #f2f5f8 0%, #ffffff 50%, #f2f5f8 100%);
      margin: 16px 0;
      height: calc(100% - 90px - 32px);
    }

    &.esop-card__full {
      position: fixed;
      width: 100vw;
      height: 100vh;
      top: 0;
      left: 0;
      z-index: 9999;

      .esop-card__header {
        border-bottom: none;
        padding-bottom: 0;
      }

      .esop-card__content {
        margin: 0;
        height: calc(100% - 64px - 16px);
      }
    }
  }
</style>
