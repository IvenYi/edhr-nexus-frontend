<template>
  <a-layout class="platform-detail__layout">
    <bi-platform-header class="flex-none" />
    <div class="platform-detail__back">
      <div style="display: flex">
        <div class="mr-16px cursor-pointer" @click="router.back">
          <left-outlined />
        </div>
        {{ moduleTitle }}
      </div>
      <div v-if="$slots.headerBtn">
        <slot name="headerBtn"></slot>
      </div>
    </div>
    <a-layout-content class="platform-detail__content">
      <div class="platform-detail__route">
        <platform-detail-comp :menus="menus" :hideContentTitle="hideContentTitle" />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
  import BiPlatformHeader from './bi-platform-header.vue';
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from '/@/hooks/web/useI18n';
  import PlatformDetailComp from './platform-detail-comp.vue';

  defineProps<{
    menus: Array<{
      path: string;
      name: string;
      meta: {
        title: string;
      };
    }>;
    hideContentTitle?: Boolean;
  }>();

  const { t } = useI18n();
  const router = useRouter();
  const { currentRoute } = useRouter();

  const moduleTitle = computed(() => {
    const title = currentRoute.value.matched[0].meta.title;
    return title ? t(title) : '';
  });
</script>

<style lang="less" scoped>
  .platform-detail {
    &__layout {
      height: 100vh;
      overflow: hidden;
    }
    &__content {
      background-color: #eff3f9;
      position: relative;
      flex: 1 1 auto;
      overflow: hidden;
    }

    &__back {
      flex: none;
      height: 70px;
      padding-left: 24px;
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 500;
      color: #000;
      background-color: #fff;
      border-top: 1px solid #e0e3ea;
      border-bottom: 1px solid #e0e3ea;
      justify-content: space-between;
    }

    &__route {
      margin: 0 auto;
      max-width: 1200px;
      height: 100%;
      background: #fff;
    }
  }
</style>
