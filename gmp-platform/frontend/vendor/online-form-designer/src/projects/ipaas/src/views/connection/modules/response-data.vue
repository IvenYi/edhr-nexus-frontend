<template>
  <div class="response-data">
    <div class="response-data__wrapper">
      <div class="response-data__trigger" @click="contentVisible = true">
        <icon-park type="fold-up-one" />
        <span>{{ $t('sys.ipaas.response') }}</span>
      </div>
      <Transition name="fade">
        <div class="response-data__content" v-if="contentVisible">
          <div class="response-data__content-header"
            >{{ $t('sys.ipaas.resContentPanel') }}
            <i
              class="iconfont icon-jiantou important-text-12px cursor-pointer"
              @click="contentVisible = false"
            ></i>
          </div>
          <div class="response-data__content-json">
            <span class="no-data" v-if="content === undefined">{{ t('sys.ipaas.noData') }}</span>
            <!-- <span v-else>{{ content }}</span> -->
            <VirtualJsonViewer v-else :json="content" :max-height="800" />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { IconPark } from '@icon-park/vue-next/es/all';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { VirtualJsonViewer } from '/@/components/VirtualJsonViewer';

  defineProps<{
    content: string | undefined;
  }>();

  const { t } = useI18n();

  const contentVisible = ref<boolean>(false);
  const setContentVisible = (visible: boolean) => {
    contentVisible.value = visible;
  };

  defineExpose({
    setContentVisible,
  });
</script>

<style lang="less" scoped>
  .response-data {
    &__wrapper {
      position: relative;
      width: 56px;
      height: 56px;
    }

    &__trigger {
      display: flex;
      position: absolute;
      top: 0;
      left: 0;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      background-color: var(--ant-primary-color);
      color: #fff;
      font-size: 14px;
      cursor: pointer;

      & > .i-icon {
        display: flex;
        font-size: 24px;
      }
    }

    &__content {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 20vw;
      overflow: hidden;
      border-radius: 4px;

      &-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 32px;
        padding: 0 12px;
        background: #fff;
        font-weight: 500;
      }

      &-json {
        min-height: 50px;
        max-height: 70vh;
        overflow: auto;
        background-color: #eee;
        white-space: pre-wrap;

        pre {
          margin-bottom: 0;
        }

        &:has(.no-data) {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
