<template>
  <div :class="['esop-card', isFullScreen ? 'esop-card__full' : '']">
    <div class="pt16px">
      <template v-if="!isFullScreen">
        <div class="flex items-center justify-between">
          <div class="color-#1A1D23 text-16px font-600">
            <!-- <gct-icon value="icon-preset:edhr-zhidaoshu" :size="20" class="mb-[-1px]" /> -->
            SOP作业指导书
          </div>
          <div class="flex gap-10px">
            <IconButton color="#5A5F6B" value="icon-preset:edhr-fullscreen" @click="fullScreen" />
            <IconButton color="#5A5F6B" value="icon-preset:edhr-switch" @click="toggle" />
          </div>
        </div>
        <div class="color-#8B8B8B text-13px leading-none"> 当前文件：{{ fileMeta?.name }} </div>
      </template>
      <template v-else>
        <div class="flex items-center justify-between h-64px">
          <div></div>
          <div class="color-#1A1D23 text-17px font-bold"> {{ fileMeta?.name }} </div>
          <van-icon name="cross" @click="exitFullScreen" />
        </div>
      </template>
    </div>
    <div class="esop-card__content mt16px">
      <EsopRender ref="esopRef" :file-meta="fileMeta" @exitFullScreen="exitFullScreen" />
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

  const esopRef = ref<any>();

  const isFullScreen = ref(false);

  const fullScreen = () => {
    const hasFullScreen = esopRef.value.fullScreen();
    if (!hasFullScreen) {
      isFullScreen.value = true;
    }
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
    overflow: hidden;

    &__content {
      height: calc(100% - 90px);
      background: linear-gradient(270deg, #f2f5f8 0%, #fff 50%, #f2f5f8 100%);
    }

    &.esop-card__full {
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;

      .esop-card__header {
        padding-bottom: 0;
        border-bottom: none;
      }

      .esop-card__content {
        height: calc(100% - 64px - 16px);
        margin: 0;
      }
    }
  }
</style>
